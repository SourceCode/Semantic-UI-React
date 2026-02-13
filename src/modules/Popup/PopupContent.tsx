import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictPopupContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface PopupContentProps extends StrictPopupContentProps {
  [key: string]: any
}

/**
 * A PopupContent displays the content body of a Popover.
 */
function PopupContent({ ref, ...props }: PopupContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('content', className)
  const rest = getUnhandledProps(PopupContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

PopupContent.displayName = 'PopupContent'
PopupContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

PopupContent.create = createShorthandFactory(PopupContent, (children: React.ReactNode) => ({ children }))

export default PopupContent
