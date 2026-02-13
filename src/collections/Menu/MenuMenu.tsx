import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictMenuMenuProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A sub menu can take left or right position. */
  position?: 'left' | 'right'
}

export interface MenuMenuProps extends StrictMenuMenuProps {
  [key: string]: any
}

/**
 * A menu can contain a sub menu.
 */
function MenuMenu({ ref, ...props }: MenuMenuProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, position } = props

  const classes = cx(position, 'menu', className)
  const rest = getUnhandledProps(MenuMenu, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

MenuMenu.displayName = 'MenuMenu'
MenuMenu.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'position',
]

export default MenuMenu
