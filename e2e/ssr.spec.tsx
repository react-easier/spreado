import {configureStore} from '@reduxjs/toolkit';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import delay from 'delay';
import {random, uniqueId} from 'lodash';
import React, {FC} from 'react';
import ReactDOM from 'react-dom';
import {renderToString} from 'react-dom/server';
import {QueryClient, QueryClientProvider, useQuery} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import resolveCaller from 'resolve/lib/caller';
import useSWR, {SWRConfig} from 'swr';
import {
  createSpreadoReduxPreloadedState,
  renderQueryResult,
  SpreadoIndexValueMap,
  SpreadoMobXStore,
  spreadoReduxReducerPack,
  SpreadoSetupForMobXReactQuery,
  SpreadoSetupForMobXSwr,
  SpreadoSetupForReduxReactQuery,
  SpreadoSetupForReduxSwr,
  SpreadoSetupProvider,
  useSpreadIn,
  useSpreadOut,
} from '..';
import {renderSwrResponse} from '../src';

jest.mock('react', () => {
  const React = jest.requireActual('react');
  const {useEffect: _useEffect, useLayoutEffect: _useLayoutEffect} = React;
  return {
    ...React,
    useLayoutEffect: (...args: never[]) => {
      if (resolveCaller().includes('node_modules')) {
        return _useEffect(...args);
      } else {
        return _useLayoutEffect(...args);
      }
    },
  };
});

beforeEach(() => {
  document.body.innerHTML = '';
});

for (const [testName, createProvider] of Object.entries({
  'redux, react-query': (ivMap: SpreadoIndexValueMap) => {
    const store = createStore(
      combineReducers(spreadoReduxReducerPack),
      createSpreadoReduxPreloadedState(ivMap)
    );
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
  'redux-toolkit, react-query': (ivMap: SpreadoIndexValueMap) => {
    const store = configureStore({
      reducer: spreadoReduxReducerPack,
      middleware: (m) => m({serializableCheck: false}),
      preloadedState: createSpreadoReduxPreloadedState(ivMap),
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
  'redux, swr': (ivMap: SpreadoIndexValueMap) => {
    const store = createStore(
      combineReducers(spreadoReduxReducerPack),
      createSpreadoReduxPreloadedState(ivMap)
    );
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
  'redux-toolkit, swr': (ivMap: SpreadoIndexValueMap) => {
    const store = configureStore({
      reducer: spreadoReduxReducerPack,
      middleware: (m) => m({serializableCheck: false}),
      preloadedState: createSpreadoReduxPreloadedState(ivMap),
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
  'mobx, react-query': (ivMap: SpreadoIndexValueMap) => {
    const store = new SpreadoMobXStore(SpreadoMobXStore.createPreloadedState(ivMap));
    const queryClient = new QueryClient();
    const spreadoSetup = new SpreadoSetupForMobXReactQuery({store, queryClient});
    const Provider: FC = ({children}) => {
      return (
        <SWRConfig value={{provider: () => new Map()}}>
          <QueryClientProvider client={queryClient}>
            <SpreadoSetupProvider setup={spreadoSetup}>{children}</SpreadoSetupProvider>
          </QueryClientProvider>
        </SWRConfig>
      );
    };
    return Provider;
  },
  'mobx, swr': (ivMap: SpreadoIndexValueMap) => {
    const store = new SpreadoMobXStore(SpreadoMobXStore.createPreloadedState(ivMap));
    const spreadoSetup = new SpreadoSetupForMobXSwr({store});
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
  describe(`SSR for ${testName}`, () => {
    it('preloads a plain state', async () => {
      const somethingPreloaded = uniqueId();
      const somethingFromSomewhereElse = uniqueId();

      const INDEX_OF_SOMETHING = uniqueId();

      function useSomethingSpreadOut(v: string) {
        return useSpreadOut(INDEX_OF_SOMETHING, v);
      }

      function useSomethingSpreadIn() {
        return useSpreadIn<ReturnType<typeof useSomethingSpreadOut>>(INDEX_OF_SOMETHING, '');
      }

      const ComponentA: FC = () => {
        const something = useSomethingSpreadOut(somethingFromSomewhereElse);
        return <div data-tn="text-a">{something}</div>;
      };

      const ComponentB: FC = () => {
        const something = useSomethingSpreadIn();
        return <div data-tn="text-b">{something}</div>;
      };

      const ivMap: SpreadoIndexValueMap = {[INDEX_OF_SOMETHING]: somethingPreloaded};
      const App: FC = () => (
        <>
          <ComponentA />
          <ComponentB />
        </>
      );

      // simulates server side rendering
      const ServerSideProvider = createProvider(ivMap);
      const htmlStr = renderToString(
        <ServerSideProvider>
          <App />
        </ServerSideProvider>
      );

      // renders html as client side DOM
      const testDom = document.createElement('div');
      testDom.innerHTML = htmlStr;
      document.body.appendChild(testDom);

      expect(screen.queryByTestId('text-a')).toHaveTextContent(somethingPreloaded);
      expect(screen.queryByTestId('text-b')).toHaveTextContent(somethingPreloaded);

      // hydrates DOM as React nodes
      const ClientSideProvider = createProvider(ivMap);
      ReactDOM.hydrate(
        <ClientSideProvider>
          <App />
        </ClientSideProvider>,
        testDom
      );

      expect(screen.queryByTestId('text-a')).toHaveTextContent(somethingPreloaded);
      expect(screen.queryByTestId('text-b')).toHaveTextContent(somethingPreloaded);

      await waitFor(() =>
        expect(screen.queryByTestId('text-a')).toHaveTextContent(somethingFromSomewhereElse)
      );
      await waitFor(() =>
        expect(screen.queryByTestId('text-b')).toHaveTextContent(somethingFromSomewhereElse)
      );

      // disposes everything tested
      ReactDOM.unmountComponentAtNode(testDom);
    });

    it('preloads a result of data fetching', async () => {
      // Helpers

      const temporaryStorage: {
        currResultData: string;
        prevResultData: string;
      } = {
        currResultData: '',
        prevResultData: '',
      };

      function shuffleResultData() {
        temporaryStorage.prevResultData = temporaryStorage.currResultData;
        temporaryStorage.currResultData = uniqueId();
      }

      async function fetchSomeData() {
        await delay(random(500, 800));
        return temporaryStorage.currResultData;
      }

      // Testers

      const INDEX_OF_SOME_DATA_QUERY = uniqueId();

      function useSomeDataQuerySpreadOut() {
        return useSpreadOut(
          'RR_' + INDEX_OF_SOME_DATA_QUERY,
          useQuery([INDEX_OF_SOME_DATA_QUERY], () => fetchSomeData())
        );
      }

      function useSomeDataQuerySpreadIn() {
        return useSpreadIn<ReturnType<typeof useSomeDataQuerySpreadOut>>(
          'RR_' + INDEX_OF_SOME_DATA_QUERY,
          {}
        );
      }

      function useSomeDataFetchSpreadOut() {
        return useSpreadOut(
          'S_' + INDEX_OF_SOME_DATA_QUERY,
          useSWR([INDEX_OF_SOME_DATA_QUERY], () => fetchSomeData())
        );
      }

      function useSomeDataFetchSpreadIn() {
        return useSpreadIn<ReturnType<typeof useSomeDataFetchSpreadOut>>(
          'S_' + INDEX_OF_SOME_DATA_QUERY,
          {}
        );
      }

      const RR_ComponentA: FC = () => {
        const {isLoading, isSuccess, data, refetch} = useSomeDataQuerySpreadOut();
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
        const {data, mutate} = useSomeDataFetchSpreadOut();
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

      shuffleResultData();
      const ivMap: SpreadoIndexValueMap = {
        ['RR_' + INDEX_OF_SOME_DATA_QUERY]: renderQueryResult(temporaryStorage.currResultData),
        ['S_' + INDEX_OF_SOME_DATA_QUERY]: renderSwrResponse(temporaryStorage.currResultData),
      };
      const App: FC = () => (
        <div>
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
        </div>
      );

      // simulates server side rendering
      const ServerSideProvider = createProvider(ivMap);
      const htmlStr = renderToString(
        <ServerSideProvider>
          <App />
        </ServerSideProvider>
      );

      // renders html as client side DOM
      const testDom = document.createElement('div');
      testDom.innerHTML = htmlStr;
      document.body.appendChild(testDom);

      expect(screen.queryByTestId('result-a')).toHaveTextContent(temporaryStorage.currResultData);
      expect(screen.queryByTestId('result-b')).toHaveTextContent(temporaryStorage.currResultData);

      // hydrates DOM as React nodes
      const ClientSideProvider = createProvider(ivMap);
      shuffleResultData();
      ReactDOM.hydrate(
        <ClientSideProvider>
          <App />
        </ClientSideProvider>,
        testDom
      );

      // renders preloaded data on page render
      expect(screen.queryByTestId('loader-a')).not.toBeInTheDocument();
      expect(screen.queryByTestId('result-a')).toHaveTextContent(temporaryStorage.prevResultData);
      expect(screen.queryByTestId('loader-b')).not.toBeInTheDocument();
      expect(screen.queryByTestId('result-b')).toHaveTextContent(temporaryStorage.prevResultData);

      // renders loadings on initial fetching
      await waitFor(() => expect(screen.queryByTestId('loader-a')).toBeInTheDocument());
      expect(screen.queryByTestId('result-a')).not.toBeInTheDocument();
      await waitFor(() => expect(screen.queryByTestId('loader-b')).toBeInTheDocument());
      expect(screen.queryByTestId('result-b')).not.toBeInTheDocument();

      // renders new data on fetched
      await waitFor(() => expect(screen.queryByTestId('loader-a')).not.toBeInTheDocument());
      expect(screen.queryByTestId('result-a')).toHaveTextContent(temporaryStorage.currResultData);
      await waitFor(() => expect(screen.queryByTestId('loader-b')).not.toBeInTheDocument());
      expect(screen.queryByTestId('result-b')).toHaveTextContent(temporaryStorage.currResultData);

      // triggers a refetch
      shuffleResultData();
      await userEvent.click(screen.getByTestId('refresh'));

      // renders new data on refetched
      await waitFor(() =>
        expect(screen.queryByTestId('result-a')).not.toHaveTextContent(
          temporaryStorage.prevResultData
        )
      );
      expect(screen.queryByTestId('result-a')).toHaveTextContent(temporaryStorage.currResultData);
      await waitFor(() =>
        expect(screen.queryByTestId('result-b')).not.toHaveTextContent(
          temporaryStorage.prevResultData
        )
      );
      expect(screen.queryByTestId('result-b')).toHaveTextContent(temporaryStorage.currResultData);

      // disposes everything tested
      ReactDOM.unmountComponentAtNode(testDom);
    });
  });
}
