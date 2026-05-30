import { IdentifierNode } from './identifier-node.js';
import type { OperationNode } from './operation-node.js';
export interface UniqueConstraintNode extends OperationNode {
    readonly kind: 'UniqueConstraintNode';
    readonly columns: ReadonlyArray<OperationNode>;
    readonly name?: IdentifierNode;
    readonly nullsNotDistinct?: boolean;
    readonly deferrable?: boolean;
    readonly initiallyDeferred?: boolean;
}
export type UniqueConstraintNodeProps = Omit<Partial<UniqueConstraintNode>, 'kind'>;
/**
 * TODO: remove this interface once support for `string[]` is removed.
 *
 * @internal
 */
type UniqueConstraintNodeFactory = Readonly<{
    is(node: OperationNode): node is UniqueConstraintNode;
    create(columns: OperationNode[], constraintName?: string, nullsNotDistinct?: boolean): UniqueConstraintNode;
    /**
     * @deprecated pass `ColumnNode[]` instead of strings.
     */
    create(columns: string[], constraintName?: string, nullsNotDistinct?: boolean): UniqueConstraintNode;
    cloneWith(node: UniqueConstraintNode, props: UniqueConstraintNodeProps): UniqueConstraintNode;
}>;
/**
 * @internal
 */
export declare const UniqueConstraintNode: UniqueConstraintNodeFactory;
export {};
