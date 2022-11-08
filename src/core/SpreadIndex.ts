import {customAlphabet} from 'nanoid';

import {TryPartial} from './types';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

const TypePlaceholder = '';

export class SpreadIndex<V> {
  _i: string;
  _t: V;

  constructor(i: string) {
    this._i = i;
    this._t = TypePlaceholder as V;
  }
}

export class SpreadIndexWithFallback<V> extends SpreadIndex<V> {
  _f: TryPartial<V>;

  constructor(i: string, f: TryPartial<V>) {
    super(i);
    this._f = f;
  }
}

export function createSpreadIndex<V>(): SpreadIndex<V>;
export function createSpreadIndex<V>(fallback: TryPartial<V>): SpreadIndexWithFallback<V>;
export function createSpreadIndex<V>(
  fallback?: TryPartial<V>
): SpreadIndex<V> | SpreadIndexWithFallback<V> {
  if (arguments.length === 0) {
    return new SpreadIndex<V>(nanoid());
  } else {
    return new SpreadIndexWithFallback<V>(nanoid(), fallback as TryPartial<V>);
  }
}
