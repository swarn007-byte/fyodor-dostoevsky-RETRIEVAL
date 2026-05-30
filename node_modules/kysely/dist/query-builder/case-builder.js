/// <reference types="./case-builder.d.ts" />
import { ExpressionWrapper } from '../expression/expression-wrapper.js';
import { freeze } from '../util/object-utils.js';
import { parseReferenceExpression, } from '../parser/reference-parser.js';
import { CaseNode } from '../operation-node/case-node.js';
import { WhenNode } from '../operation-node/when-node.js';
import { parseReferentialBinaryOperation, parseValueBinaryOperationOrExpression, } from '../parser/binary-operation-parser.js';
import { isSafeImmediateValue, parseSafeImmediateValue, parseValueExpression, } from '../parser/value-parser.js';
export class CaseBuilder {
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    when(...args) {
        return new CaseThenBuilder({
            ...this.#props,
            node: CaseNode.cloneWithWhen(this.#props.node, WhenNode.create(parseValueBinaryOperationOrExpression(args))),
        });
    }
    whenRef(lhs, op, rhs) {
        return new CaseThenBuilder({
            ...this.#props,
            node: CaseNode.cloneWithWhen(this.#props.node, WhenNode.create(parseReferentialBinaryOperation(lhs, op, rhs))),
        });
    }
}
export class CaseThenBuilder {
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    then(valueExpression) {
        return new CaseWhenBuilder({
            ...this.#props,
            node: CaseNode.cloneWithThen(this.#props.node, isSafeImmediateValue(valueExpression)
                ? parseSafeImmediateValue(valueExpression)
                : parseValueExpression(valueExpression)),
        });
    }
    /**
     * Adds a `then` clause to the `case` statement where the value is a reference to a column.
     *
     * See {@link then} for value-first variant.
     *
     * A `thenRef` call can be followed by {@link Whenable.when}, {@link Whenable.whenRef},
     * {@link CaseWhenBuilder.else}, {@link CaseWhenBuilder.elseRef},
     * {@link CaseWhenBuilder.end} or {@link CaseWhenBuilder.endCase} call.
     */
    thenRef(expression) {
        return new CaseWhenBuilder({
            ...this.#props,
            node: CaseNode.cloneWithThen(this.#props.node, parseReferenceExpression(expression)),
        });
    }
}
export class CaseWhenBuilder {
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    when(...args) {
        return new CaseThenBuilder({
            ...this.#props,
            node: CaseNode.cloneWithWhen(this.#props.node, WhenNode.create(parseValueBinaryOperationOrExpression(args))),
        });
    }
    whenRef(lhs, op, rhs) {
        return new CaseThenBuilder({
            ...this.#props,
            node: CaseNode.cloneWithWhen(this.#props.node, WhenNode.create(parseReferentialBinaryOperation(lhs, op, rhs))),
        });
    }
    else(valueExpression) {
        return new CaseEndBuilder({
            ...this.#props,
            node: CaseNode.cloneWith(this.#props.node, {
                else: isSafeImmediateValue(valueExpression)
                    ? parseSafeImmediateValue(valueExpression)
                    : parseValueExpression(valueExpression),
            }),
        });
    }
    /**
     * Adds an `else` clause to the `case` statement where the value is a reference to a column.
     *
     * See {@link else} for value-first variant.
     *
     * An `elseRef` call must be followed by an {@link Endable.end} or {@link Endable.endCase} call.
     */
    elseRef(expression) {
        return new CaseEndBuilder({
            ...this.#props,
            node: CaseNode.cloneWith(this.#props.node, {
                else: parseReferenceExpression(expression),
            }),
        });
    }
    end() {
        return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: false }));
    }
    endCase() {
        return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: true }));
    }
}
export class CaseEndBuilder {
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    end() {
        return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: false }));
    }
    endCase() {
        return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: true }));
    }
}
