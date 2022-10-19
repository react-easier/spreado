import {SpreadoSetupBase, SpreadoSetupOptions} from '../core';
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

  useSpreadOut<T>(index: unknown, value: T): T {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return _useSpreadOut(this.options.store, this.useSpreadOutCounter, index, value);
  }

  useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return _useSpreadIn(this.options.store, index, fallback);
  }

  setSpreadOut<T>(index: unknown, value: T | ((value?: T) => T)): T {
    return _setSpreadOut(this.options.store, index, value);
  }

  getSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
    return _getSpreadIn(this.options.store, index, fallback);
  }
}
