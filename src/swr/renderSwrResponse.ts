import type {SWRResponse} from 'swr';

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
    error: undefined,
    isValidating: false,
    ...override,
  };
}
