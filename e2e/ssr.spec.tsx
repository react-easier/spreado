import {configureStore} from '@reduxjs/toolkit';
import {waitFor} from '@testing-library/react';
import {uniqueId} from 'lodash';
import React, {FC} from 'react';
import ReactDOM from 'react-dom';
import {renderToString} from 'react-dom/server';
import {QueryClient, QueryClientProvider} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import resolveCaller from 'resolve/lib/caller';
import {SWRConfig} from 'swr';
import {
  createSpreadoReduxPreloadedState,
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

      // simulates server side rendering
      const ServerSideProvider = createProvider(ivMap);
      const htmlStr = renderToString(
        <ServerSideProvider>
          <ComponentA />
          <ComponentB />
        </ServerSideProvider>
      );

      // renders html as client side DOM
      const testDom = document.createElement('div');
      testDom.innerHTML = htmlStr;
      document.body.appendChild(testDom);

      expect(testDom.querySelector('[data-tn="text-a"]')).toHaveTextContent(somethingPreloaded);
      expect(testDom.querySelector('[data-tn="text-b"]')).toHaveTextContent(somethingPreloaded);

      // hydrates DOM as React nodes
      const ClientSideProvider = createProvider(ivMap);
      ReactDOM.hydrate(
        <ClientSideProvider>
          <ComponentA />
          <ComponentB />
        </ClientSideProvider>,
        testDom
      );

      expect(testDom.querySelector('[data-tn="text-a"]')).toHaveTextContent(somethingPreloaded);
      expect(testDom.querySelector('[data-tn="text-b"]')).toHaveTextContent(somethingPreloaded);

      await waitFor(() =>
        expect(testDom.querySelector('[data-tn="text-a"]')).toHaveTextContent(
          somethingFromSomewhereElse
        )
      );
      await waitFor(() =>
        expect(testDom.querySelector('[data-tn="text-b"]')).toHaveTextContent(
          somethingFromSomewhereElse
        )
      );

      // disposes everything tested
      ReactDOM.unmountComponentAtNode(testDom);
    });
  });
}
