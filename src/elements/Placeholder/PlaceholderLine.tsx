import cx from 'clsx'
import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'

export interface StrictPlaceholderLineProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Additional classes. */
  className?: string
  /** A line can specify how long its contents should appear. */
  length?: 'full' | 'very long' | 'long' | 'medium' | 'short' | 'very short'
}

export interface PlaceholderLineProps extends StrictPlaceholderLineProps {
  [key: string]: any
}

/**
 * A placeholder can contain have lines of text.
 */
function PlaceholderLine({ ref, ...props }: PlaceholderLineProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, length } = props

  const classes = cx('line', length, className)
  const rest = getUnhandledProps(PlaceholderLine, props)
  const ElementType = getComponentType(props)

  return <ElementType {...rest} className={classes} ref={ref} />
}

PlaceholderLine.displayName = 'PlaceholderLine'
PlaceholderLine.handledProps = [
  'as',
  'className',
  'length',
]

export default PlaceholderLine
