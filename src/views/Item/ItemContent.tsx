import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getVerticalAlignProp,
} from '../../lib'
import type {
  SemanticShorthandContent,
  SemanticShorthandItem,
  SemanticVERTICALALIGNMENTS,
} from '../../generic'
import ItemHeader from './ItemHeader'
import type { ItemHeaderProps } from './ItemHeader'
import ItemDescription from './ItemDescription'
import type { ItemDescriptionProps } from './ItemDescription'
import ItemExtra from './ItemExtra'
import type { ItemExtraProps } from './ItemExtra'
import ItemMeta from './ItemMeta'
import type { ItemMetaProps } from './ItemMeta'

export interface StrictItemContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Shorthand for ItemDescription component. */
  description?: SemanticShorthandItem<ItemDescriptionProps>

  /** Shorthand for ItemExtra component. */
  extra?: SemanticShorthandItem<ItemExtraProps>

  /** Shorthand for ItemHeader component. */
  header?: SemanticShorthandItem<ItemHeaderProps>

  /** Shorthand for ItemMeta component. */
  meta?: SemanticShorthandItem<ItemMetaProps>

  /** Content can specify its vertical alignment. */
  verticalAlign?: SemanticVERTICALALIGNMENTS
}

export interface ItemContentProps extends StrictItemContentProps {
  [key: string]: any
}

/**
 * An item can contain content.
 */
function ItemContent({ ref, ...props }: ItemContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, description, extra, header, meta, verticalAlign } = props

  const classes = cx(getVerticalAlignProp(verticalAlign), 'content', className)
  const rest = getUnhandledProps(ItemContent, props)
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
      {ItemHeader.create(header, { autoGenerateKey: false })}
      {ItemMeta.create(meta, { autoGenerateKey: false })}
      {ItemDescription.create(description, { autoGenerateKey: false })}
      {ItemExtra.create(extra, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}

ItemContent.displayName = 'ItemContent'
ItemContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'description',
  'extra',
  'header',
  'meta',
  'verticalAlign',
]

export default ItemContent
