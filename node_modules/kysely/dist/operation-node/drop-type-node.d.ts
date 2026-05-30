import type { OperationNode } from './operation-node.js';
import type { SchemableIdentifierNode } from './schemable-identifier-node.js';
export type DropTypeNodeParams = Omit<Partial<DropTypeNode>, 'kind' | 'name' | 'additionalNames'>;
export interface DropTypeNode extends OperationNode {
    readonly kind: 'DropTypeNode';
    readonly name: SchemableIdentifierNode;
    readonly additionalNames?: SchemableIdentifierNode[];
    readonly ifExists?: boolean;
    readonly cascade?: boolean;
}
type DropTypeNodeFactory = Readonly<{
    is(node: OperationNode): node is DropTypeNode;
    create(names: SchemableIdentifierNode | SchemableIdentifierNode[]): Readonly<DropTypeNode>;
    cloneWith(dropType: DropTypeNode, params: DropTypeNodeParams): Readonly<DropTypeNode>;
}>;
/**
 * @internal
 */
export declare const DropTypeNode: DropTypeNodeFactory;
export {};
