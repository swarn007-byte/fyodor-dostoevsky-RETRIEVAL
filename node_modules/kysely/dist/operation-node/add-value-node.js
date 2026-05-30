/// <reference types="./add-value-node.d.ts" />
import { freeze } from '../util/object-utils.js';
/**
 * @internal
 */
export const AddValueNode = freeze({
    is(node) {
        return node.kind === 'AddValueNode';
    },
    create(value) {
        return freeze({
            kind: 'AddValueNode',
            value,
        });
    },
    cloneWith(node, props) {
        return freeze({
            ...node,
            ...props,
        });
    },
});
