/// <reference types="./sqlite-driver.d.ts" />
import { SelectQueryNode } from '../../operation-node/select-query-node.js';
import { parseSavepointCommand } from '../../parser/savepoint-parser.js';
import { CompiledQuery } from '../../query-compiler/compiled-query.js';
import { freeze, isFunction } from '../../util/object-utils.js';
import { createQueryId } from '../../util/query-id.js';
export class SqliteDriver {
    #config;
    #db;
    #connection;
    constructor(config) {
        this.#config = freeze({ ...config });
    }
    async init(options) {
        this.#db = isFunction(this.#config.database)
            ? await this.#config.database(options)
            : this.#config.database;
        this.#connection = new SqliteConnection(this.#db);
        if (this.#config.onCreateConnection) {
            await this.#config.onCreateConnection(this.#connection, options);
        }
    }
    async acquireConnection() {
        return this.#connection;
    }
    async beginTransaction(connection) {
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
        await connection.executeQuery(compileQuery(parseSavepointCommand('release', savepointName), createQueryId()));
    }
    async releaseConnection() {
        // noop
    }
    async destroy() {
        this.#db?.close();
    }
}
class SqliteConnection {
    #db;
    constructor(db) {
        this.#db = db;
    }
    async executeQuery(compiledQuery) {
        const { sql, parameters } = compiledQuery;
        const stmt = this.#db.prepare(sql);
        if (stmt.reader) {
            return {
                rows: stmt.all(parameters),
            };
        }
        const { changes, lastInsertRowid } = stmt.run(parameters);
        return {
            insertId: lastInsertRowid != null ? BigInt(lastInsertRowid) : undefined,
            numAffectedRows: changes != null ? BigInt(changes) : undefined,
            rows: [],
        };
    }
    async *streamQuery(compiledQuery, _chunkSize) {
        const { sql, parameters, query } = compiledQuery;
        const stmt = this.#db.prepare(sql);
        if (!SelectQueryNode.is(query)) {
            throw new Error('Sqlite driver only supports streaming of select queries');
        }
        const iter = stmt.iterate(parameters);
        for (const row of iter) {
            yield {
                rows: [row],
            };
        }
    }
}
