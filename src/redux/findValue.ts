import {DefaultRootState} from 'redux';
import {SPREADO_REDUX_STATE_INDEX} from './module';

function findValueInRootState<T>(rootState: DefaultRootState, key: string): T | undefined;
function findValueInRootState<T>(
  rootState: DefaultRootState,
  key: string,
  fallback: Partial<T>
): T | Partial<T>;
function findValueInRootState<T>(
  rootState: DefaultRootState,
  key: string,
  fallback?: Partial<T>
): T | Partial<T> | undefined;
function findValueInRootState<T>(
  rootState: DefaultRootState,
  key: string,
  fallback?: Partial<T>
): T | Partial<T> | undefined {
  const state = rootState[SPREADO_REDUX_STATE_INDEX];
  if (!state || !(key in state)) {
    return fallback;
  }
  return state[key] as T;
}

export {findValueInRootState};
