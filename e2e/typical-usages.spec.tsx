import {configureStore} from '@reduxjs/toolkit';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import delay from 'delay';
import {random, times, uniqueId} from 'lodash';
import React, {FC} from 'react';
import {QueryClient, QueryClientProvider, useQuery} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import useSWR, {SWRConfig} from 'swr';

import {
  setSpreadOut,
  spreadoReduxReducerPack,
  SpreadoSetupForMobXReactQuery,
  SpreadoSetupForMobXSwr,
  SpreadoSetupForReduxReactQuery,
  SpreadoSetupForReduxSwr,
  SpreadoSetupProvider,
  useSpreadIn,
  useSpreadOut,
} from '..';

for (const [testName, createProvider] of Object.entries({
  'redux, react-query': () => {
    const store = createStore(combineReducers(spreadoReduxReducerPack));
    const queryClient = new QueryClient();
    const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});
    const Provider: FC = ({children}) => {
      return (
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <SpreadoSetupProvider setup={spreadoSetup}>{children}</SpreadoSetupProvider>
          </QueryClientProvider>
        </ReduxProvider>
      );
    };
    return Provider;
  },
  'redux-toolkit, react-query': () => {
    const store = configureStore({
      reducer: spreadoReduxReducerPack,
      middleware: (m) => m({serializableCheck: false}),
    });
    const queryClient = new QueryClient();
    const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});
    const Provider: FC = ({children}) => {
      return (
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <SpreadoSetupProvider setup={spreadoSetup}>{children}</SpreadoSetupProvider>
          </QueryClientProvider>
        </ReduxProvider>
      );
    };
    return Provider;
  },
  'redux, swr': () => {
    const store = createStore(combineReducers(spreadoReduxReducerPack));
    const spreadoSetup = new SpreadoSetupForReduxSwr({store});
    const Provider: FC = ({children}) => {
      return (
        <ReduxProvider store={store}>
          <SWRConfig value={{provider: () => new Map()}}>
            <SpreadoSetupProvider setup={spreadoSetup}>{children}</SpreadoSetupProvider>
          </SWRConfig>
        </ReduxProvider>
      );
    };
    return Provider;
  },
  'redux-toolkit, swr': () => {
    const store = configureStore({
      reducer: spreadoReduxReducerPack,
      middleware: (m) => m({serializableCheck: false}),
    });
    const spreadoSetup = new SpreadoSetupForReduxSwr({store});
    const Provider: FC = ({children}) => {
      return (
        <ReduxProvider store={store}>
          <SWRConfig value={{provider: () => new Map()}}>
            <SpreadoSetupProvider setup={spreadoSetup}>{children}</SpreadoSetupProvider>
          </SWRConfig>
        </ReduxProvider>
      );
    };
    return Provider;
  },
  'mobx, react-query': () => {
    const queryClient = new QueryClient();
    const spreadoSetup = new SpreadoSetupForMobXReactQuery({queryClient});
    const Provider: FC = ({children}) => {
      return (
        <QueryClientProvider client={queryClient}>
          <SpreadoSetupProvider setup={spreadoSetup}>{children}</SpreadoSetupProvider>
        </QueryClientProvider>
      );
    };
    return Provider;
  },
  'mobx, swr': () => {
    const spreadoSetup = new SpreadoSetupForMobXSwr();
    const Provider: FC = ({children}) => {
      return (
        <SWRConfig value={{provider: () => new Map()}}>
          <SpreadoSetupProvider setup={spreadoSetup}>{children}</SpreadoSetupProvider>
        </SWRConfig>
      );
    };
    return Provider;
  },
})) {
  describe(`Typical usages for ${testName}`, () => {
    it('spreads a plain state', async () => {
      const INDEX_OF_IS_SOMETHING_VISIBLE = uniqueId();

      function useIsSomethingVisible() {
        return useSpreadIn<boolean>(INDEX_OF_IS_SOMETHING_VISIBLE, false);
      }

      function setIsSomethingVisible(v: boolean) {
        return setSpreadOut(INDEX_OF_IS_SOMETHING_VISIBLE, v);
      }

      const ComponentA: FC = () => {
        const isSomethingVisible = useIsSomethingVisible();
        return (
          <div>
            {isSomethingVisible && <div>Part A related to something</div>}
            <button onClick={() => setIsSomethingVisible(true)}>Show</button>
            <button onClick={() => setIsSomethingVisible(false)}>Hide</button>
            <div>Everything else in component A</div>
          </div>
        );
      };

      const ComponentB: FC = () => {
        const isSomethingVisible = useIsSomethingVisible();
        return (
          <div>
            {isSomethingVisible && <div>Part B related to something</div>}
            <div>Everything else in component B</div>
          </div>
        );
      };

      const Provider = createProvider();
      const {unmount} = render(
        <Provider>
          <ComponentA />
          <ComponentB />
        </Provider>
      );

      expect(screen.queryByText('Part A related to something')).not.toBeInTheDocument();
      expect(screen.queryByText('Part B related to something')).not.toBeInTheDocument();

      await userEvent.click(screen.getByText('Show'));
      expect(screen.queryByText('Part A related to something')).toBeInTheDocument();
      expect(screen.queryByText('Part B related to something')).toBeInTheDocument();

      await userEvent.click(screen.getByText('Hide'));
      expect(screen.queryByText('Part A related to something')).not.toBeInTheDocument();
      expect(screen.queryByText('Part B related to something')).not.toBeInTheDocument();

      unmount();
    });

    it('spreads a result of data fetching', async () => {
      // Helpers

      const temporaryStorage: {
        currFetchedData: string;
        prevFetchedData: string;
        params: string[];
      } = {
        currFetchedData: '',
        prevFetchedData: '',
        params: times(3).map(() => uniqueId()),
      };

      function shuffleFetchedData() {
        temporaryStorage.prevFetchedData = temporaryStorage.currFetchedData;
        temporaryStorage.currFetchedData = '' + Math.random();
      }

      function generateResultData(params: string[], fetchedData: string) {
        return `${params.join(',')}:${fetchedData}`;
      }

      function prepareParams() {
        return temporaryStorage.params;
      }

      async function fetchSomeDataWithParams(params: string[]): Promise<string> {
        await delay(random(500, 800));
        return generateResultData(params, temporaryStorage.currFetchedData);
      }

      // Testers

      const INDEX_OF_SOME_DATA_QUERY = uniqueId();

      function useSomeDataQuerySpreadOut(params: string[]) {
        return useSpreadOut(
          'RR_' + INDEX_OF_SOME_DATA_QUERY,
          useQuery([INDEX_OF_SOME_DATA_QUERY, params], () => fetchSomeDataWithParams(params))
        );
      }

      function useSomeDataQuerySpreadIn() {
        return useSpreadIn<ReturnType<typeof useSomeDataQuerySpreadOut>>(
          'RR_' + INDEX_OF_SOME_DATA_QUERY,
          {}
        );
      }

      function useSomeDataFetchSpreadOut(params: string[]) {
        return useSpreadOut(
          'S_' + INDEX_OF_SOME_DATA_QUERY,
          useSWR([INDEX_OF_SOME_DATA_QUERY, params], () => fetchSomeDataWithParams(params))
        );
      }

      function useSomeDataFetchSpreadIn() {
        return useSpreadIn<ReturnType<typeof useSomeDataFetchSpreadOut>>(
          'S_' + INDEX_OF_SOME_DATA_QUERY,
          {}
        );
      }

      const RR_ComponentA: FC = () => {
        const {isLoading, isSuccess, data, refetch} = useSomeDataQuerySpreadOut(prepareParams());
        return (
          <div>
            {isLoading && <div data-tn="loader-a">Loading A</div>}
            {isSuccess && <div data-tn="result-a">{data}</div>}
            <button data-tn="refresh" onClick={() => refetch()} />
          </div>
        );
      };

      const RR_ComponentB: FC = () => {
        const {isLoading, isSuccess, data} = useSomeDataQuerySpreadIn();
        return (
          <div>
            {isLoading && <div data-tn="loader-b">Loading B</div>}
            {isSuccess && <div data-tn="result-b">{data}</div>}
          </div>
        );
      };

      const S_ComponentA = () => {
        const {data, mutate} = useSomeDataFetchSpreadOut(prepareParams());
        const isLoading = !data;
        return (
          <div>
            {isLoading && <div data-tn="loader-a">Loading A</div>}
            {data && <div data-tn="result-a">{data}</div>}
            <button data-tn="refresh" onClick={() => mutate()} />
          </div>
        );
      };

      const S_ComponentB: FC = () => {
        const {data} = useSomeDataFetchSpreadIn();
        const isLoading = !data;
        return (
          <div>
            {isLoading && <div data-tn="loader-b">Loading B</div>}
            {data && <div data-tn="result-b">{data}</div>}
          </div>
        );
      };

      const Provider = createProvider();
      shuffleFetchedData();
      const {unmount} = render(
        <Provider>
          {testName.includes('react-query') && (
            <>
              <RR_ComponentA />
              <RR_ComponentB />
            </>
          )}
          {testName.includes('swr') && (
            <>
              <S_ComponentA />
              <S_ComponentB />
            </>
          )}
        </Provider>
      );

      // renders loadings on initial fetching
      await waitFor(() => expect(screen.queryByTestId('loader-a')).toBeInTheDocument());
      expect(screen.queryByTestId('result-a')).not.toBeInTheDocument();
      await waitFor(() => expect(screen.queryByTestId('loader-b')).toBeInTheDocument());
      expect(screen.queryByTestId('result-b')).not.toBeInTheDocument();

      // renders data on fetched
      await waitFor(() => expect(screen.queryByTestId('loader-a')).not.toBeInTheDocument());
      expect(screen.queryByTestId('result-a')).toHaveTextContent(
        generateResultData(temporaryStorage.params, temporaryStorage.currFetchedData)
      );
      await waitFor(() => expect(screen.queryByTestId('loader-a')).not.toBeInTheDocument());
      expect(screen.queryByTestId('result-b')).toHaveTextContent(
        generateResultData(temporaryStorage.params, temporaryStorage.currFetchedData)
      );

      // triggers a refetch
      shuffleFetchedData();
      await userEvent.click(screen.getByTestId('refresh'));

      // renders new data on refetched
      await waitFor(() =>
        expect(screen.queryByTestId('result-a')).not.toHaveTextContent(
          generateResultData(temporaryStorage.params, temporaryStorage.prevFetchedData)
        )
      );
      expect(screen.queryByTestId('result-a')).toHaveTextContent(
        generateResultData(temporaryStorage.params, temporaryStorage.currFetchedData)
      );
      await waitFor(() =>
        expect(screen.queryByTestId('result-b')).not.toHaveTextContent(
          generateResultData(temporaryStorage.params, temporaryStorage.prevFetchedData)
        )
      );
      expect(screen.queryByTestId('result-b')).toHaveTextContent(
        generateResultData(temporaryStorage.params, temporaryStorage.currFetchedData)
      );

      // disposes everything tested
      unmount();
    });
  });
}
