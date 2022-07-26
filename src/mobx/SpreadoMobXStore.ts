import {action, makeObservable, observable} from 'mobx';

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

  findValue<T>(key: string): T | undefined;
  findValue<T>(key: string, fallback: Partial<T>): T | Partial<T>;
  findValue<T>(key: string, fallback?: Partial<T>): T | Partial<T> | undefined;
  findValue<T>(key: string, fallback?: Partial<T>): T | Partial<T> | undefined {
    if (!(key in this.state)) {
      return fallback;
    }
    return this.state[key] as T;
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
