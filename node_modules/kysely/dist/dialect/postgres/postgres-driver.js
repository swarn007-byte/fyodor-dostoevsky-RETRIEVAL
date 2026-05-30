/// <reference types="./postgres-driver.d.ts" />
import { parseSavepointCommand } from '../../parser/savepoint-parser.js';
import { CompiledQuery } from '../../query-compiler/compiled-query.js';
import { isFunction, freeze } from '../../util/object-utils.js';
import { createQueryId } from '../../util/query-id.js';
import { extendStackTrace } from '../../util/stack-trace-utils.js';
const PRIVATE_RELEASE_METHOD = Symbol();
export class PostgresDriver {
    #config;
    #connections = new WeakMap();
    #pool;
    constructor(config) {
        this.#config = freeze({ ...config });
    }
    async init(options) {
        this.#pool = isFunction(this.#config.pool)
            ? await this.#config.pool(options)
            : this.#config.pool;
    }
    async acquireConnection(options) {
        const client = await this.#pool.connect();
        let connection = this.#connections.get(client);
        if (!connection) {
            connection = new PostgresConnection(client, {
                controlClient: this.#config.controlClient || this.#pool.Client,
                cursor: this.#config.cursor ?? null,
                poolOptions: this.#pool.options,
            });
            this.#connections.set(client, connection);
            // The driver must take care of calling `onCreateConnection` when a new
            // connection is created. The `pg` module doesn't provide an async hook
            // for the connection creation. We need to call the method explicitly.
            if (this.#config.onCreateConnection) {
                await this.#config.onCreateConnection(connection, options);
            }
        }
        if (this.#config.onReserveConnection) {
            await this.#config.onReserveConnection(connection, options);
        }
        return connection;
    }
    async beginTransaction(connection, settings) {
        let sql = 'begin';
        if (settings.isolationLevel || settings.accessMode) {
            sql = 'start transaction';
            if (settings.isolationLevel) {
                sql += ` isolation level ${settings.isolationLevel}`;
            }
            if (settings.accessMode) {
                sql += ` ${settings.accessMode}`;
            }
        }
        await connection.executeQuery(CompiledQuery.raw(sql));
    }
    async commitTransaction(connection) {
        await connection.executeQuery(CompiledQuery.raw('commit'));
    }
    async rollbackTransaction(connection) {
        await connection.executeQuery(CompiledQuery.raw('rollback'));
    }
    async savepoint(connection, savepointName, compileQuery) {
        await connection.executeQuery(compileQuery(parseSavepointCommand('savepoint', savepointName), createQueryId()));
    }
    async rollbackToSavepoint(connection, savepointName, compileQuery) {
        await connection.executeQuery(compileQuery(parseSavepointCommand('rollback to', savepointName), createQueryId()));
    }
    async releaseSavepoint(connection, savepointName, compileQuery) {
        await connection.executeQuery(compileQuery(parseSavepointCommand('release', savepointName), createQueryId()));
    }
    async releaseConnection(connection) {
        connection[PRIVATE_RELEASE_METHOD]();
    }
    async destroy() {
        if (this.#pool) {
            const pool = this.#pool;
            this.#pool = undefined;
            await pool.end();
        }
    }
}
class PostgresConnection {
    #client;
    #options;
    #queryId;
    #pid;
    constructor(client, options) {
        this.#client = client;
        this.#options = options;
    }
    async cancelQuery(controlConnectionProvider) {
        return await this.#executeControlQuery(`select pg_cancel_backend(${this.#pid})`, controlConnectionProvider);
    }
    async collectSessionInfo() {
        if (this.#pid) {
            return;
        }
        const { processID } = this.#client;
        // `processID` is an undocumented member of the `Client` class.
        // it might not exist in old or future versions of the `pg` driver.
        // if it does, use it.
        if (processID) {
            this.#pid = processID;
        }
        else {
            const { rows: [{ pid }], } = await this.#client.query('select pg_backend_pid() as pid', []);
            this.#pid = Number(pid);
        }
    }
    async executeQuery(compiledQuery) {
        try {
            // this helps ensure we don't cancel the wrong query when aborted.
            this.#queryId = compiledQuery.queryId;
            const result = await this.#client.query(compiledQuery.sql, compiledQuery.parameters);
            const { command, rowCount, rows } = result;
            return {
                numAffectedRows: command === 'INSERT' ||
                    command === 'UPDATE' ||
                    command === 'DELETE' ||
                    command === 'MERGE'
                    ? BigInt(rowCount)
                    : undefined,
                rows: rows ?? [],
            };
        }
        catch (err) {
            throw extendStackTrace(err, new Error());
        }
        finally {
            // this tells cancellation the query is no longer relevant.
            this.#queryId = undefined;
        }
    }
    async killSession(controlConnectionProvider) {
        return await this.#executeControlQuery(`select pg_terminate_backend(${this.#pid})`, controlConnectionProvider);
    }
    async *streamQuery(compiledQuery, chunkSize) {
        if (!this.#options.cursor) {
            throw new Error("`cursor` is not present in your postgres dialect config. It's required to make streaming work in postgres.");
        }
        // this helps ensure we don't cancel the wrong query when aborted.
        this.#queryId = compiledQuery.queryId;
        const cursor = this.#client.query(new this.#options.cursor(compiledQuery.sql, compiledQuery.parameters.slice()));
        try {
            while (true) {
                const rows = await cursor.read(chunkSize);
                if (rows.length === 0) {
                    break;
                }
                yield {
                    rows,
                };
            }
        }
        finally {
            await cursor.close();
            // this tells cancellation the query is no longer relevant.
            this.#queryId = undefined;
        }
    }
    [PRIVATE_RELEASE_METHOD]() {
        this.#client.release();
    }
    async #executeControlQuery(query, controlConnectionProvider) {
        if (!this.#queryId) {
            return;
        }
        const { controlClient: Client, poolOptions } = this.#options;
        const queryIdToCancel = this.#queryId;
        // we fallback to a pool connection, and execute a SQL query to cancel the
        // query. this is not ideal, as we might have to wait for an idle connection.
        if (!Client) {
            return await controlConnectionProvider(async (controlConnection) => {
                // by the time we get the connection, another query might have been executed.
                // we need to ensure we're not canceling the wrong query.
                if (queryIdToCancel.queryId === this.#queryId?.queryId) {
                    await controlConnection.executeQuery(CompiledQuery.raw(query, []));
                }
            });
        }
        const controlClient = new Client({ ...poolOptions });
        try {
            await controlClient.connect();
            // by the time we get the connection, another query might have been executed.
            // we need to ensure we're not canceling the wrong query.
            if (queryIdToCancel.queryId !== this.#queryId.queryId) {
                return;
            }
            await controlClient.query(query, []);
        }
        finally {
            controlClient.end();
        }
    }
}
