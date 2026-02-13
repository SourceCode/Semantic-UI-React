import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictPlaceholderParagraphProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface PlaceholderParagraphProps extends StrictPlaceholderParagraphProps {
  [key: string]: any
}

/**
 * A placeholder can contain a paragraph.
 */
function PlaceholderParagraph({ ref, ...props }: PlaceholderParagraphProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('paragraph', className)
  const rest = getUnhandledProps(PlaceholderParagraph, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

PlaceholderParagraph.displayName = 'PlaceholderParagraph'
PlaceholderParagraph.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default PlaceholderParagraph
