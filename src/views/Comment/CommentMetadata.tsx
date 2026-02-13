import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictCommentMetadataProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface CommentMetadataProps extends StrictCommentMetadataProps {
  [key: string]: any
}

/**
 * A comment can contain metadata about the comment, an arbitrary amount of metadata may be defined.
 */
function CommentMetadata({ ref, ...props }: CommentMetadataProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, children, content } = props
  const classes = cx('metadata', className)
  const rest = getUnhandledProps(CommentMetadata, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

CommentMetadata.displayName = 'CommentMetadata'
CommentMetadata.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default CommentMetadata
