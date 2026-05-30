/// <reference types="./drop-type-node.d.ts" />
import { freeze } from '../util/object-utils.js';
/**
 * @internal
 */
export const DropTypeNode = freeze({
    is(node) {
        return node.kind === 'DropTypeNode';
    },
    create(names) {
        if (!Array.isArray(names)) {
            names = [names];
        }
        return freeze({
            kind: 'DropTypeNode',
            name: names[0],
            additionalNames: names.slice(1),
        });
    },
    cloneWith(dropType, params) {
        return freeze({
            ...dropType,
            ...params,
        });
    },
});
