/// <reference types="./readonly-compiled-query.d.ts" />
import { SelectQueryNode } from '../operation-node/select-query-node.js';
import { isCompiledQuery, } from '../query-compiler/compiled-query.js';
export function isReadonlyCompiledQuery(thing) {
    return isCompiledQuery(thing) && SelectQueryNode.is(thing.query);
}
