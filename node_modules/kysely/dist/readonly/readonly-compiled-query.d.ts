import { SelectQueryNode } from '../operation-node/select-query-node.js';
import { type CompiledQuery } from '../query-compiler/compiled-query.js';
export type ReadonlyCompiledQuery<R> = CompiledQuery<R> & {
    readonly query: SelectQueryNode;
};
export declare function isReadonlyCompiledQuery<R>(thing: unknown): thing is ReadonlyCompiledQuery<R>;
