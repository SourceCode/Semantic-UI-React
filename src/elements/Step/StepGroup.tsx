import _ from 'lodash'
import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
  getValueAndKey,
  getWidthProp,
} from '../../lib'
import type {
  SemanticShorthandCollection,
  SemanticShorthandContent,
} from '../../generic'
import type { StepProps } from './Step'
import Step from './Step'

export interface StrictStepGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Steps can be attached to other elements. */
  attached?: boolean | 'bottom' | 'top'
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A fluid step takes up the width of its container. */
  fluid?: boolean
  /** Shorthand array of props for Step. */
  items?: SemanticShorthandCollection<StepProps>
  /** A step can show a ordered sequence of steps. */
  ordered?: boolean
  /** Steps can have different sizes. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'
  /** A step can stack vertically only on smaller screens. */
  stackable?: 'tablet'
  /** A step can prevent itself from stacking on mobile. */
  unstackable?: boolean
  /** A step can be displayed stacked vertically. */
  vertical?: boolean
  /** Steps can be divided evenly inside their parent. */
  widths?:
    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
    | 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight'
}

export interface StepGroupProps extends StrictStepGroupProps {
  [key: string]: any
}

/**
 * A set of steps.
 */
function StepGroup({ ref, ...props }: StepGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    attached,
    children,
    className,
    content,
    fluid,
    items,
    ordered,
    size,
    stackable,
    unstackable,
    vertical,
    widths,
  } = props
  const classes = cx(
    'ui',
    size,
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(ordered, 'ordered'),
    getKeyOnly(unstackable, 'unstackable'),
    getKeyOnly(vertical, 'vertical'),
    getKeyOrValueAndKey(attached, 'attached'),
    getValueAndKey(stackable, 'stackable'),
    getWidthProp(widths),
    'steps',
    className,
  )
  const rest = getUnhandledProps(StepGroup, props)
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
      {_.map(items, (item) => Step.create(item))}
    </ElementType>
  )
}

StepGroup.displayName = 'StepGroup'
StepGroup.handledProps = [
  'as',
  'attached',
  'children',
  'className',
  'content',
  'fluid',
  'items',
  'ordered',
  'size',
  'stackable',
  'unstackable',
  'vertical',
]

export default StepGroup
