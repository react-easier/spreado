import {get} from 'lodash';
import {useMemo} from 'react';
import {SWRResponse} from 'swr';

import {getSpreadIn} from '../global';

export type RenderedSwrResponse<TData> = Pick<
  SWRResponse<TData>,
  'data' | 'error' | 'isValidating'
>;

export type OverrideSwrResponse<TData> = Partial<Omit<RenderedSwrResponse<TData>, 'data'>>;

export function renderSwrResponse<TData>(
  data: TData,
  override: OverrideSwrResponse<TData> = {}
): RenderedSwrResponse<TData> {
  return {
    data,
    isValidating: false,
    ...override,
  };
}

export function useSwrFallbackData(index: unknown): never {
  return useMemo(() => get(getSpreadIn(index), 'data'), [index]) as never;
}
