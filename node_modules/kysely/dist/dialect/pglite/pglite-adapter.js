/// <reference types="./pglite-adapter.d.ts" />
import { PostgresAdapter } from '../postgres/postgres-adapter.js';
export class PGliteAdapter extends PostgresAdapter {
    get supportsMultipleConnections() {
        return false;
    }
    async acquireMigrationLock() {
        // PGlite only has one connection that's reserved by the migration system
        // for the whole time between acquireMigrationLock and releaseMigrationLock.
        // We don't need to do anything here.
    }
    async releaseMigrationLock() {
        // PGlite only has one connection that's reserved by the migration system
        // for the whole time between acquireMigrationLock and releaseMigrationLock.
        // We don't need to do anything here.
    }
}
