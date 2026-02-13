import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictRevealContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A reveal may contain content that is visible before interaction. */
  hidden?: boolean
  /** A reveal may contain content that is hidden before user interaction. */
  visible?: boolean
}

export interface RevealContentProps extends StrictRevealContentProps {
  [key: string]: any
}

/**
 * A content sub-component for the Reveal.
 */
function RevealContent({ ref, ...props }: RevealContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, hidden, visible } = props

  const classes = cx(
    'ui',
    getKeyOnly(hidden, 'hidden'),
    getKeyOnly(visible, 'visible'),
    'content',
    className,
  )
  const rest = getUnhandledProps(RevealContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

RevealContent.displayName = 'RevealContent'
RevealContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'hidden',
  'visible',
]

export default RevealContent
