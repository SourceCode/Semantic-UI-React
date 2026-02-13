import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
} from '../../lib'
import type { SemanticShorthandContent, SemanticSIZES } from '../../generic'

export interface StrictLoaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** A loader can be active or visible. */
  active?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A loader can be disabled or hidden. */
  disabled?: boolean
  /** A loader can show it's unsure of how long a task will take. */
  indeterminate?: boolean
  /** Loaders can appear inline with content. */
  inline?: boolean | 'centered'
  /** Loaders can have their colors inverted. */
  inverted?: boolean
  /** Loaders can have different sizes. */
  size?: SemanticSIZES
}

export interface LoaderProps extends StrictLoaderProps {
  [key: string]: any
}

/**
 * A loader alerts a user to wait for an activity to complete.
 * @see Dimmer
 */
function Loader({ ref, ...props }: LoaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active,
    children,
    className,
    content,
    disabled,
    indeterminate,
    inline,
    inverted,
    size,
  } = props

  const classes = cx(
    'ui',
    size,
    getKeyOnly(active, 'active'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(indeterminate, 'indeterminate'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(children || content, 'text'),
    getKeyOrValueAndKey(inline, 'inline'),
    'loader',
    className,
  )
  const rest = getUnhandledProps(Loader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

Loader.displayName = 'Loader'
Loader.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
  'disabled',
  'indeterminate',
  'inline',
  'inverted',
  'size',
]

export default Loader
