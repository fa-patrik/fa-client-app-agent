import type { WatchQueryFetchPolicy } from "@apollo/client";

let apiHookCalledMap: Record<string, Date> = {};

interface FetchPolicyOptions {
  fetchPolicy: WatchQueryFetchPolicy;
  onCompleted: (data: unknown) => void;
}

const TIME_TO_STALE = 3600 * 1000; // 1h in ms

const isStale = (hookKey: string) => {
  if (!apiHookCalledMap[hookKey]) {
    return true;
  }
  return (
    new Date().getTime() - apiHookCalledMap[hookKey].getTime() > TIME_TO_STALE
  );
};

/*
App persists its Apollo Client cache to localStorage
To have fresh data we get the data from api on every first hook call after app refresh
apiHookCalledMap keeping information when specified hook was rendered in current run
if hook was rendered less than TIME_TO_STALE we set fetchPolicy to "cache-only" if not we set "cache-and-network" (displays cached data but fetch current from api)
Apollo Client provides nextFetchPolicy, but it is reset to fetchPolicy after render of component where hook was used
 */
export const getFetchPolicyOptions = (hookKey: string): FetchPolicyOptions => ({
  fetchPolicy:
    isStale(hookKey) && window.navigator.onLine
      ? "cache-and-network"
      : "cache-only",
  onCompleted: () => {
    apiHookCalledMap = {
      ...apiHookCalledMap,
      [hookKey]: new Date(),
    };
  },
});
