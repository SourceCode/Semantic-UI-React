import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictSidebarPusherProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Controls whether or not the dim is displayed. */
  dimmed?: boolean
}

export interface SidebarPusherProps extends StrictSidebarPusherProps {
  [key: string]: any
}

/**
 * A pushable sub-component for Sidebar.
 */
function SidebarPusher({ ref, ...props }: SidebarPusherProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, dimmed, children, content } = props

  const classes = cx('pusher', getKeyOnly(dimmed, 'dimmed'), className)
  const rest = getUnhandledProps(SidebarPusher, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

SidebarPusher.displayName = 'SidebarPusher'
SidebarPusher.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'dimmed',
]

export default SidebarPusher
