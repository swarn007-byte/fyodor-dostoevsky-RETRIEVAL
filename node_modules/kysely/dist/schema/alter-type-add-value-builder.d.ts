import { AlterTypeNode } from '../operation-node/alter-type-node.js';
import type { QueryExecutor } from '../query-executor/query-executor.js';
import type { QueryId } from '../util/query-id.js';
import { QueryFinalizer } from '../query-finalizer.js';
export declare class AlterTypeAddValueBuilder<const V extends string> extends QueryFinalizer<AlterTypeNode> {
    #private;
    constructor(props: AlterTypeAddValueBuilderProps);
    /**
     * Adds an `if not exists` clause.
     */
    ifNotExists(): AlterTypeAddValueBuilder<V>;
    /**
     * Sets a `before <value>` clause.
     */
    before<const NV extends string>(neighborValue: NV extends V ? never : NV): AlterTypeAddValueBuilder<V>;
    /**
     * Sets an `after <value>` clause.
     */
    after<const NV extends string>(neighborValue: NV extends V ? never : NV): AlterTypeAddValueBuilder<V>;
}
export interface AlterTypeAddValueBuilderProps {
    readonly executor: QueryExecutor;
    readonly node: AlterTypeNode;
    readonly queryId: QueryId;
}
