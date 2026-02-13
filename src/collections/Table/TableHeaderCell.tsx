import cx from 'clsx'
import * as React from 'react'

import { getUnhandledProps, getValueAndKey } from '../../lib'
import type { StrictTableCellProps } from './TableCell'
import TableCell from './TableCell'

export interface StrictTableHeaderCellProps extends StrictTableCellProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Additional classes. */
  className?: string

  /** A header cell can be sorted in ascending or descending order. */
  sorted?: 'ascending' | 'descending'
}

export interface TableHeaderCellProps extends StrictTableHeaderCellProps {
  [key: string]: any
}

/**
 * A table can have a header cell.
 */
function TableHeaderCell({ ref, ...props }: TableHeaderCellProps & { ref?: React.Ref<HTMLTableCellElement> }) {
  const { as = 'th', className, sorted } = props

  const classes = cx(getValueAndKey(sorted, 'sorted'), className)
  const rest = getUnhandledProps(TableHeaderCell, props)

  return <TableCell {...rest} as={as} className={classes} ref={ref} />
}

TableHeaderCell.displayName = 'TableHeaderCell'
TableHeaderCell.handledProps = [
  'as',
  'className',
  'sorted',
]

export default TableHeaderCell
