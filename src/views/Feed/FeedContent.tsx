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
import FeedExtra from './FeedExtra'
import type { FeedExtraProps } from './FeedExtra'
import FeedMeta from './FeedMeta'
import type { FeedMetaProps } from './FeedMeta'
import FeedSummary from './FeedSummary'
import type { FeedSummaryProps } from './FeedSummary'

export interface StrictFeedContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** An event can contain a date. */
  date?: SemanticShorthandItem<FeedDateProps>

  /** Shorthand for FeedExtra with images. */
  extraImages?: SemanticShorthandItem<FeedExtraProps>

  /** Shorthand for FeedExtra with text. */
  extraText?: SemanticShorthandItem<FeedExtraProps>

  /** Shorthand for FeedMeta. */
  meta?: SemanticShorthandItem<FeedMetaProps>

  /** Shorthand for FeedSummary. */
  summary?: SemanticShorthandItem<FeedSummaryProps>
}

export interface FeedContentProps extends StrictFeedContentProps {
  [key: string]: any
}

function FeedContent({ ref, ...props }: FeedContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, extraImages, extraText, date, meta, summary } = props

  const classes = cx('content', className)
  const rest = getUnhandledProps(FeedContent, props)
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
      {createShorthand(FeedDate, (val) => ({ content: val }), date, { autoGenerateKey: false })}
      {createShorthand(FeedSummary, (val) => ({ content: val }), summary, {
        autoGenerateKey: false,
      })}
      {content}
      {createShorthand(FeedExtra, (val) => ({ text: true, content: val }), extraText, {
        autoGenerateKey: false,
      })}
      {createShorthand(FeedExtra, (val) => ({ images: val }), extraImages, {
        autoGenerateKey: false,
      })}
      {createShorthand(FeedMeta, (val) => ({ content: val }), meta, { autoGenerateKey: false })}
    </ElementType>
  )
}

FeedContent.displayName = 'FeedContent'
FeedContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'date',
  'extraImages',
  'extraText',
  'meta',
  'summary',
]

export default FeedContent
