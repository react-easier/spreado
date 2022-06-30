import {renderHook} from '@testing-library/react-hooks';
import {mocked} from 'jest-mock';
import {uniqueId} from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {DefaultRootState, Store} from 'redux';

import {generateSpreadKey} from '../core';
import {findValueInRootState} from './findValue';
import {resetSpreadoReduxState, setSpreadoReduxState} from './module';
import {getSpreadIn, setSpreadOut, useSpreadIn, useSpreadOut} from './spreadHelpers';

const rootState: DefaultRootState = {};
const store: Store = {getState: () => rootState, dispatch: jest.fn()} as never;

jest.mock('react-redux');
jest.mock('./findValue');
jest.mock('./module');

mocked(useDispatch).mockReturnValue(jest.fn());
mocked(useSelector).mockImplementation((callback) => callback(rootState));

beforeEach(() => {
  jest.clearAllMocks();
  mocked(findValueInRootState).mockReturnValue(undefined);
});

describe('useSpreadOut', () => {
  test('returns proper value and updates redux state', async () => {
    const counter: Record<string, number> = {};
    const index = uniqueId();
    const key = generateSpreadKey(index);

    // returns input value immediately after initial call, before redux state updated
    const inputValue1 = uniqueId();
    const {result, rerender, unmount} = renderHook((value) => useSpreadOut(counter, index, value), {
      initialProps: inputValue1,
    });
    expect(setSpreadoReduxState).toBeCalledWith(key, inputValue1);
    expect(findValueInRootState).toHaveBeenNthCalledWith(1, rootState, key);
    expect(result.current).toEqual(inputValue1);

    // returns input value on rerender after initial call, before redux state updated
    rerender();
    expect(findValueInRootState).toBeCalledWith(rootState, key);
    expect(findValueInRootState).toHaveBeenNthCalledWith(2, rootState, key);
    expect(result.current).toEqual(inputValue1);

    // returns value in redux state after redux state updated
    const foundValue1 = uniqueId();
    mocked(findValueInRootState).mockReturnValue(foundValue1);
    rerender();
    expect(findValueInRootState).toHaveBeenNthCalledWith(3, rootState, key);
    expect(result.current).toEqual(foundValue1);

    // returns value in old redux state immediately after second call, before redux state updated
    const inputValue2 = uniqueId();
    rerender(inputValue2);
    expect(setSpreadoReduxState).toBeCalledWith(key, inputValue2);
    expect(findValueInRootState).toHaveBeenNthCalledWith(4, rootState, key);
    expect(result.current).toEqual(foundValue1);

    // returns value in old redux state on rerender after second call, before redux state updated
    rerender();
    expect(findValueInRootState).toHaveBeenNthCalledWith(5, rootState, key);
    expect(result.current).toEqual(foundValue1);

    // returns value in new redux state on rerender after redux state updated
    const foundValue2 = uniqueId();
    mocked(findValueInRootState).mockReturnValue(foundValue2);
    rerender();
    expect(findValueInRootState).toHaveBeenNthCalledWith(6, rootState, key);
    expect(result.current).toEqual(foundValue2);

    // resets redux in redux state on unmount
    unmount();
    expect(resetSpreadoReduxState).toBeCalledWith(key);
  });

  test('updates counter', () => {
    const counter: Record<string, number> = {};
    const index = uniqueId();
    const key = generateSpreadKey(index);

    const value1 = uniqueId();
    const {unmount: unmount1} = renderHook(() => useSpreadOut(counter, index, value1));
    expect(counter[key]).toEqual(1);

    const value2 = uniqueId();
    const {unmount: unmount2} = renderHook(() => useSpreadOut(counter, index, value2));
    expect(counter[key]).toEqual(2);

    unmount1();
    expect(counter[key]).toEqual(1);
    unmount2();
    expect(counter[key]).toBeUndefined();
  });
});

describe('useSpreadIn', () => {
  test('returns value in redux state', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const fallback = uniqueId();
    const value = uniqueId();
    mocked(findValueInRootState).mockReturnValue(value);
    const {result} = renderHook(() => useSpreadIn(index, fallback));
    expect(findValueInRootState).toBeCalledWith(rootState, key, fallback);
    expect(result.current).toEqual(value);
  });
});

describe('setSpreadOut', () => {
  test('updates redux state directly if plain value given', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const value = uniqueId();
    const ret = setSpreadOut(store, index, value);
    expect(ret).toBe(value);
    expect(setSpreadoReduxState).toBeCalledWith(key, value);
  });

  test('evalutes the value to use if callable value given', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const newValue = uniqueId();
    const callback = jest.fn(() => newValue);
    const oldValue = uniqueId();
    mocked(findValueInRootState).mockReturnValue(oldValue);
    const ret = setSpreadOut(store, index, callback);
    expect(callback).toBeCalledWith(oldValue);
    expect(ret).toBe(newValue);
    expect(setSpreadoReduxState).toBeCalledWith(key, newValue);
  });
});

describe('getSpreadIn', () => {
  test('returns value in redux state', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const fallback = uniqueId();
    const value = uniqueId();
    mocked(findValueInRootState).mockReturnValue(value);
    const ret = getSpreadIn(store, index, fallback);
    expect(findValueInRootState).toBeCalledWith(rootState, key, fallback);
    expect(ret).toEqual(value);
  });
});
