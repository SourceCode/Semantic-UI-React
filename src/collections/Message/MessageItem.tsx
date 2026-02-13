import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictMessageItemProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface MessageItemProps extends StrictMessageItemProps {
  [key: string]: any
}

/**
 * A message list can contain an item.
 */
function MessageItem({ ref, ...props }: MessageItemProps & { ref?: React.Ref<HTMLLIElement> }) {
  const { children, className, content } = props

  const classes = cx('content', className)
  const rest = getUnhandledProps(MessageItem, props)
  const ElementType = getComponentType(props, { defaultAs: 'li' })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

MessageItem.displayName = 'MessageItem'
MessageItem.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

MessageItem.create = createShorthandFactory(MessageItem, (content) => ({ content }))

export default MessageItem
