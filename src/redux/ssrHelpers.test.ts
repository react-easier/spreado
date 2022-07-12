import {uniqueId} from 'lodash';

import {generateSpreadKey} from '../core';
import {SPREADO_REDUX_STATE_INDEX} from './module';
import {createSpreadoReduxPreloadedState} from './ssrHelpers';

describe('createSpreadoReduxPreloadedState', () => {
  test('generates spreado part of preloaded state for redux SSR', () => {
    const key1 = uniqueId();
    const value1 = uniqueId();
    const key2 = uniqueId();
    const value2 = uniqueId();
    const kvMap = {[key1]: value1, [key2]: value2};
    expect(createSpreadoReduxPreloadedState(kvMap)).toEqual({
      [SPREADO_REDUX_STATE_INDEX]: {
        [generateSpreadKey(key1)]: value1,
        [generateSpreadKey(key2)]: value2,
      },
    });
  });
});
