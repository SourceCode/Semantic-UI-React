import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import { createShorthandFactory, getComponentType, getUnhandledProps } from '../../lib'

export interface StrictDropdownSearchInputProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** An input can have the auto complete. */
  autoComplete?: string

  /** Additional classes. */
  className?: string

  /**
   * Called on change.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and the new value.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, data: DropdownSearchInputProps) => void

  /** An input can receive focus. */
  tabIndex?: number | string

  /** The HTML input type. */
  type?: string

  /** Stored value. */
  value?: number | string
}

export interface DropdownSearchInputProps extends StrictDropdownSearchInputProps {
  [key: string]: any
}

/**
 * A search item sub-component for Dropdown component.
 */
function DropdownSearchInput({ ref, ...props }: DropdownSearchInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { autoComplete = 'off', className, tabIndex, type = 'text', value } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = _.get(e, 'target.value')

    _.invoke(props, 'onChange', e, { ...props, value: newValue })
  }

  const classes = cx('search', className)
  const ElementType = getComponentType(props, { defaultAs: 'input' })
  const rest = getUnhandledProps(DropdownSearchInput, props)

  return (
    <ElementType
      aria-autocomplete='list'
      {...rest}
      autoComplete={autoComplete}
      className={classes}
      onChange={handleChange}
      ref={ref}
      tabIndex={tabIndex}
      type={type}
      value={value}
    />
  )
}

DropdownSearchInput.displayName = 'DropdownSearchInput'
DropdownSearchInput.handledProps = [
  'as',
  'autoComplete',
  'className',
  'onChange',
  'tabIndex',
  'type',
  'value',
]

DropdownSearchInput.create = createShorthandFactory(DropdownSearchInput, (type) => ({ type }))

export default DropdownSearchInput
