/// <reference types="./query-finalizer.d.ts" />
import { freeze } from './util/object-utils.js';
export class QueryFinalizer {
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    toOperationNode() {
        return this.#props.executor.transformQuery(this.#props.node, this.#props.queryId);
    }
    /**
     * Compiles the query.
     */
    compile() {
        return this.#props.executor.compileQuery(this.toOperationNode(), this.#props.queryId);
    }
    /**
     * Executes the query.
     */
    async execute(options) {
        return await this.#props.executor.executeQuery(this.compile(), options);
    }
}
