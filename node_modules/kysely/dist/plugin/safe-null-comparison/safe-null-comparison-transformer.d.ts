import { BinaryOperationNode } from '../../operation-node/binary-operation-node.js';
import { OperationNodeTransformer } from '../../operation-node/operation-node-transformer.js';
export declare class SafeNullComparisonTransformer extends OperationNodeTransformer {
    protected transformBinaryOperation(node: BinaryOperationNode): BinaryOperationNode;
}
