import { PACKAGE_VERSION } from "../../version.mjs";
//#region src/plugins/siwe/client.ts
const siweClient = () => {
	return {
		id: "siwe",
		version: PACKAGE_VERSION,
		$InferServerPlugin: {},
		pathMethods: {
			"/siwe/nonce": "POST",
			"/siwe/get-nonce": "POST"
		}
	};
};
//#endregion
export { siweClient };
