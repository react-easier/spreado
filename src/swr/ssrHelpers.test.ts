import {renderHook} from '@testing-library/react-hooks';
import {mocked} from 'jest-mock';
import {uniqueId} from 'lodash';

import {getSpreadIn} from '../global';
import {renderSwrResponse, useSwrFallbackData} from './ssrHelpers';

jest.mock('../global');

describe('renderSwrResponse', () => {
  test('works', () => {
    const data = uniqueId();
    expect(renderSwrResponse(data)).toMatchObject({data});
  });
});

describe('useSwrFallbackData', () => {
  test('works', () => {
    const data = uniqueId();
    mocked(getSpreadIn).mockReturnValueOnce({data});
    const {result} = renderHook(() => useSwrFallbackData(0));
    expect(result.current).toEqual(data);
  });
});
