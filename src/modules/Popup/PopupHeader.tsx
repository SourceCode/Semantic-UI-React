import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictPopupHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface PopupHeaderProps extends StrictPopupHeaderProps {
  [key: string]: any
}

/**
 * A PopupHeader displays a header in a Popover.
 */
function PopupHeader({ ref, ...props }: PopupHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('header', className)
  const rest = getUnhandledProps(PopupHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

PopupHeader.displayName = 'PopupHeader'
PopupHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

PopupHeader.create = createShorthandFactory(PopupHeader, (children: React.ReactNode) => ({ children }))

export default PopupHeader
