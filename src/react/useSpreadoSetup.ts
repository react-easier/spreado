import {useContext} from 'react';
import {ERR_SETUP_NOT_INITED} from '../constants';
import {SpreadoSetup} from '../core';
import {SpreadoSetupContext} from './SpreadoSetupProvider';

export function useSpreadoSetup(): SpreadoSetup {
  const spreadoSetup = useContext(SpreadoSetupContext);
  if (!spreadoSetup) {
    throw new Error(ERR_SETUP_NOT_INITED);
  }
  return spreadoSetup;
}
