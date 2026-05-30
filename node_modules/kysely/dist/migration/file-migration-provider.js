/// <reference types="./file-migration-provider.d.ts" />
import { isFunction, isObject } from '../util/object-utils.js';
/**
 * Reads all migrations from a folder.
 *
 * ### Examples
 *
 * ```ts
 * import { promises as fs } from 'node:fs'
 * import path from 'node:path'
 *
 * new FileMigrationProvider({
 *   fs,
 *   path,
 *   migrationFolder: 'path/to/migrations/folder'
 * })
 * ```
 */
export class FileMigrationProvider {
    #props;
    constructor(props) {
        this.#props = props;
    }
    async getMigrations() {
        const migrations = {};
        const files = await this.#props.fs.readdir(this.#props.migrationFolder);
        for (const fileName of files) {
            if (!this.hasExpectedExtension(fileName)) {
                this.#props.onFileIgnored?.(fileName, 'Extension');
                continue;
            }
            const filePath = this.#props.path.join(this.#props.migrationFolder, fileName);
            const migration = this.#props.import
                ? await this.#props.import(filePath)
                : await import(/* webpackIgnore: true */ filePath);
            const migrationKey = fileName.substring(0, fileName.lastIndexOf('.'));
            // Handle esModuleInterop export's `default` prop...
            if (isMigration(migration?.default)) {
                migrations[migrationKey] = migration.default;
            }
            else if (isMigration(migration)) {
                migrations[migrationKey] = migration;
            }
            else {
                this.#props.onFileIgnored?.(fileName, 'NotMigration');
            }
        }
        return migrations;
    }
    hasExpectedExtension(fileName) {
        return (fileName.endsWith('.js') ||
            (fileName.endsWith('.ts') && !fileName.endsWith('.d.ts')) ||
            fileName.endsWith('.mjs') ||
            (fileName.endsWith('.mts') && !fileName.endsWith('.d.mts')) ||
            fileName.endsWith('.cjs') ||
            (fileName.endsWith('.cts') && !fileName.endsWith('.d.cts')));
    }
}
function isMigration(obj) {
    return isObject(obj) && isFunction(obj.up);
}
