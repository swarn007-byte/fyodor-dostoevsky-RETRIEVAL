import type { OperationNode } from './operation-node.js';
import type { SchemableIdentifierNode } from './schemable-identifier-node.js';
import type { IdentifierNode } from './identifier-node.js';
import type { AddValueNode } from './add-value-node.js';
import type { RenameValueNode } from './rename-value-node.js';
export type AlterTypeNodeProps = Omit<AlterTypeNode, 'kind' | 'name'>;
export interface AlterTypeNode extends OperationNode {
    readonly kind: 'AlterTypeNode';
    readonly name: SchemableIdentifierNode;
    readonly addValue?: AddValueNode;
    readonly renameTo?: IdentifierNode;
    readonly renameValue?: RenameValueNode;
    readonly setSchema?: IdentifierNode;
}
type AlterTypeNodeFactory = Readonly<{
    is(node: OperationNode): node is AlterTypeNode;
    create(name: SchemableIdentifierNode): Readonly<AlterTypeNode>;
    cloneWith(node: AlterTypeNode, props: AlterTypeNodeProps): Readonly<AlterTypeNode>;
}>;
/**
 * @internal
 */
export declare const AlterTypeNode: AlterTypeNodeFactory;
export {};
