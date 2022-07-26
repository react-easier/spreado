# Spreado

[![](https://img.shields.io/codecov/c/github/react-easier/spreado/main)](https://app.codecov.io/gh/react-easier/spreado)
[![](https://img.shields.io/npm/dm/spreado)](https://www.npmjs.com/package/spreado)
[![](https://img.shields.io/github/license/react-easier/spreado)](https://github.com/react-easier/spreado/blob/main/LICENSE)
[![](https://img.shields.io/badge/semantic--release-conventional-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

> Easier to spread things across components in a React app

## Why

In a modern React app, it's pretty common to utilize a state managing lib like [Redux](https://github.com/reduxjs/redux) and a data fetching lib like [React Query](https://github.com/tannerlinsley/react-query), but it still takes quite a little work to setup a cross-component shared state or to share a result of data fetching across components.

This module helps ease sharing (or spreading) things across components in a React app that has utilized a state managing lib and a data fetching lib. It's a group of intuitive encapsulations on existing libs regarding them as peer dependencies, but not another new wheel for a same set of problems. With this idea, making most of plugins or middlewares of the peer dependencies is kept possible. Further more, handling very special cases that are beyond the focus of this module directly with the peer dependencies is kept possible, too.

## Install

```sh
npm install spreado
```

## Usage

### Spread a plain state

Assuming 2 components (`ComponentA` and `ComponentB`) are sharing a boolean state which controls their certain parts and gets updated in one of them:

```tsx
import {setSpreadOut, useSpreadIn} from 'spreado';

const INDEX_OF_IS_SOMETHING_VISIBLE = 'INDEX_OF_IS_SOMETHING_VISIBLE';

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
```

The plain state `isSomethingVisible` is managed by a pair of functions `useIsSomethingVisible` and `setIsSomethingVisible` which read and write its value. The default value is specified by the second param of `useSpreadIn`. The benifit is, it's straightforward and avoids boilerplate.

### Spread a result of data fetching

Supposing 2 components (`ComponentA` and `ComponentB`) are sharing a result of data fetching which determines their presentational behaviors and gets refetched in one of them:

```tsx
import {
  useQuery, // or useSWR from `swr`
} from 'react-query';
import {useSpreadIn, useSpreadOut} from 'spreado';

const INDEX_OF_SOME_DATA_QUERY = 'INDEX_OF_SOME_DATA_QUERY';

function useSomeDataQuerySpreadOut(params: ParamsForSomeDataQuery) {
  return useSpreadOut(
    INDEX_OF_SOME_DATA_QUERY,
    useQuery([INDEX_OF_SOME_DATA_QUERY, params], () => fetch_some_data_with_params(params))
  );
}

function useSomeDataQuerySpreadIn() {
  return useSpreadIn<ReturnType<typeof useSomeDataQuerySpreadOut>>(INDEX_OF_SOME_DATA_QUERY, {});
}

const ComponentA: FC = () => {
  const params = prepare_params_for_fetching_some_data();
  const {isLoading, isSuccess, data, refetch} = useSomeDataQuerySpreadOut(params);
  return (
    <div>
      {isLoading && <Loading />}
      {isSuccess && <ResultA data={data} />}
      <button onClick={() => refetch()}>Refresh data</button>
    </div>
  );
};

const ComponentB: FC = () => {
  const {isLoading, isSuccess, data} = useSomeDataQuerySpreadIn();
  return (
    <div>
      {isLoading && <Loading />}
      {isSuccess && <ResultB data={data} />}
    </div>
  );
};
```

The snake-case named functions are placeholders. The result of data fetching gets shared by `useSomeDataQuerySpreadOut` and gets re-visited by `useSomeDataQuerySpreadIn`. The fallback value of the shared result is specified by the second param of `useSpreadIn` in case that there is not yet any result fetched. Notice that both returns contain the binded helpers for the fetched data, which can help operate the fetched data like refetching later as needed. In terms of state managing, the benifit is, again, it's straightforward and avoids boilerplate. In terms of data fetching, the benifit is, it avoids quite amount of work on preparing a same set of fetching params in different components, especially when the params are coupled more or less with presentational logics in any of the components.

### Initialization

Spreado assumes a pair of a state managing lib and a data fetching lib has been adopted by your modern React app. It aims to integrate with them well but won't re-invent wheels itself. Most well-known libs of the categories (e.g. [Redux](https://github.com/reduxjs/redux), [MobX](https://github.com/mobxjs/mobx), [React Query](https://github.com/tannerlinsley/react-query), [SWR](https://github.com/vercel/swr)) have been supported by spreado. You may pick up your preferred pair, then setup spreado as follows:

#### With Redux and React Query

```tsx
// Requires peer dependencies installed: `react`, `redux`, `react-redux`, `react-query`.
import React, {FC} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import {SpreadoSetupProvider} from 'spreado';
import {
  spreadoReduxReducerPack,
  SpreadoSetupForReduxReactQuery,
} from 'spreado/for-redux-react-query';

const store = createStore(combineReducers(spreadoReduxReducerPack));
const queryClient = new QueryClient();
const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});

const App: FC = () => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SpreadoSetupProvider setup={spreadoSetup}>
          <div>...</div>
        </SpreadoSetupProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};
```

#### With Redux Toolkit and React Query

```tsx
// Requires peer dependencies installed: `react`, `@reduxjs/toolkit`, `react-redux`, `react-query`.
import {configureStore} from '@reduxjs/toolkit';
import React, {FC} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {SpreadoSetupProvider} from 'spreado';
import {
  spreadoReduxReducerPack,
  SpreadoSetupForReduxReactQuery,
} from 'spreado/for-redux-react-query';

const store = configureStore({
  reducer: spreadoReduxReducerPack,
  middleware: (m) => m({serializableCheck: false}),
});
const queryClient = new QueryClient();
const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});

const App: FC = () => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SpreadoSetupProvider setup={spreadoSetup}>
          <div>...</div>
        </SpreadoSetupProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};
```

#### With Redux and SWR

```tsx
// Requires peer dependencies installed: `react`, `redux`, `react-redux`, `swr`.
import React, {FC} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import {SpreadoSetupProvider} from 'spreado';
import {spreadoReduxReducerPack, SpreadoSetupForReduxSwr} from 'spreado/for-redux-swr';

const store = createStore(combineReducers(spreadoReduxReducerPack));
const spreadoSetup = new SpreadoSetupForReduxSwr({store});

const App: FC = () => {
  return (
    <ReduxProvider store={store}>
      <SpreadoSetupProvider setup={spreadoSetup}>
        <div>...</div>
      </SpreadoSetupProvider>
    </ReduxProvider>
  );
};
```

#### With Redux Toolkit and SWR

```tsx
// Requires peer dependencies installed: `react`, `@reduxjs/toolkit`, `react-redux`, `swr`.
import {configureStore} from '@reduxjs/toolkit';
import React, {FC} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {SpreadoSetupProvider} from 'spreado';
import {spreadoReduxReducerPack, SpreadoSetupForReduxSwr} from 'spreado/for-redux-swr';

const store = configureStore({
  reducer: spreadoReduxReducerPack,
  middleware: (m) => m({serializableCheck: false}),
});
const spreadoSetup = new SpreadoSetupForReduxSwr({store});

const App: FC = () => {
  return (
    <ReduxProvider store={store}>
      <SpreadoSetupProvider setup={spreadoSetup}>
        <div>...</div>
      </SpreadoSetupProvider>
    </ReduxProvider>
  );
};
```

#### With MobX and React Query

```tsx
// Requires peer dependencies installed: `react`, `mobx`, `react-query`.
import React, {FC} from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {SpreadoSetupProvider} from 'spreado';
import {SpreadoSetupForMobXReactQuery} from 'spreado/for-mobx-react-query';

const queryClient = new QueryClient();
const spreadoSetup = new SpreadoSetupForMobXReactQuery({queryClient});

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SpreadoSetupProvider setup={spreadoSetup}>
        <div>...</div>
      </SpreadoSetupProvider>
    </QueryClientProvider>
  );
};
```

#### With MobX and SWR

```tsx
// Requires peer dependencies installed: `react`, `mobx`, `swr`.
import React, {FC} from 'react';
import {SpreadoSetupProvider} from 'spreado';
import {SpreadoSetupForMobXSwr} from 'spreado/for-mobx-swr';
import {SWRConfig} from 'swr';

const spreadoSetup = new SpreadoSetupForMobXSwr();

const App: FC = () => {
  return (
    <SpreadoSetupProvider setup={spreadoSetup}>
      <div>...</div>
    </SpreadoSetupProvider>
  );
};
```

Notice that constructors `SpreadoSetupForMobX...` optionally accept a param `store` that can get instantiated by `new SpreadoMobXStore()`. If the `store` is give, constructors `SpreadoSetupForMobX...` will use it. Otherwise, they will create one internally.

### Sever side rendering (SSR)

SSR process of a modern React app works like this in general:

1. When a http request for a html page hits the server side, the server side prepares data according to the http request, then the data are used to produce the initial global state of the root client side React component to render the html page. Meanwhile, the initial global state is serialized together with the html page.
2. When a requested html page arrives in the client side, if the client side is a regular browser, the client side deserializes the initial global state and uses it together with the root client side React component to hydrate to initialize the React app. If the client side is a web crawler with JavaScript disabled, the html content remains available at least.

Spreado follows that pattern. In the server side, spreado provides helpers for producing the initial global state. Let's take an example by continuing the usage section _Spread a result of data fetching_ and the spreado setup for `redux` and `react-query`:

```tsx
import {INDEX_OF_SOME_DATA_QUERY} from '@/client';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {QueryClient, QueryClientProvider} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import {SpreadoSetupProvider} from 'spreado';
import {
  createSpreadoReduxPreloadedState,
  renderQueryResult,
  spreadoReduxReducerPack,
  SpreadoSetupForReduxReactQuery,
} from 'spreado/for-redux-react-query';

app.get('/some-page', (req, res) => {
  const someData = prepare_some_data_according_to_the_http_request(req);

  const initialGlobalState = createSpreadoReduxPreloadedState({
    [INDEX_OF_SOME_DATA_QUERY]: renderQueryResult(someData),
  });

  const store = createStore(combineReducers(spreadoReduxReducerPack), initialGlobalState);
  const queryClient = new QueryClient();
  const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});

  const htmlContent = renderToString(
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SpreadoSetupProvider setup={spreadoSetup}>
          <div>...</div>
        </SpreadoSetupProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );

  res.send(
    `...
<script>window.INITIAL_GLOBAL_STATE='${JSON.stringify(initialGlobalState)}';</script>
<div id="app">${htmlContent}</div>
    ...`
  );
});
```

The `app.get` is the pseudo code for handling http requests for html pages in the server side, the snake-case named functions are placeholders, and the `...` in `res.send` is the rest required html snippets for a working html page. Then, in the client side, we deserialize the initial global state and hydrate:

```tsx
import React, {FC} from 'react';
import {hydrate} from 'react-dom';
import {QueryClient, QueryClientProvider} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import {SpreadoSetupProvider} from 'spreado';
import {spreadoReduxReducerPack, SpreadoSetupForReduxReactQuery} from 'spreado/redux-react-query';

const store = createStore(
  combineReducers(spreadoReduxReducerPack),
  JSON.parse(window.INITIAL_GLOBAL_STATE)
);
const queryClient = new QueryClient();
const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});

const App: FC = () => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SpreadoSetupProvider setup={spreadoSetup}>
          <div>...</div>
        </SpreadoSetupProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

hydrate(<App>, document.getElementById('app'));
```

After that, we set the initial data for all the `useQuery` calls of `react-query` so to have correct statuses of data fetching in the client side:

```diff
import {useSpreadIn, useSpreadOut} from 'spreado';
+import {useQueryInitialData} from 'spreado/for-redux-react-query';

const INDEX_OF_SOME_DATA_QUERY = 'INDEX_OF_SOME_DATA_QUERY';

function useSomeDataQuerySpreadOut(params: ParamsForSomeDataQuery) {
  return useSpreadOut(
    INDEX_OF_SOME_DATA_QUERY,
-    useQuery([INDEX_OF_SOME_DATA_QUERY, params], () => fetch_some_data_with_params(params))
+    useQuery([INDEX_OF_SOME_DATA_QUERY, params], () => fetch_some_data_with_params(params), {
+      initialData: useQueryInitialData(INDEX_OF_SOME_DATA_QUERY)
+    })
  );
}
```

If the client side is a regualr browser, the page will have a same look as its server side rendered html content at its initial rendering, then it will refetch the latest data immediately afterwards without entering loading states. If the client side is a web crawler with JavaScript disabled, the page just remains its server side rendered html content.

In case of using `swr`, similarly, you can prepare the `store` by `SpreadoMobXStore`, `createSpreadoMobXPreloadedState`, `renderSwrResponse` and set the fallback data for all the `useSWR` calls by `useSwrFallbackData`.

For more details on available SSR helpers, see also:

- [src/react-query/ssrHelpers](https://github.com/react-easier/spreado/blob/main/src/react-query/ssrHelpers.ts)
- [src/swr/ssrHelpers](https://github.com/react-easier/spreado/blob/main/src/swr/ssrHelpers.ts)
- [src/redux/ssrHelpers](https://github.com/react-easier/spreado/blob/main/src/redux/ssrHelpers.ts)
- [src/mobx/ssrHelpers](https://github.com/react-easier/spreado/blob/main/src/mobx/ssrHelpers.ts)

## API

Here are full descriptions for core APIs of spreado. Please have a look as needed:

### useSpreadOut

```ts
useSpreadOut<T>(index: unknown, value: T): T;
```

The `useSpreadOut` is a React hook that spreads the input value by the index. It uses the integrated state managing lib to get the input value stored by the index and returns the newer version of the input value and the stored value. When the input value changes, the returned value and the stored value will change in a consistent and timely manner. When all `useSpreadOut` calls on the same index get unmounted, the stored value will be cleared alongside.

### useSpreadIn

```ts
useSpreadIn<T>(index: unknown): T | undefined;
useSpreadIn<T>(index: unknown, fallback: Partial<T>): T | Partial<T>;
useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined;
```

The `useSpreadIn` is a React hook that reads the spread value by the index. It uses the integrated state managing lib to retrieve the stored value by the index. The stored value is returned if it's retrieved. Otherwise, `undefined` is returned. When the second param is given, this param will be returned as a fallback for the `undefined` case. When the stored value changes, the returned value will change timely.

### setSpreadOut

```ts
setSpreadOut<T>(index: unknown, value: T): T;
setSpreadOut<T>(index: unknown, callback: (value?: T) => T): T;
```

The `setSpreadOut` is a non-hook version of `useSpreadOut` that spreads the input value by the index. The only difference is, when the second param is a function, this param is used as a callback to accept the stored value from the integrated state managing lib and produce a new value to spread.

### getSpreadIn

```ts
getSpreadIn<T>(index: unknown): T | undefined;
getSpreadIn<T>(index: unknown, fallback: Partial<T>): T | Partial<T>;
getSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined;
```

The `getSpreadIn` is a non-hook version of `useSpreadIn` that reads the spread value by the index. No more difference.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/licg9999"><img src="https://avatars.githubusercontent.com/u/8203034?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Chungen Li</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=licg9999" title="Code">💻</a> <a href="https://github.com/react-easier/spreado/commits?author=licg9999" title="Documentation">📖</a> <a href="#maintenance-licg9999" title="Maintenance">🚧</a> <a href="https://github.com/react-easier/spreado/pulls?q=is%3Apr+reviewed-by%3Alicg9999" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/linyongping"><img src="https://avatars.githubusercontent.com/u/13087561?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yongping Lin</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=linyongping" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ishanyang"><img src="https://avatars.githubusercontent.com/u/31538059?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Donghua Zhang</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=ishanyang" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/humordancer"><img src="https://avatars.githubusercontent.com/u/34059032?v=4?s=100" width="100px;" alt=""/><br /><sub><b>WeiQi Huang</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=humordancer" title="Code">💻</a></td>
    <td align="center"><a href="https://www.jianshu.com/u/befa68b81f92"><img src="https://avatars.githubusercontent.com/u/18299850?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Le Gao</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=preservance717" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/supfree"><img src="https://avatars.githubusercontent.com/u/18379566?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jian Liu</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=supfree" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jokyme"><img src="https://avatars.githubusercontent.com/u/8001736?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jian Zhu</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=jokyme" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://sswang.zone/"><img src="https://avatars.githubusercontent.com/u/66862408?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Songsong Wang</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=sswang1991220" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/struggle-lulu"><img src="https://avatars.githubusercontent.com/u/16461065?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lu Lu</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=struggle-lulu" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Evan-Leee"><img src="https://avatars.githubusercontent.com/u/13001056?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yu Li</b></sub></a><br /><a href="https://github.com/react-easier/spreado/commits?author=Evan-Leee" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
