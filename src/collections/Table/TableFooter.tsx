import * as React from 'react'

import { getUnhandledProps } from '../../lib'
import type { StrictTableHeaderProps } from './TableHeader'
import TableHeader from './TableHeader'

export interface StrictTableFooterProps extends StrictTableHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
}

export interface TableFooterProps extends StrictTableFooterProps {
  [key: string]: any
}

/**
 * A table can have a footer.
 */
function TableFooter({ ref, ...props }: TableFooterProps & { ref?: React.Ref<HTMLTableSectionElement> }) {
  const { as = 'tfoot' } = props
  const rest = getUnhandledProps(TableFooter, props)

  return <TableHeader {...rest} as={as} ref={ref} />
}

TableFooter.displayName = 'TableFooter'
TableFooter.handledProps = [
  'as',
]

export default TableFooter
