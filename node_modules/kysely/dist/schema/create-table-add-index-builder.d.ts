import { AddIndexNode } from '../operation-node/add-index-node.js';
import type { IndexType } from '../operation-node/create-index-node.js';
import type { OperationNodeSource } from '../operation-node/operation-node-source.js';
export declare class CreateTableAddIndexBuilder implements OperationNodeSource {
    #private;
    constructor(node: AddIndexNode);
    /**
     * Specifies the index type.
     *
     * ### Examples
     *
     * ```ts
     * await db.schema
     *   .createTable('person')
     *   .addColumn('email', 'varchar(255)')
     *   .addIndex('email_index', ['email'], (ib) => ib.using('hash'))
     *   .execute()
     * ```
     *
     * The generated SQL (MySQL):
     *
     * ```sql
     * create table `person` (`email` varchar(255), index `email_index` (`email`) using hash)
     * ```
     */
    using(indexType: IndexType): CreateTableAddIndexBuilder;
    using(indexType: string): CreateTableAddIndexBuilder;
    /**
     * Simply calls the provided function passing `this` as the only argument. `$call` returns
     * what the provided function returns.
     */
    $call<T>(func: (qb: this) => T): T;
    toOperationNode(): AddIndexNode;
}
export type CreateTableAddIndexBuilderCallback = (builder: CreateTableAddIndexBuilder) => CreateTableAddIndexBuilder;
