import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictDividerProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Divider can clear the content above it. */
  clearing?: boolean
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Divider can be fitted without any space above or below it. */
  fitted?: boolean
  /** Divider can divide content without creating a dividing line. */
  hidden?: boolean
  /** Divider can segment content horizontally. */
  horizontal?: boolean
  /** Divider can have its colours inverted. */
  inverted?: boolean
  /** Divider can provide greater margins to divide sections of content. */
  section?: boolean
  /** Divider can segment content vertically. */
  vertical?: boolean
}

export interface DividerProps extends StrictDividerProps {
  [key: string]: any
}

/**
 * A divider visually segments content into groups.
 */
function Divider({ ref, ...props }: DividerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    children,
    className,
    clearing,
    content,
    fitted,
    hidden,
    horizontal,
    inverted,
    section,
    vertical,
  } = props

  const classes = cx(
    'ui',
    getKeyOnly(clearing, 'clearing'),
    getKeyOnly(fitted, 'fitted'),
    getKeyOnly(hidden, 'hidden'),
    getKeyOnly(horizontal, 'horizontal'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(section, 'section'),
    getKeyOnly(vertical, 'vertical'),
    'divider',
    className,
  )
  const rest = getUnhandledProps(Divider, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

Divider.displayName = 'Divider'
Divider.handledProps = [
  'as',
  'children',
  'className',
  'clearing',
  'content',
  'fitted',
  'hidden',
  'horizontal',
  'inverted',
  'section',
  'vertical',
]

export default Divider
