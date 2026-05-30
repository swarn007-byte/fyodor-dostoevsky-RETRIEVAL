/// <reference types="./query-executor-base.d.ts" />
import { freeze } from '../util/object-utils.js';
import { provideControlledConnection } from '../util/provide-controlled-connection.js';
import { ABORTED, assertNotAborted, getInflightQueryAbortHandler, printBackgroundFail, throwReasonWithTiming, } from '../util/abort.js';
import { Deferred } from '../util/deferred.js';
const NO_PLUGINS = freeze([]);
export class QueryExecutorBase {
    #plugins;
    constructor(plugins = NO_PLUGINS) {
        this.#plugins = plugins;
    }
    get plugins() {
        return this.#plugins;
    }
    transformQuery(node, queryId) {
        for (const plugin of this.#plugins) {
            const transformedNode = plugin.transformQuery({ node, queryId });
            // We need to do a runtime check here. There is no good way
            // to write types that enforce this constraint.
            if (transformedNode.kind === node.kind) {
                node = transformedNode;
            }
            else {
                throw new Error([
                    `KyselyPlugin.transformQuery must return a node`,
                    `of the same kind that was given to it.`,
                    `The plugin was given a ${node.kind}`,
                    `but it returned a ${transformedNode.kind}`,
                ].join(' '));
            }
        }
        return node;
    }
    async executeQuery(compiledQuery, options) {
        const { inflightQueryAbortStrategy = 'ignore query', signal } = options || {};
        // intentionally isolating the simple common case from the new cancellation flow.
        if (!signal) {
            const result = await this.provideConnection(async (connection) => {
                return await connection.executeQuery(compiledQuery);
            }, options);
            return await this.#transformResult(result, compiledQuery.queryId);
        }
        assertNotAborted(signal, 'before query execution');
        options = freeze({ signal });
        const { connection, release } = await provideControlledConnection(this, options);
        const controlConnectionProvider = this.provideConnection.bind(this);
        const { promise: abortPromise, resolve } = new Deferred();
        const abortListener = () => resolve(ABORTED);
        signal.addEventListener('abort', abortListener, { once: true });
        try {
            assertNotAborted(signal, 'before query execution', release);
            const inflightQueryAbortHandler = getInflightQueryAbortHandler(inflightQueryAbortStrategy, connection, release);
            if (inflightQueryAbortHandler && connection.collectSessionInfo) {
                assertNotAborted(signal, 'before query execution', release);
                const collectPromise = connection.collectSessionInfo();
                const result = await Promise.race([abortPromise, collectPromise]).catch((error) => {
                    release();
                    throw error;
                });
                if (result === ABORTED) {
                    void collectPromise
                        .catch(printBackgroundFail('collectSessionInfo'))
                        .finally(release);
                    throwReasonWithTiming(signal.reason, 'before query execution');
                }
            }
            const queryPromise = connection.executeQuery(compiledQuery, options);
            const result = await Promise.race([abortPromise, queryPromise])
                // only the query can error. in that case, we want to release immediately.
                .catch((error) => {
                release();
                throw error;
            });
            if (result === ABORTED) {
                void Promise.allSettled([
                    queryPromise.catch(printBackgroundFail('query')),
                    inflightQueryAbortHandler?.(controlConnectionProvider).catch(printBackgroundFail('inflightQueryAbortHandler')),
                ])
                    // the abort handler might use the same connection that runs the query.
                    .finally(release);
                throwReasonWithTiming(signal.reason, 'during query execution');
            }
            else {
                release();
            }
            const transformPromise = this.#transformResult(result, compiledQuery.queryId, options);
            const transformedResult = await Promise.race([
                abortPromise,
                transformPromise,
            ]);
            if (transformedResult === ABORTED) {
                transformPromise.catch(printBackgroundFail('plugins.transformResult'));
                throwReasonWithTiming(signal.reason, 'during result transformation');
            }
            return transformedResult;
        }
        finally {
            resolve(ABORTED);
            signal.removeEventListener('abort', abortListener);
        }
    }
    async *stream(compiledQuery, chunkSize, options) {
        const { signal } = options || {};
        if (!signal) {
            const { connection, release } = await provideControlledConnection(this);
            try {
                for await (const result of connection.streamQuery(compiledQuery, chunkSize)) {
                    yield await this.#transformResult(result, compiledQuery.queryId, options);
                }
            }
            finally {
                release();
            }
            return;
        }
        options = freeze({ signal });
        assertNotAborted(signal, 'before connection acquisition');
        const { connection, release } = await provideControlledConnection(this, options);
        const { promise: abortPromise, resolve } = new Deferred();
        const abortListener = () => resolve(ABORTED);
        signal.addEventListener('abort', abortListener, { once: true });
        let asyncIterator;
        let releasePrerequisite;
        assertNotAborted(signal, 'before query streaming', release);
        const { queryId } = compiledQuery;
        try {
            asyncIterator = connection.streamQuery(compiledQuery, chunkSize, options);
            while (true) {
                assertNotAborted(signal, 'during query streaming');
                const nextPromise = asyncIterator.next();
                const result = await Promise.race([abortPromise, nextPromise]);
                if (result === ABORTED) {
                    releasePrerequisite = nextPromise.catch(printBackgroundFail('iterator.next'));
                    throwReasonWithTiming(signal.reason, 'during query streaming');
                }
                if (result.done) {
                    break;
                }
                const transformPromise = this.#transformResult(result.value, queryId, options);
                const transformedResult = await Promise.race([
                    abortPromise,
                    transformPromise,
                ]);
                if (transformedResult === ABORTED) {
                    releasePrerequisite = transformPromise.catch(printBackgroundFail('plugins.transformResult'));
                    throwReasonWithTiming(signal.reason, 'during result transformation');
                }
                yield transformedResult;
            }
        }
        finally {
            resolve(ABORTED);
            signal.removeEventListener('abort', abortListener);
            const cleanup = (asyncIterator?.return?.() || Promise.resolve())
                .finally(() => releasePrerequisite)
                .finally(release);
            if (!releasePrerequisite) {
                await cleanup;
            }
        }
    }
    async #transformResult(result, queryId, options) {
        const { signal } = options || {};
        for (const plugin of this.#plugins) {
            result = await plugin.transformResult(freeze({ queryId, result, signal }));
        }
        return result;
    }
}
