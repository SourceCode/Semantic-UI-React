import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictHeaderContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface HeaderContentProps extends StrictHeaderContentProps {
  [key: string]: any
}

/**
 * Header content wraps the main content when there is an adjacent Icon or Image.
 */
function HeaderContent({ ref, ...props }: HeaderContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('content', className)
  const rest = getUnhandledProps(HeaderContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

HeaderContent.displayName = 'HeaderContent'
HeaderContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default HeaderContent
