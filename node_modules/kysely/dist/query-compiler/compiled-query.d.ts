import { type RootOperationNode } from '../operation-node/root-operation-node.js';
import { type QueryId } from '../util/query-id.js';
export interface CompiledQuery<O = unknown> {
    readonly query: RootOperationNode;
    readonly queryId: QueryId;
    readonly sql: string;
    readonly parameters: ReadonlyArray<unknown>;
}
export declare function isCompiledQuery<R>(thing: unknown): thing is CompiledQuery<R>;
type CompiledQueryFactory = Readonly<{
    raw(sql: string, parameters?: unknown[]): Readonly<CompiledQuery>;
}>;
export declare const CompiledQuery: CompiledQueryFactory;
export {};
