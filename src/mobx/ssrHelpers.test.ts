import {uniqueId} from 'lodash';

import {generateSpreadKey} from '../core';
import {createSpreadoMobXPreloadedState} from './ssrHelpers';

describe('createSpreadoMobXPreloadedState', () => {
  test('generates preloaded state for mobx store', () => {
    const key1 = uniqueId();
    const value1 = uniqueId();
    const key2 = uniqueId();
    const value2 = uniqueId();
    const kvMap = {[key1]: value1, [key2]: value2};
    expect(createSpreadoMobXPreloadedState(kvMap)).toEqual({
      [generateSpreadKey(key1)]: value1,
      [generateSpreadKey(key2)]: value2,
    });
  });
});
