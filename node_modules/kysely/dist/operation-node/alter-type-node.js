/// <reference types="./alter-type-node.d.ts" />
import { freeze } from '../util/object-utils.js';
/**
 * @internal
 */
export const AlterTypeNode = freeze({
    is(node) {
        return node.kind === 'AlterTypeNode';
    },
    create(name) {
        return freeze({
            kind: 'AlterTypeNode',
            name,
        });
    },
    cloneWith(node, props) {
        return freeze({
            ...node,
            ...props,
        });
    },
});
