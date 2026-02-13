import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictListListProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ListListProps extends StrictListListProps {
  [key: string]: any
}

/**
 * A list can contain a sub list.
 */
function ListList({ ref, ...props }: ListListProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const rest = getUnhandledProps(ListList, props)
  const ElementType = getComponentType(props)
  const classes = cx(getKeyOnly(ElementType !== 'ul' && ElementType !== 'ol', 'list'), className)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ListList.displayName = 'ListList'
ListList.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default ListList
