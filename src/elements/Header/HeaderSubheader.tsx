import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictHeaderSubheaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface HeaderSubheaderProps extends StrictHeaderSubheaderProps {
  [key: string]: any
}

/**
 * Headers may contain subheaders.
 */
function HeaderSubheader({ ref, ...props }: HeaderSubheaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('sub header', className)
  const rest = getUnhandledProps(HeaderSubheader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

HeaderSubheader.displayName = 'HeaderSubheader'
HeaderSubheader.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

HeaderSubheader.create = createShorthandFactory(HeaderSubheader, (content) => ({ content }))

export default HeaderSubheader
