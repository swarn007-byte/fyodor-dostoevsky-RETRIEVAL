import { ATTR_CONTEXT, ATTR_DB_COLLECTION_NAME, ATTR_DB_OPERATION_NAME, ATTR_HOOK_TYPE, ATTR_HTTP_RESPONSE_STATUS_CODE, ATTR_HTTP_ROUTE, ATTR_OPERATION_ID } from "./attributes.mjs";

//#region src/instrumentation/pure.index.d.ts
declare function withSpan<T>(name: string, attributes: Record<string, string | number | boolean>, fn: () => T): T;
declare function withSpan<T>(name: string, attributes: Record<string, string | number | boolean>, fn: () => Promise<T>): Promise<T>;
//#endregion
export { ATTR_CONTEXT, ATTR_DB_COLLECTION_NAME, ATTR_DB_OPERATION_NAME, ATTR_HOOK_TYPE, ATTR_HTTP_RESPONSE_STATUS_CODE, ATTR_HTTP_ROUTE, ATTR_OPERATION_ID, withSpan };