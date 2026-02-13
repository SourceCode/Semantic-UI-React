import * as React from 'react'

/**
 * Re-export of React.useOptimistic for convenience.
 */
export default function useOptimistic<State, Action>(
  state: State,
  updateFn: (currentState: State, action: Action) => State,
): [State, (action: Action) => void] {
  return React.useOptimistic(state, updateFn)
}
