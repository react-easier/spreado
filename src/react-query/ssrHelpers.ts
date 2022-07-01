import {get} from 'lodash';
import {useMemo} from 'react';
import {InfiniteData, UseInfiniteQueryResult, UseQueryResult} from 'react-query';

import {getSpreadIn} from '../global';

export type RenderedQueryResult<TData> = Pick<
  UseQueryResult<TData>,
  | 'data'
  | 'dataUpdatedAt'
  | 'error'
  | 'errorUpdateCount'
  | 'errorUpdatedAt'
  | 'failureCount'
  | 'isError'
  | 'isFetched'
  | 'isFetchedAfterMount'
  | 'isFetching'
  | 'isIdle'
  | 'isLoading'
  | 'isLoadingError'
  | 'isPlaceholderData'
  | 'isPreviousData'
  | 'isRefetchError'
  | 'isRefetching'
  | 'isStale'
  | 'isSuccess'
  | 'status'
>;

export type OverrideQueryResult<TData> = Partial<Omit<RenderedQueryResult<TData>, 'data'>>;

export function renderQueryResult<TData>(
  data: TData,
  override: OverrideQueryResult<TData> = {}
): RenderedQueryResult<TData> {
  const now = Date.now();
  return {
    data,
    dataUpdatedAt: now,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: now,
    failureCount: 0,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: false,
    isFetching: false,
    isIdle: false,
    isLoading: false,
    isLoadingError: false,
    isPlaceholderData: false,
    isPreviousData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    status: 'success',
    ...override,
  };
}

export type RenderedInfiniteQueryResult<TData> = Pick<
  UseInfiniteQueryResult<TData>,
  | 'data'
  | 'dataUpdatedAt'
  | 'error'
  | 'errorUpdateCount'
  | 'errorUpdatedAt'
  | 'failureCount'
  | 'hasNextPage'
  | 'hasPreviousPage'
  | 'isError'
  | 'isFetched'
  | 'isFetchedAfterMount'
  | 'isFetching'
  | 'isFetchingNextPage'
  | 'isFetchingPreviousPage'
  | 'isIdle'
  | 'isLoading'
  | 'isLoadingError'
  | 'isPlaceholderData'
  | 'isPreviousData'
  | 'isRefetchError'
  | 'isRefetching'
  | 'isStale'
  | 'isSuccess'
  | 'status'
>;

export type OverrideInfiniteQueryResult<TData> = Partial<
  Omit<RenderedInfiniteQueryResult<TData>, 'data'>
>;

export function renderInfiniteQueryResult<TData>(
  data: InfiniteData<TData>,
  override: OverrideInfiniteQueryResult<TData> = {}
): RenderedInfiniteQueryResult<TData> {
  const now = Date.now();
  return {
    data,
    dataUpdatedAt: now,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: now,
    failureCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: false,
    isFetching: false,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    isIdle: false,
    isLoading: false,
    isLoadingError: false,
    isPlaceholderData: false,
    isPreviousData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    status: 'success',
    ...override,
  };
}

export function useQueryInitialData(index: unknown): never {
  return useMemo(() => get(getSpreadIn(index), 'data'), [index]) as never;
}
