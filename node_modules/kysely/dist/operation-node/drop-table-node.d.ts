import type { OperationNode } from './operation-node.js';
import type { TableNode } from './table-node.js';
export type DropTableNodeParams = Omit<Partial<DropTableNode>, 'kind' | 'table'>;
/**
 * @deprecated use {@link DropTableNodeParams} instead.
 */
export type DropTablexNodeParams = DropTableNodeParams;
export interface DropTableNode extends OperationNode {
    readonly kind: 'DropTableNode';
    readonly table: TableNode;
    readonly ifExists?: boolean;
    readonly cascade?: boolean;
    readonly temporary?: boolean;
}
type DropTableNodeFactory = Readonly<{
    is(node: OperationNode): node is DropTableNode;
    create(table: TableNode, params?: DropTableNodeParams): Readonly<DropTableNode>;
    cloneWith(dropIndex: DropTableNode, params: DropTableNodeParams): Readonly<DropTableNode>;
}>;
/**
 * @internal
 */
export declare const DropTableNode: DropTableNodeFactory;
export {};
