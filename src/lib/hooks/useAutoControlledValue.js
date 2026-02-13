import * as React from 'react'

/**
 * A hook that allows optional user control, implements an interface similar to `React.useState()`.
 * Useful for components which allow uncontrolled and controlled behaviours for users.
 *
 * - defaultState - default state or factory initializer
 * - state - controllable state, undefined state means internal state will be used
 * - initialState - Used to initialize state if all user provided states are undefined
 *
 * @param {{ defaultState?: any, state: any, initialState: any }} options
 *
 * @see https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components
 * @see https://react.dev/reference/react/useState
 */
function useAutoControlledValue(options) {
  const initialState =
    typeof options.defaultState === 'undefined' ? options.initialState : options.defaultState
  const [internalState, setInternalState] = React.useState(initialState)

  const state = typeof options.state === 'undefined' ? internalState : options.state

  // Update ref synchronously (not in an effect) for React 19 compatibility.
  // React 19's automatic batching can cause stale values if the ref is updated
  // in an effect and setState is called multiple times before the effect runs.
  const stateRef = React.useRef(state)
  stateRef.current = state

  // To match the behavior of the setter returned by React.useState, this callback's identity
  // should never change. This means it MUST NOT directly reference variables that can change.
  const setState = React.useCallback((newState) => {
    // React dispatch can use a factory
    // https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
    if (typeof newState === 'function') {
      stateRef.current = newState(stateRef.current)
    } else {
      stateRef.current = newState
    }

    setInternalState(stateRef.current)
  }, [])

  return [state, setState]
}

export default useAutoControlledValue
