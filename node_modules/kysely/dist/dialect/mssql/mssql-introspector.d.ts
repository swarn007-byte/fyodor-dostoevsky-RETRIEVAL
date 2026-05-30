import type { Kysely } from '../../kysely.js';
import type { DatabaseIntrospector, DatabaseMetadataOptions, SchemaMetadata, TableMetadata } from '../database-introspector.js';
export declare class MssqlIntrospector implements DatabaseIntrospector {
    #private;
    constructor(db: Kysely<any>);
    /**
     * Get schema metadata.
     */
    getSchemas(): Promise<SchemaMetadata[]>;
    /**
     * Get tables and views metadata.
     */
    getTables(options?: DatabaseMetadataOptions): Promise<TableMetadata[]>;
}
