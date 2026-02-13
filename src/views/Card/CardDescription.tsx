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

export interface StrictCardDescriptionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A card description can adjust its text alignment. */
  textAlign?: 'center' | 'left' | 'right'
}

export interface CardDescriptionProps extends StrictCardDescriptionProps {
  [key: string]: any
}

/**
 * A card can contain a description with one or more paragraphs.
 */
function CardDescription({ ref, ...props }: CardDescriptionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, textAlign } = props
  const classes = cx(getTextAlignProp(textAlign), 'description', className)
  const rest = getUnhandledProps(CardDescription, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CardDescription.displayName = 'CardDescription'
CardDescription.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'textAlign',
]

CardDescription.create = createShorthandFactory(CardDescription, (content) => ({ content }))

export default CardDescription
