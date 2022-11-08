import {action, makeObservable, observable} from 'mobx';

import {TryPartial} from '../core';
import {createSpreadoMobXPreloadedState} from './ssrHelpers';
import {SpreadoMobXState} from './types';

export class SpreadoMobXStore {
  state: SpreadoMobXState;

  constructor(preloadedState: SpreadoMobXState = {}) {
    this.state = preloadedState;
    makeObservable(this, {
      state: observable.ref,
      setState: action,
      resetState: action,
      bulkSetState: action,
    });
  }

  findValue<V>(key: string): V | undefined;
  findValue<V>(key: string, fallback: TryPartial<V>): V | TryPartial<V>;
  findValue<V>(key: string, fallback?: TryPartial<V>): V | TryPartial<V> | undefined;
  findValue<V>(key: string, fallback?: TryPartial<V>): V | TryPartial<V> | undefined {
    if (!(key in this.state)) {
      return fallback;
    }
    return this.state[key] as V;
  }

  setState(key: string, value: unknown): void {
    this.state = {...this.state, [key]: value};
  }

  resetState(key: string): void {
    const nextState = {...this.state};
    delete nextState[key];
    this.state = nextState;
  }

  bulkSetState(kvMap: SpreadoMobXState): void {
    this.state = {...this.state, ...kvMap};
  }

  static createPreloadedState = createSpreadoMobXPreloadedState;
}
