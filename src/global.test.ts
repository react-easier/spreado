import {cloneDeep, uniqueId} from 'lodash';

import {ERR_SETUP_NOT_INITED} from './constants';
import {
  getSpreadIn,
  setSpreadoGlobalState,
  setSpreadOut,
  spreadoGlobalState,
  SpreadoGlobalState,
} from './global';

const originalGlobalState = cloneDeep(spreadoGlobalState);

beforeEach(() => {
  jest.clearAllMocks();
  let k: keyof SpreadoGlobalState;
  for (k in spreadoGlobalState) {
    spreadoGlobalState[k] = originalGlobalState[k];
  }
});

describe('setSpreadoGlobalState', () => {
  test('sets fields', () => {
    const spreadoSetup = uniqueId() as never;
    setSpreadoGlobalState({spreadoSetup});
    expect(spreadoGlobalState.spreadoSetup).toBe(spreadoSetup);
  });
});

describe('getSpreadIn', () => {
  const index = uniqueId();

  test('redirects to current spreado setup', () => {
    const spreadoSetup$getSpreadIn = jest.fn();
    const spreadoSetup = {getSpreadIn: spreadoSetup$getSpreadIn} as never;
    setSpreadoGlobalState({spreadoSetup});
    getSpreadIn(index);
    expect(spreadoSetup$getSpreadIn).toHaveBeenCalledWith(index);
  });

  test('throws error if not initialized', () => {
    expect(() => getSpreadIn(index)).toThrow(ERR_SETUP_NOT_INITED);
  });
});

describe('setSpreadOut', () => {
  const index = uniqueId();
  const value = uniqueId();

  test('redirects to current spreado setup', () => {
    const spreadoSetup$setSpreadOut = jest.fn();
    const spreadoSetup = {setSpreadOut: spreadoSetup$setSpreadOut} as never;
    setSpreadoGlobalState({spreadoSetup});
    setSpreadOut(index, value);
    expect(spreadoSetup$setSpreadOut).toHaveBeenCalledWith(index, value);
  });

  test('throws error if not initialized', () => {
    expect(() => setSpreadOut(index, value)).toThrow(ERR_SETUP_NOT_INITED);
  });
});
