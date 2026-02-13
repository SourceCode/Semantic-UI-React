import * as React from 'react'

/**
 * Returns the value from the previous render.
 *
 * The effect intentionally has no dependency array -- it must run after
 * every render to update the ref with the current value.
 *
 * @see https://react.dev/reference/react/useRef#referencing-a-value-with-a-ref
 */
function usePrevious(value) {
  const ref = React.useRef()

  React.useEffect(() => {
    ref.current = value
  }) // No deps -- intentional

  return ref.current
}

export default usePrevious
