import type * as mobxModule from 'mobx';
import {useMemo} from 'react';
import type * as reactQueryModule from 'react-query';
import type * as reactReduxModule from 'react-redux';
import type * as reduxModule from 'redux';
import type * as swrModule from 'swr';

/* eslint-disable @typescript-eslint/no-var-requires */
export const peerDeps = {
  ['mobx']: () => require('mobx') as typeof mobxModule,
  ['react-query']: () => require('react-query') as typeof reactQueryModule,
  ['react-redux']: () => require('react-redux') as typeof reactReduxModule,
  ['redux']: () => require('redux') as typeof reduxModule,
  ['swr']: () => require('swr') as typeof swrModule,
} as const;
/* eslint-enable @typescript-eslint/no-var-requires */

export type PeerId = keyof typeof peerDeps;
export type PeerModule<T extends PeerId> = ReturnType<typeof peerDeps[T]>;

export function requirePeer<T extends PeerId>(peerId: T): PeerModule<T> {
  return peerDeps[peerId]() as never;
}

export function useRequirePeer<T extends PeerId>(peerId: T): PeerModule<T> {
  return useMemo(() => requirePeer(peerId), [peerId]);
}
