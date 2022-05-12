import {SpreadoSetupBase, SpreadoSetupOptions} from '../core';
import {getSpreadIn, setSpreadOut, SpreadoMobXStore, useSpreadIn, useSpreadOut} from '../mobx';

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
