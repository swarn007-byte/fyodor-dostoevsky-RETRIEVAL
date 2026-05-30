/// <reference types="./pglite-driver.d.ts" />
import { parseSavepointCommand } from '../../parser/savepoint-parser.js';
import { waitOrAbort, } from '../../util/abort.js';
import { Deferred } from '../../util/deferred.js';
import { freeze, isFunction } from '../../util/object-utils.js';
import { createQueryId } from '../../util/query-id.js';
import { extendStackTrace } from '../../util/stack-trace-utils.js';
const PRIVATE_BEGIN_TRANSACTION_METHOD = Symbol();
const PRIVATE_COMMIT_TRANSACTION_METHOD = Symbol();
const PRIVATE_ROLLBACK_TRANSACTION_METHOD = Symbol();
export class PGliteDriver {
    #config;
    #connection;
    #pglite;
    constructor(config) {
        this.#config = freeze({ ...config });
    }
    async acquireConnection() {
        return this.#connection;
    }
    async beginTransaction(connection) {
        await connection[PRIVATE_BEGIN_TRANSACTION_METHOD]();
    }
    async commitTransaction(connection) {
        await connection[PRIVATE_COMMIT_TRANSACTION_METHOD]();
    }
    async destroy() {
        if (!this.#pglite?.closed) {
            await this.#pglite?.close();
        }
    }
    async init(options) {
        this.#pglite ??= isFunction(this.#config.pglite)
            ? await this.#config.pglite(options)
            : this.#config.pglite;
        if (this.#pglite.closed) {
            throw new Error('PGlite instance is already closed.');
        }
        if (!this.#pglite.ready) {
            await waitOrAbort(this.#pglite.waitReady, options?.signal, 'wait ready');
        }
        this.#connection = new PGliteConnection(this.#pglite);
        if (this.#config.onCreateConnection) {
            await this.#config.onCreateConnection(this.#connection, options);
        }
    }
    async releaseConnection() {
        // noop
    }
    async releaseSavepoint(connection, savepointName, compileQuery) {
        await connection.executeQuery(compileQuery(parseSavepointCommand('release', savepointName), createQueryId()));
    }
    async rollbackToSavepoint(connection, savepointName, compileQuery) {
        await connection.executeQuery(compileQuery(parseSavepointCommand('rollback to', savepointName), createQueryId()));
    }
    async rollbackTransaction(connection) {
        await connection[PRIVATE_ROLLBACK_TRANSACTION_METHOD]();
    }
    async savepoint(connection, savepointName, compileQuery) {
        await connection.executeQuery(compileQuery(parseSavepointCommand('savepoint', savepointName), createQueryId()));
    }
}
class PGliteConnection {
    #pglite;
    #commitTransaction;
    #rollbackTransaction;
    #transaction;
    #transactionClosedPromise;
    constructor(pglite) {
        this.#pglite = pglite;
    }
    async executeQuery(compiledQuery) {
        try {
            const { affectedRows, rows } = await (this.#transaction || this.#pglite).query(compiledQuery.sql, compiledQuery.parameters, {
                rowMode: 'object',
            });
            return {
                numAffectedRows: affectedRows != null ? BigInt(affectedRows) : undefined,
                rows: rows || [],
            };
        }
        catch (error) {
            throw extendStackTrace(error, new Error());
        }
    }
    async *streamQuery() {
        throw new Error('Streaming is not supported by PGlite.');
    }
    async [PRIVATE_BEGIN_TRANSACTION_METHOD]() {
        const { promise: waitForCommit, reject: rollback, resolve: commit, } = new Deferred();
        const { promise: waitForBegin, resolve: hasBegun } = new Deferred();
        this.#commitTransaction = commit;
        this.#rollbackTransaction = rollback;
        // we want to use PGlite's exclusive transaction mode, to lock the instance,
        // in case this dialect is not the only one using it.
        this.#transactionClosedPromise = this.#pglite.transaction(async (tx) => {
            this.#transaction = tx;
            hasBegun();
            await waitForCommit;
        });
        await waitForBegin;
    }
    async [PRIVATE_COMMIT_TRANSACTION_METHOD]() {
        this.#commitTransaction?.();
        await this.#transactionClosedPromise;
        this.#commitTransaction = undefined;
        this.#rollbackTransaction = undefined;
        this.#transaction = undefined;
        this.#transactionClosedPromise = undefined;
    }
    async [PRIVATE_ROLLBACK_TRANSACTION_METHOD]() {
        this.#rollbackTransaction?.();
        await this.#transactionClosedPromise?.catch(() => { });
        this.#commitTransaction = undefined;
        this.#rollbackTransaction = undefined;
        this.#transaction = undefined;
        this.#transactionClosedPromise = undefined;
    }
}
