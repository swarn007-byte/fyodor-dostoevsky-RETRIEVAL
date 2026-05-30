import { IdentifierNode } from './identifier-node.js';
import type { OperationNode } from './operation-node.js';
import type { RawNode } from './raw-node.js';
export interface AddIndexNode extends OperationNode {
    readonly kind: 'AddIndexNode';
    readonly name: IdentifierNode;
    readonly columns?: OperationNode[];
    readonly unique?: boolean;
    readonly using?: RawNode;
    /**
     * @deprecated added by accident.
     */
    readonly ifNotExists?: boolean;
}
type AddIndexNodeFactory = Readonly<{
    is(node: OperationNode): node is AddIndexNode;
    create(name: string): Readonly<AddIndexNode>;
    /**
     * @deprecated `ifNotExists` was added by accident.
     */
    cloneWith(node: AddIndexNode, props: Required<Pick<AddIndexNode, 'ifNotExists'>>): Readonly<AddIndexNode>;
    cloneWith(node: AddIndexNode, props: Omit<AddIndexNode, 'kind' | 'name' | 'ifNotExists'>): Readonly<AddIndexNode>;
    cloneWithColumns(node: AddIndexNode, columns: OperationNode[]): Readonly<AddIndexNode>;
}>;
/**
 * @internal
 */
export declare const AddIndexNode: AddIndexNodeFactory;
export {};
