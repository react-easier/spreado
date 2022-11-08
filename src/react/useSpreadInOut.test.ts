import {mocked} from 'jest-mock';
import {uniqueId} from 'lodash';

import {SpreadoSetup} from '../core';
import {useSpreadIn, useSpreadOut} from './useSpreadInOut';
import {useSpreadoSetup} from './useSpreadoSetup';

jest.mock('./useSpreadoSetup');

const mockedSpreadSetup = {
  useSpreadIn: jest.fn(),
  useSpreadOut: jest.fn(),
} as unknown as SpreadoSetup;
mocked(useSpreadoSetup).mockReturnValue(mockedSpreadSetup);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSpreadIn', () => {
  test('dispatches to spreado setup', () => {
    const index = uniqueId();
    const fallback = uniqueId();
    useSpreadIn(index, fallback);
    expect(mockedSpreadSetup.useSpreadIn).toBeCalledWith(index, fallback);
  });
});

describe('useSpreadOut', () => {
  test('dispatches the call to spreado setup', () => {
    const index = uniqueId();
    const value = uniqueId();
    useSpreadOut(index, value);
    expect(mockedSpreadSetup.useSpreadOut).toBeCalledWith(index, value);
  });
});
