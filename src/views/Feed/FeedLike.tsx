import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictFeedLikeProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Shorthand for icon. Mutually exclusive with children. */
  icon?: SemanticShorthandItem<IconProps>
}

export interface FeedLikeProps extends StrictFeedLikeProps {
  [key: string]: any
}

/**
 * A feed can contain a like element.
 */
function FeedLike({ ref, ...props }: FeedLikeProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, icon } = props

  const classes = cx('like', className)
  const rest = getUnhandledProps(FeedLike, props)
  const ElementType = getComponentType(props, { defaultAs: 'a' })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}

FeedLike.displayName = 'FeedLike'
FeedLike.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'icon',
]

export default FeedLike
