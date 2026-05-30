import type { QueryExecutor } from '../query-executor/query-executor.js';
import type { QueryId } from '../util/query-id.js';
import { AlterTypeNode } from '../operation-node/alter-type-node.js';
import { AlterTypeAddValueBuilder } from './alter-type-add-value-builder.js';
import { QueryFinalizer } from '../query-finalizer.js';
/**
 * This builder can be used to create `alter type` queries.
 */
export declare class AlterTypeBuilder<const N extends string> {
    #private;
    constructor(props: AlterTypeBuilderProps);
    /**
     * Adds a new value to an enum type.
     */
    addValue<const V extends string>(value: V): AlterTypeAddValueBuilder<V>;
    /**
     * Rename the type.
     */
    renameTo<NN extends string>(newName: NN extends N ? never : NN): QueryFinalizer<AlterTypeNode>;
    /**
     * Renames a value of an enum type.
     */
    renameValue<const OV extends string, const NV extends string>(oldValue: OV, newValue: NV extends OV ? never : NV): QueryFinalizer<AlterTypeNode>;
    /**
     * Changes the type's schema.
     */
    setSchema<const NS extends string>(schema: NS extends (N extends `${infer S}.${string}` ? S : never) ? never : NS): QueryFinalizer<AlterTypeNode>;
}
export interface AlterTypeBuilderProps {
    readonly executor: QueryExecutor;
    readonly node: AlterTypeNode;
    readonly queryId: QueryId;
}
