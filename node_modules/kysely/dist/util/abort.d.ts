import type { DatabaseConnection } from '../driver/database-connection.js';
export interface AbortableOperationOptions {
    /**
     * An optional signal that can be used to abort the execution of (async) operations.
     *
     * This is useful for cancelling long-running queries, for example when
     * the user navigates away from the page or closes the browser tab.
     *
     * See {@link inflightQueryAbortStrategy} for handling of database side query.
     */
    readonly signal?: AbortSignal | undefined;
}
export interface AbortableQueryOptions extends AbortableOperationOptions {
    /**
     * Controls what happens when the {@link signal} is aborted while a query is
     * in-flight.
     *
     * `'ignore query'` stops waiting for query results. The query continues running
     * on the database server, and the connection is released back to the pool only
     * after the in-flight query settles.
     *
     * `'cancel query'` attempts to cancel the query on the database side (e.g. `pg_cancel_backend`
     * in PostgreSQL or `kill query` in MySQL). This requires the dialect's connection
     * to implement {@link DatabaseConnection.cancelQuery}. Otherwise, falls back
     * to `'ignore query'` with a warning. Writes (insert, update, delete) are not
     * cancellable in most database engines, so your mileage
     * may vary. Also, some databases do not cancel the running query immediately
     * resulting in changes being committed sometimes - consider `'kill session'`
     * when you need stronger guarantees, at all costs.
     *
     * `'kill session'` attempts to kill the database process/session the query is
     * running in (e.g. `pg_terminate_backend` in PostgreSQL) and with it any running
     * queries, transactions and obtained locks. This requires the dialect's connection
     * to implement {@link DatabaseConnection.killSession}. Otherwise, falls back
     * to `'cancel query'` with a warning. Killing the session is very aggressive,
     * and will require reconnection on the next database operation if there are
     * no idle connections available in the pool.
     *
     * Default is `'ignore query'`.
     */
    readonly inflightQueryAbortStrategy?: InflightQueryAbortStrategy | undefined;
}
export type InflightQueryAbortStrategy = 'ignore query' | 'cancel query' | 'kill session';
export declare function getInflightQueryAbortHandler(abortStrategy: InflightQueryAbortStrategy | undefined, connection: DatabaseConnection, beforeThrow: () => void): ((controlConnectionProvider: import("../driver/database-connection.js").ControlConnectionProvider) => Promise<void>) | undefined;
export declare function assertNotAborted(signal: AbortSignal | undefined, timing: string, beforeThrow?: () => void): void;
export declare function throwReasonWithTiming(reason: any, timing: string): never;
export declare const ABORTED: unique symbol;
export declare function waitOrAbort<T>(promise: Promise<T>, signal: AbortSignal | undefined, name: string, onAbort?: () => void | Promise<void>): Promise<T>;
export declare function printBackgroundFail(name: string): (reason: unknown) => void;
