import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictCommentAuthorProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface CommentAuthorProps extends StrictCommentAuthorProps {
  [key: string]: any
}

/**
 * A comment can contain an author.
 */
function CommentAuthor({ ref, ...props }: CommentAuthorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, children, content } = props
  const classes = cx('author', className)
  const rest = getUnhandledProps(CommentAuthor, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CommentAuthor.displayName = 'CommentAuthor'
CommentAuthor.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default CommentAuthor
