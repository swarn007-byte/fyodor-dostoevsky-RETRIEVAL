//#region src/integrations/cookie-plugin-guard.ts
/**
* Warns when a cookie integration plugin is not effectively last.
*
* A plugin is considered misordered when there is at least one other plugin
* after it in the `plugins` array that declares `hooks.after`, since those
* hooks can set cookies that this integration will not see.
*/
function warnIfCookiePluginNotLast(ctx, pluginId) {
	const plugins = ctx.options.plugins || [];
	if (plugins.length === 0) return;
	const index = plugins.findIndex((p) => p.id === pluginId);
	if (index === -1) return;
	if (!plugins.slice(index + 1).some((p) => p.hooks && Array.isArray(p.hooks.after) && p.hooks.after.length > 0)) return;
	ctx.logger.warn(`[better-auth] Cookie integration plugin "${pluginId}" should be placed last in the plugins array. Plugins with \`hooks.after\` running after it may set cookies that are not forwarded to the framework cookie store. Move your cookie integration plugin to the end of the \`plugins\` array to avoid missing \`Set-Cookie\` headers.`);
}
//#endregion
export { warnIfCookiePluginNotLast };
