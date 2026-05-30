import { applySetCookies } from "../cookies/cookie-utils.mjs";
//#region src/test-utils/headers.ts
/**
* converts set cookie containing headers to
* cookie containing headers
*/
function convertSetCookieToCookie(headers) {
	const setCookieHeaders = [];
	headers.forEach((value, name) => {
		if (name.toLowerCase() === "set-cookie") setCookieHeaders.push(value);
	});
	if (setCookieHeaders.length === 0) return headers;
	applySetCookies(headers, setCookieHeaders);
	return headers;
}
//#endregion
export { convertSetCookieToCookie };
