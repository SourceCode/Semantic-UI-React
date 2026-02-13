import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictCommentContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface CommentContentProps extends StrictCommentContentProps {
  [key: string]: any
}

/**
 * A comment can contain content.
 */
function CommentContent({ ref, ...props }: CommentContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, children, content } = props
  const classes = cx(className, 'content')
  const rest = getUnhandledProps(CommentContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CommentContent.displayName = 'CommentContent'
CommentContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default CommentContent
