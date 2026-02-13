import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictItemDescriptionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ItemDescriptionProps extends StrictItemDescriptionProps {
  [key: string]: any
}

/**
 * An item can contain a description with a single or multiple paragraphs.
 */
function ItemDescription({ ref, ...props }: ItemDescriptionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('description', className)
  const rest = getUnhandledProps(ItemDescription, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ItemDescription.displayName = 'ItemDescription'
ItemDescription.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

ItemDescription.create = createShorthandFactory(ItemDescription, (content) => ({ content }))

export default ItemDescription
