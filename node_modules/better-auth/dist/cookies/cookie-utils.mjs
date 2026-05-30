//#region src/cookies/cookie-utils.ts
function tryDecode(str) {
	if (str.indexOf("%") === -1) return str;
	try {
		return decodeURIComponent(str);
	} catch {
		return str;
	}
}
const SECURE_COOKIE_PREFIX = "__Secure-";
const HOST_COOKIE_PREFIX = "__Host-";
/**
* Remove __Secure- or __Host- prefix from cookie name.
*/
function stripSecureCookiePrefix(cookieName) {
	if (cookieName.startsWith("__Secure-")) return cookieName.slice(9);
	if (cookieName.startsWith("__Host-")) return cookieName.slice(7);
	return cookieName;
}
/**
* Split a comma-joined `Set-Cookie` header string into individual cookies.
*/
function splitSetCookieHeader(setCookie) {
	if (!setCookie) return [];
	const result = [];
	let start = 0;
	let i = 0;
	while (i < setCookie.length) {
		if (setCookie[i] === ",") {
			let j = i + 1;
			while (j < setCookie.length && setCookie[j] === " ") j++;
			while (j < setCookie.length && setCookie[j] !== "=" && setCookie[j] !== ";" && setCookie[j] !== ",") j++;
			if (j < setCookie.length && setCookie[j] === "=") {
				const part = setCookie.slice(start, i).trim();
				if (part) result.push(part);
				start = i + 1;
				while (start < setCookie.length && setCookie[start] === " ") start++;
				i = start;
				continue;
			}
		}
		i++;
	}
	const last = setCookie.slice(start).trim();
	if (last) result.push(last);
	return result;
}
function parseSetCookieHeader(setCookie) {
	const cookies = /* @__PURE__ */ new Map();
	splitSetCookieHeader(setCookie).forEach((cookieString) => {
		const [nameValue, ...attributes] = cookieString.split(";").map((part) => part.trim());
		const [name, ...valueParts] = (nameValue || "").split("=");
		const value = unquoteCookieValue(valueParts.join("="));
		if (!name) return;
		const attrObj = { value: tryDecode(value) };
		attributes.forEach((attribute) => {
			const [attrName, ...attrValueParts] = attribute.split("=");
			const attrValue = attrValueParts.join("=");
			const normalizedAttrName = attrName.trim().toLowerCase();
			switch (normalizedAttrName) {
				case "max-age":
					attrObj["max-age"] = attrValue ? parseInt(attrValue.trim(), 10) : void 0;
					break;
				case "expires":
					attrObj.expires = attrValue ? new Date(attrValue.trim()) : void 0;
					break;
				case "domain":
					attrObj.domain = attrValue ? attrValue.trim() : void 0;
					break;
				case "path":
					attrObj.path = attrValue ? attrValue.trim() : void 0;
					break;
				case "secure":
					attrObj.secure = true;
					break;
				case "httponly":
					attrObj.httponly = true;
					break;
				case "samesite":
					attrObj.samesite = attrValue ? attrValue.trim().toLowerCase() : void 0;
					break;
				case "partitioned":
					attrObj.partitioned = true;
					break;
				default:
					attrObj[normalizedAttrName] = attrValue ? attrValue.trim() : true;
					break;
			}
		});
		cookies.set(name, attrObj);
	});
	return cookies;
}
function toCookieOptions(attributes) {
	return {
		maxAge: attributes["max-age"],
		expires: attributes.expires,
		domain: attributes.domain,
		path: attributes.path,
		secure: attributes.secure,
		httpOnly: attributes.httponly,
		sameSite: attributes.samesite,
		partitioned: attributes.partitioned
	};
}
/**
* Cookie-name token char set per RFC 7230 §3.2.6.
*
* @see https://datatracker.ietf.org/doc/html/rfc7230#section-3.2.6
*/
const cookieNameRegex = /^[\w!#$%&'*.^`|~+-]+$/;
/**
* Cookie-value char set per RFC 6265 §4.1.1, plus space and comma.
*
* @see https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1
* @see https://github.com/golang/go/issues/7243
*/
const cookieValueRegex = /^[ !#-:<-[\]-~]*$/;
/**
* Strip surrounding double-quotes per RFC 6265 §4.1.1 quoted-string form.
*
* @see https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1
*/
function unquoteCookieValue(value) {
	if (value.length < 2 || !value.startsWith("\"") || !value.endsWith("\"")) return value;
	return value.slice(1, -1);
}
/**
* Trim leading/trailing OWS (space / horizontal tab) per RFC 7230 §3.2.3.
* Narrower than `String.prototype.trim()`, which strips CR/LF and other
* whitespace and would let CTLs escape `cookieValueRegex`.
*
* @see https://datatracker.ietf.org/doc/html/rfc7230#section-3.2.3
*/
function trimOWS(s) {
	let start = 0;
	let end = s.length;
	while (start < end) {
		const c = s.charCodeAt(start);
		if (c !== 32 && c !== 9) break;
		start++;
	}
	while (end > start) {
		const c = s.charCodeAt(end - 1);
		if (c !== 32 && c !== 9) break;
		end--;
	}
	return start === 0 && end === s.length ? s : s.slice(start, end);
}
/**
* Tolerates `;` separators without the SP that RFC 6265 §4.2.1 mandates,
* since proxies and runtimes commonly strip it. Silently drops entries
* whose name violates RFC 7230 token or whose value violates RFC 6265
* cookie-octet (plus space and comma). Strips optional surrounding
* double-quotes per RFC 6265 §4.1.1.
*/
function parseCookies(cookie) {
	const cookieMap = /* @__PURE__ */ new Map();
	if (cookie.length < 2) return cookieMap;
	for (const chunk of cookie.split(";")) {
		const eq = chunk.indexOf("=");
		if (eq === -1) continue;
		const key = trimOWS(chunk.slice(0, eq));
		const val = unquoteCookieValue(trimOWS(chunk.slice(eq + 1)));
		if (cookieNameRegex.test(key) && cookieValueRegex.test(val)) cookieMap.set(key, tryDecode(val));
	}
	return cookieMap;
}
/**
* Add or replace a cookie in the request `Cookie` header.
*
* Cookie pairs are joined with `; `, but `headers.append("cookie", ...)`
* joins with `, ` in some runtimes (e.g. Deno, Cloudflare Workers) and
* breaks downstream cookie parsing. This builds the header value via
* parse-mutate-serialize.
*/
function setRequestCookie(headers, name, value) {
	const cookieMap = parseCookies(headers.get("cookie") || "");
	if (cookieNameRegex.test(name)) cookieMap.set(name, value);
	headers.set("cookie", Array.from(cookieMap, ([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; "));
}
/**
* Merge `Set-Cookie` header values into the target's `Cookie` header.
* Mutates `target`.
*
* Name/value-level merge only. RFC 6265 §5 user-agent semantics
* (expiration, domain/path scoping, ordering) are out of scope. Suitable
* for single-request proxy, middleware, and test contexts.
*/
function applySetCookies(target, setCookieValues) {
	const cookieMap = parseCookies(target.get("cookie") || "");
	for (const setCookie of setCookieValues) for (const [name, attr] of parseSetCookieHeader(setCookie)) if (cookieNameRegex.test(name)) cookieMap.set(name, attr.value);
	target.set("cookie", Array.from(cookieMap, ([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; "));
}
function setCookieToHeader(headers) {
	return (context) => {
		const setCookieHeader = context.response.headers.get("set-cookie");
		if (!setCookieHeader) return;
		applySetCookies(headers, [setCookieHeader]);
	};
}
//#endregion
export { HOST_COOKIE_PREFIX, SECURE_COOKIE_PREFIX, applySetCookies, cookieNameRegex, parseCookies, parseSetCookieHeader, setCookieToHeader, setRequestCookie, splitSetCookieHeader, stripSecureCookiePrefix, toCookieOptions };
