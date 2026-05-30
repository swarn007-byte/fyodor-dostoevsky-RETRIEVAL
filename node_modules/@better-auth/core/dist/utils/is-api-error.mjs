import { APIError as APIError$1 } from "../error/index.mjs";
import { APIError } from "better-call";
//#region src/utils/is-api-error.ts
function isAPIError(error) {
	return error instanceof APIError || error instanceof APIError$1 || error?.name === "APIError";
}
//#endregion
export { isAPIError };
