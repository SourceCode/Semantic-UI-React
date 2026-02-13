import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'
import Segment from '../../elements/Segment/Segment'

export interface StrictTabPaneProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A tab pane can be active. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A Tab.Pane can display a loading indicator. */
  loading?: boolean
}

export interface TabPaneProps extends StrictTabPaneProps {
  [key: string]: any
}

/**
 * A tab pane holds the content of a tab.
 */
function TabPane({ ref, ...props }: TabPaneProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active = true, children, className, content, loading } = props

  const classes = cx(getKeyOnly(active, 'active'), getKeyOnly(loading, 'loading'), 'tab', className)
  const rest = getUnhandledProps(TabPane, props)
  const ElementType = getComponentType(props, { defaultAs: Segment })

  const calculatedDefaultProps: Record<string, any> = {}

  if (ElementType === Segment) {
    calculatedDefaultProps.attached = 'bottom'
  }

  return (
    <ElementType {...calculatedDefaultProps} {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

TabPane.displayName = 'TabPane'
TabPane.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
  'loading',
]

TabPane.create = createShorthandFactory(TabPane, (content) => ({ content }))

export default TabPane
