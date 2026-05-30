/// <reference types="./deferred.d.ts" />
export class Deferred {
    #promise;
    #resolve;
    #reject;
    constructor() {
        this.#promise = new Promise((resolve, reject) => {
            this.#reject = reject;
            this.#resolve = resolve;
        });
    }
    get promise() {
        return this.#promise;
    }
    resolve = (value) => {
        this.#resolve?.(value);
        this.#resolve = this.#reject = undefined;
    };
    reject = (reason) => {
        this.#reject?.(reason);
        this.#reject = this.#resolve = undefined;
    };
}
