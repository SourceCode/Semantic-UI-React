import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
} from '../../lib'
import type { SemanticShorthandCollection, SemanticShorthandContent } from '../../generic'
import type { ItemProps } from './Item'
import Item from './Item'

export interface StrictItemGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Items can be divided to better distinguish between grouped content. */
  divided?: boolean

  /** Shorthand array of props for Item. */
  items?: SemanticShorthandCollection<ItemProps>

  /** An item can be formatted so that the entire contents link to another page. */
  link?: boolean

  /** A group of items can relax its padding to provide more negative space. */
  relaxed?: boolean | 'very'

  /** Prevent items from stacking on mobile. */
  unstackable?: boolean
}

export interface ItemGroupProps extends StrictItemGroupProps {
  [key: string]: any
}

/**
 * A group of items.
 */
function ItemGroup({ ref, ...props }: ItemGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, divided, items, link, relaxed, unstackable } = props

  const classes = cx(
    'ui',
    getKeyOnly(divided, 'divided'),
    getKeyOnly(link, 'link'),
    getKeyOnly(unstackable, 'unstackable'),
    getKeyOrValueAndKey(relaxed, 'relaxed'),
    'items',
    className,
  )
  const rest = getUnhandledProps(ItemGroup, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }
  if (!childrenUtils.isNil(content)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {content}
      </ElementType>
    )
  }

  const itemsJSX = _.map(items, (item: any) => {
    const { childKey, ...itemProps } = item
    const finalKey =
      childKey ??
      [itemProps.content, itemProps.description, itemProps.header, itemProps.meta].join('-')

    return <Item {...itemProps} key={finalKey} />
  })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {itemsJSX}
    </ElementType>
  )
}

ItemGroup.displayName = 'ItemGroup'
ItemGroup.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'divided',
  'items',
  'link',
  'relaxed',
  'unstackable',
]

export default ItemGroup
