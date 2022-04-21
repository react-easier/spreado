import {SpreadoSetup} from '../core';
import {useSpreadoSetup} from './useSpreadoSetup';

export const useSpreadIn: SpreadoSetup['useSpreadIn'] = (...params: [never]) => {
  return useSpreadoSetup().useSpreadIn(...params);
};

export const useSpreadOut: SpreadoSetup['useSpreadOut'] = (...params: [never, never]) => {
  return useSpreadoSetup().useSpreadOut(...params);
};
