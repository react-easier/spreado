import {renderHook} from '@testing-library/react-hooks';
import {uniqueId} from 'lodash';
import {Store} from 'redux';

import {getSpreadIn, setSpreadOut, useSpreadIn, useSpreadOut} from '../redux';
import {SpreadoSetupBetweenReduxSwr} from './SpreadoSetupImpl';

const store: Store = {
  dispatch: jest.fn(),
} as never;
jest.mock('../redux');

describe('SpreadoSetupBetweenReduxSwr', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupBetweenReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.setSpreadOut(index, value));
      expect(setSpreadOut).toBeCalledWith(store, index, value);
    });
  });

  describe('useSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupBetweenReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.useSpreadOut(index, value));
      expect(useSpreadOut).toBeCalledWith({}, index, value);
    });
  });

  describe('getSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupBetweenReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.getSpreadIn(index, value));
      expect(getSpreadIn).toBeCalledWith(store, index, value);
    });
  });

  describe('useSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupBetweenReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.useSpreadIn(index, value));
      expect(useSpreadIn).toBeCalledWith(index, value);
    });
  });
});
