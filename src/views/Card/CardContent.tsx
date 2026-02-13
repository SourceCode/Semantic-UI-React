import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthand,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getTextAlignProp,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { CardDescriptionProps } from './CardDescription'
import type { CardHeaderProps } from './CardHeader'
import type { CardMetaProps } from './CardMeta'
import CardDescription from './CardDescription'
import CardHeader from './CardHeader'
import CardMeta from './CardMeta'

export interface StrictCardContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Shorthand for CardDescription. */
  description?: SemanticShorthandItem<CardDescriptionProps>

  /** A card can contain extra content meant to be formatted separately from the main content. */
  extra?: boolean

  /** Shorthand for CardHeader. */
  header?: SemanticShorthandItem<CardHeaderProps>

  /** Shorthand for CardMeta. */
  meta?: SemanticShorthandItem<CardMetaProps>

  /** A card content can adjust its text alignment. */
  textAlign?: 'center' | 'left' | 'right'
}

export interface CardContentProps extends StrictCardContentProps {
  [key: string]: any
}

/**
 * A card can contain blocks of content or extra content meant to be formatted separately from the main content.
 */
function CardContent({ ref, ...props }: CardContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, description, extra, header, meta, textAlign } = props

  const classes = cx(getKeyOnly(extra, 'extra'), getTextAlignProp(textAlign), 'content', className)
  const rest = getUnhandledProps(CardContent, props)
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

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {createShorthand(CardHeader, (val) => ({ content: val }), header, { autoGenerateKey: false })}
      {createShorthand(CardMeta, (val) => ({ content: val }), meta, { autoGenerateKey: false })}
      {createShorthand(CardDescription, (val) => ({ content: val }), description, {
        autoGenerateKey: false,
      })}
    </ElementType>
  )
}

CardContent.displayName = 'CardContent'
CardContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'description',
  'extra',
  'header',
  'meta',
  'textAlign',
]

export default CardContent
