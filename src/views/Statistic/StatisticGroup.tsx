import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getWidthProp,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticShorthandCollection,
  SemanticShorthandContent,
  SemanticWIDTHS,
} from '../../generic'
import type { StatisticProps, StatisticSizeProp } from './Statistic'
import Statistic from './Statistic'

export interface StrictStatisticGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A statistic group can be formatted to be different colors. */
  color?: SemanticCOLORS

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A statistic group can present its measurement horizontally. */
  horizontal?: boolean

  /** A statistic group can present its measurement horizontally. */
  inverted?: boolean

  /** Array of props for Statistic. */
  items?: SemanticShorthandCollection<StatisticProps>

  /** A statistic group can vary in size. */
  size?: StatisticSizeProp

  /** A statistic group can have its items divided evenly. */
  widths?: SemanticWIDTHS
}

export interface StatisticGroupProps extends StrictStatisticGroupProps {
  [key: string]: any
}

/**
 * A group of statistics.
 */
function StatisticGroup({ ref, ...props }: StatisticGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, color, content, horizontal, inverted, items, size, widths } = props

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(horizontal, 'horizontal'),
    getKeyOnly(inverted, 'inverted'),
    getWidthProp(widths),
    'statistics',
    className,
  )
  const rest = getUnhandledProps(StatisticGroup, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }
  if (!childrenUtils.isNil(content)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {content}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {_.map(items, (item) => Statistic.create(item))}
    </ElementType>
  )
}

StatisticGroup.displayName = 'StatisticGroup'
StatisticGroup.handledProps = [
  'as',
  'children',
  'className',
  'color',
  'content',
  'horizontal',
  'inverted',
  'items',
  'size',
  'widths',
]

export default StatisticGroup
