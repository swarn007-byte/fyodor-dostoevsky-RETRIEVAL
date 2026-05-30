import type { QueryResult } from '../../driver/database-connection.js';
import type { RootOperationNode } from '../../operation-node/root-operation-node.js';
import type { UnknownRow } from '../../util/type-utils.js';
import type { KyselyPlugin, PluginTransformQueryArgs, PluginTransformResultArgs } from '../kysely-plugin.js';
/**
 * Plugin that handles NULL comparisons to prevent common SQL mistakes.
 *
 * In SQL, comparing values with NULL using standard comparison operators (=, !=, <>)
 * always yields NULL, which is usually not what developers expect. The correct way
 * to compare with NULL is using IS NULL and IS NOT NULL.
 *
 * When working with nullable variables (e.g. string | null), you need to be careful to
 * manually handle these cases with conditional WHERE clauses. This plugins automatically
 * applies the correct operator based on the value, allowing you to simply write `query.where('name', '=', name)`.
 *
 * The plugin transforms the following operators when comparing with NULL:
 * - `=` becomes `IS`
 * - `!=` becomes `IS NOT`
 * - `<>` becomes `IS NOT`
 */
export declare class SafeNullComparisonPlugin implements KyselyPlugin {
    #private;
    /**
     * This is called for each query before it is executed. You can modify the query by
     * transforming its {@link OperationNode} tree provided in {@link PluginTransformQueryArgs.node | args.node}
     * and returning the transformed tree. You'd usually want to use an {@link OperationNodeTransformer}
     * for this.
     *
     * If you need to pass some query-related data between this method and `transformResult` you
     * can use a `WeakMap` with {@link PluginTransformQueryArgs.queryId | args.queryId} as the key:
     *
     * ```ts
     * import type {
     *   KyselyPlugin,
     *   QueryResult,
     *   RootOperationNode,
     *   UnknownRow
     * } from 'kysely'
     *
     * interface MyData {
     *   // ...
     * }
     * const data = new WeakMap<any, MyData>()
     *
     * const plugin = {
     *   transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
     *     const something: MyData = {}
     *
     *     // ...
     *
     *     data.set(args.queryId, something)
     *
     *     // ...
     *
     *     return args.node
     *   },
     *
     *   async transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
     *     // ...
     *
     *     const something = data.get(args.queryId)
     *
     *     // ...
     *
     *     return args.result
     *   }
     * } satisfies KyselyPlugin
     * ```
     *
     * You should use a `WeakMap` instead of a `Map` or some other strong references because `transformQuery`
     * is not always matched by a call to `transformResult` which would leave orphaned items in the map
     * and cause a memory leak.
     */
    transformQuery(args: PluginTransformQueryArgs): RootOperationNode;
    /**
     * This method is called for each query after it has been executed. The result
     * of the query can be accessed through {@link PluginTransformResultArgs.result | args.result}.
     * You can modify the result and return the modifier result.
     */
    transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>>;
}
