/// <reference types="./data-type-node.d.ts" />
import { freeze } from '../util/object-utils.js';
const SIMPLE_COLUMN_DATA_TYPES = freeze({
    bigint: true,
    bigserial: true,
    binary: true,
    blob: true,
    boolean: true,
    bytea: true,
    char: true,
    date: true,
    datemultirange: true,
    daterange: true,
    datetime: true,
    datetime2: true,
    decimal: true,
    'double precision': true,
    float4: true,
    float8: true,
    int2: true,
    int4: true,
    int4multirange: true,
    int4range: true,
    int8: true,
    int8multirange: true,
    int8range: true,
    integer: true,
    json: true,
    jsonb: true,
    numeric: true,
    nummultirange: true,
    numrange: true,
    real: true,
    serial: true,
    smallint: true,
    text: true,
    time: true,
    timestamp: true,
    timestamptz: true,
    timetz: true,
    tsmultirange: true,
    tsrange: true,
    tstzmultirange: true,
    tstzrange: true,
    uuid: true,
    varbinary: true,
    varchar: true,
});
const COLUMN_DATA_TYPE_REGEX = freeze([
    /^varchar\(\d+\)$/,
    /^char\(\d+\)$/,
    /^decimal\(\d+, \d+\)$/,
    /^numeric\(\d+, \d+\)$/,
    /^binary\(\d+\)$/,
    /^datetime\(\d+\)$/,
    /^time\(\d+\)$/,
    /^timetz\(\d+\)$/,
    /^timestamp\(\d+\)$/,
    /^timestamptz\(\d+\)$/,
    /^datetime2\(\d+\)$/,
    /^varbinary\(\d+\)$/,
]);
/**
 * @internal
 */
export const DataTypeNode = freeze({
    is(node) {
        return node.kind === 'DataTypeNode';
    },
    create(dataType) {
        return freeze({
            kind: 'DataTypeNode',
            dataType,
        });
    },
});
export function isColumnDataType(dataType) {
    return (SIMPLE_COLUMN_DATA_TYPES[dataType] ||
        COLUMN_DATA_TYPE_REGEX.some((r) => r.test(dataType)));
}
