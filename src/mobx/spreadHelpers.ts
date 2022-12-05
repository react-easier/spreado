import {isEqual} from 'lodash';
import {reaction} from 'mobx';
import {useEffect, useMemo, useRef, useState} from 'react';

import {evaluateFallback, generateSpreadKey, TryPartial} from '../core';
import {SpreadoMobXStore} from './SpreadoMobXStore';

export function _useSpreadOut<V>(
  store: SpreadoMobXStore,
  counter: Record<string, number>,
  index: unknown,
  value: V
): V {
  const key = useMemo(() => generateSpreadKey(index), [index]);

  const [foundValue, setFoundValue] = useState(() => store.findValue<V>(key));
  const refFoundValue = useRef(foundValue);

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
      () => store.findValue<V>(key),
      (foundValue) => {
        if (!isEqual(foundValue, refFoundValue.current)) {
          setFoundValue(foundValue);
          refFoundValue.current = foundValue;
        }
      },
      {fireImmediately: true}
    );
  }, [key, store]);

  return foundValue ?? value;
}

export function _useSpreadIn<V>(
  store: SpreadoMobXStore,
  index: unknown,
  fallback?: TryPartial<V>
): V | TryPartial<V> | undefined {
  const key = useMemo(() => generateSpreadKey(index), [index]);

  const finalFallback = useMemo(() => evaluateFallback(index, fallback), [index, fallback]);
  const refFinalFallback = useRef(finalFallback);

  const [foundValue, setFoundValue] = useState(() => store.findValue<V>(key, finalFallback));
  const refFoundValue = useRef(foundValue);

  useEffect(() => {
    refFinalFallback.current = finalFallback;
  }, [finalFallback]);

  useEffect(() => {
    return reaction(
      () => store.findValue<V>(key, refFinalFallback.current),
      (foundValue) => {
        if (!isEqual(foundValue, refFoundValue.current)) {
          setFoundValue(foundValue);
          refFoundValue.current = foundValue;
        }
      },
      {fireImmediately: true}
    );
  }, [key, store]);

  return foundValue;
}

export function _setSpreadOut<V>(
  store: SpreadoMobXStore,
  index: unknown,
  value: V | ((value?: V | TryPartial<V>) => V)
): V {
  const key = generateSpreadKey(index);

  if (typeof value === 'function') {
    const callback = value as (value?: V | TryPartial<V>) => V;
    const oldValue = store.findValue<V>(key, evaluateFallback<V>(index));
    const newValue = callback(oldValue);
    store.setState(key, newValue);
    return newValue;
  }

  store.setState(key, value);
  return value;
}

export function _getSpreadIn<V>(
  store: SpreadoMobXStore,
  index: unknown,
  fallback?: TryPartial<V>
): V | TryPartial<V> | undefined {
  const key = generateSpreadKey(index);
  const finalFallback = evaluateFallback(index, fallback);
  return store.findValue(key, finalFallback);
}
