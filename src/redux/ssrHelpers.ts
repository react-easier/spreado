import {generateSpreadKey, SpreadoIndexValueMap} from '../core';
import {SPREADO_REDUX_STATE_INDEX, SpreadoReduxState} from './module';

export interface SpreadoReduxPreloadedState {
  [SPREADO_REDUX_STATE_INDEX]: SpreadoReduxState;
}

export function createSpreadoReduxPreloadedState(
  ivMap: SpreadoIndexValueMap
): SpreadoReduxPreloadedState {
  const preloadedState: SpreadoReduxState = Object.keys(ivMap).reduce(
    (acc, index) => ({...acc, [generateSpreadKey(index)]: ivMap[index]}),
    {}
  );
  return {[SPREADO_REDUX_STATE_INDEX]: preloadedState};
}
