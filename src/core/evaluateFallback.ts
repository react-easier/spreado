import {SpreadIndexWithFallback} from './SpreadIndex';
import {TryMatch, TryPartial} from './types';

export function evaluateFallback<V, I = unknown>(
  index: TryMatch<I, SpreadIndexWithFallback<V>>,
  fallback?: TryPartial<V>
): TryPartial<V> | undefined {
  if (index instanceof SpreadIndexWithFallback) {
    return fallback ?? index._f;
  } else {
    return fallback;
  }
}
