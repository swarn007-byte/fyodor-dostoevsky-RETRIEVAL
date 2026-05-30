import { DropColumnNode } from '../operation-node/drop-column-node.js';
import type { OperationNodeSource } from '../operation-node/operation-node-source.js';
export declare class DropColumnBuilder implements OperationNodeSource {
    #private;
    constructor(props: DropColumnBuilderProps);
    ifExists(): DropColumnBuilder;
    toOperationNode(): DropColumnNode;
}
export interface DropColumnBuilderProps {
    readonly node: DropColumnNode;
}
export type DropColumnBuilderCallback = (builder: DropColumnBuilder) => DropColumnBuilder;
