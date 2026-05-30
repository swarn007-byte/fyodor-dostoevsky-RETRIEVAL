/// <reference types="./pglite-dialect.d.ts" />
import { PostgresIntrospector } from '../postgres/postgres-introspector.js';
import { PostgresQueryCompiler } from '../postgres/postgres-query-compiler.js';
import { PGliteAdapter } from './pglite-adapter.js';
import { PGliteDriver } from './pglite-driver.js';
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
export class PGliteDialect {
    #config;
    constructor(config) {
        this.#config = config;
    }
    createAdapter() {
        return new PGliteAdapter();
    }
    createDriver() {
        return new PGliteDriver(this.#config);
    }
    createIntrospector(db) {
        return new PostgresIntrospector(db);
    }
    createQueryCompiler() {
        return new PostgresQueryCompiler();
    }
}
