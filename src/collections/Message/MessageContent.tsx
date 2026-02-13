import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictMessageContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface MessageContentProps extends StrictMessageContentProps {
  [key: string]: any
}

/**
 * A message can contain a content.
 */
function MessageContent({ ref, ...props }: MessageContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('content', className)
  const rest = getUnhandledProps(MessageContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

MessageContent.displayName = 'MessageContent'
MessageContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default MessageContent
