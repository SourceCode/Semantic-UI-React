import cx from 'clsx'
import * as React from 'react'

import { createShorthand, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import FeedContent from './FeedContent'
import type { FeedContentProps } from './FeedContent'
import type { FeedDateProps } from './FeedDate'
import type { FeedExtraProps } from './FeedExtra'
import FeedLabel from './FeedLabel'
import type { FeedLabelProps } from './FeedLabel'
import type { FeedMetaProps } from './FeedMeta'
import type { FeedSummaryProps } from './FeedSummary'

export interface StrictFeedEventProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for FeedContent. */
  content?: SemanticShorthandItem<FeedContentProps>

  /** Shorthand for FeedDate. */
  date?: SemanticShorthandItem<FeedDateProps>

  /** Shorthand for FeedExtra with images. */
  extraImages?: SemanticShorthandItem<FeedExtraProps>

  /** Shorthand for FeedExtra with content. */
  extraText?: SemanticShorthandItem<FeedExtraProps>

  /** An event can contain icon label. */
  icon?: SemanticShorthandItem<FeedLabelProps>

  /** An event can contain image label. */
  image?: SemanticShorthandItem<FeedLabelProps>

  /** Shorthand for FeedMeta. */
  meta?: SemanticShorthandItem<FeedMetaProps>

  /** Shorthand for FeedSummary. */
  summary?: SemanticShorthandItem<FeedSummaryProps>
}

export interface FeedEventProps extends StrictFeedEventProps {
  [key: string]: any
}

/**
 * A feed contains an event.
 */
function FeedEvent({ ref, ...props }: FeedEventProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    content,
    children,
    className,
    date,
    extraImages,
    extraText,
    image,
    icon,
    meta,
    summary,
  } = props

  const classes = cx('event', className)
  const rest = getUnhandledProps(FeedEvent, props)
  const ElementType = getComponentType(props)

  const hasContentProp = content || date || extraImages || extraText || meta || summary
  const contentProps = { content, date, extraImages, extraText, meta, summary }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {createShorthand(FeedLabel, (val) => ({ icon: val }), icon, { autoGenerateKey: false })}
      {createShorthand(FeedLabel, (val) => ({ image: val }), image, { autoGenerateKey: false })}
      {hasContentProp && <FeedContent {...(contentProps as any)} />}
      {children}
    </ElementType>
  )
}

FeedEvent.displayName = 'FeedEvent'
FeedEvent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'date',
  'extraImages',
  'extraText',
  'icon',
  'image',
  'meta',
  'summary',
]

export default FeedEvent
