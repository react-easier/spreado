# Spreado

> Easier to spread things across components in a React app

## Why

In a modern React app, it's pretty common to utilize a state managing lib like [Redux](https://github.com/reduxjs/redux) and a data fetching lib like [React Query](https://github.com/tannerlinsley/react-query), but it still takes quite a little work to setup a cross-component shared state or to share a result of data fetching across components.

This module helps easilier share (or spread) things across components in a React app which has utilized a state managing lib and a data fetching lib. It's a group of intuitive encapsulations on existing libs but not another new wheel for a same set of problems.

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
import {useSpreadIn, useSpreadOut} from 'spreado';

const INDEX_OF_SOME_DATA_QUERY = 'INDEX_OF_SOME_DATA_QUERY';

function useSomeDataQuerySpreadOut(params: ParamsForSomeDataQuery) {
  return useSpreadOut(
    INDEX_OF_SOME_DATA_QUERY
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

The snake-case named functions are placeholders. The result of data fetching gets shared by `useSomeDataQuerySpreadOut` and gets re-visited by `useSomeDataQuerySpreadIn`. The fallback value of the shared result is specified by the second param of `useSpreadIn` in case that there is not yet any result fetched. It's worth noting that returns of the 2 functions contain binded helpers of the fetched data. In terms of state managing, the benifit is, again, it's straightforward and avoids boilerplate. In terms of data fetching, the benifit is, it avoids quite amount of work on preparing a same set of fetching params in different components, especially when the params are coupled more or less with presentational logics in any of the components.

### Initialization

Spreado assumes a pair of a state managing lib and a data fetching lib has been adopted by your modern React app. It aims to integrate with them well but won't re-invent wheels itself. Most well-known libs of the categories (e.g. [Redux](https://github.com/reduxjs/redux), [MobX](https://github.com/mobxjs/mobx), [React Query](https://github.com/tannerlinsley/react-query), [SWR](https://github.com/vercel/swr)) have been supported by Spreado. You may pick up your preferred pair, then setup Spreado as follows:

#### With Redux and React Query

```tsx
import {QueryClient, QueryClientProvider} from 'react-query';
import {Provider as ReduxProvider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import {SpreadoSetupForReduxReactQuery, SpreadoSetupProvider, spreadoReducerPack} from 'spreado';

const store = createStore(combineReducers(spreadoReducerPack));
const queryClient = new QueryClient();
const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});

const App: FC = () => {
  <ReduxProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <SpreadoSetupProvider setup={spreadoSetup}>
        <div>...</div>
      </SpreadoSetupProvider>
    </QueryClientProvider>
  </ReduxProvider>;
};
```

#### With Redux Toolkit and React Query

```tsx
import {configureStore} from '@reduxjs/toolkit';
import {Provider as ReduxProvider} from 'react-redux';
import {QueryClient, QueryClientProvider} from 'react-query';
import {SpreadoSetupForReduxReactQuery, SpreadoSetupProvider, spreadoReducerPack} from 'spreado';

const store = configureStore({reducer: spreadoReducerPack});
const queryClient = new QueryClient();
const spreadoSetup = new SpreadoSetupForReduxReactQuery({store, queryClient});

const App: FC = () => {
  <ReduxProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <SpreadoSetupProvider setup={spreadoSetup}>
        <div>...</div>
      </SpreadoSetupProvider>
    </QueryClientProvider>
  </ReduxProvider>;
};
```

## API

Only typical usages are described above. Please explore more usages by refering to APIs below to fit your use cases.

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
