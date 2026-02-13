import cx from 'clsx'
import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'

export interface StrictButtonOrProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Additional classes. */
  className?: string
  /** Or buttons can have their text localized, or adjusted by using the text prop. */
  text?: number | string
}

export interface ButtonOrProps extends StrictButtonOrProps {
  [key: string]: any
}

/**
 * Button groups can contain conditionals.
 */
function ButtonOr({ ref, ...props }: ButtonOrProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, text } = props

  const classes = cx('or', className)
  const rest = getUnhandledProps(ButtonOr, props)
  const ElementType = getComponentType(props)

  return <ElementType {...rest} className={classes} data-text={text} ref={ref} />
}

ButtonOr.displayName = 'ButtonOr'
ButtonOr.handledProps = [
  'as',
  'className',
  'text',
]

export default ButtonOr
