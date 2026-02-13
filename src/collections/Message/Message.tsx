import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createHTMLParagraph,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
  useEventCallback,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticShorthandCollection,
  SemanticShorthandContent,
  SemanticShorthandItem,
} from '../../generic'
import Icon from '../../elements/Icon'
import type { MessageHeaderProps } from './MessageHeader'
import type { MessageItemProps } from './MessageItem'
import MessageContent from './MessageContent'
import MessageHeader from './MessageHeader'
import MessageList from './MessageList'
import MessageItem from './MessageItem'

export type MessageSizeProp = 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'

export interface StrictMessageProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A message can be formatted to attach itself to other content. */
  attached?: boolean | 'bottom' | 'top'

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A message can be formatted to be different colors. */
  color?: SemanticCOLORS

  /** A message can only take up the width of its content. */
  compact?: boolean

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A message may be formatted to display a negative message. Same as `negative`. */
  error?: boolean

  /** A message can float above content that it is related to. */
  floating?: boolean

  /** Shorthand for MessageHeader. */
  header?: SemanticShorthandItem<MessageHeaderProps>

  /** A message can be hidden. */
  hidden?: boolean

  /** Add an icon by icon name or pass an <Icon />. */
  icon?: any | boolean

  /** A message may be formatted to display information. */
  info?: boolean

  /** Array shorthand items for the MessageList. Mutually exclusive with children. */
  list?: SemanticShorthandCollection<MessageItemProps>

  /** A message may be formatted to display a negative message. Same as `error`. */
  negative?: boolean

  /**
   * A message that the user can choose to hide.
   * Called when the user clicks the "x" icon. This also adds the "x" icon.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onDismiss?: (event: React.MouseEvent<HTMLElement>, data: MessageProps) => void

  /** A message may be formatted to display a positive message. Same as `success`. */
  positive?: boolean

  /** A message can have different sizes. */
  size?: MessageSizeProp

  /** A message may be formatted to display a positive message. Same as `positive`. */
  success?: boolean

  /** A message can be set to visible to force itself to be shown. */
  visible?: boolean

  /** A message may be formatted to display warning messages. */
  warning?: boolean
}

export interface MessageProps extends StrictMessageProps {
  [key: string]: any
}

/**
 * A message displays information that explains nearby content.
 * @see Form
 */
function Message({ ref, ...props }: MessageProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    attached,
    children,
    className,
    color,
    compact,
    content,
    error,
    floating,
    header,
    hidden,
    icon,
    info,
    list,
    negative,
    onDismiss,
    positive,
    size,
    success,
    visible,
    warning,
  } = props

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(compact, 'compact'),
    getKeyOnly(error, 'error'),
    getKeyOnly(floating, 'floating'),
    getKeyOnly(hidden, 'hidden'),
    getKeyOnly(icon, 'icon'),
    getKeyOnly(info, 'info'),
    getKeyOnly(negative, 'negative'),
    getKeyOnly(positive, 'positive'),
    getKeyOnly(success, 'success'),
    getKeyOnly(visible, 'visible'),
    getKeyOnly(warning, 'warning'),
    getKeyOrValueAndKey(attached, 'attached'),
    'message',
    className,
  )
  const rest = getUnhandledProps(Message, props)
  const ElementType = getComponentType(props)

  const handleDismiss = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    _.invoke(props, 'onDismiss', e, props)
  })
  const dismissIcon = onDismiss && <Icon name='close' onClick={handleDismiss} />

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {dismissIcon}
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {dismissIcon}
      {Icon.create(icon, { autoGenerateKey: false })}
      {(!_.isNil(header) || !_.isNil(content) || !_.isNil(list)) && (
        <MessageContent>
          {MessageHeader.create(header, { autoGenerateKey: false })}
          {MessageList.create(list, { autoGenerateKey: false })}
          {createHTMLParagraph(content, { autoGenerateKey: false })}
        </MessageContent>
      )}
    </ElementType>
  )
}

Message.displayName = 'Message'
Message.handledProps = [
  'as',
  'attached',
  'children',
  'className',
  'color',
  'compact',
  'content',
  'error',
  'floating',
  'header',
  'hidden',
  'icon',
  'info',
  'list',
  'negative',
  'onDismiss',
  'positive',
  'size',
  'success',
  'visible',
  'warning',
]

Message.Content = MessageContent
Message.Header = MessageHeader
Message.List = MessageList
Message.Item = MessageItem

export default Message
