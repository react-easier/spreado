import {ERR_SETUP_NOT_INITED} from './constants';
import {SpreadoSetup} from './core';

export const spreadoGlobalState: SpreadoGlobalState = {};

export interface SpreadoGlobalState {
  spreadoSetup?: SpreadoSetup;
}

export function setSpreadoGlobalState(partialState: Partial<SpreadoGlobalState>): void {
  Object.assign(spreadoGlobalState, partialState);
}

export const getSpreadIn: SpreadoSetup['getSpreadIn'] = ((...params: [never]) => {
  const {spreadoSetup} = spreadoGlobalState;
  if (!spreadoSetup) {
    throw new Error(ERR_SETUP_NOT_INITED);
  }
  return spreadoSetup.getSpreadIn(...params);
}) as never;

export const setSpreadOut: SpreadoSetup['setSpreadOut'] = (...params: [never, never]) => {
  const {spreadoSetup} = spreadoGlobalState;
  if (!spreadoSetup) {
    throw new Error(ERR_SETUP_NOT_INITED);
  }
  return spreadoSetup.setSpreadOut(...params);
};
