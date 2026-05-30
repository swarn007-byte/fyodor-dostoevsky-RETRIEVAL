import { isValidIP, normalizeIP } from "./ip.mjs";
//#region src/utils/host.ts
/**
* Cloud provider instance metadata service FQDNs. These resolve to link-local
* IPs (usually `169.254.169.254`) inside their respective clouds and are
* prime SSRF targets.
*
* The IPs themselves are already caught by the `linkLocal` kind; this set
* only exists for the FQDN form that a naive server-side fetch might resolve
* via its own resolver.
*/
const CLOUD_METADATA_HOSTS = new Set([
	"metadata.google.internal",
	"metadata.goog",
	"metadata",
	"instance-data",
	"instance-data.ec2.internal"
]);
/** Strip `[...]` if the entire input is bracketed (IPv6 literal form). */
function stripBrackets(host) {
	if (host.length >= 2 && host.startsWith("[") && host.endsWith("]")) return host.slice(1, -1);
	return host;
}
/**
* Strip trailing `:port` from host-with-port strings.
*
* - Bracketed IPv6 with port: `[::1]:8080` → `[::1]`
* - IPv4/FQDN with port: `127.0.0.1:3000` / `example.com:443` → base form
* - Bare IPv6: `::1` / `fe80::1` → unchanged (multiple colons means no port)
*/
function stripPort(host) {
	if (host.startsWith("[")) {
		const end = host.indexOf("]");
		if (end === -1) return host;
		return host.slice(0, end + 1);
	}
	const firstColon = host.indexOf(":");
	if (firstColon === -1) return host;
	if (host.indexOf(":", firstColon + 1) !== -1) return host;
	return host.slice(0, firstColon);
}
/** Strip IPv6 zone identifier: `fe80::1%eth0` → `fe80::1`. */
function stripZoneId(host) {
	const zone = host.indexOf("%");
	if (zone === -1) return host;
	return host.slice(0, zone);
}
/**
* Strip trailing dots (RFC 1034 absolute DNS form): `localhost.` → `localhost`.
* Without this, `metadata.google.internal.` would fall through to `public` and
* bypass the cloud-metadata / `.localhost` checks, since WHATWG URL parsing
* preserves the trailing dot in `url.hostname`.
*/
function stripTrailingDot(host) {
	return host.replace(/\.+$/, "");
}
/** Fast dotted-decimal shape check. Does NOT validate octet bounds. */
function looksLikeIPv4(host) {
	return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
}
/** Pack a validated dotted-decimal IPv4 into a 32-bit unsigned integer. */
function ipv4ToUint32(ip) {
	const parts = ip.split(".");
	return (Number(parts[0]) << 24 | Number(parts[1]) << 16 | Number(parts[2]) << 8 | Number(parts[3])) >>> 0;
}
/** Check whether a 32-bit value matches `prefix/length` (both unsigned). */
function inIPv4Range(value, prefix, length) {
	if (length === 0) return true;
	const mask = length === 32 ? 4294967295 : -1 << 32 - length >>> 0;
	return (value & mask) === (prefix & mask);
}
function classifyIPv4(ip) {
	if (ip === "0.0.0.0") return "unspecified";
	if (ip === "255.255.255.255") return "broadcast";
	const n = ipv4ToUint32(ip);
	if (inIPv4Range(n, ipv4ToUint32("127.0.0.0"), 8)) return "loopback";
	if (inIPv4Range(n, ipv4ToUint32("10.0.0.0"), 8)) return "private";
	if (inIPv4Range(n, ipv4ToUint32("172.16.0.0"), 12)) return "private";
	if (inIPv4Range(n, ipv4ToUint32("192.168.0.0"), 16)) return "private";
	if (inIPv4Range(n, ipv4ToUint32("169.254.0.0"), 16)) return "linkLocal";
	if (inIPv4Range(n, ipv4ToUint32("100.64.0.0"), 10)) return "sharedAddressSpace";
	if (inIPv4Range(n, ipv4ToUint32("192.0.2.0"), 24)) return "documentation";
	if (inIPv4Range(n, ipv4ToUint32("198.51.100.0"), 24)) return "documentation";
	if (inIPv4Range(n, ipv4ToUint32("203.0.113.0"), 24)) return "documentation";
	if (inIPv4Range(n, ipv4ToUint32("198.18.0.0"), 15)) return "benchmarking";
	if (inIPv4Range(n, ipv4ToUint32("224.0.0.0"), 4)) return "multicast";
	if (inIPv4Range(n, ipv4ToUint32("0.0.0.0"), 8)) return "reserved";
	if (inIPv4Range(n, ipv4ToUint32("192.0.0.0"), 24)) return "reserved";
	if (inIPv4Range(n, ipv4ToUint32("240.0.0.0"), 4)) return "reserved";
	return "public";
}
/**
* Extract an IPv4 address embedded in an expanded IPv6 literal.
*
* Used to recurse into tunnel/translation forms (6to4, NAT64, Teredo) so a
* private destination cannot be smuggled behind a syntactically-public IPv6
* literal. `startGroup` is the index of the first of two 16-bit groups in the
* expanded form (`0000:0000:...`). With `xor: true`, the 32-bit value is XORed
* with `0xffffffff` before decoding (Teredo obfuscates the client IPv4 this
* way).
*/
function extractEmbeddedIPv4(expanded, startGroup, options = {}) {
	const offset = startGroup * 5;
	const g1 = Number.parseInt(expanded.slice(offset, offset + 4), 16);
	const g2 = Number.parseInt(expanded.slice(offset + 5, offset + 9), 16);
	if (!Number.isFinite(g1) || !Number.isFinite(g2)) return null;
	let combined = (g1 << 16 | g2) >>> 0;
	if (options.xor) combined = (combined ^ 4294967295) >>> 0;
	return `${combined >>> 24 & 255}.${combined >>> 16 & 255}.${combined >>> 8 & 255}.${combined & 255}`;
}
/**
* Classify an expanded, full-form, lowercase IPv6 address (no IPv4-mapped
* input — those are unmapped to IPv4 before reaching here).
*
* 6to4 (`2002::/16`), NAT64 (`64:ff9b::/96`) and Teredo (`2001:0000::/32`)
* embed an IPv4 that can route to private/loopback space. If the embedded
* IPv4 classifies as non-`public`, return `reserved` — blocks SSRF without
* advertising the address as a loopback literal for RFC 8252 §7.3 matching.
*/
function classifyIPv6(expanded) {
	if (expanded === "0000:0000:0000:0000:0000:0000:0000:0000") return "unspecified";
	if (expanded === "0000:0000:0000:0000:0000:0000:0000:0001") return "loopback";
	const firstByte = Number.parseInt(expanded.slice(0, 2), 16);
	const secondByte = Number.parseInt(expanded.slice(2, 4), 16);
	if (firstByte === 255) return "multicast";
	if (firstByte === 254 && (secondByte & 192) === 128) return "linkLocal";
	if ((firstByte & 254) === 252) return "private";
	if (expanded.startsWith("2001:0db8:")) return "documentation";
	if (expanded.startsWith("2002:")) {
		const embedded = extractEmbeddedIPv4(expanded, 1);
		if (embedded && classifyIPv4(embedded) !== "public") return "reserved";
		return "public";
	}
	if (expanded.startsWith("0064:ff9b:0000:0000:0000:0000:")) {
		const embedded = extractEmbeddedIPv4(expanded, 6);
		if (embedded && classifyIPv4(embedded) !== "public") return "reserved";
		return "reserved";
	}
	if (expanded.startsWith("2001:0000:")) {
		const embedded = extractEmbeddedIPv4(expanded, 6, { xor: true });
		if (embedded && classifyIPv4(embedded) !== "public") return "reserved";
		return "reserved";
	}
	if (expanded.startsWith("0100:0000:0000:0000:")) return "reserved";
	return "public";
}
/**
* Classify a host string according to RFC 6890 / RFC 6761.
*
* Accepts inputs in any of these shapes and normalizes before classifying:
*
*   - Bare IPv4: `127.0.0.1`
*   - Bare IPv6: `::1`, `fe80::1%eth0`
*   - Bracketed IPv6: `[::1]`
*   - Host with port: `localhost:3000`, `127.0.0.1:443`, `[::1]:8080`
*   - FQDN: `example.com`, `tenant.localhost`
*   - IPv4-mapped IPv6: `::ffff:192.0.2.1` (reported as `literal: "ipv4"`)
*
* Invalid or non-resolvable FQDNs are returned as `{ kind: "public", literal: "fqdn" }`
* — this function never throws. Callers that need structural validation must
* combine this with a URL/hostname validator upstream.
*
* @example
* classifyHost("127.0.0.1")
* // { kind: "loopback", literal: "ipv4", canonical: "127.0.0.1" }
*
* @example
* classifyHost("[::1]:8080")
* // { kind: "loopback", literal: "ipv6", canonical: "0000:0000:...:0001" }
*
* @example
* classifyHost("::ffff:192.0.2.1")
* // { kind: "documentation", literal: "ipv4", canonical: "192.0.2.1" }
*
* @example
* classifyHost("tenant-a.localhost")
* // { kind: "localhost", literal: "fqdn", canonical: "tenant-a.localhost" }
*/
function classifyHost(host) {
	const lowered = stripTrailingDot(stripZoneId(stripBrackets(stripPort(host.trim())))).toLowerCase();
	if (lowered === "") return {
		kind: "reserved",
		literal: "fqdn",
		canonical: ""
	};
	if (!isValidIP(lowered)) {
		if (lowered === "localhost" || lowered.endsWith(".localhost")) return {
			kind: "localhost",
			literal: "fqdn",
			canonical: lowered
		};
		if (CLOUD_METADATA_HOSTS.has(lowered)) return {
			kind: "cloudMetadata",
			literal: "fqdn",
			canonical: lowered
		};
		return {
			kind: "public",
			literal: "fqdn",
			canonical: lowered
		};
	}
	if (looksLikeIPv4(lowered)) return {
		kind: classifyIPv4(lowered),
		literal: "ipv4",
		canonical: lowered
	};
	const canonical = normalizeIP(lowered, { ipv6Subnet: 128 });
	if (looksLikeIPv4(canonical)) return {
		kind: classifyIPv4(canonical),
		literal: "ipv4",
		canonical
	};
	return {
		kind: classifyIPv6(canonical),
		literal: "ipv6",
		canonical
	};
}
/**
* Strict loopback-IP-literal check per RFC 8252 §7.3.
*
* Returns true ONLY for IPv4 `127.0.0.0/8` or IPv6 `::1`. The DNS name
* `localhost` returns false — RFC 8252 §8.3 explicitly recommends against
* relying on name resolution for loopback redirect URIs.
*
* Use this for OAuth redirect URI matching.
*
* @example
* isLoopbackIP("127.0.0.1")     // true
* isLoopbackIP("::1")           // true
* isLoopbackIP("[::1]:8080")    // true
* isLoopbackIP("localhost")     // false  (use isLoopbackHost for DNS names)
* isLoopbackIP("0.0.0.0")       // false  (unspecified, not loopback)
*/
function isLoopbackIP(host) {
	return classifyHost(host).kind === "loopback";
}
/**
* Permissive loopback check for developer-ergonomics code paths.
*
* Returns true for IPv4 `127.0.0.0/8`, IPv6 `::1`, the literal name `localhost`,
* and any RFC 6761 `.localhost` subdomain (`tenant.localhost`, `app.localhost`).
*
* Use this for things like: allowing HTTP for dev servers, skipping Secure
* cookie requirements, browser-trust heuristics. Do NOT use this for OAuth
* redirect URI matching — use {@link isLoopbackIP} there.
*
* @example
* isLoopbackHost("localhost")         // true
* isLoopbackHost("tenant.localhost")  // true  (RFC 6761)
* isLoopbackHost("127.0.0.1")         // true
* isLoopbackHost("0.0.0.0")           // false (unspecified, NOT loopback)
*/
function isLoopbackHost(host) {
	const kind = classifyHost(host).kind;
	return kind === "loopback" || kind === "localhost";
}
/**
* First-line SSRF gate: returns true ONLY for hosts that classify as `public`.
*
* Every RFC 6890 special-purpose range (loopback, private, link-local,
* unspecified, documentation, multicast, broadcast, reserved, shared address
* space, benchmarking) and cloud-metadata FQDN returns false.
*
* Use this BEFORE issuing a server-side fetch to a user-supplied URL, e.g.
* OAuth introspection endpoints, webhook targets, or metadata-document
* fetches (CIMD).
*
* Limitations (this is a syntactic check, not a complete SSRF mitigation):
* - No DNS resolution: a public-looking FQDN that resolves to a private IP
*   passes this check. Re-verify the resolved address before connecting, or
*   pin the socket to the resolved IP.
* - No DNS-rebinding defense: attackers can return a public IP on the first
*   lookup and a private IP on the second. Resolve once and reuse the IP.
* - No redirect following: HTTP 3xx responses can redirect to private hosts.
*   Re-run this check on every redirect target, or disable auto-follow.
*
* @example
* isPublicRoutableHost("example.com")            // true
* isPublicRoutableHost("127.0.0.1")              // false (loopback)
* isPublicRoutableHost("169.254.169.254")        // false (linkLocal / AWS IMDS)
* isPublicRoutableHost("metadata.google.internal") // false (cloudMetadata)
* isPublicRoutableHost("10.0.0.1")               // false (private)
* isPublicRoutableHost("::ffff:127.0.0.1")       // false (mapped loopback)
*/
function isPublicRoutableHost(host) {
	return classifyHost(host).kind === "public";
}
//#endregion
export { classifyHost, isLoopbackHost, isLoopbackIP, isPublicRoutableHost };
