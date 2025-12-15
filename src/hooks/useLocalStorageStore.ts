import { useEffect, useReducer } from "react";
import { ReactSubscriber } from "utils/ReactSubscriber";
import type { LocalOrder } from "./useLocalTradeStorageState";

type StorageState = LocalOrder[];

class LocalTradingStorage extends ReactSubscriber<StorageState> {
  private key = "tradingStorage";

  constructor() {
    super([]);
    const valueInLocalStorage = window.localStorage.getItem(this.key);
    if (valueInLocalStorage == null) {
      return;
    }
    this.state = JSON.parse(valueInLocalStorage) as StorageState;
  }

  setState(state: StorageState) {
    this.state = state;
    window.localStorage.setItem(this.key, JSON.stringify(this.state));
    this.updateState();
  }
}

const localTradingStorage = new LocalTradingStorage();

export const useLocalStorageStore = (): [
  StorageState,
  (newState: StorageState) => void,
] => {
  const [, forceRender] = useReducer((previous) => previous + 1, 0);

  useEffect(() => {
    const index = localTradingStorage.subscribe(forceRender);
    return () => localTradingStorage.unsubscribe(index);
  }, []);

  const state = localTradingStorage.State;

  const setState = (newState: StorageState) => {
    localTradingStorage.setState(newState);
  };

  return [state, setState];
};
