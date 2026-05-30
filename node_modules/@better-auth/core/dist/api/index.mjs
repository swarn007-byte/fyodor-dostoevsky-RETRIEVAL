import { runWithEndpointContext } from "../context/endpoint-context.mjs";
import { isAPIError } from "../utils/is-api-error.mjs";
import { createEndpoint, createMiddleware, kAPIErrorHeaderSymbol } from "better-call";
//#region src/api/index.ts
/**
* Better-call's createEndpoint re-throws APIError without exposing the headers
* accumulated on ctx.responseHeaders (e.g. Set-Cookie from deleteSessionCookie
* before throw). Attach them to the error via kAPIErrorHeaderSymbol — matching
* better-call's createMiddleware contract so the outer pipeline can merge them
* into the response.
*/
function attachResponseHeadersToAPIError(responseHeaders, e) {
	if (!isAPIError(e) || !responseHeaders) return;
	Object.defineProperty(e, kAPIErrorHeaderSymbol, {
		enumerable: false,
		configurable: true,
		value: responseHeaders,
		writable: false
	});
}
const optionsMiddleware = createMiddleware(async () => {
	/**
	* This will be passed on the instance of
	* the context. Used to infer the type
	* here.
	*/
	return {};
});
const createAuthMiddleware = createMiddleware.create({ use: [optionsMiddleware, createMiddleware(async () => {
	return {};
})] });
const use = [optionsMiddleware];
function createAuthEndpoint(pathOrOptions, handlerOrOptions, handlerOrNever) {
	const path = typeof pathOrOptions === "string" ? pathOrOptions : void 0;
	const options = typeof handlerOrOptions === "object" ? handlerOrOptions : pathOrOptions;
	const handler = typeof handlerOrOptions === "function" ? handlerOrOptions : handlerOrNever;
	const wrapped = async (ctx) => {
		const runtimeCtx = ctx;
		try {
			return await runWithEndpointContext(ctx, () => handler(ctx));
		} catch (e) {
			attachResponseHeadersToAPIError(runtimeCtx.responseHeaders, e);
			throw e;
		}
	};
	if (path) return createEndpoint(path, {
		...options,
		use: [...options?.use || [], ...use]
	}, wrapped);
	return createEndpoint({
		...options,
		use: [...options?.use || [], ...use]
	}, wrapped);
}
//#endregion
export { createAuthEndpoint, createAuthMiddleware, optionsMiddleware };
