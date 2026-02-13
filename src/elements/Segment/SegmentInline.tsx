import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictSegmentInlineProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface SegmentInlineProps extends StrictSegmentInlineProps {
  [key: string]: any
}

/**
 * A placeholder segment can be inline.
 */
function SegmentInline({ ref, ...props }: SegmentInlineProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('inline', className)
  const rest = getUnhandledProps(SegmentInline, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

SegmentInline.displayName = 'SegmentInline'
SegmentInline.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default SegmentInline
