import type { QueryResult } from './driver/database-connection.js';
import type { OperationNodeSource } from './operation-node/operation-node-source.js';
import type { OperationNode } from './operation-node/operation-node.js';
import type { RootOperationNode } from './operation-node/root-operation-node.js';
import type { CompiledQuery } from './query-compiler/compiled-query.js';
import type { QueryExecutor } from './query-executor/query-executor.js';
import type { AbortableQueryOptions } from './util/abort.js';
import type { Compilable } from './util/compilable.js';
import type { QueryId } from './util/query-id.js';
export declare class QueryFinalizer<N extends RootOperationNode, O = unknown> implements OperationNodeSource, Compilable {
    #private;
    constructor(props: QueryFinalizerProps<N>);
    toOperationNode(): N;
    /**
     * Compiles the query.
     */
    compile(): CompiledQuery<O>;
    /**
     * Executes the query.
     */
    execute(options?: AbortableQueryOptions): Promise<QueryResult<O>>;
}
export interface QueryFinalizerProps<N extends OperationNode> {
    readonly executor: QueryExecutor;
    readonly node: N;
    readonly queryId: QueryId;
}
