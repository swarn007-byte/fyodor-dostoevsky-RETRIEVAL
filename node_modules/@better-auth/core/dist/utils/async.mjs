//#region src/utils/async.ts
/**
* Run an async mapper over items with bounded concurrency.
* Preserves input order in the result. Fails fast on the first rejection.
*/
async function mapConcurrent(items, fn, options) {
	const n = items.length;
	if (n === 0) return [];
	const { signal } = options;
	if (signal?.aborted) throw signal.reason;
	const raw = Math.floor(options.concurrency);
	const width = Math.min(n, raw >= 1 ? raw : 1);
	const results = new Array(n);
	let idx = 0;
	let failed = false;
	const worker = async () => {
		while (!failed && idx < n) {
			if (signal?.aborted) throw signal.reason;
			const i = idx++;
			try {
				results[i] = await fn(items[i], i);
			} catch (error) {
				failed = true;
				throw error;
			}
		}
	};
	await Promise.all(Array.from({ length: width }, worker));
	return results;
}
//#endregion
export { mapConcurrent };
