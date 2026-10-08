import type { ReactNode } from 'react';
import { createContext, useContext, useRef } from 'react';

import type { StoreApi } from 'zustand';

import { createStore, useStore } from 'zustand';

/**
 * Creates an SSR-safe context and provider wrapper around a Zustand store definition.
 *
 * @param createStoreFn The Zustand store creator function.
 * @returns An object containing the Provider component, the hook, and the raw React Context.
 */
export function createSSRStore<TStateAndActions>(
  createStoreFn: (
    set: StoreApi<TStateAndActions>['setState'],
    get: StoreApi<TStateAndActions>['getState'],
    api: StoreApi<TStateAndActions>
  ) => TStateAndActions
) {
  type StoreType = StoreApi<TStateAndActions>;
  const Context = createContext<StoreType | null>(null);

  interface ProviderProps {
    children: ReactNode;
    initialValue?: Partial<TStateAndActions>;
  }

  function Provider({ children, initialValue }: ProviderProps) {
    const storeRef = useRef<StoreType | null>(null);
    if (!storeRef.current) {
      storeRef.current = createStore<TStateAndActions>((set, get, api) => {
        const base = createStoreFn(set, get, api);
        if (initialValue) {
          return {
            ...base,
            ...initialValue
          };
        }
        return base;
      });
    }
    return <Context.Provider value={storeRef.current}>{children}</Context.Provider>;
  }

  function useSSRStore<TSelected>(selector: (state: TStateAndActions) => TSelected): TSelected {
    const store = useContext(Context);

    if (!store) {
      throw new Error('useSSRStore must be used within its corresponding Provider');
    }

    return useStore(store, selector);
  }

  return {
    Context,
    Provider,
    useSSRStore
  };
}
