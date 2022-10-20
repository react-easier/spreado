import {renderHook} from '@testing-library/react-hooks';
import {mocked} from 'jest-mock';
import {get, noop, times, uniqueId, unzip, zipObject} from 'lodash';
import {QueryCache, QueryClient} from 'react-query';
import {Store} from 'redux';

import {generateSpreadKey} from '../core';
import {
  _getSpreadIn,
  _setSpreadOut,
  _useSpreadIn,
  _useSpreadOut,
  bulkSetSpreadoReduxState,
  SpreadoReduxState,
} from '../redux';
import {SpreadoSetupForReduxReactQuery} from './SpreadoSetupImpl';

const store: Store = {
  dispatch: jest.fn(),
} as never;

const queryClient: QueryClient = {
  getQueryCache: () => queryCache,
  getQueryState: jest.fn(),
} as never;

const queryCache: QueryCache = {
  subscribe: jest.fn(),
  getAll: jest.fn(),
} as never;

jest.mock('../redux');

describe('SpreadoSetupForReduxReactQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocked(queryClient.getQueryState).mockReturnValue(null as never);
  });

  describe('#useSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxReactQuery({store, queryClient});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.useSpreadOut(index, value));
      expect(_useSpreadOut).toBeCalledWith(get(setup, 'useSpreadOutCounter'), index, value);
    });
  });

  describe('#useSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxReactQuery({store, queryClient});
      const index = uniqueId();
      const fallback = uniqueId();
      renderHook(() => setup.useSpreadIn(index, fallback));
      expect(_useSpreadIn).toBeCalledWith(index, fallback);
    });
  });

  describe('#setSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxReactQuery({store, queryClient});
      const index = uniqueId();
      const value = uniqueId();
      setup.setSpreadOut(index, value);
      expect(_setSpreadOut).toBeCalledWith(store, index, value);
    });
  });

  describe('#getSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxReactQuery({store, queryClient});
      const index = uniqueId();
      const fallback = uniqueId();
      setup.getSpreadIn(index, fallback);
      expect(_getSpreadIn).toBeCalledWith(store, index, fallback);
    });
  });

  describe('auto spread', () => {
    test('subscribes query cache changes on construction if enabled', () => {
      new SpreadoSetupForReduxReactQuery({
        store,
        queryClient,
        enableAutoSpread: true,
      });
      expect(queryCache.subscribe).toBeCalledWith(expect.any(Function));
    });

    test('bulk updates redux state on query cache change', () => {
      let triggerQueryCacheChange!: () => void;
      mocked(queryCache.subscribe).mockImplementationOnce((fn) => {
        if (fn) {
          triggerQueryCacheChange = fn;
        }
        return noop;
      });

      const queryKeyStateMap = zipObject(...unzip(times(5).map(() => [uniqueId(), uniqueId()])));
      mocked(queryCache.getAll).mockReturnValueOnce(
        Object.keys(queryKeyStateMap).map((queryKey) => ({queryKey} as never))
      );
      mocked(queryClient.getQueryState).mockImplementation(
        (queryKey) => queryKeyStateMap[queryKey as string] as never
      );

      new SpreadoSetupForReduxReactQuery({
        store,
        queryClient,
        enableAutoSpread: true,
      });
      const kvMap: SpreadoReduxState = {};
      for (const k in queryKeyStateMap) {
        kvMap[generateSpreadKey(k)] = queryKeyStateMap[k];
      }
      triggerQueryCacheChange();
      expect(bulkSetSpreadoReduxState).toBeCalledWith(kvMap);
    });
  });
});
