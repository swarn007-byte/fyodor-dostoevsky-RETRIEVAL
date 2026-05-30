import type { OperationNode } from './operation-node.js';
export type ComparisonOperator = '=' | '==' | '!=' | '<>' | '>' | '>=' | '<' | '<=' | 'in' | 'not in' | 'is' | 'is not' | 'like' | 'not like' | 'match' | 'ilike' | 'not ilike' | '@>' | '<@' | '^@' | '&&' | '?' | '?&' | '?|' | '!<' | '!>' | '<=>' | '!~' | '~' | '~*' | '!~*' | '@@' | '@@@' | '!!' | '<->' | 'regexp' | 'is distinct from' | 'is not distinct from';
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const COMPARISON_OPERATORS: readonly ComparisonOperator[];
export type ArithmeticOperator = '+' | '-' | '*' | '/' | '%' | '^' | '&' | '|' | '#' | '<<' | '>>';
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const ARITHMETIC_OPERATORS: readonly ArithmeticOperator[];
export type JSONOperator = '->' | '->>';
export type JSONOperatorWith$ = JSONOperator | `${JSONOperator}$`;
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const JSON_OPERATORS: readonly JSONOperator[];
export type BinaryOperator = ComparisonOperator | ArithmeticOperator | '||';
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const BINARY_OPERATORS: readonly BinaryOperator[];
export type UnaryFilterOperator = 'exists' | 'not exists';
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const UNARY_FILTER_OPERATORS: readonly UnaryFilterOperator[];
export type UnaryOperator = 'not' | '-' | UnaryFilterOperator;
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const UNARY_OPERATORS: readonly UnaryOperator[];
export type Operator = BinaryOperator | JSONOperator | UnaryOperator | 'between' | 'between symmetric';
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare const OPERATORS: readonly Operator[];
export interface OperatorNode extends OperationNode {
    readonly kind: 'OperatorNode';
    readonly operator: Operator;
}
type OperatorNodeFactory = Readonly<{
    is(node: OperationNode): node is OperatorNode;
    create(operator: Operator): Readonly<OperatorNode>;
}>;
/**
 * @internal
 */
export declare const OperatorNode: OperatorNodeFactory;
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare function isOperator(op: unknown): op is Operator;
export declare function isBinaryOperator(op: unknown): op is BinaryOperator;
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare function isComparisonOperator(op: unknown): op is ComparisonOperator;
/**
 * @deprecated will be removed in version 0.30.x
 */
export declare function isArithmeticOperator(op: unknown): op is ArithmeticOperator;
export declare function isJSONOperator(op: unknown): op is JSONOperator;
export declare function isUnaryOperator(op: unknown): op is UnaryOperator;
export {};
