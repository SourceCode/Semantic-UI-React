import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictStatisticValueProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Format the value with smaller font size to fit nicely beside number values. */
  text?: boolean
}

export interface StatisticValueProps extends StrictStatisticValueProps {
  [key: string]: any
}

/**
 * A statistic can contain a numeric, icon, image, or text value.
 */
function StatisticValue({ ref, ...props }: StatisticValueProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, text } = props

  const classes = cx(getKeyOnly(text, 'text'), 'value', className)
  const rest = getUnhandledProps(StatisticValue, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

StatisticValue.displayName = 'StatisticValue'
StatisticValue.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'text',
]

StatisticValue.create = createShorthandFactory(StatisticValue, (content) => ({ content }))

export default StatisticValue
