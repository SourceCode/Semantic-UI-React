import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthand,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import FeedDate from './FeedDate'
import type { FeedDateProps } from './FeedDate'
import FeedUser from './FeedUser'
import type { FeedUserProps } from './FeedUser'

export interface StrictFeedSummaryProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Shorthand for FeedDate. */
  date?: SemanticShorthandItem<FeedDateProps>

  /** Shorthand for FeedUser. */
  user?: SemanticShorthandItem<FeedUserProps>
}

export interface FeedSummaryProps extends StrictFeedSummaryProps {
  [key: string]: any
}

/**
 * A feed can contain a summary.
 */
function FeedSummary({ ref, ...props }: FeedSummaryProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, date, user } = props

  const classes = cx('summary', className)
  const rest = getUnhandledProps(FeedSummary, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {createShorthand(FeedUser, (val) => ({ content: val }), user, { autoGenerateKey: false })}
      {/*
        Content styles require wrapping whitespace
        https://github.com/Semantic-Org/Semantic-UI-React/pull/3836
      */}
      {content && ' '}
      {content}
      {content && ' '}
      {createShorthand(FeedDate, (val) => ({ content: val }), date, { autoGenerateKey: false })}
    </ElementType>
  )
}

FeedSummary.displayName = 'FeedSummary'
FeedSummary.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'date',
  'user',
]

export default FeedSummary
