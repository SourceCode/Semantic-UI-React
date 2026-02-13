import cx from 'clsx'

import { getComponentType, getUnhandledProps } from '../../lib'

export interface StrictDropdownDividerProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Additional classes. */
  className?: string
}

export interface DropdownDividerProps extends StrictDropdownDividerProps {
  [key: string]: any
}

/**
 * A dropdown menu can contain dividers to separate related content.
 */
function DropdownDivider({ ref, ...props }: DropdownDividerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className } = props

  const classes = cx('divider', className)
  const rest = getUnhandledProps(DropdownDivider, props)
  const ElementType = getComponentType(props)

  return <ElementType {...rest} className={classes} ref={ref} />
}

DropdownDivider.displayName = 'DropdownDivider'
DropdownDivider.handledProps = [
  'as',
  'className',
]

export default DropdownDivider
