import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictCommentActionsProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface CommentActionsProps extends StrictCommentActionsProps {
  [key: string]: any
}

/**
 * A comment can contain an list of actions a user may perform related to this comment.
 */
function CommentActions({ ref, ...props }: CommentActionsProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, children, content } = props
  const classes = cx('actions', className)
  const rest = getUnhandledProps(CommentActions, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CommentActions.displayName = 'CommentActions'
CommentActions.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default CommentActions
