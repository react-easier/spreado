import {QueryClient} from 'react-query';
import {generateSpreadKey, SpreadoSetupBase, SpreadoSetupOptions} from '../core';
import {getSpreadIn, setSpreadOut, SpreadoMobXStore, useSpreadIn, useSpreadOut} from '../mobx';

interface Options extends SpreadoSetupOptions {
  store?: SpreadoMobXStore;
  enableAutoSpread?: boolean;
  queryClient: QueryClient;
}

interface InternalOptions extends Options {
  store: SpreadoMobXStore;
}

export class SpreadoSetupForMobXReactQuery extends SpreadoSetupBase {
  private options: InternalOptions;
  private useSpreadOutCounter: Record<string, number> = {};

  constructor(options: Options) {
    super(options);
    this.options = {
      store: options.store ?? new SpreadoMobXStore(),
      ...options,
    };

    const {enableAutoSpread} = this.options;
    if (enableAutoSpread) {
      this.autoSpreadOutQueries();
    }
  }

  autoSpreadOutQueries() {
    const {store, queryClient} = this.options;
    const queryCache = queryClient.getQueryCache();
    queryCache.subscribe(() => {
      const stateKvMap = queryCache.getAll().reduce(
        (result, {queryKey}) => ({
          ...result,
          [generateSpreadKey(queryKey)]: queryClient.getQueryState(queryKey),
        }),
        {}
      );

      store.bulkSetState(stateKvMap);
    });
  }

  useSpreadOut<T>(index: unknown, value: T): T {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSpreadOut(this.options.store, this.useSpreadOutCounter, index, value);
  }

  useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSpreadIn(this.options.store, index, fallback);
  }

  setSpreadOut<T>(index: unknown, value: T | ((value?: T) => T)): T {
    return setSpreadOut(this.options.store, index, value);
  }

  getSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    return getSpreadIn(this.options.store, index, fallback);
  }
}
