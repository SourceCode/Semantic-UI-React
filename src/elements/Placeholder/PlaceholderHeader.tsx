import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictPlaceholderHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A placeholder can contain an image. */
  image?: boolean
}

export interface PlaceholderHeaderProps extends StrictPlaceholderHeaderProps {
  [key: string]: any
}

/**
 * A placeholder can contain a header.
 */
function PlaceholderHeader({ ref, ...props }: PlaceholderHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, image } = props
  const classes = cx(getKeyOnly(image, 'image'), 'header', className)
  const rest = getUnhandledProps(PlaceholderHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

PlaceholderHeader.displayName = 'PlaceholderHeader'
PlaceholderHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'image',
]

export default PlaceholderHeader
