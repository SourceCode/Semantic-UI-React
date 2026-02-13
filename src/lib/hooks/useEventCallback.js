import * as React from 'react'

/**
 * A hook that returns a stable callback reference that always invokes the latest
 * version of the provided function. Useful when a callback needs to be passed to
 * child components or event listeners without causing re-renders when the
 * callback's closure changes.
 *
 * @param {Function} fn The callback function that will be used
 */
export default function useEventCallback(fn) {
  const callbackRef = React.useRef(fn)
  callbackRef.current = fn

  return React.useCallback((...args) => callbackRef.current(...args), [])
}
