import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictMessageHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface MessageHeaderProps extends StrictMessageHeaderProps {
  [key: string]: any
}

/**
 * A message can contain a header.
 */
function MessageHeader({ ref, ...props }: MessageHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('header', className)
  const rest = getUnhandledProps(MessageHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

MessageHeader.displayName = 'MessageHeader'
MessageHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

MessageHeader.create = createShorthandFactory(MessageHeader, (val) => ({ content: val }))

export default MessageHeader
