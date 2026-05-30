/// <reference types="./on-modify-action-parser.d.ts" />
import { isOnModifyForeignAction, } from '../operation-node/references-node.js';
export function parseOnModifyForeignAction(action) {
    if (isOnModifyForeignAction(action)) {
        return action;
    }
    throw new Error(`invalid OnModifyForeignAction ${action}`);
}
