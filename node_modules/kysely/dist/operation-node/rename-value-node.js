/// <reference types="./rename-value-node.d.ts" />
import { freeze } from '../util/object-utils.js';
export const RenameValueNode = freeze({
    is(node) {
        return node.kind === 'RenameValueNode';
    },
    create(oldValue, newValue) {
        return freeze({
            kind: 'RenameValueNode',
            oldValue,
            newValue,
        });
    },
});
