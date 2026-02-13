import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictItemExtraProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ItemExtraProps extends StrictItemExtraProps {
  [key: string]: any
}

/**
 * An item can contain extra content meant to be formatted separately from the main content.
 */
function ItemExtra({ ref, ...props }: ItemExtraProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('extra', className)
  const rest = getUnhandledProps(ItemExtra, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ItemExtra.displayName = 'ItemExtra'
ItemExtra.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

ItemExtra.create = createShorthandFactory(ItemExtra, (content) => ({ content }))

export default ItemExtra
