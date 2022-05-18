import {waitFor} from '@testing-library/react';
import {act, renderHook} from '@testing-library/react-hooks';
import {uniqueId} from 'lodash';
import React from 'react';
import {QueryClient, QueryClientProvider, useQuery} from 'react-query';
import {SpreadoMobXStore} from '../mobx';
import {SpreadoSetupForMobXReactQuery} from './SpreadoSetupImpl';

const builtinStore: SpreadoMobXStore = new SpreadoMobXStore();
const queryClient: QueryClient = new QueryClient();

describe('SpreadoSetupForMobXReactQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('#constructor', () => {
    it('uses external store if store is given', () => {
      const store = {test: 'test'} as never;
      const setup = new SpreadoSetupForMobXReactQuery({queryClient, store});
      expect(setup).toHaveProperty('options.store', store);
    });

    it('uses builtin store if store not given', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      expect(setup).toHaveProperty('options.store', builtinStore);
    });

    it('auto subscribe should work', async () => {
      const index = uniqueId();
      const value = uniqueId();
      const store = new SpreadoMobXStore();
      const setup = new SpreadoSetupForMobXReactQuery({
        enableAutoSpread: true,
        queryClient,
        store,
      });

      const wrapper = ({children}: {children: React.ReactNode}) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      renderHook(() => useQuery(index, () => value), {wrapper});
      const {result} = renderHook(() => setup.useSpreadIn<any>(index).data, {wrapper});
      await act(() => waitFor(() => expect(result.current).toEqual(value)));
      expect(setup.getSpreadIn<any>(index).data).toEqual(value);
    });
  });

  describe('#useSpreadOut', () => {
    test('works', async () => {
      const index = uniqueId();
      const value = uniqueId();
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      renderHook(() => setup.useSpreadOut(index, value));
      waitFor(() => expect(setup.getSpreadIn<any>(index).data).toEqual(value));
    });
  });

  describe('#useSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      const index = uniqueId();
      const fallback = uniqueId();
      renderHook(() => setup.useSpreadIn(index, fallback));
      waitFor(() => expect(setup.getSpreadIn<any>(index).data).toEqual(fallback));
    });
  });

  describe('#setSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      const index = uniqueId();
      const value = uniqueId();
      setup.setSpreadOut(index, value);
      waitFor(() => expect(setup.getSpreadIn<any>(index).data).toEqual(value));
    });
  });

  describe('#getSpreadIn', () => {
    test('works', () => {
      const index = uniqueId();
      const value = uniqueId();
      const setup = new SpreadoSetupForMobXReactQuery({queryClient});
      setup.getSpreadIn(index, value);
      waitFor(() => expect(setup.useSpreadIn<any>(index)).toEqual(value));
    });
  });
});
