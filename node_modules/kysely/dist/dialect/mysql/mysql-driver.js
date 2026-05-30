/// <reference types="./mysql-driver.d.ts" />
import { parseSavepointCommand } from '../../parser/savepoint-parser.js';
import { CompiledQuery } from '../../query-compiler/compiled-query.js';
import { isFunction, isObject, freeze } from '../../util/object-utils.js';
import { createQueryId } from '../../util/query-id.js';
import { extendStackTrace } from '../../util/stack-trace-utils.js';
const PRIVATE_RELEASE_METHOD = Symbol();
export class MysqlDriver {
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
        const rawConnection = await this.#acquireConnection();
        let connection = this.#connections.get(rawConnection);
        if (!connection) {
            connection = new MysqlConnection(rawConnection, this.#config.controlConnection);
            this.#connections.set(rawConnection, connection);
            // The driver must take care of calling `onCreateConnection` when a new
            // connection is created. The `mysql2` module doesn't provide an async hook
            // for the connection creation. We need to call the method explicitly.
            if (this.#config?.onCreateConnection) {
                await this.#config.onCreateConnection(connection, options);
            }
        }
        if (this.#config?.onReserveConnection) {
            await this.#config.onReserveConnection(connection, options);
        }
        return connection;
    }
    async beginTransaction(connection, settings) {
        if (settings.isolationLevel || settings.accessMode) {
            const parts = [];
            if (settings.isolationLevel) {
                parts.push(`isolation level ${settings.isolationLevel}`);
            }
            if (settings.accessMode) {
                parts.push(settings.accessMode);
            }
            const sql = `set transaction ${parts.join(', ')}`;
            // On MySQL this sets the isolation level of the next transaction.
            await connection.executeQuery(CompiledQuery.raw(sql));
        }
        await connection.executeQuery(CompiledQuery.raw('begin'));
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
        await connection.executeQuery(compileQuery(parseSavepointCommand('release savepoint', savepointName), createQueryId()));
    }
    async releaseConnection(connection) {
        connection[PRIVATE_RELEASE_METHOD]();
    }
    async destroy() {
        return new Promise((resolve, reject) => {
            this.#pool.end((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async #acquireConnection() {
        return new Promise((resolve, reject) => {
            this.#pool.getConnection(async (err, rawConnection) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rawConnection);
                }
            });
        });
    }
}
function isOkPacket(obj) {
    return isObject(obj) && 'insertId' in obj && 'affectedRows' in obj;
}
class MysqlConnection {
    #connection;
    #controlConnection;
    #cid;
    #queryId;
    constructor(connection, controlConnection) {
        this.#connection = connection;
        this.#controlConnection = controlConnection;
    }
    async cancelQuery(controlConnectionProvider) {
        await this.#executeControlQuery(`kill query ${this.#cid}`, controlConnectionProvider);
    }
    async collectSessionInfo() {
        if (this.#cid) {
            return;
        }
        const { threadId } = this.#connection;
        if (threadId != null) {
            this.#cid = threadId;
        }
        else {
            const [{ cid }] = (await this.#executeQuery(CompiledQuery.raw(`select connection_id() as cid`)));
            this.#cid = Number(cid);
        }
    }
    async executeQuery(compiledQuery) {
        try {
            // this helps ensure we don't cancel the wrong query when aborted.
            this.#queryId = compiledQuery.queryId;
            const result = await this.#executeQuery(compiledQuery);
            if (!isOkPacket(result)) {
                return {
                    rows: (Array.isArray(result) ? result : []),
                };
            }
            const { insertId, affectedRows, changedRows } = result;
            return {
                insertId: insertId != null && insertId.toString() !== '0'
                    ? BigInt(insertId)
                    : undefined,
                numAffectedRows: affectedRows != null ? BigInt(affectedRows) : undefined,
                numChangedRows: changedRows != null ? BigInt(changedRows) : undefined,
                rows: [],
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
        try {
            // this removes the connection from the pool.
            // this is done to avoid picking it up after the `kill` command next, which
            // would cause an error when attempting to query.
            this.#connection.destroy();
        }
        catch {
            // noop
        }
        await this.#executeControlQuery(`kill connection ${this.#cid}`, controlConnectionProvider);
    }
    async *streamQuery(compiledQuery, _chunkSize) {
        // this helps ensure we don't cancel the wrong query when aborted.
        this.#queryId = compiledQuery.queryId;
        const stream = this.#connection
            .query(compiledQuery.sql, compiledQuery.parameters)
            .stream({ objectMode: true });
        try {
            for await (const row of stream) {
                yield {
                    rows: [row],
                };
            }
        }
        catch (error) {
            if (isObject(error) &&
                'code' in error &&
                // @ts-ignore
                error.code === 'ERR_STREAM_PREMATURE_CLOSE') {
                // Most likely because of https://github.com/mysqljs/mysql/blob/master/lib/protocol/sequences/Query.js#L220
                return;
            }
            throw error;
        }
        finally {
            // this tells cancellation the query is no longer relevant.
            this.#queryId = undefined;
        }
    }
    [PRIVATE_RELEASE_METHOD]() {
        this.#connection.release();
    }
    #executeQuery(compiledQuery) {
        return new Promise((resolve, reject) => {
            this.#connection.query(compiledQuery.sql, compiledQuery.parameters, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async #executeControlQuery(query, controlConnectionProvider) {
        if (!this.#queryId) {
            return;
        }
        const { config } = this.#connection;
        const queryIdToCancel = this.#queryId;
        // we fallback to a pool connection, and execute a SQL query to cancel the
        // query. this is not ideal, as we might have to wait for an idle connection.
        if (!this.#controlConnection || !config) {
            return await controlConnectionProvider(async (controlConnection) => {
                // by the time we get the connection, another query might have been executed.
                // we need to ensure we're not canceling the wrong query.
                if (queryIdToCancel.queryId === this.#queryId?.queryId) {
                    await controlConnection.executeQuery(CompiledQuery.raw(query, []));
                }
            });
        }
        const { 
        // omitting these as they cause a warning and perhaps a future error when passed.
        clientFlags: _, maxPacketSize: __, ...cfg } = config;
        const controlConnection = this.#controlConnection(cfg);
        try {
            await new Promise((resolve, reject) => {
                controlConnection.connect((connectError) => {
                    if (connectError) {
                        return reject(connectError);
                    }
                    // by the time we get the connection, another query might have been executed.
                    // we need to ensure we're not canceling the wrong query.
                    if (queryIdToCancel.queryId !== this.#queryId?.queryId) {
                        return resolve();
                    }
                    controlConnection.query(query, [], (queryError) => {
                        if (queryError) {
                            return reject(queryError);
                        }
                        resolve();
                    });
                });
            });
        }
        finally {
            controlConnection.destroy();
        }
    }
}
