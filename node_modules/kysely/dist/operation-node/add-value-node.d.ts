import type { OperationNode } from './operation-node.js';
import type { ValueNode } from './value-node.js';
export type AddValueNodeProps = Omit<AddValueNode, 'kind' | 'value'>;
export interface AddValueNode extends OperationNode {
    readonly kind: 'AddValueNode';
    readonly value: ValueNode;
    readonly ifNotExists?: boolean;
    readonly neighborValue?: ValueNode;
    readonly isBefore?: boolean;
}
type AddValueNodeFactory = Readonly<{
    is(node: OperationNode): node is AddValueNode;
    create(value: ValueNode): Readonly<AddValueNode>;
    cloneWith(node: AddValueNode, props: AddValueNodeProps): Readonly<AddValueNode>;
}>;
/**
 * @internal
 */
export declare const AddValueNode: AddValueNodeFactory;
export {};
