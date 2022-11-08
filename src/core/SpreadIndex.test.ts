import {uniqueId} from 'lodash';

import {createSpreadIndex, SpreadIndex, SpreadIndexWithFallback} from './SpreadIndex';

describe('createSpreadIndex', () => {
  test('creates spread index w/o fallback if fallback not given', () => {
    const spreadIndex = createSpreadIndex();
    expect(spreadIndex).toBeInstanceOf(SpreadIndex);
    expect(spreadIndex).not.toBeInstanceOf(SpreadIndexWithFallback);
  });

  test('creates spread index with fallback if fallback given', () => {
    const fallback = uniqueId();
    const spreadIndex = createSpreadIndex(fallback);
    expect(spreadIndex).toBeInstanceOf(SpreadIndex);
    expect(spreadIndex).toBeInstanceOf(SpreadIndexWithFallback);
  });
});
