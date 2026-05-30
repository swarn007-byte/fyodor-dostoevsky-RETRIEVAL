/// <reference types="./unary-operation-parser.d.ts" />
import { isUnaryOperator, OperatorNode, } from '../operation-node/operator-node.js';
import { UnaryOperationNode } from '../operation-node/unary-operation-node.js';
import { parseReferenceExpression, } from './reference-parser.js';
export function parseExists(operand) {
    return parseUnaryOperation('exists', operand);
}
export function parseNotExists(operand) {
    return parseUnaryOperation('not exists', operand);
}
export function parseUnaryOperation(operator, operand) {
    if (isUnaryOperator(operator)) {
        return UnaryOperationNode.create(OperatorNode.create(operator), parseReferenceExpression(operand));
    }
    throw new Error(`invalid unary operator ${JSON.stringify(operator)}`);
}
