/// <reference types="./unique-constraint-node.d.ts" />
import { logOnce } from '../util/log-once.js';
import { freeze, isString } from '../util/object-utils.js';
import { ColumnNode } from './column-node.js';
import { IdentifierNode } from './identifier-node.js';
/**
 * @internal
 */
export const UniqueConstraintNode = freeze({
    is(node) {
        return node.kind === 'UniqueConstraintNode';
    },
    create(columns, constraintName, nullsNotDistinct) {
        // TODO: remove this block when support for `string[]` is removed.
        if (isString(columns.at(0))) {
            logOnce('`UniqueConstraintNode.create(columns: string[], ...)` is deprecated - pass `ColumnNode[]` instead.');
            columns = columns.map(ColumnNode.create);
        }
        return freeze({
            kind: 'UniqueConstraintNode',
            columns: freeze(columns),
            name: constraintName ? IdentifierNode.create(constraintName) : undefined,
            nullsNotDistinct,
        });
    },
    cloneWith(node, props) {
        return freeze({ ...node, ...props });
    },
});
