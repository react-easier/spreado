import {renderHook} from '@testing-library/react-hooks';
import {uniqueId} from 'lodash';
import {Store} from 'redux';

import {_getSpreadIn, _setSpreadOut, _useSpreadIn, _useSpreadOut} from '../redux';
import {SpreadoSetupForReduxSwr} from './SpreadoSetupImpl';

const store: Store = {} as never;
jest.mock('../redux');

describe('SpreadoSetupForReduxSwr', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('#setSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.setSpreadOut(index, value));
      expect(_setSpreadOut).toBeCalledWith(store, index, value);
    });
  });

  describe('#useSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.useSpreadOut(index, value));
      expect(_useSpreadOut).toBeCalledWith({}, index, value);
    });
  });

  describe('#getSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.getSpreadIn(index, value));
      expect(_getSpreadIn).toBeCalledWith(store, index, value);
    });
  });

  describe('#useSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForReduxSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.useSpreadIn(index, value));
      expect(_useSpreadIn).toBeCalledWith(index, value);
    });
  });
});
