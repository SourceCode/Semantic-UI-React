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

export interface StrictCardHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A card header can adjust its text alignment. */
  textAlign?: 'center' | 'left' | 'right'
}

export interface CardHeaderProps extends StrictCardHeaderProps {
  [key: string]: any
}

/**
 * A card can contain a header.
 */
function CardHeader({ ref, ...props }: CardHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, textAlign } = props
  const classes = cx(getTextAlignProp(textAlign), 'header', className)
  const rest = getUnhandledProps(CardHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CardHeader.displayName = 'CardHeader'
CardHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'textAlign',
]

CardHeader.create = createShorthandFactory(CardHeader, (content) => ({ content }))

export default CardHeader
