import {DefaultRootState} from 'redux';

import {TryPartial} from '../core';
import {SPREADO_REDUX_STATE_INDEX} from './module';

function findValueInRootState<V>(rootState: DefaultRootState, key: string): V | undefined;
function findValueInRootState<V>(
  rootState: DefaultRootState,
  key: string,
  fallback: TryPartial<V>
): V | TryPartial<V>;
function findValueInRootState<V>(
  rootState: DefaultRootState,
  key: string,
  fallback?: TryPartial<V>
): V | TryPartial<V> | undefined;
function findValueInRootState<V>(
  rootState: DefaultRootState,
  key: string,
  fallback?: TryPartial<V>
): V | TryPartial<V> | undefined {
  const state = rootState[SPREADO_REDUX_STATE_INDEX];
  if (!state || !(key in state)) {
    return fallback;
  }
  return state[key] as V;
}

export {findValueInRootState};
