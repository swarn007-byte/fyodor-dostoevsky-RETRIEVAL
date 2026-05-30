/// <reference types="./references-node.d.ts" />
import { freeze, isString } from '../util/object-utils.js';
const ON_MODIFY_FOREIGN_ACTIONS_DICTIONARY = freeze({
    cascade: true,
    'no action': true,
    restrict: true,
    'set default': true,
    'set null': true,
});
/**
 * @deprecated will be removed in version 0.30.x
 */
export const ON_MODIFY_FOREIGN_ACTIONS = Object.keys(ON_MODIFY_FOREIGN_ACTIONS_DICTIONARY);
/**
 * @internal
 */
export const ReferencesNode = freeze({
    is(node) {
        return node.kind === 'ReferencesNode';
    },
    create(table, columns) {
        return freeze({
            kind: 'ReferencesNode',
            table,
            columns: freeze([...columns]),
        });
    },
    cloneWithOnDelete(references, onDelete) {
        return freeze({
            ...references,
            onDelete,
        });
    },
    cloneWithOnUpdate(references, onUpdate) {
        return freeze({
            ...references,
            onUpdate,
        });
    },
});
export function isOnModifyForeignAction(thing) {
    return isString(thing) && ON_MODIFY_FOREIGN_ACTIONS_DICTIONARY[thing];
}
