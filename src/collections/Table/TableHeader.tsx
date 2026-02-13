import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictTableHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A definition table can have a full width header or footer, filling in the gap left by the first column. */
  fullWidth?: boolean
}

export interface TableHeaderProps extends StrictTableHeaderProps {
  [key: string]: any
}

/**
 * A table can have a header.
 */
function TableHeader({ ref, ...props }: TableHeaderProps & { ref?: React.Ref<HTMLTableSectionElement> }) {
  const { children, className, content, fullWidth } = props

  const classes = cx(getKeyOnly(fullWidth, 'full-width'), className)
  const rest = getUnhandledProps(TableHeader, props)
  const ElementType = getComponentType(props, { defaultAs: 'thead' })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

TableHeader.displayName = 'TableHeader'
TableHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'fullWidth',
]

export default TableHeader
