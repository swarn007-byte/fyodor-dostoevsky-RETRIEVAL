//#region src/oauth2/errors.ts
const HANDLING_DOCS_URL = "https://www.better-auth.com/docs/concepts/oauth#handling-providers-without-email";
/**
* Redirect the user to the OAuth error page with a machine-readable `error`
* code (and optional `error_description`).
*
* Every OAuth callback path routes its failures through this helper so the
* query parameter name, the `?`/`&` separator, and URL encoding are decided in
* one place. The error page reads the `error` query parameter, so callers must
* never hand-build the redirect with a different parameter name.
*/
function redirectOnError(ctx, errorURL, error, description) {
	const params = new URLSearchParams({ error });
	if (description) params.set("error_description", description);
	const sep = errorURL.includes("?") ? "&" : "?";
	throw ctx.redirect(`${errorURL}${sep}${params.toString()}`);
}
/**
* Build the logger message shown when an OAuth provider does not return an
* email address. Kept in one place so every rejection site points users at
* the same workaround docs.
*/
function missingEmailLogMessage(providerId, options) {
	return `${options?.source === "generic" ? `Generic OAuth provider "${providerId}"` : `Provider "${providerId}"`} did not return an email${options?.source === "id_token" ? " in the id token" : ""}. Either request the provider's email scope, or synthesize one via \`mapProfileToUser\`. See ${HANDLING_DOCS_URL}`;
}
//#endregion
export { missingEmailLogMessage, redirectOnError };
