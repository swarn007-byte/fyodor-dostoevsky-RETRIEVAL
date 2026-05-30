/// <reference types="./abort.d.ts" />
import { Deferred } from './deferred.js';
import { getMessage } from './object-utils.js';
export function getInflightQueryAbortHandler(abortStrategy = 'ignore query', connection, beforeThrow) {
    if (abortStrategy === 'ignore query') {
        return;
    }
    if (abortStrategy === 'cancel query') {
        const handler = connection.cancelQuery;
        if (!handler) {
            throwUnsupportedInflightQueryAbortStrategyError(abortStrategy, connection.killSession ? 'kill session' : undefined);
        }
        return handler.bind(connection);
    }
    if (abortStrategy === 'kill session') {
        const handler = connection.killSession;
        if (!handler) {
            throwUnsupportedInflightQueryAbortStrategyError(abortStrategy, connection.cancelQuery ? 'cancel query' : undefined);
        }
        return handler.bind(connection);
    }
    beforeThrow();
    throw new Error(`Unexpected \`inflightQueryAbortStrategy\`: "${abortStrategy}"`);
}
function throwUnsupportedInflightQueryAbortStrategyError(abortStrategy, alt) {
    throw new Error(`This dialect doesn't support \`inflightQueryAbortStrategy\` "${abortStrategy}". Use "${'ignore query'}"${alt ? ` or "${alt}"` : ''} instead.`);
}
export function assertNotAborted(signal, timing, beforeThrow) {
    if (signal?.aborted) {
        beforeThrow?.();
        throwReasonWithTiming(signal.reason, timing);
    }
}
export function throwReasonWithTiming(reason, timing) {
    decorateWithTiming(reason, timing);
    throw reason;
}
export const ABORTED = {};
export async function waitOrAbort(promise, signal, name, onAbort) {
    if (!signal) {
        return promise;
    }
    assertNotAborted(signal, `before ${name}`, onAbort);
    const { promise: abortPromise, resolve } = new Deferred();
    const abortListener = () => resolve(ABORTED);
    signal.addEventListener('abort', abortListener);
    try {
        assertNotAborted(signal, `before ${name}`, onAbort);
        const result = await Promise.race([promise, abortPromise]);
        if (result !== ABORTED) {
            return result;
        }
        onAbort?.();
        throwReasonWithTiming(signal.reason, `during ${name}`);
    }
    finally {
        signal.removeEventListener('abort', abortListener);
        resolve(ABORTED);
    }
}
export function printBackgroundFail(name) {
    return (reason) => console.error(`\`${name}\` failed in the background after abortion: ${getMessage(reason)}`);
}
function decorateWithTiming(reason, timing) {
    if (reason !== null &&
        typeof reason === 'object' &&
        !Object.isFrozen(reason)) {
        // we use this in tests, but it can also be used to debug in userland.
        Object.defineProperty(reason, '__kysely_timing__', {
            configurable: true,
            enumerable: false,
            value: timing,
            writable: false,
        });
    }
}
