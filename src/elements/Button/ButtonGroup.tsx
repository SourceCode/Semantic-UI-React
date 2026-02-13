import cx from 'clsx'
import _ from 'lodash'
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
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticShorthandCollection,
  SemanticShorthandContent,
  SemanticSIZES,
  SemanticWIDTHS,
} from '../../generic'
import type { ButtonProps } from './Button'
import Button from './Button'

export interface StrictButtonGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Groups can be attached to other content. */
  attached?: boolean | 'left' | 'right' | 'top' | 'bottom'
  /** Groups can be less pronounced. */
  basic?: boolean
  /** Array of shorthand Button values. */
  buttons?: SemanticShorthandCollection<ButtonProps>
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Groups can have a shared color. */
  color?: SemanticCOLORS
  /** Groups can reduce their padding to fit into tighter spaces. */
  compact?: boolean
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Groups can be aligned to the left or right of its container. */
  floated?: SemanticFLOATS
  /** Groups can take the width of their container. */
  fluid?: boolean
  /** Groups can be formatted as icons. */
  icon?: boolean
  /** Groups can be formatted to appear on dark backgrounds. */
  inverted?: boolean
  /** Groups can be formatted as labeled icon buttons. */
  labeled?: boolean
  /** Groups can hint towards a negative consequence. */
  negative?: boolean
  /** Groups can hint towards a positive consequence. */
  positive?: boolean
  /** Groups can be formatted to show different levels of emphasis. */
  primary?: boolean
  /** Groups can be formatted to show different levels of emphasis. */
  secondary?: boolean
  /** Groups can have different sizes. */
  size?: SemanticSIZES
  /** Groups can be formatted to toggle on and off. */
  toggle?: boolean
  /** Groups can be formatted to appear vertically. */
  vertical?: boolean
  /** Groups can have their widths divided evenly. */
  widths?: SemanticWIDTHS
}

export interface ButtonGroupProps extends StrictButtonGroupProps {
  [key: string]: any
}

/**
 * Buttons can be grouped.
 */
function ButtonGroup({ ref, ...props }: ButtonGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    attached,
    basic,
    buttons,
    children,
    className,
    color,
    compact,
    content,
    floated,
    fluid,
    icon,
    inverted,
    labeled,
    negative,
    positive,
    primary,
    secondary,
    size,
    toggle,
    vertical,
    widths,
  } = props

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(basic, 'basic'),
    getKeyOnly(compact, 'compact'),
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(icon, 'icon'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(labeled, 'labeled'),
    getKeyOnly(negative, 'negative'),
    getKeyOnly(positive, 'positive'),
    getKeyOnly(primary, 'primary'),
    getKeyOnly(secondary, 'secondary'),
    getKeyOnly(toggle, 'toggle'),
    getKeyOnly(vertical, 'vertical'),
    getKeyOrValueAndKey(attached, 'attached'),
    getValueAndKey(floated, 'floated'),
    getWidthProp(widths),
    'buttons',
    className,
  )
  const rest = getUnhandledProps(ButtonGroup, props)
  const ElementType = getComponentType(props)

  if (_.isNil(buttons)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {childrenUtils.isNil(children) ? content : children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {_.map(buttons, (button) => Button.create(button))}
    </ElementType>
  )
}

ButtonGroup.displayName = 'ButtonGroup'
ButtonGroup.handledProps = [
  'as',
  'attached',
  'basic',
  'buttons',
  'children',
  'className',
  'color',
  'compact',
  'content',
  'floated',
  'fluid',
  'icon',
  'inverted',
  'labeled',
  'negative',
  'positive',
  'primary',
  'secondary',
  'size',
  'toggle',
  'vertical',
  'widths',
]

export default ButtonGroup
