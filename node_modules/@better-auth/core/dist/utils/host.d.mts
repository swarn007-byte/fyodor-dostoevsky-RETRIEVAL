//#region src/utils/host.d.ts
/**
 * Host classification per RFC 6890 (Special-Purpose IP Address Registries),
 * RFC 6761 (Special-Use Domain Names), and RFC 8252 §7.3 (loopback redirect URIs).
 *
 * This module is the single source of truth for "is this host public? private?
 * loopback? link-local?" in the codebase. Consumers MUST prefer these predicates
 * over bespoke regexes or substring matches; divergent checks are how bypass
 * vulnerabilities get introduced (e.g. Oligo's "0.0.0.0 Day" 2024).
 *
 * Four user-facing primitives:
 *
 *   - `classifyHost(host)` — the workhorse. Returns a {@link HostClassification}
 *     with `kind`, `literal`, and `canonical` fields.
 *   - `isLoopbackIP(host)` — strict: IPv4 `127.0.0.0/8` or IPv6 `::1` only.
 *     Use this for RFC 8252 §7.3 loopback redirect URI matching where IP
 *     literals are REQUIRED.
 *   - `isLoopbackHost(host)` — permissive: also accepts `localhost` and RFC 6761
 *     `.localhost` subdomains. Use this for developer ergonomics (CORS, cookie
 *     secure bypass, dev-mode HTTP allow-list).
 *   - `isPublicRoutableHost(host)` — SSRF gate. Returns false for every
 *     non-`public` kind. Use this before server-side fetches to user-controlled
 *     URLs.
 */
/**
 * The semantic kind of a host, derived from RFC 6890 special-purpose registries
 * plus a few domain-name categories (localhost, cloud metadata FQDNs).
 */
type HostKind = /** IPv4 `127.0.0.0/8` or IPv6 `::1`. */"loopback" /** DNS name `localhost` or RFC 6761 `.localhost` TLD. */ | "localhost" /** IPv4 `0.0.0.0` or IPv6 `::` — "this host on this network", not loopback. */ | "unspecified" /** RFC 1918 `10/8`, `172.16/12`, `192.168/16`, or IPv6 ULA `fc00::/7`. */ | "private" /** IPv4 `169.254/16` or IPv6 `fe80::/10`. Includes AWS IMDS `169.254.169.254`. */ | "linkLocal" /** RFC 6598 carrier-grade NAT `100.64.0.0/10`. */ | "sharedAddressSpace" /** RFC 5737 `192.0.2/24`, `198.51.100/24`, `203.0.113/24`, or RFC 3849 `2001:db8::/32`. */ | "documentation" /** RFC 2544 `198.18.0.0/15`. */ | "benchmarking" /** IPv4 `224.0.0.0/4` or IPv6 `ff00::/8`. */ | "multicast" /** IPv4 limited broadcast `255.255.255.255`. */ | "broadcast" /** Other RFC 6890 special-purpose ranges (0/8, 192.0.0/24, 240/4, 2001::/32, etc.). */ | "reserved" /** Cloud metadata service FQDN (e.g. `metadata.google.internal`). */ | "cloudMetadata" /** Any host not matching a special-purpose range above. */ | "public";
/**
 * The syntactic form of the input host: an IPv4 literal, an IPv6 literal, or
 * a domain name. IPv4-mapped IPv6 (`::ffff:192.0.2.1`) is reported as `ipv4`
 * because it's unmapped during canonicalization.
 */
type HostLiteral = "ipv4" | "ipv6" | "fqdn";
/**
 * Result of {@link classifyHost}. All fields are readonly.
 *
 * @property kind - Semantic classification per RFC 6890 + RFC 6761.
 * @property literal - Syntactic form of the input (IPv4, IPv6, or FQDN).
 * @property canonical - Lowercase, port-stripped, bracket-stripped, zone-id-stripped
 *   form suitable for equality comparison. IPv6 is expanded to full form.
 *   IPv4-mapped IPv6 is collapsed to the underlying IPv4.
 */
interface HostClassification {
  readonly kind: HostKind;
  readonly literal: HostLiteral;
  readonly canonical: string;
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
declare function classifyHost(host: string): HostClassification;
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
declare function isLoopbackIP(host: string): boolean;
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
declare function isLoopbackHost(host: string): boolean;
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
declare function isPublicRoutableHost(host: string): boolean;
//#endregion
export { HostClassification, HostKind, HostLiteral, classifyHost, isLoopbackHost, isLoopbackIP, isPublicRoutableHost };