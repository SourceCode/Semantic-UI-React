import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictCommentGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Comments can be collapsed, or hidden from view. */
  collapsed?: boolean

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Comments can hide extra information unless a user shows intent to interact with a comment */
  minimal?: boolean

  /** Comments can have different sizes. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'

  /** A comment list can be threaded to showing the relationship between conversations */
  threaded?: boolean
}

export interface CommentGroupProps extends StrictCommentGroupProps {
  [key: string]: any
}

/**
 * Comments can be grouped.
 */
function CommentGroup({ ref, ...props }: CommentGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, children, collapsed, content, minimal, size, threaded } = props

  const classes = cx(
    'ui',
    size,
    getKeyOnly(collapsed, 'collapsed'),
    getKeyOnly(minimal, 'minimal'),
    getKeyOnly(threaded, 'threaded'),
    'comments',
    className,
  )
  const rest = getUnhandledProps(CommentGroup, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CommentGroup.displayName = 'CommentGroup'
CommentGroup.handledProps = [
  'as',
  'children',
  'className',
  'collapsed',
  'content',
  'minimal',
  'size',
  'threaded',
]

export default CommentGroup
