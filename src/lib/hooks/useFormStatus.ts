import { useFormStatus as useReactDomFormStatus } from 'react-dom'

/**
 * Re-export of react-dom's useFormStatus for convenience.
 * Returns the status of the nearest parent form submission.
 */
export default function useFormStatus() {
  return useReactDomFormStatus()
}
