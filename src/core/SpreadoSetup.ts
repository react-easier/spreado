import {setSpreadoGlobalState} from '../global';
import {SpreadIndex, SpreadIndexWithFallback} from './SpreadIndex';
import {TryMatch, TryPartial} from './types';

export interface SpreadoSetupOptions {}

export interface SpreadoSetup {
  useSpreadOut<V, I = unknown>(index: TryMatch<I, SpreadIndex<V>>, value: V): V;

  useSpreadIn<V>(index: SpreadIndexWithFallback<V>): V | TryPartial<V>;
  useSpreadIn<V, I = unknown>(index: TryMatch<I, SpreadIndex<V>>): V | undefined;
  useSpreadIn<V, I = unknown>(
    index: TryMatch<I, SpreadIndex<V>>,
    fallback: TryPartial<V>
  ): V | TryPartial<V>;
  useSpreadIn<V>(index: SpreadIndexWithFallback<V>, fallback?: TryPartial<V>): V | TryPartial<V>;
  useSpreadIn<V, I = unknown>(
    index: TryMatch<I, SpreadIndex<V>>,
    fallback?: TryPartial<V>
  ): V | TryPartial<V> | undefined;

  setSpreadOut<V, I = unknown>(index: TryMatch<I, SpreadIndex<V>>, value: V): V;
  setSpreadOut<V>(index: SpreadIndexWithFallback<V>, callback: (value: V | TryPartial<V>) => V): V;
  setSpreadOut<V, I = unknown>(index: TryMatch<I, SpreadIndex<V>>, callback: (value?: V) => V): V;

  getSpreadIn<V>(index: SpreadIndexWithFallback<V>): V | TryPartial<V>;
  getSpreadIn<V, I = unknown>(index: TryMatch<I, SpreadIndex<V>>): V | undefined;
  getSpreadIn<V, I = unknown>(
    index: TryMatch<I, SpreadIndex<V>>,
    fallback: TryPartial<V>
  ): V | TryPartial<V>;
  getSpreadIn<V>(index: SpreadIndexWithFallback<V>, fallback?: TryPartial<V>): V | TryPartial<V>;
  getSpreadIn<V, I>(
    index: TryMatch<I, SpreadIndex<V>>,
    fallback?: TryPartial<V>
  ): V | TryPartial<V> | undefined;
}

export abstract class SpreadoSetupBase implements SpreadoSetup {
  // We leave a consistent form of the base constructor to do better extending in the future.
  // eslint-disable-next-line
  constructor(options: SpreadoSetupOptions) {
    setSpreadoGlobalState({spreadoSetup: this});
  }

  abstract useSpreadOut: SpreadoSetup['useSpreadOut'];
  abstract useSpreadIn: SpreadoSetup['useSpreadIn'];
  abstract setSpreadOut: SpreadoSetup['setSpreadOut'];
  abstract getSpreadIn: SpreadoSetup['getSpreadIn'];
}
