import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictButtonContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Initially hidden, visible on hover. */
  hidden?: boolean
  /** Initially visible, hidden on hover. */
  visible?: boolean
}

export interface ButtonContentProps extends StrictButtonContentProps {
  [key: string]: any
}

/**
 * Used in some Button types, such as `animated`.
 */
function ButtonContent({ ref, ...props }: ButtonContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, hidden, visible } = props

  const classes = cx(
    getKeyOnly(visible, 'visible'),
    getKeyOnly(hidden, 'hidden'),
    'content',
    className,
  )
  const rest = getUnhandledProps(ButtonContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ButtonContent.displayName = 'ButtonContent'
ButtonContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'hidden',
  'visible',
]

export default ButtonContent
