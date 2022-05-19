import {renderHook} from '@testing-library/react-hooks';
import {mocked} from 'jest-mock';
import {get, noop, times, uniqueId, unzip, zipObject} from 'lodash';
import {QueryCache, QueryClient} from 'react-query';
import {generateSpreadKey} from '../core';
import {
  getSpreadIn,
  setSpreadOut,
  SpreadoMobXState,
  SpreadoMobXStore,
  useSpreadIn,
  useSpreadOut,
} from '../mobx';
import {SpreadoSetupForMobXReactQuery} from './SpreadoSetupImpl';

const store: SpreadoMobXStore = {} as never;
const builtinStore: SpreadoMobXStore = {} as never;

jest.mock('../mobx');

mocked(SpreadoMobXStore).mockReturnValue(builtinStore);

const queryClient: QueryClient = {
  getQueryCache: () => queryCache,
  getQueryState: jest.fn(),
} as never;

const queryCache: QueryCache = {
  subscribe: jest.fn(),
  getAll: jest.fn(),
} as never;

describe('SpreadoSetupForMobXReactQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocked(queryClient.getQueryState).mockReturnValue(null as never);
  });

  describe('#constructor', () => {
    test('uses external store if store is given', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient, store});
      expect(setup).toHaveProperty('options.store', store);
    });

    test('uses builtin store if store not given', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      expect(setup).toHaveProperty('options.store', builtinStore);
    });
  });

  describe('#useSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.useSpreadOut(index, value));
      expect(useSpreadOut).toBeCalledWith(store, get(setup, 'useSpreadOutCounter'), index, value);
    });
  });

  describe('#useSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      const index = uniqueId();
      const fallback = uniqueId();
      renderHook(() => setup.useSpreadIn(index, fallback));
      expect(useSpreadIn).toBeCalledWith(store, index, fallback);
    });
  });

  describe('#setSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      const index = uniqueId();
      const value = uniqueId();
      setup.setSpreadOut(index, value);
      expect(setSpreadOut).toBeCalledWith(store, index, value);
    });
  });

  describe('#getSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      const index = uniqueId();
      const fallback = uniqueId();
      setup.getSpreadIn(index, fallback);
      expect(getSpreadIn).toBeCalledWith(store, index, fallback);
    });
  });

  describe('auto spread', () => {
    test('subscribes query cache changes on construction if enabled', () => {
      new SpreadoSetupForMobXReactQuery({
        store,
        queryClient,
        enableAutoSpread: true,
      });
      expect(queryCache.subscribe).toBeCalledWith(expect.any(Function));
    });

    test('bulk updates state on query cache change', () => {
      const store: SpreadoMobXStore = {
        bulkSetState: jest.fn(),
      } as never;
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

      new SpreadoSetupForMobXReactQuery({
        store,
        queryClient,
        enableAutoSpread: true,
      });
      const kvMap: SpreadoMobXState = {};
      for (const k in queryKeyStateMap) {
        kvMap[generateSpreadKey(k)] = queryKeyStateMap[k];
      }
      triggerQueryCacheChange();

      expect(store.bulkSetState).toBeCalledWith(kvMap);
    });
  });
});
