import { DropTableNode } from '../operation-node/drop-table-node.js';
import type { OperationNodeSource } from '../operation-node/operation-node-source.js';
import type { CompiledQuery } from '../query-compiler/compiled-query.js';
import type { Compilable } from '../util/compilable.js';
import type { QueryExecutor } from '../query-executor/query-executor.js';
import type { QueryId } from '../util/query-id.js';
import type { AbortableQueryOptions } from '../util/abort.js';
export declare class DropTableBuilder implements OperationNodeSource, Compilable {
    #private;
    constructor(props: DropTableBuilderProps);
    /**
     * Adds the "temporary" modifier.
     *
     * This is only supported by some dialects like MySQL.
     */
    temporary(): DropTableBuilder;
    ifExists(): DropTableBuilder;
    cascade(): DropTableBuilder;
    /**
     * Simply calls the provided function passing `this` as the only argument. `$call` returns
     * what the provided function returns.
     */
    $call<T>(func: (qb: this) => T): T;
    toOperationNode(): DropTableNode;
    compile(): CompiledQuery;
    execute(options?: AbortableQueryOptions): Promise<void>;
}
export interface DropTableBuilderProps {
    readonly queryId: QueryId;
    readonly executor: QueryExecutor;
    readonly node: DropTableNode;
}
