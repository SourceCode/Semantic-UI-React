import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
  getValueAndKey,
  getVerticalAlignProp,
} from '../../lib'
import type {
  SemanticFLOATS,
  SemanticShorthandCollection,
  SemanticShorthandContent,
  SemanticSIZES,
  SemanticVERTICALALIGNMENTS,
} from '../../generic'
import ListContent from './ListContent'
import ListDescription from './ListDescription'
import ListHeader from './ListHeader'
import ListIcon from './ListIcon'
import ListItem from './ListItem'
import type { ListItemProps } from './ListItem'
import ListList from './ListList'

export interface StrictListProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** A list can animate to set the current item apart from the list. */
  animated?: boolean
  /** A list can mark items with a bullet. */
  bulleted?: boolean
  /** A list can divide its items into cells. */
  celled?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A list can show divisions between content. */
  divided?: boolean
  /** An list can be floated left or right. */
  floated?: SemanticFLOATS
  /** A list can be formatted to have items appear horizontally. */
  horizontal?: boolean
  /** A list can be inverted to appear on a dark background. */
  inverted?: boolean
  /** Shorthand array of props for ListItem. */
  items?: SemanticShorthandCollection<ListItemProps>
  /** A list can be specially formatted for navigation links. */
  link?: boolean
  /**
   * onClick handler for ListItem. Mutually exclusive with children.
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All item props.
   */
  onItemClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: ListItemProps) => void
  /** A list can be ordered numerically. */
  ordered?: boolean
  /** A list can relax its padding to provide more negative space. */
  relaxed?: boolean | 'very'
  /** A selection list formats list items as possible choices. */
  selection?: boolean
  /** A list can vary in size. */
  size?: SemanticSIZES
  /** An element inside a list can be vertically aligned. */
  verticalAlign?: SemanticVERTICALALIGNMENTS
}

export interface ListProps extends StrictListProps {
  [key: string]: any
}

/**
 * A list groups related content.
 */
function List({ ref, ...props }: ListProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    animated,
    bulleted,
    celled,
    children,
    className,
    content,
    divided,
    floated,
    horizontal,
    inverted,
    items,
    link,
    ordered,
    relaxed,
    selection,
    size,
    verticalAlign,
  } = props

  const classes = cx(
    'ui',
    size,
    getKeyOnly(animated, 'animated'),
    getKeyOnly(bulleted, 'bulleted'),
    getKeyOnly(celled, 'celled'),
    getKeyOnly(divided, 'divided'),
    getKeyOnly(horizontal, 'horizontal'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(link, 'link'),
    getKeyOnly(ordered, 'ordered'),
    getKeyOnly(selection, 'selection'),
    getKeyOrValueAndKey(relaxed, 'relaxed'),
    getValueAndKey(floated, 'floated'),
    getVerticalAlignProp(verticalAlign),
    'list',
    className,
  )
  const rest = getUnhandledProps(List, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType role='list' {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  if (!childrenUtils.isNil(content)) {
    return (
      <ElementType role='list' {...rest} className={classes} ref={ref}>
        {content}
      </ElementType>
    )
  }

  return (
    <ElementType role='list' {...rest} className={classes} ref={ref}>
      {_.map(items, (item) =>
        ListItem.create(item, {
          overrideProps: (predefinedProps: any) => ({
            onClick: (e: React.MouseEvent<HTMLAnchorElement>, itemProps: ListItemProps) => {
              _.invoke(predefinedProps, 'onClick', e, itemProps)
              _.invoke(props, 'onItemClick', e, itemProps)
            },
          }),
        }),
      )}
    </ElementType>
  )
}

List.displayName = 'List'
List.handledProps = [
  'as',
  'animated',
  'bulleted',
  'celled',
  'children',
  'className',
  'content',
  'divided',
  'floated',
  'horizontal',
  'inverted',
  'items',
  'link',
  'onItemClick',
  'ordered',
  'relaxed',
  'selection',
  'size',
  'verticalAlign',
]

List.Content = ListContent
List.Description = ListDescription
List.Header = ListHeader
List.Icon = ListIcon
List.Item = ListItem
List.List = ListList

export default List
