import {isEqual} from 'lodash';
import {useEffect, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Store} from 'redux';

import {evaluateFallback, generateSpreadKey, TryPartial} from '../core';
import {findValueInRootState} from './findValue';
import {resetSpreadoReduxState, setSpreadoReduxState} from './module';

export function _useSpreadOut<V>(counter: Record<string, number>, index: unknown, value: V): V {
  const dispatch = useDispatch();
  const key = useMemo(() => generateSpreadKey(index), [index]);
  const refTrackedValue = useRef<V | symbol>(Symbol());

  useEffect(() => {
    counter[key] = key in counter ? counter[key] + 1 : 1;
    return () => {
      counter[key] = counter[key] - 1;
      if (counter[key] <= 0) {
        delete counter[key];
        dispatch(resetSpreadoReduxState(key));
      }
    };
  }, [dispatch, key, counter]);

  useEffect(() => {
    if (!isEqual(value, refTrackedValue.current)) {
      dispatch(setSpreadoReduxState(key, value));
      refTrackedValue.current = value;
    }
  }, [dispatch, key, value]);

  return useSelector((rootState) => findValueInRootState<V>(rootState, key)) ?? value;
}

export function _useSpreadIn<V>(
  index: unknown,
  fallback?: TryPartial<V>
): V | TryPartial<V> | undefined {
  const key = useMemo(() => generateSpreadKey(index), [index]);
  const finalFallback = useMemo(() => evaluateFallback(index, fallback), [index, fallback]);
  return useSelector((rootState) => findValueInRootState(rootState, key, finalFallback));
}

export function _setSpreadOut<V>(
  store: Store,
  index: unknown,
  value: V | ((value?: V | TryPartial<V>) => V)
): V {
  const key = generateSpreadKey(index);

  if (typeof value === 'function') {
    const callback = value as (value?: V | TryPartial<V>) => V;
    const rootState = store.getState();
    const oldValue = findValueInRootState<V>(rootState, key, evaluateFallback<V>(index));
    const newValue = callback(oldValue);
    store.dispatch(setSpreadoReduxState(key, newValue));
    return newValue;
  }

  store.dispatch(setSpreadoReduxState(key, value));
  return value;
}

export function _getSpreadIn<V>(
  store: Store,
  index: unknown,
  fallback?: TryPartial<V>
): V | TryPartial<V> | undefined {
  const key = generateSpreadKey(index);
  const finalFallback = evaluateFallback(index, fallback);
  const rootState = store.getState();
  return findValueInRootState(rootState, key, finalFallback);
}
