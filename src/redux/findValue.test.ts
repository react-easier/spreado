import {uniqueId} from 'lodash';
import {findValueInRootState} from './findValue';
import {SPREADO_REDUX_STATE_INDEX} from './module';

describe('findValueInRootState', () => {
  interface MyType {
    x: number;
    y: number;
    z: number;
  }

  test('returns undefined if sub store not found', () => {
    const key = uniqueId();
    expect(findValueInRootState<MyType>({}, key)).toBeUndefined();
  });

  test('returns undefined if value not found in sub store', () => {
    const key = uniqueId();
    expect(findValueInRootState<MyType>({[SPREADO_REDUX_STATE_INDEX]: {}}, key)).toBeUndefined();
  });

  test('returns typed value if found', () => {
    const key = uniqueId();
    const value: MyType = {x: 1, y: 2, z: 3};
    const rootStore = {[SPREADO_REDUX_STATE_INDEX]: {[key]: value}};
    expect(findValueInRootState<MyType>(rootStore, key)).toEqual(value);
  });

  test('returns fallback if not found but fallback provided', () => {
    const key = uniqueId();
    const fallback: Partial<MyType> = {x: 1};
    expect(findValueInRootState<MyType>({}, key, fallback)).toEqual(fallback);
  });
});
