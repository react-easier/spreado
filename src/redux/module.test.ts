import {uniqueId} from 'lodash';

import reducer, {
  bulkSetSpreadoReduxState,
  resetSpreadoReduxState,
  setSpreadoReduxState,
  SPREADO_REDUX_ACTION_BULK_SET_STATE,
  SPREADO_REDUX_ACTION_RESET_STATE,
  SPREADO_REDUX_ACTION_SET_STATE,
  SpreadoReduxState,
} from './module';

describe('setSpreadoReduxState', () => {
  test('dispatches params with action type', () => {
    const type = SPREADO_REDUX_ACTION_SET_STATE;
    const key = uniqueId();
    const value = {field: uniqueId()};
    expect(setSpreadoReduxState(key, value)).toEqual({type, key, value});
  });
});

describe('resetSpreadoReduxState', () => {
  test('dispatches params with action type', () => {
    const type = SPREADO_REDUX_ACTION_RESET_STATE;
    const key = uniqueId();
    expect(resetSpreadoReduxState(key)).toEqual({type, key});
  });
});

describe('bulkSetSpreadoReduxState', () => {
  test('dispatches params with action type', () => {
    const type = SPREADO_REDUX_ACTION_BULK_SET_STATE;
    const kvMap = {[uniqueId()]: uniqueId()};
    expect(bulkSetSpreadoReduxState(kvMap)).toEqual({type, kvMap});
  });
});

describe('reducer', () => {
  const initialState: SpreadoReduxState = {};

  test('returns initial state on unknown action type', () => {
    expect(reducer(initialState, {type: 'unknown'} as never)).toEqual(initialState);
  });

  test('returns default initial state on its absence', () => {
    expect(reducer(undefined, {type: 'unknown'} as never)).toEqual(initialState);
  });

  describe(`handles ${SPREADO_REDUX_ACTION_SET_STATE}`, () => {
    const type = SPREADO_REDUX_ACTION_SET_STATE;

    test('sets value by key', () => {
      const key = uniqueId();
      const value = uniqueId();
      expect(reducer(initialState, {type, key, value})).toEqual({[key]: value});
    });
  });

  describe(`handles ${SPREADO_REDUX_ACTION_RESET_STATE}`, () => {
    const type = SPREADO_REDUX_ACTION_RESET_STATE;

    test('deletes value by key', () => {
      const key = uniqueId();
      const initState = {[key]: {}};
      expect(reducer(initState, {type, key})[key]).not.toBeDefined();
    });
  });

  describe(`handles ${SPREADO_REDUX_ACTION_BULK_SET_STATE}`, () => {
    const type = SPREADO_REDUX_ACTION_BULK_SET_STATE;

    test('expands state map', () => {
      const kvMap = {[uniqueId()]: uniqueId(), [uniqueId()]: uniqueId()};
      expect(reducer(initialState, {type, kvMap})).toEqual({...initialState, ...kvMap});
    });
  });
});
