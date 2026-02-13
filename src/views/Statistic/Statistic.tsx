import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getValueAndKey,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticShorthandContent,
} from '../../generic'
import StatisticGroup from './StatisticGroup'
import StatisticLabel from './StatisticLabel'
import StatisticValue from './StatisticValue'

export type StatisticSizeProp = 'mini' | 'tiny' | 'small' | 'large' | 'huge'

export interface StrictStatisticProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A statistic can be formatted to be different colors. */
  color?: SemanticCOLORS

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A statistic can sit to the left or right of other content. */
  floated?: SemanticFLOATS

  /** A statistic can present its measurement horizontally. */
  horizontal?: boolean

  /** A statistic can be formatted to fit on a dark background. */
  inverted?: boolean

  /** Label content of the Statistic. */
  label?: SemanticShorthandContent

  /** A statistic can vary in size. */
  size?: StatisticSizeProp

  /** Format the StatisticValue with smaller font size to fit nicely beside number values. */
  text?: boolean

  /** Value content of the Statistic. */
  value?: SemanticShorthandContent
}

export interface StatisticProps extends StrictStatisticProps {
  [key: string]: any
}

/**
 * A statistic emphasizes the current value of an attribute.
 */
function Statistic({ ref, ...props }: StatisticProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    children,
    className,
    color,
    content,
    floated,
    horizontal,
    inverted,
    label,
    size,
    text,
    value,
  } = props

  const classes = cx(
    'ui',
    color,
    size,
    getValueAndKey(floated, 'floated'),
    getKeyOnly(horizontal, 'horizontal'),
    getKeyOnly(inverted, 'inverted'),
    'statistic',
    className,
  )
  const rest = getUnhandledProps(Statistic, props)
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
      {StatisticValue.create(value, {
        defaultProps: { text },
        autoGenerateKey: false,
      })}
      {StatisticLabel.create(label, { autoGenerateKey: false })}
    </ElementType>
  )
}

Statistic.displayName = 'Statistic'
Statistic.handledProps = [
  'as',
  'children',
  'className',
  'color',
  'content',
  'floated',
  'horizontal',
  'inverted',
  'label',
  'size',
  'text',
  'value',
]

Statistic.Group = StatisticGroup
Statistic.Label = StatisticLabel
Statistic.Value = StatisticValue

Statistic.create = createShorthandFactory(Statistic, (content) => ({ content }))

export default Statistic
