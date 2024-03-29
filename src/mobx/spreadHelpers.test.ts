import {act, renderHook} from '@testing-library/react-hooks';
import {mocked} from 'jest-mock';
import {noop, uniqueId} from 'lodash';
import {reaction} from 'mobx';

import {generateSpreadKey} from '../core';
import {_getSpreadIn, _setSpreadOut, _useSpreadIn, _useSpreadOut} from './spreadHelpers';
import {SpreadoMobXStore} from './SpreadoMobXStore';

const store = new SpreadoMobXStore();

jest.mock('mobx', () => ({
  ...jest.requireActual('mobx'),
  reaction: jest.fn(),
}));

const triggerReactionOnce = jest.fn();
mocked(reaction).mockImplementation((expression, effect) => {
  triggerReactionOnce.mockImplementation(() => {
    effect(expression(0 as never), 0 as never, 0 as never);
  });
  return noop as never;
});

describe('_useSpreadOut', () => {
  test('returns proper value and updates mobx state', async () => {
    const counter: Record<string, number> = {};
    const index = uniqueId();
    const key = generateSpreadKey(index);

    // returns input value immediately after initial call, before mobx state updated
    const inputValue1 = uniqueId();
    const {result, rerender, unmount} = renderHook(
      (value) => _useSpreadOut(store, counter, index, value),
      {initialProps: inputValue1}
    );
    expect(result.current).toEqual(inputValue1);

    // returns input value on rerender after initial call, before mobx state updated
    rerender();
    expect(result.current).toEqual(inputValue1);

    // returns value in mobx state after mobx state updated
    const foundValue1 = uniqueId();
    store.setState(key, foundValue1);
    act(triggerReactionOnce);
    expect(result.current).toEqual(foundValue1);

    // returns value in old mobx state immediately after second call, before mobx state updated
    const inputValue2 = uniqueId();
    rerender(inputValue2);
    expect(result.current).toEqual(foundValue1);

    // returns value in new mobx state on rerender after mobx state updated
    const foundValue2 = uniqueId();
    store.setState(key, foundValue2);
    act(triggerReactionOnce);
    expect(result.current).toEqual(foundValue2);

    // resets mobx in mobx state on unmount
    unmount();
    expect(store.state[key]).toBeUndefined();
  });

  test('updates counter', () => {
    const counter: Record<string, number> = {};
    const index = uniqueId();
    const key = generateSpreadKey(index);

    const value1 = uniqueId();
    const {unmount: unmount1} = renderHook(() => _useSpreadOut(store, counter, index, value1));
    expect(counter[key]).toEqual(1);

    const value2 = uniqueId();
    const {unmount: unmount2} = renderHook(() => _useSpreadOut(store, counter, index, value2));
    expect(counter[key]).toEqual(2);

    unmount1();
    expect(counter[key]).toEqual(1);
    unmount2();
    expect(counter[key]).toBeUndefined();
  });
});

describe('_useSpreadIn', () => {
  test('returns value in mobx state', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const fallback = uniqueId();
    const value = uniqueId();
    const {result} = renderHook(() => _useSpreadIn(store, index, fallback));
    expect(result.current).toEqual(fallback);
    store.setState(key, value);
    act(triggerReactionOnce);
    expect(result.current).toEqual(value);
  });
});

describe('_setSpreadOut', () => {
  test('updates mobx state directly if plain value given', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const value = uniqueId();
    const ret = _setSpreadOut(store, index, value);
    expect(ret).toBe(value);
    expect(store.state[key]).toEqual(value);
  });

  test('evalutes the value to use if callable value given', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const newValue = uniqueId();
    const callback = jest.fn(() => newValue);
    const oldValue = uniqueId();
    store.setState(key, oldValue);
    const ret = _setSpreadOut(store, index, callback);
    expect(callback).toHaveBeenCalledWith(oldValue);
    expect(ret).toBe(newValue);
    expect(store.state[key]).toEqual(newValue);
  });
});

describe('_getSpreadIn', () => {
  test('returns value in mobx state', () => {
    const index = uniqueId();
    const key = generateSpreadKey(index);
    const fallback = uniqueId();
    const value = uniqueId();
    store.setState(key, value);
    const ret = _getSpreadIn(store, index, fallback);
    expect(ret).toEqual(value);
  });
});
