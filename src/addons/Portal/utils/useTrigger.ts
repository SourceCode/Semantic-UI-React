import * as React from 'react'

import validateTrigger from './validateTrigger'

/**
 * Validates and returns a portal trigger element.
 *
 * Previously this hook cloned the trigger to attach a merged ref. With React 19,
 * ref is a regular prop and Portal now uses a wrapper span for event handlers
 * and ref tracking, so cloning is no longer necessary.
 *
 * @param {React.ReactNode} trigger
 * @returns {React.ReactNode|null}
 */
function useTrigger(trigger: React.ReactNode): React.ReactNode | null {
  if (trigger) {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      validateTrigger(trigger)
    }

    return trigger
  }

  return null
}

export default useTrigger
