import {renderHook} from '@testing-library/react-hooks';
import {mocked} from 'jest-mock';
import {uniqueId} from 'lodash';

import {getSpreadIn} from '../global';
import {renderInfiniteQueryResult, renderQueryResult, useQueryInitialData} from './ssrHelpers';

jest.mock('../global');

describe('renderQueryResult', () => {
  test('works', () => {
    const data = uniqueId();
    expect(renderQueryResult(data)).toMatchObject({data});
  });
});

describe('renderInfiniteQueryResult', () => {
  test('works', () => {
    const data = {pages: [uniqueId()], pageParams: [uniqueId()]};
    expect(renderInfiniteQueryResult(data)).toMatchObject({data});
  });
});

describe('useQueryInitialData', () => {
  test('works', () => {
    const data = uniqueId();
    mocked(getSpreadIn).mockReturnValueOnce({data});
    const {result} = renderHook(() => useQueryInitialData(0));
    expect(result.current).toEqual(data);
  });
});
