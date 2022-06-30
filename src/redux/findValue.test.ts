import {uniqueId} from 'lodash';

import {findValueInRootState} from './findValue';
import {SPREADO_REDUX_STATE_INDEX} from './module';

describe('findValueInRootState', () => {
  interface MyValueType {
    x: number;
    y: number;
    z: number;
  }

  test('returns undefined if sub store not found', () => {
    const key = uniqueId();
    expect(findValueInRootState<MyValueType>({}, key)).toBeUndefined();
  });

  test('returns undefined if value not found in sub store', () => {
    const key = uniqueId();
    expect(
      findValueInRootState<MyValueType>({[SPREADO_REDUX_STATE_INDEX]: {}}, key)
    ).toBeUndefined();
  });

  test('returns typed value if found', () => {
    const key = uniqueId();
    const value: MyValueType = {x: 1, y: 2, z: 3};
    const rootStore = {[SPREADO_REDUX_STATE_INDEX]: {[key]: value}};
    expect(findValueInRootState<MyValueType>(rootStore, key)).toEqual(value);
  });

  test('returns fallback if not found but fallback provided', () => {
    const key = uniqueId();
    const fallback: Partial<MyValueType> = {x: 1};
    expect(findValueInRootState<MyValueType>({}, key, fallback)).toEqual(fallback);
  });
});
