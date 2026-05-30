/// <reference types="./parse-json-results-plugin.d.ts" />
import { freeze, isPlainObject, isString } from '../../util/object-utils.js';
/**
 * Parses JSON strings in query results into JSON objects.
 *
 * This plugin can be useful with dialects that don't automatically parse
 * JSON into objects and arrays but return JSON strings instead.
 *
 * To apply this plugin globally, pass an instance of it to the `plugins` option
 * when creating a new `Kysely` instance:
 *
 * ```ts
 * import * as Sqlite from 'better-sqlite3'
 * import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely'
 * import type { Database } from 'type-editor' // imaginary module
 *
 * const db = new Kysely<Database>({
 *   dialect: new SqliteDialect({
 *     database: new Sqlite(':memory:'),
 *   }),
 *   plugins: [new ParseJSONResultsPlugin()],
 * })
 * ```
 *
 * To apply this plugin to a single query:
 *
 * ```ts
 * import { ParseJSONResultsPlugin } from 'kysely'
 * import { jsonArrayFrom } from 'kysely/helpers/sqlite'
 *
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     'first_name',
 *     'last_name',
 *     jsonArrayFrom(
 *       eb.selectFrom('pet')
 *         .whereRef('owner_id', '=', 'person.id')
 *         .select(['name', 'species'])
 *     ).as('pets')
 *   ])
 *   .withPlugin(new ParseJSONResultsPlugin())
 *   .execute()
 * ```
 */
export class ParseJSONResultsPlugin {
    options;
    #options;
    constructor(options = {}) {
        this.options = options;
        const { shouldParse } = options;
        this.#options = freeze({
            objectStrategy: options.objectStrategy || 'in-place',
            reviver: options.reviver || ((_, value) => value),
            shouldParse: shouldParse
                ? (value, jsonPath) => maybeJson(value) && shouldParse(value, jsonPath)
                : maybeJson,
        });
    }
    // noop
    transformQuery(args) {
        return args.node;
    }
    async transformResult(args) {
        return {
            ...args.result,
            rows: parseArray(args.result.rows, '$', this.#options),
        };
    }
}
function parseArray(arr, jsonPath, options) {
    const target = options.objectStrategy === 'create' ? new Array(arr.length) : arr;
    for (let i = 0; i < arr.length; ++i) {
        target[i] = parse(arr[i], `${jsonPath}[${i}]`, options);
    }
    return target;
}
function parse(value, jsonPath, options) {
    if (isString(value)) {
        return parseString(value, jsonPath, options);
    }
    if (Array.isArray(value)) {
        return parseArray(value, jsonPath, options);
    }
    if (isPlainObject(value)) {
        return parseObject(value, jsonPath, options);
    }
    return value;
}
function parseString(str, jsonPath, options) {
    const { shouldParse } = options;
    if (!shouldParse(str, jsonPath)) {
        return str;
    }
    try {
        return parse(JSON.parse(str, (key, value, ...otherArgs) => {
            // prevent prototype pollution
            if (key === '__proto__') {
                return;
            }
            // prevent prototype pollution
            if (key === 'constructor' &&
                isPlainObject(value) &&
                Object.hasOwn(value, 'prototype')) {
                delete value.prototype;
            }
            return options.reviver(key, value, ...otherArgs);
        }), jsonPath, { ...options, objectStrategy: 'in-place' });
    }
    catch (error) {
        // custom JSON detection should expose parsing errors.
        if (shouldParse !== maybeJson) {
            throw error;
        }
        // built-in naive heuristic should keep going despite errors given there might be false positives in detection.
        console.error(error);
        return str;
    }
}
function maybeJson(value) {
    return ((value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']')));
}
function parseObject(obj, jsonPath, options) {
    const { objectStrategy } = options;
    const target = objectStrategy === 'create' ? {} : obj;
    for (const key of Object.keys(obj)) {
        // prevent prototype pollution
        if (key === '__proto__') {
            continue;
        }
        const parsed = parse(obj[key], `${jsonPath}."${key}"`, options);
        // prevent prototype pollution
        if (key === 'constructor' &&
            isPlainObject(parsed) &&
            Object.hasOwn(parsed, 'prototype')) {
            delete parsed.prototype;
        }
        target[key] = parsed;
    }
    return target;
}
