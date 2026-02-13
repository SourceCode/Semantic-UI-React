import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'
import RevealContent from './RevealContent'

export type RevealAnimatedProp =
  | 'fade'
  | 'small fade'
  | 'move'
  | 'move right'
  | 'move up'
  | 'move down'
  | 'rotate'
  | 'rotate left'

export interface StrictRevealProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** An active reveal displays its hidden content. */
  active?: boolean
  /** An animation name that will be applied to Reveal. */
  animated?: RevealAnimatedProp
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A disabled reveal will not animate when hovered. */
  disabled?: boolean
  /** An element can show its content without delay. */
  instant?: boolean
}

export interface RevealProps extends StrictRevealProps {
  [key: string]: any
}

/**
 * A reveal displays additional content in place of previous content when activated.
 */
function Reveal({ ref, ...props }: RevealProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, animated, children, className, content, disabled, instant } = props

  const classes = cx(
    'ui',
    animated,
    getKeyOnly(active, 'active'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(instant, 'instant'),
    'reveal',
    className,
  )
  const rest = getUnhandledProps(Reveal, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

Reveal.displayName = 'Reveal'
Reveal.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
  'disabled',
  'instant',
]

Reveal.Content = RevealContent

export default Reveal
