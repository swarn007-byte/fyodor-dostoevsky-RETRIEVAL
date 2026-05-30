import { Awaitable } from "../types/helper.mjs";

//#region src/utils/async.d.ts
interface MapConcurrentOptions {
  /**
   * Max in-flight mappers. Non-integer values are floored, then clamped
   * to the range `[1, items.length]`. `NaN` falls back to 1.
   */
  concurrency: number;
  /**
   * Rejects with `signal.reason` when aborted. In-flight mappers keep
   * running but their results are not returned.
   */
  signal?: AbortSignal;
}
/**
 * Run an async mapper over items with bounded concurrency.
 * Preserves input order in the result. Fails fast on the first rejection.
 */
declare function mapConcurrent<T, R>(items: readonly T[], fn: (item: T, index: number) => Awaitable<R>, options: MapConcurrentOptions): Promise<R[]>;
//#endregion
export { MapConcurrentOptions, mapConcurrent };