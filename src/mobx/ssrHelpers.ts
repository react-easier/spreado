import {generateSpreadKey, SpreadoIndexValueMap} from '../core';
import {SpreadoMobXState} from './types';

export function createSpreadoMobXPreloadedState(ivMap: SpreadoIndexValueMap): SpreadoMobXState {
  const preloadedState: SpreadoMobXState = Object.keys(ivMap).reduce(
    (acc, index) => ({...acc, [generateSpreadKey(index)]: ivMap[index]}),
    {}
  );
  return preloadedState;
}
