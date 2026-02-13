import * as React from 'react'

/**
 * Assigns a value to a React ref. In React 19, ref callbacks may return a
 * cleanup function which is called when the ref is detached.
 *
 * @param {React.Ref} ref
 * @param {HTMLElement} value
 * @returns {(() => void) | void} Optional cleanup function from ref callbacks
 */
export function setRef(ref, value) {
  if (typeof ref === 'function') {
    // React 19: ref callbacks may return a cleanup function
    const cleanup = ref(value)
    if (typeof cleanup === 'function') {
      return cleanup
    }
  } else if (ref) {
    ref.current = value
  }
}

/**
 * Merges two React refs into a single ref callback.
 *
 * The returned callback also has a `.current` property that holds the latest
 * ref value, allowing it to be used as both a RefCallback and a RefObject.
 *
 * Supports React 19 ref cleanup functions: if either ref callback returns
 * a cleanup function, the merged callback will return a combined cleanup.
 *
 * @param {React.Ref} refA
 * @param {React.Ref} refB
 *
 * @return {React.Ref} A function with an attached "current" prop, so that it can be treated like a React.RefObject.
 */
export default function useMergedRefs(refA, refB) {
  const mergedCallback = React.useCallback(
    (value) => {
      // Update the "current" prop hanging on the function.
      mergedCallback.current = value

      const cleanupA = setRef(refA, value)
      const cleanupB = setRef(refB, value)

      // Return combined cleanup for React 19
      if (cleanupA || cleanupB) {
        return () => {
          if (cleanupA) cleanupA()
          if (cleanupB) cleanupB()
        }
      }
    },
    [refA, refB],
  )

  return mergedCallback
}
