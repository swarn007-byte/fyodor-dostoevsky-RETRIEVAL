/// <reference types="./compiled-query.d.ts" />
import { RawNode } from '../operation-node/raw-node.js';
import { isRootOperationNode, } from '../operation-node/root-operation-node.js';
import { freeze, isObject, isString } from '../util/object-utils.js';
import { createQueryId } from '../util/query-id.js';
export function isCompiledQuery(thing) {
    return (isObject(thing) &&
        Object.hasOwn(thing, 'parameters') &&
        Object.hasOwn(thing, 'query') &&
        Object.hasOwn(thing, 'queryId') &&
        Object.hasOwn(thing, 'sql') &&
        isString(thing.sql) &&
        Array.isArray(thing.parameters) &&
        isRootOperationNode(thing.query));
}
export const CompiledQuery = freeze({
    raw(sql, parameters = []) {
        return freeze({
            sql,
            query: RawNode.createWithSql(sql),
            parameters: freeze(parameters),
            queryId: createQueryId(),
        });
    },
});
