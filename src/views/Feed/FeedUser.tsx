import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictFeedUserProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface FeedUserProps extends StrictFeedUserProps {
  [key: string]: any
}

/**
 * A feed can contain a user element.
 */
function FeedUser({ ref, ...props }: FeedUserProps & { ref?: React.Ref<HTMLAnchorElement> }) {
  const { children, className, content } = props

  const classes = cx('user', className)
  const rest = getUnhandledProps(FeedUser, props)
  const ElementType = getComponentType(props, { defaultAs: 'a' })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

FeedUser.displayName = 'FeedUser'
FeedUser.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default FeedUser
