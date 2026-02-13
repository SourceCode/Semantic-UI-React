import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictCommentActionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Style as the currently active action. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface CommentActionProps extends StrictCommentActionProps {
  [key: string]: any
}

/**
 * A comment can contain an action.
 */
function CommentAction({ ref, ...props }: CommentActionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, className, children, content } = props

  const classes = cx(getKeyOnly(active, 'active'), className)
  const rest = getUnhandledProps(CommentAction, props)
  const ElementType = getComponentType(props, { defaultAs: 'a' })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CommentAction.displayName = 'CommentAction'
CommentAction.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
]

export default CommentAction
