import { siwe } from "./index.mjs";

//#region src/plugins/siwe/client.d.ts
declare const siweClient: () => {
  id: "siwe";
  version: string;
  $InferServerPlugin: ReturnType<typeof siwe>;
  pathMethods: {
    "/siwe/nonce": "POST";
    "/siwe/get-nonce": "POST";
  };
};
//#endregion
export { siweClient };