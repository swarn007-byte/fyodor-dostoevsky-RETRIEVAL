import type { OperationNode } from './operation-node.js';
import type { TableNode } from './table-node.js';
import type { ConstraintNode } from './constraint-node.js';
import type { ColumnDefinitionNode } from './column-definition-node.js';
import type { ArrayItemType } from '../util/type-utils.js';
import type { AddIndexNode } from './add-index-node.js';
export declare const ON_COMMIT_ACTIONS: string[];
export type OnCommitAction = ArrayItemType<typeof ON_COMMIT_ACTIONS>;
export type CreateTableNodeParams = Omit<CreateTableNode, 'kind' | 'table' | 'columns' | 'constraints' | 'indexes' | 'frontModifiers' | 'endModifiers'>;
export interface CreateTableNode extends OperationNode {
    readonly kind: 'CreateTableNode';
    readonly table: TableNode;
    readonly columns: ReadonlyArray<ColumnDefinitionNode>;
    readonly constraints?: ReadonlyArray<ConstraintNode>;
    readonly indexes?: ReadonlyArray<AddIndexNode>;
    readonly temporary?: boolean;
    readonly ifNotExists?: boolean;
    readonly onCommit?: OnCommitAction;
    readonly frontModifiers?: ReadonlyArray<OperationNode>;
    readonly endModifiers?: ReadonlyArray<OperationNode>;
    readonly selectQuery?: OperationNode;
}
type CreateTableNodeFactory = Readonly<{
    is(node: OperationNode): node is CreateTableNode;
    create(table: TableNode): Readonly<CreateTableNode>;
    cloneWithColumn(node: CreateTableNode, column: ColumnDefinitionNode): Readonly<CreateTableNode>;
    cloneWithConstraint(node: CreateTableNode, constraint: ConstraintNode): Readonly<CreateTableNode>;
    cloneWithIndex(node: CreateTableNode, index: AddIndexNode): Readonly<CreateTableNode>;
    cloneWithFrontModifier(node: CreateTableNode, modifier: OperationNode): Readonly<CreateTableNode>;
    cloneWithEndModifier(node: CreateTableNode, modifier: OperationNode): Readonly<CreateTableNode>;
    cloneWith(node: CreateTableNode, params: CreateTableNodeParams): Readonly<CreateTableNode>;
}>;
/**
 * @internal
 */
export declare const CreateTableNode: CreateTableNodeFactory;
export {};
