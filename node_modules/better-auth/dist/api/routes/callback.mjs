import { isAPIError } from "../../utils/is-api-error.mjs";
import { setSessionCookie } from "../../cookies/index.mjs";
import { getAwaitableValue } from "../../context/helpers.mjs";
import { missingEmailLogMessage, redirectOnError } from "../../oauth2/errors.mjs";
import { parseState } from "../../oauth2/state.mjs";
import { setTokenUtil } from "../../oauth2/utils.mjs";
import { handleOAuthUserInfo } from "../../oauth2/link-account.mjs";
import { HIDE_METADATA } from "../../utils/hide-metadata.mjs";
import { safeJSONParse } from "@better-auth/core/utils/json";
import { createAuthEndpoint } from "@better-auth/core/api";
import * as z from "zod";
//#region src/api/routes/callback.ts
const schema = z.object({
	code: z.string().optional(),
	error: z.string().optional(),
	device_id: z.string().optional(),
	error_description: z.string().optional(),
	state: z.string().optional(),
	user: z.string().optional()
});
const callbackOAuth = createAuthEndpoint("/callback/:id", {
	method: ["GET", "POST"],
	operationId: "handleOAuthCallback",
	body: schema.optional(),
	query: schema.optional(),
	metadata: {
		...HIDE_METADATA,
		allowedMediaTypes: ["application/x-www-form-urlencoded", "application/json"]
	}
}, async (c) => {
	let queryOrBody;
	const defaultErrorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
	if (c.method === "POST") {
		const postData = c.body ? schema.parse(c.body) : {};
		const queryData = c.query ? schema.parse(c.query) : {};
		const mergedData = schema.parse({
			...postData,
			...queryData
		});
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(mergedData)) if (value !== void 0 && value !== null) params.set(key, String(value));
		const redirectURL = `${c.context.baseURL}/callback/${c.params.id}?${params.toString()}`;
		throw c.redirect(redirectURL);
	}
	try {
		if (c.method === "GET") queryOrBody = schema.parse(c.query);
		else if (c.method === "POST") queryOrBody = schema.parse(c.body);
		else throw new Error("Unsupported method");
	} catch (e) {
		c.context.logger.error("INVALID_CALLBACK_REQUEST", e);
		redirectOnError(c, defaultErrorURL, "invalid_callback_request");
	}
	const { code, error, error_description, device_id, user: userData } = queryOrBody;
	const { codeVerifier, callbackURL, link, errorURL, newUserURL, requestSignUp } = await parseState(c);
	const resolvedErrorURL = errorURL ?? defaultErrorURL;
	if (error) redirectOnError(c, resolvedErrorURL, error, error_description);
	if (!code) {
		c.context.logger.error("Code not found");
		redirectOnError(c, resolvedErrorURL, "no_code");
	}
	const provider = await getAwaitableValue(c.context.socialProviders, { value: c.params.id });
	if (!provider) {
		c.context.logger.error("Oauth provider with id", c.params.id, "not found");
		redirectOnError(c, resolvedErrorURL, "oauth_provider_not_found");
	}
	let tokens;
	try {
		tokens = await provider.validateAuthorizationCode({
			code,
			codeVerifier,
			deviceId: device_id,
			redirectURI: `${c.context.baseURL}/callback/${provider.id}`
		});
	} catch (e) {
		c.context.logger.error("", e);
		redirectOnError(c, resolvedErrorURL, "invalid_code");
	}
	if (!tokens) redirectOnError(c, resolvedErrorURL, "invalid_code");
	const parsedUserData = userData ? safeJSONParse(userData) : null;
	const userInfo = await provider.getUserInfo({
		...tokens,
		user: parsedUserData ?? void 0
	}).then((res) => res?.user);
	if (!userInfo || userInfo.id === void 0 || userInfo.id === null) {
		c.context.logger.error("Unable to get user info");
		redirectOnError(c, resolvedErrorURL, "unable_to_get_user_info");
	}
	const providerAccountId = String(userInfo.id);
	if (!callbackURL) {
		c.context.logger.error("No callback URL found");
		redirectOnError(c, resolvedErrorURL, "no_callback_url");
	}
	if (link) {
		if (!c.context.trustedProviders.includes(provider.id) && !userInfo.emailVerified || c.context.options.account?.accountLinking?.enabled === false) {
			c.context.logger.error("Unable to link account - untrusted provider");
			redirectOnError(c, resolvedErrorURL, "unable_to_link_account");
		}
		if (userInfo.email?.toLowerCase() !== link.email.toLowerCase() && c.context.options.account?.accountLinking?.allowDifferentEmails !== true) redirectOnError(c, resolvedErrorURL, "email_doesn't_match");
		const existingAccount = await c.context.internalAdapter.findAccountByProviderId(providerAccountId, provider.id);
		if (existingAccount) {
			if (existingAccount.userId.toString() !== link.userId.toString()) redirectOnError(c, resolvedErrorURL, "account_already_linked_to_different_user");
			const updateData = Object.fromEntries(Object.entries({
				accessToken: await setTokenUtil(tokens.accessToken, c.context),
				refreshToken: await setTokenUtil(tokens.refreshToken, c.context),
				idToken: tokens.idToken,
				accessTokenExpiresAt: tokens.accessTokenExpiresAt,
				refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
				scope: tokens.scopes?.join(",")
			}).filter(([_, value]) => value !== void 0));
			await c.context.internalAdapter.updateAccount(existingAccount.id, updateData);
		} else if (!await c.context.internalAdapter.createAccount({
			userId: link.userId,
			providerId: provider.id,
			accountId: providerAccountId,
			...tokens,
			accessToken: await setTokenUtil(tokens.accessToken, c.context),
			refreshToken: await setTokenUtil(tokens.refreshToken, c.context),
			scope: tokens.scopes?.join(",")
		})) redirectOnError(c, resolvedErrorURL, "unable_to_link_account");
		let toRedirectTo;
		try {
			toRedirectTo = callbackURL.toString();
		} catch {
			toRedirectTo = callbackURL;
		}
		throw c.redirect(toRedirectTo);
	}
	if (!userInfo.email) {
		c.context.logger.error(missingEmailLogMessage(provider.id));
		redirectOnError(c, resolvedErrorURL, "email_not_found");
	}
	const accountData = {
		providerId: provider.id,
		accountId: providerAccountId,
		...tokens,
		scope: tokens.scopes?.join(",")
	};
	let result;
	try {
		result = await handleOAuthUserInfo(c, {
			userInfo: {
				...userInfo,
				id: providerAccountId,
				email: userInfo.email,
				name: userInfo.name || ""
			},
			account: accountData,
			callbackURL,
			disableSignUp: provider.disableImplicitSignUp && !requestSignUp || provider.options?.disableSignUp,
			overrideUserInfo: provider.options?.overrideUserInfoOnSignIn
		});
	} catch (e) {
		if (isAPIError(e) && e.body?.code) redirectOnError(c, resolvedErrorURL, e.body.code, e.body.message);
		throw e;
	}
	if (result.error) {
		c.context.logger.error(result.error.split(" ").join("_"));
		redirectOnError(c, resolvedErrorURL, result.error.split(" ").join("_"));
	}
	const { session, user } = result.data;
	await setSessionCookie(c, {
		session,
		user
	});
	let toRedirectTo;
	try {
		toRedirectTo = (result.isRegister ? newUserURL || callbackURL : callbackURL).toString();
	} catch {
		toRedirectTo = result.isRegister ? newUserURL || callbackURL : callbackURL;
	}
	throw c.redirect(toRedirectTo);
});
//#endregion
export { callbackOAuth };
