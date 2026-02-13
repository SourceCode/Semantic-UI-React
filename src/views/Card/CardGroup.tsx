import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getTextAlignProp,
  getWidthProp,
} from '../../lib'
import type {
  SemanticShorthandCollection,
  SemanticShorthandContent,
  SemanticWIDTHS,
} from '../../generic'
import type { CardProps } from './Card'
import Card from './Card'

export interface StrictCardGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A group of cards can center itself inside its container. */
  centered?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A group of cards can double its column width for mobile. */
  doubling?: boolean

  /** Shorthand array of props for Card. */
  items?: SemanticShorthandCollection<CardProps>

  /** A group of cards can set how many cards should exist in a row. */
  itemsPerRow?: SemanticWIDTHS

  /** A group of cards can automatically stack rows to a single columns on mobile devices. */
  stackable?: boolean

  /** A card group can adjust its text alignment. */
  textAlign?: 'center' | 'left' | 'right'
}

export interface CardGroupProps extends StrictCardGroupProps {
  [key: string]: any
}

/**
 * A group of cards.
 */
function CardGroup({ ref, ...props }: CardGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    centered,
    children,
    className,
    content,
    doubling,
    items,
    itemsPerRow,
    stackable,
    textAlign,
  } = props

  const classes = cx(
    'ui',
    getKeyOnly(centered, 'centered'),
    getKeyOnly(doubling, 'doubling'),
    getKeyOnly(stackable, 'stackable'),
    getTextAlignProp(textAlign),
    getWidthProp(itemsPerRow),
    'cards',
    className,
  )
  const rest = getUnhandledProps(CardGroup, props)
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
    const key = item.key ?? [item.header, item.description].join('-')
    return <Card key={key} {...item} />
  })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {itemsJSX}
    </ElementType>
  )
}

CardGroup.displayName = 'CardGroup'
CardGroup.handledProps = [
  'as',
  'centered',
  'children',
  'className',
  'content',
  'doubling',
  'items',
  'itemsPerRow',
  'stackable',
  'textAlign',
]

export default CardGroup
