/// <reference types="./alter-type-add-value-builder.d.ts" />
var _a;
import { AddValueNode } from '../operation-node/add-value-node.js';
import { ValueNode } from '../operation-node/value-node.js';
import { AlterTypeNode } from '../operation-node/alter-type-node.js';
import { QueryFinalizer } from '../query-finalizer.js';
export class AlterTypeAddValueBuilder extends QueryFinalizer {
    #props;
    constructor(props) {
        super(props);
        this.#props = props;
    }
    /**
     * Adds an `if not exists` clause.
     */
    ifNotExists() {
        return new _a({
            ...this.#props,
            node: AlterTypeNode.cloneWith(this.#props.node, {
                addValue: AddValueNode.cloneWith(this.#props.node.addValue, {
                    ifNotExists: true,
                }),
            }),
        });
    }
    /**
     * Sets a `before <value>` clause.
     */
    before(neighborValue) {
        return this.#setNeighbor(neighborValue, true);
    }
    /**
     * Sets an `after <value>` clause.
     */
    after(neighborValue) {
        return this.#setNeighbor(neighborValue, false);
    }
    #setNeighbor(neighborValue, isBefore) {
        return new _a({
            ...this.#props,
            node: AlterTypeNode.cloneWith(this.#props.node, {
                addValue: AddValueNode.cloneWith(this.#props.node.addValue, {
                    isBefore,
                    neighborValue: ValueNode.createImmediate(neighborValue),
                }),
            }),
        });
    }
}
_a = AlterTypeAddValueBuilder;
