/// <reference types="./drop-column-builder.d.ts" />
import { DropColumnNode } from '../operation-node/drop-column-node.js';
import { freeze } from '../util/object-utils.js';
export class DropColumnBuilder {
    #props;
    constructor(props) {
        this.#props = freeze({ ...props });
    }
    ifExists() {
        return new DropColumnBuilder({
            ...this.#props,
            node: DropColumnNode.cloneWith(this.#props.node, { ifExists: true }),
        });
    }
    toOperationNode() {
        return this.#props.node;
    }
}
