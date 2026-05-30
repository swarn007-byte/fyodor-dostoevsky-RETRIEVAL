/// <reference types="./runtime-driver.d.ts" />
import { printBackgroundFail, waitOrAbort, } from '../util/abort.js';
import { performanceNow } from '../util/performance-now.js';
import { ConnectionMutex } from './connection-mutex.js';
/**
 * A small wrapper around {@link Driver} that makes sure the driver is
 * initialized before it is used, only initialized and destroyed
 * once etc.
 */
export class RuntimeDriver {
    #driver;
    #log;
    #initPromise;
    #initDone;
    #destroyPromise;
    #connections = new WeakSet();
    #connectionMutex;
    constructor(driver, adapter, log) {
        this.#driver = driver;
        this.#initDone = false;
        this.#log = log;
        if (adapter.supportsMultipleConnections === false) {
            this.#connectionMutex = new ConnectionMutex();
        }
    }
    async init(options) {
        if (this.#destroyPromise) {
            throw new Error('driver has already been destroyed');
        }
        this.#initPromise ??= this.#driver
            .init(options)
            .then(() => {
            this.#initDone = true;
        })
            .catch((reason) => {
            // ensure `init` is retried later.
            this.#initPromise = undefined;
            throw reason;
        });
        await waitOrAbort(this.#initPromise, options?.signal, 'init');
    }
    async acquireConnection(options) {
        if (this.#destroyPromise) {
            throw new Error('driver has already been destroyed');
        }
        if (!this.#initDone) {
            await this.init(options);
        }
        if (this.#connectionMutex) {
            const lockPromise = this.#connectionMutex.obtainLock();
            await waitOrAbort(lockPromise, options?.signal, 'acquireConnection:mutex', () => lockPromise.then(() => this.#connectionMutex?.releaseLock()));
        }
        const connectionPromise = this.#driver.acquireConnection(options);
        const connection = await waitOrAbort(connectionPromise, options?.signal, 'acquireConnection:acquire', () => connectionPromise
            ?.then((connection) => this.releaseConnection(connection).catch(printBackgroundFail('driver.releaseConnection')))
            .catch(printBackgroundFail('driver.acquireConnection')));
        if (!this.#connections.has(connection)) {
            if (this.#needsLogging()) {
                this.#addLogging(connection);
            }
            this.#connections.add(connection);
        }
        return connection;
    }
    async releaseConnection(connection, options) {
        await this.#driver.releaseConnection(connection, options);
        this.#connectionMutex?.releaseLock();
    }
    async beginTransaction(connection, settings) {
        return await this.#driver.beginTransaction(connection, settings);
    }
    async commitTransaction(connection) {
        return await this.#driver.commitTransaction(connection);
    }
    async rollbackTransaction(connection) {
        return await this.#driver.rollbackTransaction(connection);
    }
    async savepoint(connection, savepointName, compileQuery) {
        if (this.#driver.savepoint) {
            return await this.#driver.savepoint(connection, savepointName, compileQuery);
        }
        throw new Error('The `savepoint` method is not supported by this driver');
    }
    async rollbackToSavepoint(connection, savepointName, compileQuery) {
        if (this.#driver.rollbackToSavepoint) {
            return await this.#driver.rollbackToSavepoint(connection, savepointName, compileQuery);
        }
        throw new Error('The `rollbackToSavepoint` method is not supported by this driver');
    }
    async releaseSavepoint(connection, savepointName, compileQuery) {
        if (this.#driver.releaseSavepoint) {
            return await this.#driver.releaseSavepoint(connection, savepointName, compileQuery);
        }
        throw new Error('The `releaseSavepoint` method is not supported by this driver');
    }
    async destroy(options) {
        if (!this.#initPromise) {
            return;
        }
        await waitOrAbort(this.#initPromise, options?.signal, 'destroy:initPromise');
        this.#destroyPromise ??= this.#driver.destroy(options).catch((reason) => {
            // ensure `destroy` is retried later.
            this.#destroyPromise = undefined;
            throw reason;
        });
        await waitOrAbort(this.#destroyPromise, options?.signal, 'destroy');
    }
    #needsLogging() {
        return (this.#log.isLevelEnabled('query') || this.#log.isLevelEnabled('error'));
    }
    // This method monkey patches the database connection's executeQuery method
    // by adding logging code around it. Monkey patching is not pretty, but it's
    // the best option in this case.
    #addLogging(connection) {
        const executeQuery = connection.executeQuery;
        const streamQuery = connection.streamQuery;
        const dis = this;
        connection.executeQuery = async (compiledQuery, options) => {
            let caughtError;
            const startTime = performanceNow();
            try {
                return await executeQuery.call(connection, compiledQuery, options);
            }
            catch (error) {
                caughtError = error;
                await dis.#logError(error, compiledQuery, startTime);
                throw error;
            }
            finally {
                if (!caughtError) {
                    await dis.#logQuery(compiledQuery, startTime);
                }
            }
        };
        connection.streamQuery = async function* (compiledQuery, chunkSize, options) {
            let caughtError;
            const startTime = performanceNow();
            try {
                for await (const result of streamQuery.call(connection, compiledQuery, chunkSize, options)) {
                    yield result;
                }
            }
            catch (error) {
                caughtError = error;
                await dis.#logError(error, compiledQuery, startTime);
                throw error;
            }
            finally {
                if (!caughtError) {
                    await dis.#logQuery(compiledQuery, startTime, true);
                }
            }
        };
    }
    async #logError(error, compiledQuery, startTime) {
        await this.#log.error(() => ({
            level: 'error',
            error,
            query: compiledQuery,
            queryDurationMillis: this.#calculateDurationMillis(startTime),
        }));
    }
    async #logQuery(compiledQuery, startTime, isStream = false) {
        await this.#log.query(() => ({
            level: 'query',
            isStream,
            query: compiledQuery,
            queryDurationMillis: this.#calculateDurationMillis(startTime),
        }));
    }
    #calculateDurationMillis(startTime) {
        return performanceNow() - startTime;
    }
}
