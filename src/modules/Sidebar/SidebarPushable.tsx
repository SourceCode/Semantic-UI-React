import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictSidebarPushableProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface SidebarPushableProps extends StrictSidebarPushableProps {
  [key: string]: any
}

/**
 * A pushable sub-component for Sidebar.
 */
function SidebarPushable({ ref, ...props }: SidebarPushableProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, children, content } = props
  const classes = cx('pushable', className)
  const rest = getUnhandledProps(SidebarPushable, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

SidebarPushable.displayName = 'SidebarPushable'
SidebarPushable.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default SidebarPushable
