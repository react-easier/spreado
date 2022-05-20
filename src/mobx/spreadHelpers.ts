import {isEqual} from 'lodash';
import {reaction} from 'mobx';
import {useEffect, useMemo, useRef, useState} from 'react';
import {generateSpreadKey} from '../core';
import {SpreadoMobXStore} from './SpreadoMobXStore';

export function useSpreadOut<T>(
  store: SpreadoMobXStore,
  counter: Record<string, number>,
  index: unknown,
  value: T
): T {
  const key = useMemo(() => generateSpreadKey(index), [index]);
  const [foundValue, setFoundValue] = useState(() => store.findValue<T>(key));

  useEffect(() => {
    counter[key] = key in counter ? counter[key] + 1 : 1;
    return () => {
      counter[key] = counter[key] - 1;
      if (counter[key] <= 0) {
        delete counter[key];
        store.resetState(key);
      }
    };
  }, [key, store, counter]);

  useEffect(() => {
    store.setState(key, value);
  }, [key, store, value]);

  useEffect(() => {
    return reaction(
      () => store.findValue<T>(key),
      (foundValue) => setFoundValue(foundValue),
      {equals: isEqual, fireImmediately: true}
    );
  }, [key, store]);

  return foundValue ?? value;
}

export function useSpreadIn<T>(
  store: SpreadoMobXStore,
  index: unknown,
  fallback?: Partial<T>
): T | Partial<T> | undefined {
  const key = useMemo(() => generateSpreadKey(index), [index]);
  const refFallback = useRef(fallback);
  const [foundValue, setFoundValue] = useState(() => store.findValue<T>(key, fallback));

  useEffect(() => {
    refFallback.current = fallback;
  }, [fallback]);

  useEffect(() => {
    return reaction(
      () => store.findValue<T>(key, refFallback.current),
      (foundValue) => setFoundValue(foundValue),
      {equals: isEqual, fireImmediately: true}
    );
  }, [key, store]);

  return foundValue;
}

export function setSpreadOut<T>(
  store: SpreadoMobXStore,
  index: unknown,
  value: T | ((value?: T) => T)
): T {
  const key = generateSpreadKey(index);

  if (typeof value === 'function') {
    const callback = value as (value?: T) => T;
    const oldValue = store.findValue<T>(key);
    const newValue = callback(oldValue);
    store.setState(key, newValue);
    return newValue;
  }

  store.setState(key, value);
  return value;
}

export function getSpreadIn<T>(
  store: SpreadoMobXStore,
  index: unknown,
  fallback?: Partial<T>
): T | Partial<T> | undefined {
  const key = generateSpreadKey(index);
  return store.findValue(key, fallback);
}
