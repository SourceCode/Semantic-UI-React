import * as React from 'react'

/**
 * Returns a callback that causes force render of a component.
 *
 * Prefer using React state or useSyncExternalStore over this hook.
 * This hook is a last resort for cases where state is managed externally.
 */
export default function useForceUpdate() {
  return React.useReducer((x) => x + 1, 0)[1]
}
