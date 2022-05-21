import {renderHook} from '@testing-library/react-hooks';
import {peerDeps, requirePeer, useRequirePeer} from './peerDeps';

describe('peerDeps', () => {
  it('works', () => {
    Object.values(peerDeps).forEach((fn) => expect(fn()).toBeTruthy());
  });
});

describe('requirePeer', () => {
  it('works', () => {
    expect(requirePeer('redux')).toBe(peerDeps['redux']());
  });
});

describe('useRequirePeer', () => {
  it('works', () => {
    const {result} = renderHook(() => useRequirePeer('redux'));
    expect(result.current).toBe(peerDeps['redux']());
  });
});
