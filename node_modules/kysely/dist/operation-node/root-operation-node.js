/// <reference types="./root-operation-node.d.ts" />
import { isOperationNode } from './operation-node.js';
const ROOT_OPERATION_NODE_KINDS = {
    AlterTableNode: true,
    AlterTypeNode: true,
    CreateIndexNode: true,
    CreateSchemaNode: true,
    CreateTableNode: true,
    CreateTypeNode: true,
    CreateViewNode: true,
    DeleteQueryNode: true,
    DropIndexNode: true,
    DropSchemaNode: true,
    DropTableNode: true,
    DropTypeNode: true,
    RefreshMaterializedViewNode: true,
    DropViewNode: true,
    InsertQueryNode: true,
    RawNode: true,
    SelectQueryNode: true,
    UpdateQueryNode: true,
    MergeQueryNode: true,
};
export function isRootOperationNode(thing) {
    return (isOperationNode(thing) &&
        ROOT_OPERATION_NODE_KINDS[thing.kind] === true);
}
