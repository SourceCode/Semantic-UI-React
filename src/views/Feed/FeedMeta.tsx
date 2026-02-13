import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthand,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import FeedLike from './FeedLike'
import type { FeedLikeProps } from './FeedLike'

export interface StrictFeedMetaProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Shorthand for FeedLike. */
  like?: SemanticShorthandItem<FeedLikeProps>
}

export interface FeedMetaProps extends StrictFeedMetaProps {
  [key: string]: any
}

/**
 * A feed can contain a meta.
 */
function FeedMeta({ ref, ...props }: FeedMetaProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, like } = props

  const classes = cx('meta', className)
  const rest = getUnhandledProps(FeedMeta, props)
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
      {createShorthand(FeedLike, (val) => ({ content: val }), like, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}

FeedMeta.displayName = 'FeedMeta'
FeedMeta.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'like',
]

export default FeedMeta
