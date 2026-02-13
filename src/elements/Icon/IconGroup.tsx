import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export type IconSizeProp = 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'

export interface StrictIconGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Size of the icon group. */
  size?: IconSizeProp
}

export interface IconGroupProps extends StrictIconGroupProps {
  [key: string]: any
}

/**
 * Several icons can be used together as a group.
 */
function IconGroup({ ref, ...props }: IconGroupProps & { ref?: React.Ref<HTMLElement> }) {
  const { children, className, content, size } = props

  const classes = cx(size, 'icons', className)
  const rest = getUnhandledProps(IconGroup, props)
  const ElementType = getComponentType(props, { defaultAs: 'i' })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

IconGroup.displayName = 'IconGroup'
IconGroup.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'size',
]

export default IconGroup
