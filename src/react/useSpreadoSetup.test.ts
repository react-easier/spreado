import {mocked} from 'jest-mock';
import {uniqueId} from 'lodash';
import {useContext} from 'react';
import {ERR_SETUP_NOT_INITED} from '../constants';
import {useSpreadoSetup} from './useSpreadoSetup';

jest.mock('react');

describe('useSpreadoSetup', () => {
  test('returns current spreado setup', () => {
    const spreadoSetup = uniqueId() as never;
    mocked(useContext).mockReturnValueOnce(spreadoSetup);
    expect(useSpreadoSetup()).toBe(spreadoSetup);
  });

  test('throws error if not initialized', () => {
    expect(() => useSpreadoSetup()).toThrow(ERR_SETUP_NOT_INITED);
  });
});
