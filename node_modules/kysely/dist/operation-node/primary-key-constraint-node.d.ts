import { ColumnNode } from './column-node.js';
import { IdentifierNode } from './identifier-node.js';
import type { OperationNode } from './operation-node.js';
export interface PrimaryKeyConstraintNode extends OperationNode {
    readonly kind: 'PrimaryKeyConstraintNode';
    readonly columns: ReadonlyArray<ColumnNode>;
    readonly name?: IdentifierNode;
    readonly deferrable?: boolean;
    readonly initiallyDeferred?: boolean;
}
export type PrimaryKeyConstraintNodeProps = Omit<Partial<PrimaryKeyConstraintNode>, 'kind'>;
type PrimaryKeyConstraintNodeFactory = Readonly<{
    is(node: OperationNode): node is PrimaryKeyConstraintNode;
    create(columns: string[], constraintName?: string): Readonly<PrimaryKeyConstraintNode>;
    cloneWith(node: PrimaryKeyConstraintNode, props: PrimaryKeyConstraintNodeProps): Readonly<PrimaryKeyConstraintNode>;
}>;
/**
 * @internal
 */
export declare const PrimaryKeyConstraintNode: PrimaryKeyConstraintNodeFactory;
export {};
