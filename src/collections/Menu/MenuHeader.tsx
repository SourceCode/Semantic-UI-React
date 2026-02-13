import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictMenuHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface MenuHeaderProps extends StrictMenuHeaderProps {
  [key: string]: any
}

/**
 * A menu item may include a header or may itself be a header.
 */
function MenuHeader({ ref, ...props }: MenuHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('header', className)
  const rest = getUnhandledProps(MenuHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

MenuHeader.displayName = 'MenuHeader'
MenuHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default MenuHeader
