import React, {FC} from 'react';
import {SpreadoSetup} from '../core';

export const SpreadoSetupContext = React.createContext<SpreadoSetup | undefined>(undefined);

export type SpreadoProviderProps = {
  setup: SpreadoSetup;
};

export const SpreadoSetupProvider: FC<SpreadoProviderProps> = ({setup, children}) => {
  return <SpreadoSetupContext.Provider value={setup}>{children}</SpreadoSetupContext.Provider>;
};
