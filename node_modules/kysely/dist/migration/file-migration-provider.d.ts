import type { Migration, MigrationProvider } from './migrator.js';
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
export declare class FileMigrationProvider implements MigrationProvider {
    #private;
    constructor(props: FileMigrationProviderProps);
    /**
     * Returns all migrations, old and new.
     *
     * For example if you have your migrations in a folder as separate files,
     * you can implement this method to return all migration in that folder
     * as {@link Migration} objects.
     *
     * Kysely already has a built-in {@link FileMigrationProvider} for node.js
     * that does exactly that.
     *
     * The keys of the returned object are migration names and values are the
     * migrations. The order of the migrations is determined by the alphabetical
     * order of the migration names. The items in the object don't need to be
     * sorted, they are sorted by Kysely.
     */
    getMigrations(): Promise<Record<string, Migration>>;
    protected hasExpectedExtension(fileName: string): boolean;
}
export interface FileMigrationProviderFS {
    readdir(path: string): Promise<string[]>;
}
export interface FileMigrationProviderPath {
    join(...path: string[]): string;
}
export interface FileMigrationProviderProps {
    fs: FileMigrationProviderFS;
    import?(module: string): Promise<any>;
    migrationFolder: string;
    onFileIgnored?(fileName: string, reason: 'Extension' | 'NotMigration'): void;
    path: FileMigrationProviderPath;
}
