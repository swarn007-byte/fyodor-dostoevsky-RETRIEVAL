import type { OperationNode } from './operation-node.js';
import { ColumnNode } from './column-node.js';
export type DropColumnNodeProps = Omit<DropColumnNode, 'kind' | 'column'>;
export interface DropColumnNode extends OperationNode {
    readonly kind: 'DropColumnNode';
    readonly column: ColumnNode;
    readonly ifExists?: boolean;
}
type DropColumnNodeFactory = Readonly<{
    is(node: OperationNode): node is DropColumnNode;
    create(column: string): Readonly<DropColumnNode>;
    cloneWith(node: DropColumnNode, props: DropColumnNodeProps): Readonly<DropColumnNode>;
}>;
/**
 * @internal
 */
export declare const DropColumnNode: DropColumnNodeFactory;
export {};
