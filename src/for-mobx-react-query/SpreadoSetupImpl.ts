import {QueryClient} from 'react-query';

import {generateSpreadKey, SpreadoSetupBase, SpreadoSetupOptions, TryPartial} from '../core';
import {
  _getSpreadIn,
  _setSpreadOut,
  _useSpreadIn,
  _useSpreadOut,
  SpreadoMobXState,
  SpreadoMobXStore,
} from '../mobx';

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
      ...options,
      store: options.store ?? new SpreadoMobXStore(),
    };

    const {enableAutoSpread} = this.options;
    if (enableAutoSpread) {
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
        {} as SpreadoMobXState
      );

      store.bulkSetState(stateKvMap);
    });
  }

  useSpreadOut = <V>(index: unknown, value: V): V => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return _useSpreadOut(this.options.store, this.useSpreadOutCounter, index, value);
  };

  useSpreadIn = <V>(index: unknown, fallback?: TryPartial<V>): V | TryPartial<V> | undefined => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return _useSpreadIn(this.options.store, index, fallback);
  };

  setSpreadOut = <V>(index: unknown, value: V | ((value?: V | TryPartial<V>) => V)): V => {
    return _setSpreadOut(this.options.store, index, value);
  };

  getSpreadIn = <V>(index: unknown, fallback?: TryPartial<V>): V | TryPartial<V> | undefined => {
    return _getSpreadIn(this.options.store, index, fallback);
  };
}
