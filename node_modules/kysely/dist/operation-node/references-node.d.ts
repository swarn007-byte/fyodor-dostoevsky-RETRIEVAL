import type { OperationNode } from './operation-node.js';
import type { ColumnNode } from './column-node.js';
import type { TableNode } from './table-node.js';
export type OnModifyForeignAction = 'cascade' | 'no action' | 'restrict' | 'set default' | 'set null';
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const ON_MODIFY_FOREIGN_ACTIONS: readonly OnModifyForeignAction[];
export interface ReferencesNode extends OperationNode {
    readonly kind: 'ReferencesNode';
    readonly table: TableNode;
    readonly columns: ReadonlyArray<ColumnNode>;
    readonly onDelete?: OnModifyForeignAction;
    readonly onUpdate?: OnModifyForeignAction;
}
type ReferencesNodeFactory = Readonly<{
    is(node: OperationNode): node is ReferencesNode;
    create(table: TableNode, columns: ReadonlyArray<ColumnNode>): Readonly<ReferencesNode>;
    cloneWithOnDelete(references: ReferencesNode, onDelete: OnModifyForeignAction): Readonly<ReferencesNode>;
    cloneWithOnUpdate(references: ReferencesNode, onUpdate: OnModifyForeignAction): Readonly<ReferencesNode>;
}>;
/**
 * @internal
 */
export declare const ReferencesNode: ReferencesNodeFactory;
export declare function isOnModifyForeignAction(thing: unknown): thing is OnModifyForeignAction;
export {};
