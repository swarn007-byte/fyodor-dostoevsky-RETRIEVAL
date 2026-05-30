import type { OperationNode } from './operation-node.js';
import type { ValueNode } from './value-node.js';
export type RenameValueNodeProps = Omit<RenameValueNode, 'kind'>;
export interface RenameValueNode extends OperationNode {
    readonly kind: 'RenameValueNode';
    readonly oldValue: ValueNode;
    readonly newValue: ValueNode;
}
type RenameValueNodeFactory = Readonly<{
    is(node: OperationNode): node is RenameValueNode;
    create(existingEnumValue: ValueNode, newEnumValue: ValueNode): Readonly<RenameValueNode>;
}>;
export declare const RenameValueNode: RenameValueNodeFactory;
export {};
