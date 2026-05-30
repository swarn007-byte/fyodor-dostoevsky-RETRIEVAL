/// <reference types="./operation-node.d.ts" />
import { isObject, isString } from '../util/object-utils.js';
export function isOperationNode(thing) {
    return isObject(thing) && isString(thing.kind);
}
