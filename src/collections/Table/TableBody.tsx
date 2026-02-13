import cx from 'clsx'
import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'

export interface StrictTableBodyProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string
}

export interface TableBodyProps extends StrictTableBodyProps {
  [key: string]: any
}

function TableBody({ ref, ...props }: TableBodyProps & { ref?: React.Ref<HTMLTableSectionElement> }) {
  const { children, className } = props

  const classes = cx(className)
  const rest = getUnhandledProps(TableBody, props)
  const ElementType = getComponentType(props, { defaultAs: 'tbody' })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {children}
    </ElementType>
  )
}

TableBody.displayName = 'TableBody'
TableBody.handledProps = [
  'as',
  'children',
  'className',
]

export default TableBody
