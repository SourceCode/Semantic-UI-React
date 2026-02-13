import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictItemMetaProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ItemMetaProps extends StrictItemMetaProps {
  [key: string]: any
}

/**
 * An item can contain content metadata.
 */
function ItemMeta({ ref, ...props }: ItemMetaProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('meta', className)
  const rest = getUnhandledProps(ItemMeta, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ItemMeta.displayName = 'ItemMeta'
ItemMeta.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

ItemMeta.create = createShorthandFactory(ItemMeta, (content) => ({ content }))

export default ItemMeta
