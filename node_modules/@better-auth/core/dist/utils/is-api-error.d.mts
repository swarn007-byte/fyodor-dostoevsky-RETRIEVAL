import { APIError } from "../error/index.mjs";

//#region src/utils/is-api-error.d.ts
declare function isAPIError(error: unknown): error is APIError;
//#endregion
export { isAPIError };