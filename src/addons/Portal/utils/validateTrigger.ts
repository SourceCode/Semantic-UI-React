import * as React from 'react'
// @ts-expect-error – no types for react-is
import * as ReactIs from 'react-is'

/**
 * Asserts that a passed element can be used cloned a props will be applied properly.
 */
export default function validateTrigger(element: React.ReactNode): void {
  React.Children.only(element)

  if (ReactIs.isFragment(element)) {
    throw new Error('An "React.Fragment" cannot be used as a `trigger`.')
  }
}
