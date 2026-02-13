import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getValueAndKey,
  getVerticalAlignProp,
} from '../../lib'
import type {
  SemanticFLOATS,
  SemanticShorthandContent,
  SemanticShorthandItem,
  SemanticVERTICALALIGNMENTS,
} from '../../generic'
import type { ListDescriptionProps } from './ListDescription'
import type { ListHeaderProps } from './ListHeader'
import ListDescription from './ListDescription'
import ListHeader from './ListHeader'

export interface StrictListContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Shorthand for ListDescription. */
  description?: SemanticShorthandItem<ListDescriptionProps>
  /** An list content can be floated left or right. */
  floated?: SemanticFLOATS
  /** Shorthand for ListHeader. */
  header?: SemanticShorthandItem<ListHeaderProps>
  /** An element inside a list can be vertically aligned. */
  verticalAlign?: SemanticVERTICALALIGNMENTS
}

export interface ListContentProps extends StrictListContentProps {
  [key: string]: any
}

/**
 * A list item can contain a content.
 */
function ListContent({ ref, ...props }: ListContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, description, floated, header, verticalAlign } = props

  const classes = cx(
    getValueAndKey(floated, 'floated'),
    getVerticalAlignProp(verticalAlign),
    'content',
    className,
  )
  const rest = getUnhandledProps(ListContent, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {ListHeader.create(header)}
      {ListDescription.create(description)}
      {content}
    </ElementType>
  )
}

ListContent.displayName = 'ListContent'
ListContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'description',
  'floated',
  'header',
  'verticalAlign',
]

ListContent.create = createShorthandFactory(ListContent, (content) => ({ content }))

export default ListContent
