import {QueryClient} from 'react-query';
import {Store} from 'redux';

import {generateSpreadKey, SpreadoSetupBase, SpreadoSetupOptions} from '../core';
import {
  _getSpreadIn,
  _setSpreadOut,
  _useSpreadIn,
  _useSpreadOut,
  bulkSetSpreadoReduxState,
  SpreadoReduxState,
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
      this.enableQueriesAutoSpreadOut();
    }
  }

  enableQueriesAutoSpreadOut() {
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return _useSpreadOut(this.useSpreadOutCounter, index, value);
  }

  useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return _useSpreadIn(index, fallback);
  }

  setSpreadOut<T>(index: unknown, value: T | ((value?: T) => T)): T {
    return _setSpreadOut(this.options.store, index, value);
  }

  getSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    return _getSpreadIn(this.options.store, index, fallback);
  }
}
