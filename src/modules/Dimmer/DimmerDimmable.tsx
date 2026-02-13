import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictDimmerDimmableProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A dimmable element can blur its contents. */
  blurring?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Controls whether or not the dim is displayed. */
  dimmed?: boolean
}

export interface DimmerDimmableProps extends StrictDimmerDimmableProps {
  [key: string]: any
}

/**
 * A dimmable sub-component for Dimmer.
 */
function DimmerDimmable({ ref, ...props }: DimmerDimmableProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { blurring, className, children, content, dimmed } = props

  const classes = cx(
    getKeyOnly(blurring, 'blurring'),
    getKeyOnly(dimmed, 'dimmed'),
    'dimmable',
    className,
  )
  const rest = getUnhandledProps(DimmerDimmable, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

DimmerDimmable.displayName = 'DimmerDimmable'
DimmerDimmable.handledProps = [
  'as',
  'blurring',
  'children',
  'className',
  'content',
  'dimmed',
]

export default DimmerDimmable
