import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandCollection } from '../../generic'
import type { MessageItemProps } from './MessageItem'
import MessageItem from './MessageItem'

export interface StrictMessageListProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand Message.Items. */
  items?: SemanticShorthandCollection<MessageItemProps>
}

export interface MessageListProps extends StrictMessageListProps {
  [key: string]: any
}

/**
 * A message can contain a list of items.
 */
function MessageList({ ref, ...props }: MessageListProps & { ref?: React.Ref<HTMLUListElement> }) {
  const { children, className, items } = props

  const classes = cx('list', className)
  const rest = getUnhandledProps(MessageList, props)
  const ElementType = getComponentType(props, { defaultAs: 'ul' })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? _.map(items, MessageItem.create) : children}
    </ElementType>
  )
}

MessageList.displayName = 'MessageList'
MessageList.handledProps = [
  'as',
  'children',
  'className',
  'items',
]

MessageList.create = createShorthandFactory(MessageList, (val) => ({ items: val }))

export default MessageList
