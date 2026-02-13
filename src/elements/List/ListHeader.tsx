import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictListHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ListHeaderProps extends StrictListHeaderProps {
  [key: string]: any
}

/**
 * A list item can contain a header.
 */
function ListHeader({ ref, ...props }: ListHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('header', className)
  const rest = getUnhandledProps(ListHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ListHeader.displayName = 'ListHeader'
ListHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

ListHeader.create = createShorthandFactory(ListHeader, (content) => ({ content }))

export default ListHeader
