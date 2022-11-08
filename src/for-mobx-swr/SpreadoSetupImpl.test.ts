import {renderHook} from '@testing-library/react-hooks';
import {mocked} from 'jest-mock';
import {get, uniqueId} from 'lodash';

import {_getSpreadIn, _setSpreadOut, _useSpreadIn, _useSpreadOut, SpreadoMobXStore} from '../mobx';
import {SpreadoSetupForMobXSwr} from './SpreadoSetupImpl';

const store: SpreadoMobXStore = {} as never;
const builtinStore: SpreadoMobXStore = {} as never;

jest.mock('../mobx');

mocked(SpreadoMobXStore).mockReturnValue(builtinStore);

describe('SpreadoSetupForMobXSwr', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('#constructor', () => {
    test('uses external store if store is given', () => {
      const setup = new SpreadoSetupForMobXSwr({store});
      expect(setup).toHaveProperty('options.store', store);
    });

    test('uses builtin store if store not given', () => {
      const setup = new SpreadoSetupForMobXSwr();
      expect(setup).toHaveProperty('options.store', builtinStore);
    });
  });

  describe('#useSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      renderHook(() => setup.useSpreadOut(index, value));
      expect(_useSpreadOut).toHaveBeenCalledWith(
        store,
        get(setup, 'useSpreadOutCounter'),
        index,
        value
      );
    });
  });

  describe('#useSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXSwr({store});
      const index = uniqueId();
      const fallback = uniqueId();
      renderHook(() => setup.useSpreadIn(index, fallback));
      expect(_useSpreadIn).toHaveBeenCalledWith(store, index, fallback);
    });
  });

  describe('#setSpreadOut', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXSwr({store});
      const index = uniqueId();
      const value = uniqueId();
      setup.setSpreadOut(index, value);
      expect(_setSpreadOut).toHaveBeenCalledWith(store, index, value);
    });
  });

  describe('#getSpreadIn', () => {
    test('works', () => {
      const setup = new SpreadoSetupForMobXSwr({store});
      const index = uniqueId();
      const fallback = uniqueId();
      setup.getSpreadIn(index, fallback);
      expect(_getSpreadIn).toHaveBeenCalledWith(store, index, fallback);
    });
  });
});
