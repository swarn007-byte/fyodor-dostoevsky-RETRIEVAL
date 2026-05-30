import type { OperationNode } from './operation-node.js';
export type SimpleColumnDataType = 'varchar' | 'char' | 'text' | 'integer' | 'int2' | 'int4' | 'int8' | 'smallint' | 'bigint' | 'boolean' | 'real' | 'double precision' | 'float4' | 'float8' | 'decimal' | 'numeric' | 'binary' | 'bytea' | 'date' | 'datetime' | 'time' | 'timetz' | 'timestamp' | 'timestamptz' | 'serial' | 'bigserial' | 'uuid' | 'json' | 'jsonb' | 'datetime2' | 'blob' | 'varbinary' | 'int4range' | 'int4multirange' | 'int8range' | 'int8multirange' | 'numrange' | 'nummultirange' | 'tsrange' | 'tsmultirange' | 'tstzrange' | 'tstzmultirange' | 'daterange' | 'datemultirange';
export type ColumnDataType = SimpleColumnDataType | `varchar(${number})` | `char(${number})` | `decimal(${number}, ${number})` | `numeric(${number}, ${number})` | `binary(${number})` | `datetime(${number})` | `datetime2(${number})` | `time(${number})` | `timetz(${number})` | `timestamp(${number})` | `timestamptz(${number})` | `varbinary(${number})`;
export type DataTypeParams = Omit<DataTypeNode, 'kind' | 'dataType'>;
export interface DataTypeNode extends OperationNode {
    readonly kind: 'DataTypeNode';
    readonly dataType: ColumnDataType;
}
type DataTypeNodeFactory = Readonly<{
    is(node: OperationNode): node is DataTypeNode;
    create(dataType: ColumnDataType): Readonly<DataTypeNode>;
}>;
/**
 * @internal
 */
export declare const DataTypeNode: DataTypeNodeFactory;
export declare function isColumnDataType(dataType: string): dataType is ColumnDataType;
export {};
