import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictListDescriptionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ListDescriptionProps extends StrictListDescriptionProps {
  [key: string]: any
}

/**
 * A list item can contain a description.
 */
function ListDescription({ ref, ...props }: ListDescriptionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx(className, 'description')
  const rest = getUnhandledProps(ListDescription, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ListDescription.displayName = 'ListDescription'
ListDescription.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

ListDescription.create = createShorthandFactory(ListDescription, (content) => ({ content }))

export default ListDescription
