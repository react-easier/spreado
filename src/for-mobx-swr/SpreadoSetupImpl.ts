import {SpreadoSetupBase, SpreadoSetupOptions, TryPartial} from '../core';
import {_getSpreadIn, _setSpreadOut, _useSpreadIn, _useSpreadOut, SpreadoMobXStore} from '../mobx';

interface Options extends SpreadoSetupOptions {
  store?: SpreadoMobXStore;
}

interface InternalOptions extends SpreadoSetupOptions {
  store: SpreadoMobXStore;
}

export class SpreadoSetupForMobXSwr extends SpreadoSetupBase {
  private options: InternalOptions;
  private useSpreadOutCounter: Record<string, number> = {};

  constructor(options: Options = {}) {
    super(options);
    this.options = {
      store: options.store ?? new SpreadoMobXStore(),
    };
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
