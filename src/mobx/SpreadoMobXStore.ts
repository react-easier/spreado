import {action, makeObservable, observable} from 'mobx';
import {generateSpreadKey} from '../core';

export type SpreadoMobXState = Record<string, unknown>;

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

  static createPreloadedState(ivMap: Record<string | number | symbol, unknown>): SpreadoMobXState {
    const preloadedState: SpreadoMobXState = Object.keys(ivMap).reduce(
      (acc, index) => ({...acc, [generateSpreadKey(index)]: ivMap[index]}),
      {}
    );
    return preloadedState;
  }
}
