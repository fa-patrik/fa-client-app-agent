import type { StrategyHandler } from "workbox-strategies";
import { Strategy } from "workbox-strategies";
import { initTimestamp, calledChachesInThisInit } from "./init";

const addInitTimestampParam = (url: string) =>
  new URL(`?initTimestamp=${initTimestamp}`, url).href;

// works like StaleWhileRevalidate on first handle then works like CacheFirst
export class SWROnInitThenCacheFirst extends Strategy {
  async _handle(request: Request, handler: StrategyHandler): Promise<Response> {
    let error;
    let fetchAndCachePromise;

    let response = await handler.cacheMatch(request);
    if (!calledChachesInThisInit[request.url]) {
      fetchAndCachePromise = this.fetchAndCachePut(request, handler).catch(
        () => {
          // Swallow this error because a 'no-response' error will be thrown in
          // main handler return flow. This will be in the `waitUntil()` flow.
        }
      );
    }

    if (!response) {
      try {
        if (!fetchAndCachePromise) {
          response = await this.fetchAndCachePut(request, handler);
        } else {
          response = (await fetchAndCachePromise) as Response | undefined;
        }
      } catch (err) {
        if (err instanceof Error) {
          error = err;
        }
      }
    }

    if (!response) {
      throw new Error(
        JSON.stringify({
          type: "no-response",
          url: request.url,
          error,
        })
      );
    }
    calledChachesInThisInit[request.url] = true;

    return response;
  }

  // adaptation of https://github.com/GoogleChrome/workbox/blob/v6/packages/workbox-strategies/src/StrategyHandler.ts#L253
  // in below version we fetch asset with initTimestamp query param to make sure that browser cache isn't used
  async fetchAndCachePut(
    input: RequestInfo,
    handler: StrategyHandler
  ): Promise<Response> {
    const response = await handler.fetch(this.toInputWithParam(input));
    const responseClone = response.clone();

    void handler.waitUntil(handler.cachePut(input, responseClone));

    return response;
  }

  // returns input with initTimestamp param added to url
  toInputWithParam(input: RequestInfo) {
    if (typeof input === "string") {
      return addInitTimestampParam(input);
    }
    if (input.mode === "navigate") {
      return input;
    }
    return new Request(addInitTimestampParam(input.url), input);
  }
}
