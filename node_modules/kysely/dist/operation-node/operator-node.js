/// <reference types="./operator-node.d.ts" />
import { freeze, isString } from '../util/object-utils.js';
const COMPARISON_OPERATORS_DICTIONARY = freeze({
    '=': true,
    '==': true,
    '!=': true,
    '<>': true,
    '>': true,
    '>=': true,
    '<': true,
    '<=': true,
    in: true,
    'not in': true,
    is: true,
    'is not': true,
    like: true,
    'not like': true,
    match: true,
    ilike: true,
    'not ilike': true,
    '@>': true,
    '<@': true,
    '^@': true,
    '&&': true,
    '?': true,
    '?&': true,
    '?|': true,
    '!<': true,
    '!>': true,
    '<=>': true,
    '!~': true,
    '~': true,
    '~*': true,
    '!~*': true,
    '@@': true,
    '@@@': true,
    '!!': true,
    '<->': true,
    regexp: true,
    'is distinct from': true,
    'is not distinct from': true,
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export const COMPARISON_OPERATORS = Object.keys(COMPARISON_OPERATORS_DICTIONARY);
const ARITHMETIC_OPERATORS_DICTIONARY = freeze({
    '+': true,
    '-': true,
    '*': true,
    '/': true,
    '%': true,
    '^': true,
    '&': true,
    '|': true,
    '#': true,
    '<<': true,
    '>>': true,
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export const ARITHMETIC_OPERATORS = Object.keys(ARITHMETIC_OPERATORS_DICTIONARY);
const JSON_OPERATORS_DICTIONARY = freeze({
    '->': true,
    '->>': true,
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export const JSON_OPERATORS = Object.keys(JSON_OPERATORS_DICTIONARY);
const BINARY_OPERATORS_DICTIONARY = freeze({
    ...COMPARISON_OPERATORS_DICTIONARY,
    ...ARITHMETIC_OPERATORS_DICTIONARY,
    '||': true,
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export const BINARY_OPERATORS = Object.keys(BINARY_OPERATORS_DICTIONARY);
const UNARY_FILTER_OPERATORS_DICTIONARY = freeze({
    exists: true,
    'not exists': true,
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export const UNARY_FILTER_OPERATORS = Object.keys(UNARY_FILTER_OPERATORS_DICTIONARY);
const UNARY_OPERATORS_DICTIONARY = freeze({
    ...UNARY_FILTER_OPERATORS_DICTIONARY,
    '-': true,
    not: true,
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export const UNARY_OPERATORS = Object.keys(UNARY_OPERATORS_DICTIONARY);
/**
 * @deprecated will be removed in version 0.30.x
 */
export const OPERATORS = [
    ...BINARY_OPERATORS,
    ...JSON_OPERATORS,
    ...UNARY_OPERATORS,
    'between',
    'between symmetric',
];
/**
 * @internal
 */
export const OperatorNode = freeze({
    is(node) {
        return node.kind === 'OperatorNode';
    },
    create(operator) {
        return freeze({
            kind: 'OperatorNode',
            operator,
        });
    },
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export function isOperator(op) {
    return isString(op) && OPERATORS.includes(op);
}
export function isBinaryOperator(op) {
    return isString(op) && BINARY_OPERATORS_DICTIONARY[op];
}
/**
 * @deprecated will be removed in version 0.30.x
 */
export function isComparisonOperator(op) {
    return isString(op) && COMPARISON_OPERATORS.includes(op);
}
/**
 * @deprecated will be removed in version 0.30.x
 */
export function isArithmeticOperator(op) {
    return isString(op) && ARITHMETIC_OPERATORS.includes(op);
}
export function isJSONOperator(op) {
    return isString(op) && JSON_OPERATORS_DICTIONARY[op];
}
export function isUnaryOperator(op) {
    return isString(op) && UNARY_OPERATORS_DICTIONARY[op];
}
