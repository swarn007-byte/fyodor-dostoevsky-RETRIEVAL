/// <reference types="./alter-table-add-index-builder.d.ts" />
import { AddIndexNode } from '../operation-node/add-index-node.js';
import { AlterTableNode } from '../operation-node/alter-table-node.js';
import { RawNode } from '../operation-node/raw-node.js';
import { parseOrderedColumnName, } from '../parser/reference-parser.js';
import { freeze, isString } from '../util/object-utils.js';
export class AlterTableAddIndexBuilder {
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    /**
     * Makes the index unique.
     *
     * ### Examples
     *
     * ```ts
     * await db.schema
     *   .alterTable('person')
     *   .addIndex('person_first_name_index')
     *   .unique()
     *   .column('email')
     *   .execute()
     * ```
     *
     * The generated SQL (MySQL):
     *
     * ```sql
     * alter table `person` add unique index `person_first_name_index` (`email`)
     * ```
     */
    unique() {
        return new AlterTableAddIndexBuilder({
            ...this.#props,
            node: AlterTableNode.cloneWithTableProps(this.#props.node, {
                addIndex: AddIndexNode.cloneWith(this.#props.node.addIndex, {
                    unique: true,
                }),
            }),
        });
    }
    column(arg) {
        return new AlterTableAddIndexBuilder({
            ...this.#props,
            node: AlterTableNode.cloneWithTableProps(this.#props.node, {
                addIndex: AddIndexNode.cloneWithColumns(this.#props.node.addIndex, [
                    isString(arg) ? parseOrderedColumnName(arg) : arg.toOperationNode(),
                ]),
            }),
        });
    }
    /**
     * Specifies a list of columns for the index.
     *
     * Also see {@link column} for adding a single column or {@link expression} for
     * specifying an arbitrary expression.
     *
     * ### Examples
     *
     * ```ts
     * import { sql } from 'kysely'
     *
     * await db.schema
     *   .alterTable('person')
     *   .addIndex('person_first_name_and_age_index')
     *   .columns(['first_name', sql`(left(lower(last_name), 1))`, 'age desc'])
     *   .execute()
     * ```
     *
     * The generated SQL (MySQL):
     *
     * ```sql
     * alter table `person`
     * add index `person_first_name_and_age_index` (
     *   `first_name`,
     *   (left(lower(last_name), 1)),
     *   `age` desc
     * )
     * ```
     */
    columns(columns) {
        return new AlterTableAddIndexBuilder({
            ...this.#props,
            node: AlterTableNode.cloneWithTableProps(this.#props.node, {
                addIndex: AddIndexNode.cloneWithColumns(this.#props.node.addIndex, columns.map((item) => isString(item)
                    ? parseOrderedColumnName(item)
                    : item.toOperationNode())),
            }),
        });
    }
    /**
     * Specifies an arbitrary expression for the index.
     *
     * ### Examples
     *
     * ```ts
     * import { sql } from 'kysely'
     *
     * await db.schema
     *   .alterTable('person')
     *   .addIndex('person_first_name_index')
     *   .expression(sql<boolean>`(first_name < 'Sami')`)
     *   .execute()
     * ```
     *
     * The generated SQL (MySQL):
     *
     * ```sql
     * alter table `person` add index `person_first_name_index` ((first_name < 'Sami'))
     * ```
     *
     * @deprecated Use {@link column} or {@link columns} with an {@link Expression} instead.
     */
    // TODO: remove in v0.30
    expression(expression) {
        return new AlterTableAddIndexBuilder({
            ...this.#props,
            node: AlterTableNode.cloneWithTableProps(this.#props.node, {
                addIndex: AddIndexNode.cloneWithColumns(this.#props.node.addIndex, [
                    expression.toOperationNode(),
                ]),
            }),
        });
    }
    using(indexType) {
        return new AlterTableAddIndexBuilder({
            ...this.#props,
            node: AlterTableNode.cloneWithTableProps(this.#props.node, {
                addIndex: AddIndexNode.cloneWith(this.#props.node.addIndex, {
                    using: RawNode.createWithSql(indexType),
                }),
            }),
        });
    }
    /**
     * Simply calls the provided function passing `this` as the only argument. `$call` returns
     * what the provided function returns.
     */
    $call(func) {
        return func(this);
    }
    toOperationNode() {
        return this.#props.executor.transformQuery(this.#props.node, this.#props.queryId);
    }
    compile() {
        return this.#props.executor.compileQuery(this.toOperationNode(), this.#props.queryId);
    }
    async execute(options) {
        await this.#props.executor.executeQuery(this.compile(), options);
    }
}
