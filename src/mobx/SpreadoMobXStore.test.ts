import {waitFor} from '@testing-library/react';
import {pick, uniqueId} from 'lodash';
import {autorun} from 'mobx';

import {SpreadoMobXStore} from './SpreadoMobXStore';
import {SpreadoMobXState} from './types';

describe('SpreadoMobXStore', () => {
  let store!: SpreadoMobXStore;
  let storedState!: SpreadoMobXState;
  beforeAll(() => {
    store = new SpreadoMobXStore();
    storedState = store.state;
    autorun(() => (storedState = store.state));
  });

  describe('#findValue', () => {
    interface MyValueType {
      x: number;
      y: number;
      z: number;
    }

    test('returns undefined if value not found', () => {
      const key = uniqueId();
      expect(store.findValue<MyValueType>(key)).toBeUndefined();
    });

    test('returns typed value if found', () => {
      const key = uniqueId();
      const value: MyValueType = {x: 1, y: 2, z: 3};
      Object.assign(store.state, {[key]: value});
      expect(store.findValue<MyValueType>(key)).toEqual(value);
    });

    test('returns fallback if not found but fallback provided', () => {
      const key = uniqueId();
      const fallback: Partial<MyValueType> = {x: 1};
      expect(store.findValue<MyValueType>(key, fallback)).toEqual(fallback);
    });
  });

  describe('#setState', () => {
    test('sets value by key', async () => {
      const key = uniqueId();
      const value = uniqueId();
      store.setState(key, value);
      await waitFor(() => expect(storedState[key]).toEqual(value));
    });
  });

  describe('#resetState', () => {
    test('deletes value by key', async () => {
      const key = uniqueId();
      store.resetState(key);
      await waitFor(() => expect(storedState[key]).toBeUndefined());
    });
  });

  describe('#bulkSetState', () => {
    test('expands state map', async () => {
      const k1 = uniqueId();
      const k2 = uniqueId();
      const kvMap = {[k1]: uniqueId(), [k2]: uniqueId()};
      store.bulkSetState(kvMap);
      await waitFor(() => expect(pick(storedState, k1, k2)).toEqual(kvMap));
    });
  });
});
