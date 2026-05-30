/// <reference types="./create-table-add-index-builder.d.ts" />
import { AddIndexNode } from '../operation-node/add-index-node.js';
import { RawNode } from '../operation-node/raw-node.js';
export class CreateTableAddIndexBuilder {
    #node;
    constructor(node) {
        this.#node = node;
    }
    using(indexType) {
        return new CreateTableAddIndexBuilder(AddIndexNode.cloneWith(this.#node, {
            using: RawNode.createWithSql(indexType),
        }));
    }
    /**
     * Simply calls the provided function passing `this` as the only argument. `$call` returns
     * what the provided function returns.
     */
    $call(func) {
        return func(this);
    }
    toOperationNode() {
        return this.#node;
    }
}
