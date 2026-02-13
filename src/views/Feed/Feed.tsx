import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandCollection } from '../../generic'
import FeedContent from './FeedContent'
import FeedDate from './FeedDate'
import FeedEvent from './FeedEvent'
import type { FeedEventProps } from './FeedEvent'
import FeedExtra from './FeedExtra'
import FeedLabel from './FeedLabel'
import FeedLike from './FeedLike'
import FeedMeta from './FeedMeta'
import FeedSummary from './FeedSummary'
import FeedUser from './FeedUser'

export interface StrictFeedProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand array of props for FeedEvent. */
  events?: SemanticShorthandCollection<FeedEventProps>

  /** A feed can have different sizes. */
  size?: 'small' | 'large'
}

export interface FeedProps extends StrictFeedProps {
  [key: string]: any
}

/**
 * A feed presents user activity chronologically.
 */
function Feed({ ref, ...props }: FeedProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, events, size } = props

  const classes = cx('ui', size, 'feed', className)
  const rest = getUnhandledProps(Feed, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  const eventElements = _.map(events, (eventProps: any) => {
    const { childKey, date, meta, summary, ...eventData } = eventProps
    const finalKey = childKey ?? [date, meta, summary].join('-')

    // TODO: use .create() factory
    return <FeedEvent date={date} key={finalKey} meta={meta} summary={summary} {...eventData} />
  })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {eventElements}
    </ElementType>
  )
}

Feed.displayName = 'Feed'
Feed.handledProps = [
  'as',
  'children',
  'className',
  'events',
  'size',
]

Feed.Content = FeedContent
Feed.Date = FeedDate
Feed.Event = FeedEvent
Feed.Extra = FeedExtra
Feed.Label = FeedLabel
Feed.Like = FeedLike
Feed.Meta = FeedMeta
Feed.Summary = FeedSummary
Feed.User = FeedUser

export default Feed
