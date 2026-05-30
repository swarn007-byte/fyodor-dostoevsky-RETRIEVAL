/**
 * This mutex is used to ensure that only one operation at a time can
 * acquire a connection from the driver. This is necessary when the
 * driver only has a single connection, like SQLite and PGlite.
 *
 * @internal
 */
export declare class ConnectionMutex {
    #private;
    obtainLock(): Promise<void>;
    releaseLock(): void;
}
