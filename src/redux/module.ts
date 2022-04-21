import {generateSpreadKey} from '../core';

export const SPREADO_REDUX_STATE_INDEX = 'spreado';

export const SPREADO_REDUX_ACTION_SET_STATE = 'SPREADO_REDUX_ACTION_SET_STATE';
export const SPREADO_REDUX_ACTION_RESET_STATE = 'SPREADO_REDUX_ACTION_RESET_STATE';
export const SPREADO_REDUX_ACTION_BULK_SET_STATE = 'SPREADO_REDUX_ACTION_BULK_SET_STATE';

export type SpreadoReduxState = Record<string, unknown>;

export type SpreadoReduxAction =
  | {
      type: typeof SPREADO_REDUX_ACTION_SET_STATE;
      key: string;
      value: unknown;
    }
  | {
      type: typeof SPREADO_REDUX_ACTION_RESET_STATE;
      key: string;
    }
  | {
      type: typeof SPREADO_REDUX_ACTION_BULK_SET_STATE;
      kvMap: SpreadoReduxState;
    };

export function setSpreadoReduxState(key: string, value: unknown): SpreadoReduxAction {
  return {type: SPREADO_REDUX_ACTION_SET_STATE, key, value};
}

export function resetSpreadoReduxState(key: string): SpreadoReduxAction {
  return {type: SPREADO_REDUX_ACTION_RESET_STATE, key};
}

export function bulkSetSpreadoReduxState(kvMap: SpreadoReduxState): SpreadoReduxAction {
  return {type: SPREADO_REDUX_ACTION_BULK_SET_STATE, kvMap};
}

export default function reducer(
  state: SpreadoReduxState = {},
  action: SpreadoReduxAction
): SpreadoReduxState {
  switch (action.type) {
    case SPREADO_REDUX_ACTION_SET_STATE: {
      const {key, value} = action;
      return {...state, [key]: value};
    }
    case SPREADO_REDUX_ACTION_RESET_STATE: {
      const {key} = action;
      const nextState = {...state};
      delete nextState[key];
      return nextState;
    }
    case SPREADO_REDUX_ACTION_BULK_SET_STATE: {
      const {kvMap} = action;
      return {...state, ...kvMap};
    }
    default:
      return state;
  }
}

declare module 'redux' {
  interface DefaultRootState {
    [SPREADO_REDUX_STATE_INDEX]?: SpreadoReduxState;
  }
}

declare module 'react-redux' {
  interface DefaultRootState {
    [SPREADO_REDUX_STATE_INDEX]?: SpreadoReduxState;
  }
}

export const spreadoReducerPack = {[SPREADO_REDUX_STATE_INDEX]: reducer};

export interface SpreadoReduxPreloadedState {
  [SPREADO_REDUX_STATE_INDEX]: SpreadoReduxState;
}

export function createSpreadoReduxPreloadedState(
  kvMap: Record<string | number | symbol, unknown>
): SpreadoReduxPreloadedState {
  const preloadedState: SpreadoReduxState = Object.keys(kvMap).reduce(
    (acc, key) => ({...acc, [generateSpreadKey(key)]: kvMap[key]}),
    {}
  );
  return {[SPREADO_REDUX_STATE_INDEX]: preloadedState};
}
