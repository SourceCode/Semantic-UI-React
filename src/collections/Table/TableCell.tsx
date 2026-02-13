import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getTextAlignProp,
  getVerticalAlignProp,
  getWidthProp,
} from '../../lib'
import type {
  SemanticShorthandContent,
  SemanticShorthandItem,
  SemanticVERTICALALIGNMENTS,
  SemanticWIDTHS,
} from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictTableCellProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A cell can be active or selected by a user. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A table can be collapsing, taking up only as much space as its rows. */
  collapsing?: boolean

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A cell can be disabled. */
  disabled?: boolean

  /** A cell may call attention to an error or a negative value. */
  error?: boolean

  /** Add an Icon by name, props object, or pass an <Icon />. */
  icon?: SemanticShorthandItem<IconProps>

  /** A cell may let a user know whether a value is bad. */
  negative?: boolean

  /** A cell may let a user know whether a value is good. */
  positive?: boolean

  /** A cell can be selectable. */
  selectable?: boolean

  /** A cell can specify that its contents should remain on a single line and not wrap. */
  singleLine?: boolean

  /** A table cell can adjust its text alignment. */
  textAlign?: 'center' | 'left' | 'right'

  /** A table cell can adjust its text alignment. */
  verticalAlign?: SemanticVERTICALALIGNMENTS

  /** A cell may warn a user. */
  warning?: boolean

  /** A table can specify the width of individual columns independently. */
  width?: SemanticWIDTHS
}

export interface TableCellProps extends StrictTableCellProps {
  [key: string]: any
}

/**
 * A table row can have cells.
 */
function TableCell({ ref, ...props }: TableCellProps & { ref?: React.Ref<HTMLTableCellElement> }) {
  const {
    active,
    children,
    className,
    collapsing,
    content,
    disabled,
    error,
    icon,
    negative,
    positive,
    selectable,
    singleLine,
    textAlign,
    verticalAlign,
    warning,
    width,
  } = props

  const classes = cx(
    getKeyOnly(active, 'active'),
    getKeyOnly(collapsing, 'collapsing'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(error, 'error'),
    getKeyOnly(negative, 'negative'),
    getKeyOnly(positive, 'positive'),
    getKeyOnly(selectable, 'selectable'),
    getKeyOnly(singleLine, 'single line'),
    getKeyOnly(warning, 'warning'),
    getTextAlignProp(textAlign),
    getVerticalAlignProp(verticalAlign),
    getWidthProp(width, 'wide'),
    className,
  )
  const rest = getUnhandledProps(TableCell, props)
  const ElementType = getComponentType(props, { defaultAs: 'td' })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {Icon.create(icon)}
      {content}
    </ElementType>
  )
}

TableCell.displayName = 'TableCell'
TableCell.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'collapsing',
  'content',
  'disabled',
  'error',
  'icon',
  'negative',
  'positive',
  'selectable',
  'singleLine',
  'textAlign',
  'verticalAlign',
  'warning',
  'width',
]

TableCell.create = createShorthandFactory(TableCell, (content) => ({ content }))

export default TableCell
