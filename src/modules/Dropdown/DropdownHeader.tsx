import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictDropdownHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Shorthand for Icon. */
  icon?: SemanticShorthandItem<IconProps>
}

export interface DropdownHeaderProps extends StrictDropdownHeaderProps {
  [key: string]: any
}

/**
 * A dropdown menu can contain a header.
 */
function DropdownHeader({ ref, ...props }: DropdownHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, icon } = props

  const classes = cx('header', className)
  const rest = getUnhandledProps(DropdownHeader, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}

DropdownHeader.displayName = 'DropdownHeader'
DropdownHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'icon',
]

DropdownHeader.create = createShorthandFactory(DropdownHeader, (content) => ({ content }))

export default DropdownHeader
