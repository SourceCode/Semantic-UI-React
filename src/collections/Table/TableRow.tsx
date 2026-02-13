import _ from 'lodash'
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
} from '../../lib'
import type {
  SemanticShorthandCollection,
  SemanticVERTICALALIGNMENTS,
} from '../../generic'
import type { TableCellProps } from './TableCell'
import TableCell from './TableCell'

export interface StrictTableRowProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A row can be active or selected by a user. */
  active?: boolean

  /** An element type to render as (string or function). */
  cellAs?: React.ElementType

  /** Shorthand array of props for TableCell. */
  cells?: SemanticShorthandCollection<TableCellProps>

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A row can be disabled. */
  disabled?: boolean

  /** A row may call attention to an error or a negative value. */
  error?: boolean

  /** A row may let a user know whether a value is bad. */
  negative?: boolean

  /** A row may let a user know whether a value is good. */
  positive?: boolean

  /** A table row can adjust its text alignment. */
  textAlign?: 'center' | 'left' | 'right'

  /** A table row can adjust its vertical alignment. */
  verticalAlign?: SemanticVERTICALALIGNMENTS

  /** A row may warn a user. */
  warning?: boolean
}

export interface TableRowProps extends StrictTableRowProps {
  [key: string]: any
}

/**
 * A table can have rows.
 */
function TableRow({ ref, ...props }: TableRowProps & { ref?: React.Ref<HTMLTableRowElement> }) {
  const {
    active,
    cellAs = 'td',
    cells,
    children,
    className,
    disabled,
    error,
    negative,
    positive,
    textAlign,
    verticalAlign,
    warning,
  } = props

  const classes = cx(
    getKeyOnly(active, 'active'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(error, 'error'),
    getKeyOnly(negative, 'negative'),
    getKeyOnly(positive, 'positive'),
    getKeyOnly(warning, 'warning'),
    getTextAlignProp(textAlign),
    getVerticalAlignProp(verticalAlign),
    className,
  )
  const rest = getUnhandledProps(TableRow, props)
  const ElementType = getComponentType(props, { defaultAs: 'tr' })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {_.map(cells, (cell) => TableCell.create(cell, { defaultProps: { as: cellAs } }))}
    </ElementType>
  )
}

TableRow.displayName = 'TableRow'
TableRow.handledProps = [
  'as',
  'active',
  'cellAs',
  'cells',
  'children',
  'className',
  'disabled',
  'error',
  'negative',
  'positive',
  'textAlign',
  'verticalAlign',
  'warning',
]

TableRow.create = createShorthandFactory(TableRow, (cells) => ({ cells }))

export default TableRow
