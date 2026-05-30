import { noopOpenTelemetryAPI } from "./noop.mjs";
//#region src/instrumentation/api.ts
let openTelemetryAPIPromise;
let openTelemetryAPI;
function getOpenTelemetryAPI() {
	if (!openTelemetryAPIPromise) openTelemetryAPIPromise = import("@opentelemetry/api").then((mod) => {
		openTelemetryAPI = mod;
	}).catch(() => void 0);
	return openTelemetryAPI ?? noopOpenTelemetryAPI;
}
//#endregion
export { getOpenTelemetryAPI };
