/// <reference types="./alter-type-builder.d.ts" />
import { freeze } from '../util/object-utils.js';
import { AlterTypeNode } from '../operation-node/alter-type-node.js';
import { IdentifierNode } from '../operation-node/identifier-node.js';
import { AlterTypeAddValueBuilder } from './alter-type-add-value-builder.js';
import { AddValueNode } from '../operation-node/add-value-node.js';
import { ValueNode } from '../operation-node/value-node.js';
import { QueryFinalizer } from '../query-finalizer.js';
import { RenameValueNode } from '../operation-node/rename-value-node.js';
/**
 * This builder can be used to create `alter type` queries.
 */
export class AlterTypeBuilder {
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    /**
     * Adds a new value to an enum type.
     */
    addValue(value) {
        return new AlterTypeAddValueBuilder({
            ...this.#props,
            node: AlterTypeNode.cloneWith(this.#props.node, {
                addValue: AddValueNode.create(ValueNode.createImmediate(value)),
            }),
        });
    }
    /**
     * Rename the type.
     */
    renameTo(newName) {
        return new QueryFinalizer({
            ...this.#props,
            node: AlterTypeNode.cloneWith(this.#props.node, {
                renameTo: IdentifierNode.create(newName),
            }),
        });
    }
    /**
     * Renames a value of an enum type.
     */
    renameValue(oldValue, newValue) {
        return new QueryFinalizer({
            ...this.#props,
            node: AlterTypeNode.cloneWith(this.#props.node, {
                renameValue: RenameValueNode.create(ValueNode.createImmediate(oldValue), ValueNode.createImmediate(newValue)),
            }),
        });
    }
    /**
     * Changes the type's schema.
     */
    setSchema(schema) {
        return new QueryFinalizer({
            ...this.#props,
            node: AlterTypeNode.cloneWith(this.#props.node, {
                setSchema: IdentifierNode.create(schema),
            }),
        });
    }
}
