import {QueryClient} from 'react-query';
import {Store} from 'redux';
import {generateSpreadKey, SpreadoSetupBase, SpreadoSetupOptions} from '../core';
import {
  bulkSetSpreadoReduxState,
  getSpreadIn,
  setSpreadOut,
  SpreadoReduxState,
  useSpreadIn,
  useSpreadOut,
} from '../redux';

interface Options extends SpreadoSetupOptions {
  store: Store;
  queryClient: QueryClient;
  enableAutoSpread?: boolean;
}

export class SpreadoSetupForReduxReactQuery extends SpreadoSetupBase {
  private options: Options;
  private useSpreadOutCounter: Record<string, number> = {};

  constructor(options: Options) {
    super(options);
    this.options = options;
    if (this.options.enableAutoSpread) {
      this.enableAutoSpreadOutQueries();
    }
  }

  enableAutoSpreadOutQueries() {
    const {store, queryClient} = this.options;
    const queryCache = queryClient.getQueryCache();
    queryCache.subscribe(() => {
      const stateKvMap = queryCache.getAll().reduce(
        (result, {queryKey}) => ({
          ...result,
          [generateSpreadKey(queryKey)]: queryClient.getQueryState(queryKey),
        }),
        {} as SpreadoReduxState
      );
      store.dispatch(bulkSetSpreadoReduxState(stateKvMap));
    });
  }

  useSpreadOut<T>(index: unknown, value: T): T {
    // eslint-disable-next-line
    return useSpreadOut(this.useSpreadOutCounter, index, value);
  }

  useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    // eslint-disable-next-line
    return useSpreadIn(index, fallback);
  }

  setSpreadOut<T>(index: unknown, value: T | ((value?: T) => T)): T {
    return setSpreadOut(this.options.store, index, value);
  }

  getSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    return getSpreadIn(this.options.store, index, fallback);
  }
}
