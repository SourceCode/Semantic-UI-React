import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictStatisticLabelProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface StatisticLabelProps extends StrictStatisticLabelProps {
  [key: string]: any
}

/**
 * A statistic can contain a label to help provide context for the presented value.
 */
function StatisticLabel({ ref, ...props }: StatisticLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('label', className)
  const rest = getUnhandledProps(StatisticLabel, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

StatisticLabel.displayName = 'StatisticLabel'
StatisticLabel.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

StatisticLabel.create = createShorthandFactory(StatisticLabel, (content) => ({ content }))

export default StatisticLabel
