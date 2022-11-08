import {uniqueId} from 'lodash';

import {evaluateFallback} from './evaluateFallback';
import {SpreadIndex, SpreadIndexWithFallback} from './SpreadIndex';

describe('evaluateFallback', () => {
  describe('when fallback is not given', () => {
    test('returns undefined if index is plain index', () => {
      expect(evaluateFallback({x: uniqueId()})).toBeUndefined();
    });

    test('returns undefined if index is spread index w/o fallback', () => {
      expect(evaluateFallback(new SpreadIndex(uniqueId()))).toBeUndefined();
    });

    test('returns fallback from index if index is spread index with fallback', () => {
      const fallbackFromSpreadIndex = uniqueId();
      expect(
        evaluateFallback(new SpreadIndexWithFallback(uniqueId(), fallbackFromSpreadIndex))
      ).toBe(fallbackFromSpreadIndex);
    });
  });

  describe('when fallback is given', () => {
    const fallback = uniqueId();

    test('returns fallback if index is plain index or is spread index w/o fallback', () => {
      expect(evaluateFallback({x: uniqueId()}, fallback)).toBe(fallback);
    });

    test('returns fallback if index is spread index w/o fallback', () => {
      expect(evaluateFallback(new SpreadIndex(uniqueId()), fallback)).toBe(fallback);
    });

    test('returns fallback even if index is spread index with fallback', () => {
      const fallbackFromSpreadIndex = uniqueId();
      expect(
        evaluateFallback(new SpreadIndexWithFallback(uniqueId(), fallbackFromSpreadIndex), fallback)
      ).toBe(fallback);
    });
  });
});
