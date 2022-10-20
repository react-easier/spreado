import {isEqual} from 'lodash';
import {useEffect, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Store} from 'redux';

import {generateSpreadKey} from '../core';
import {findValueInRootState} from './findValue';
import {resetSpreadoReduxState, setSpreadoReduxState} from './module';

export function _useSpreadOut<T>(counter: Record<string, number>, index: unknown, value: T): T {
  const dispatch = useDispatch();
  const key = useMemo(() => generateSpreadKey(index), [index]);
  const refTrackedValue = useRef<T | symbol>(Symbol());

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

  return useSelector((rootState) => findValueInRootState<T>(rootState, key)) ?? value;
}

export function _useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined {
  const key = useMemo(() => generateSpreadKey(index), [index]);
  return useSelector((rootState) => findValueInRootState(rootState, key, fallback));
}

export function _setSpreadOut<T>(store: Store, index: unknown, value: T | ((value?: T) => T)): T {
  const key = generateSpreadKey(index);

  if (typeof value === 'function') {
    const callback = value as (value?: T) => T;
    const rootState = store.getState();
    const oldValue = findValueInRootState<T>(rootState, key);
    const newValue = callback(oldValue);
    store.dispatch(setSpreadoReduxState(key, newValue));
    return newValue;
  }

  store.dispatch(setSpreadoReduxState(key, value));
  return value;
}

export function _getSpreadIn<T>(
  store: Store,
  index: unknown,
  fallback?: Partial<T>
): T | Partial<T> | undefined {
  const key = generateSpreadKey(index);
  const rootState = store.getState();
  return findValueInRootState(rootState, key, fallback);
}
