/// <reference types="./create-table-node.d.ts" />
import { freeze } from '../util/object-utils.js';
export const ON_COMMIT_ACTIONS = ['preserve rows', 'delete rows', 'drop'];
/**
 * @internal
 */
export const CreateTableNode = freeze({
    is(node) {
        return node.kind === 'CreateTableNode';
    },
    create(table) {
        return freeze({
            kind: 'CreateTableNode',
            table,
            columns: freeze([]),
        });
    },
    cloneWithColumn(node, column) {
        return freeze({
            ...node,
            columns: freeze([...node.columns, column]),
        });
    },
    cloneWithConstraint(node, constraint) {
        return freeze({
            ...node,
            constraints: node.constraints
                ? freeze([...node.constraints, constraint])
                : freeze([constraint]),
        });
    },
    cloneWithIndex(node, index) {
        return freeze({
            ...node,
            indexes: node.indexes
                ? freeze([...node.indexes, index])
                : freeze([index]),
        });
    },
    cloneWithFrontModifier(node, modifier) {
        return freeze({
            ...node,
            frontModifiers: node.frontModifiers
                ? freeze([...node.frontModifiers, modifier])
                : freeze([modifier]),
        });
    },
    cloneWithEndModifier(node, modifier) {
        return freeze({
            ...node,
            endModifiers: node.endModifiers
                ? freeze([...node.endModifiers, modifier])
                : freeze([modifier]),
        });
    },
    cloneWith(node, params) {
        return freeze({
            ...node,
            ...params,
        });
    },
});
