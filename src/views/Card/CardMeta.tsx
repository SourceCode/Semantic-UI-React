import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getTextAlignProp,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictCardMetaProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A card meta can adjust its text alignment. */
  textAlign?: 'center' | 'left' | 'right'
}

export interface CardMetaProps extends StrictCardMetaProps {
  [key: string]: any
}

/**
 * A card can contain content metadata.
 */
function CardMeta({ ref, ...props }: CardMetaProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, textAlign } = props
  const classes = cx(getTextAlignProp(textAlign), 'meta', className)
  const rest = getUnhandledProps(CardMeta, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CardMeta.displayName = 'CardMeta'
CardMeta.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'textAlign',
]

CardMeta.create = createShorthandFactory(CardMeta, (content) => ({ content }))

export default CardMeta
