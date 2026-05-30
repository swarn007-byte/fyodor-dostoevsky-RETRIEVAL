//#region src/cookies/cookie-utils.d.ts
interface CookieAttributes {
  value: string;
  "max-age"?: number | undefined;
  expires?: Date | undefined;
  domain?: string | undefined;
  path?: string | undefined;
  secure?: boolean | undefined;
  httponly?: boolean | undefined;
  partitioned?: boolean | undefined;
  samesite?: ("strict" | "lax" | "none") | undefined;
  [key: string]: any;
}
interface ParsedCookieOptions {
  maxAge?: number | undefined;
  expires?: Date | undefined;
  domain?: string | undefined;
  path?: string | undefined;
  secure?: boolean | undefined;
  httpOnly?: boolean | undefined;
  partitioned?: boolean | undefined;
  sameSite?: CookieAttributes["samesite"];
}
declare const SECURE_COOKIE_PREFIX = "__Secure-";
declare const HOST_COOKIE_PREFIX = "__Host-";
/**
 * Remove __Secure- or __Host- prefix from cookie name.
 */
declare function stripSecureCookiePrefix(cookieName: string): string;
/**
 * Split a comma-joined `Set-Cookie` header string into individual cookies.
 */
declare function splitSetCookieHeader(setCookie: string): string[];
declare function parseSetCookieHeader(setCookie: string): Map<string, CookieAttributes>;
declare function toCookieOptions(attributes: CookieAttributes): ParsedCookieOptions;
/**
 * Cookie-name token char set per RFC 7230 §3.2.6.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7230#section-3.2.6
 */
declare const cookieNameRegex: RegExp;
/**
 * Tolerates `;` separators without the SP that RFC 6265 §4.2.1 mandates,
 * since proxies and runtimes commonly strip it. Silently drops entries
 * whose name violates RFC 7230 token or whose value violates RFC 6265
 * cookie-octet (plus space and comma). Strips optional surrounding
 * double-quotes per RFC 6265 §4.1.1.
 */
declare function parseCookies(cookie: string): Map<string, string>;
/**
 * Add or replace a cookie in the request `Cookie` header.
 *
 * Cookie pairs are joined with `; `, but `headers.append("cookie", ...)`
 * joins with `, ` in some runtimes (e.g. Deno, Cloudflare Workers) and
 * breaks downstream cookie parsing. This builds the header value via
 * parse-mutate-serialize.
 */
declare function setRequestCookie(headers: Headers, name: string, value: string): void;
/**
 * Merge `Set-Cookie` header values into the target's `Cookie` header.
 * Mutates `target`.
 *
 * Name/value-level merge only. RFC 6265 §5 user-agent semantics
 * (expiration, domain/path scoping, ordering) are out of scope. Suitable
 * for single-request proxy, middleware, and test contexts.
 */
declare function applySetCookies(target: Headers, setCookieValues: Iterable<string>): void;
declare function setCookieToHeader(headers: Headers): (context: {
  response: Response;
}) => void;
//#endregion
export { CookieAttributes, HOST_COOKIE_PREFIX, SECURE_COOKIE_PREFIX, applySetCookies, cookieNameRegex, parseCookies, parseSetCookieHeader, setCookieToHeader, setRequestCookie, splitSetCookieHeader, stripSecureCookiePrefix, toCookieOptions };