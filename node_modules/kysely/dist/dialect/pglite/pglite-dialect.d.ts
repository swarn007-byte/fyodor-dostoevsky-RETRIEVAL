import type { Driver } from '../../driver/driver.js';
import type { Kysely } from '../../kysely.js';
import type { QueryCompiler } from '../../query-compiler/query-compiler.js';
import type { DatabaseIntrospector } from '../database-introspector.js';
import type { DialectAdapter } from '../dialect-adapter.js';
import type { Dialect } from '../dialect.js';
import type { PGliteDialectConfig } from './pglite-dialect-config.js';
/**
 * PGlite dialect.
 *
 * The constructor takes an instance of {@link PGliteDialectConfig}.
 *
 * ```ts
 * import { PGlite } from '@electric-sql/pglite'
 *
 * new PGliteDialect({
 *   pglite: new PGlite()
 * })
 * ```
 *
 * If you want the client to only be created once it's first used, `pglite`
 * can be a function:
 *
 * ```ts
 * import { PGlite } from '@electric-sql/pglite'
 *
 * new PGliteDialect({
 *   pglite: () => new PGlite()
 * })
 * ```
 */
export declare class PGliteDialect implements Dialect {
    #private;
    constructor(config: PGliteDialectConfig);
    /**
     * Creates an adapter for the dialect.
     */
    createAdapter(): DialectAdapter;
    /**
     * Creates a driver for the dialect.
     */
    createDriver(): Driver;
    /**
     * Creates a database introspector that can be used to get database metadata
     * such as the table names and column names of those tables.
     *
     * `db` never has any plugins installed. It's created using
     * {@link Kysely.withoutPlugins}.
     */
    createIntrospector(db: Kysely<any>): DatabaseIntrospector;
    /**
     * Creates a query compiler for the dialect.
     */
    createQueryCompiler(): QueryCompiler;
}
