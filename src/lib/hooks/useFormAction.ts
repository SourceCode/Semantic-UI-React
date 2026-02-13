import * as React from 'react'

/**
 * Convenience hook wrapping React.useActionState for use with Form component.
 */
export default function useFormAction<State>(
  action: (prevState: Awaited<State>, formData: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string,
): [state: Awaited<State>, formAction: (payload: FormData) => void, isPending: boolean] {
  return React.useActionState(action, initialState, permalink)
}
