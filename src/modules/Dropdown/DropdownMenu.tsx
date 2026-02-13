import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictDropdownMenuProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A dropdown menu can open to the left or to the right. */
  direction?: 'left' | 'right'

  /** Whether or not the dropdown menu is displayed. */
  open?: boolean

  /** A dropdown menu can scroll. */
  scrolling?: boolean
}

export interface DropdownMenuProps extends StrictDropdownMenuProps {
  [key: string]: any
}

/**
 * A dropdown menu can contain a menu.
 */
function DropdownMenu({ ref, ...props }: DropdownMenuProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, direction, open, scrolling } = props

  const classes = cx(
    direction,
    getKeyOnly(open, 'visible'),
    getKeyOnly(scrolling, 'scrolling'),
    'menu transition',
    className,
  )
  const rest = getUnhandledProps(DropdownMenu, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

DropdownMenu.displayName = 'DropdownMenu'
DropdownMenu.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'direction',
  'open',
  'scrolling',
]

export default DropdownMenu
