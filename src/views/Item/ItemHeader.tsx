import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictItemHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ItemHeaderProps extends StrictItemHeaderProps {
  [key: string]: any
}

/**
 * An item can contain a header.
 */
function ItemHeader({ ref, ...props }: ItemHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('header', className)
  const rest = getUnhandledProps(ItemHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ItemHeader.displayName = 'ItemHeader'
ItemHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

ItemHeader.create = createShorthandFactory(ItemHeader, (content) => ({ content }))

export default ItemHeader
