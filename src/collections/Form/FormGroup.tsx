import cx from 'clsx'
import * as React from 'react'

import {
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getWidthProp,
} from '../../lib'
import type { SemanticWIDTHS } from '../../generic'

export interface StrictFormGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A Form Group can be disabled. */
  disabled?: boolean

  /** A Form Group can have error. */
  error?: boolean

  /** Fields can show related choices. */
  grouped?: boolean

  /** Multiple fields may be inline in a row. */
  inline?: boolean

  /** A form group can prevent itself from stacking on mobile. */
  unstackable?: boolean

  /** Fields Groups can specify their width in grid columns or automatically divide fields to be equal width. */
  widths?: SemanticWIDTHS | 'equal'
}

export interface FormGroupProps extends StrictFormGroupProps {
  [key: string]: any
}

/**
 * A set of fields can appear grouped together.
 * @see Form
 */
function FormGroup({ ref, ...props }: FormGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, disabled, error, grouped, inline, unstackable, widths } = props

  const classes = cx(
    getKeyOnly(error, 'error'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(grouped, 'grouped'),
    getKeyOnly(inline, 'inline'),
    getKeyOnly(unstackable, 'unstackable'),
    getWidthProp(widths, null, true),
    'fields',
    className,
  )
  const rest = getUnhandledProps(FormGroup, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {children}
    </ElementType>
  )
}

FormGroup.displayName = 'FormGroup'
FormGroup.handledProps = [
  'as',
  'children',
  'className',
  'disabled',
  'error',
  'grouped',
  'inline',
  'unstackable',
  'widths',
]

export default FormGroup
