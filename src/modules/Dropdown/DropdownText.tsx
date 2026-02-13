import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictDropdownTextProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface DropdownTextProps extends StrictDropdownTextProps {
  [key: string]: any
}

/**
 * A dropdown contains a selected value.
 */
function DropdownText({ ref, ...props }: DropdownTextProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('divider', className)
  const rest = getUnhandledProps(DropdownText, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType
      aria-atomic
      aria-live='polite'
      role='alert'
      {...rest}
      className={classes}
      ref={ref}
    >
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

DropdownText.displayName = 'DropdownText'
DropdownText.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

DropdownText.create = createShorthandFactory(DropdownText, (val) => ({ content: val }))

export default DropdownText
