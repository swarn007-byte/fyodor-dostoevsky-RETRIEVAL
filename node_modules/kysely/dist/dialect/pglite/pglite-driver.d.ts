import type { DatabaseConnection, QueryResult } from '../../driver/database-connection.js';
import type { Driver } from '../../driver/driver.js';
import type { CompiledQuery } from '../../query-compiler/compiled-query.js';
import type { QueryCompiler } from '../../query-compiler/query-compiler.js';
import { type AbortableOperationOptions } from '../../util/abort.js';
import type { PGlite, PGliteDialectConfig } from './pglite-dialect-config.js';
declare const PRIVATE_BEGIN_TRANSACTION_METHOD: unique symbol;
declare const PRIVATE_COMMIT_TRANSACTION_METHOD: unique symbol;
declare const PRIVATE_ROLLBACK_TRANSACTION_METHOD: unique symbol;
export declare class PGliteDriver implements Driver {
    #private;
    constructor(config: PGliteDialectConfig);
    /**
     * Acquires a new connection from the pool.
     */
    acquireConnection(): Promise<DatabaseConnection>;
    /**
     * Begins a transaction.
     */
    beginTransaction(connection: PGliteConnection): Promise<void>;
    /**
     * Commits a transaction.
     */
    commitTransaction(connection: PGliteConnection): Promise<void>;
    /**
     * Destroys the driver and releases all resources.
     */
    destroy(): Promise<void>;
    /**
     * Initializes the driver.
     *
     * After calling this method the driver should be usable and `acquireConnection` etc.
     * methods should be callable.
     */
    init(options?: AbortableOperationOptions): Promise<void>;
    /**
     * Releases a connection back to the pool.
     */
    releaseConnection(): Promise<void>;
    releaseSavepoint(connection: DatabaseConnection, savepointName: string, compileQuery: QueryCompiler['compileQuery']): Promise<void>;
    rollbackToSavepoint(connection: DatabaseConnection, savepointName: string, compileQuery: QueryCompiler['compileQuery']): Promise<void>;
    /**
     * Rolls back a transaction.
     */
    rollbackTransaction(connection: PGliteConnection): Promise<void>;
    savepoint(connection: DatabaseConnection, savepointName: string, compileQuery: QueryCompiler['compileQuery']): Promise<void>;
}
declare class PGliteConnection implements DatabaseConnection {
    #private;
    constructor(pglite: PGlite);
    executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>>;
    streamQuery<R>(): AsyncIterableIterator<QueryResult<R>>;
    [PRIVATE_BEGIN_TRANSACTION_METHOD](): Promise<void>;
    [PRIVATE_COMMIT_TRANSACTION_METHOD](): Promise<void>;
    [PRIVATE_ROLLBACK_TRANSACTION_METHOD](): Promise<void>;
}
export {};
