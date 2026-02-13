import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'
import type { StrictDropdownProps } from '../../modules/Dropdown'
import Dropdown from '../../modules/Dropdown'
import type { StrictFormFieldProps } from './FormField'
import FormField from './FormField'

export interface StrictFormDropdownProps extends StrictFormFieldProps, StrictDropdownProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A FormField control prop. */
  control?: any

  /** Individual fields may display an error state along with a message. */
  error?: any
}

export interface FormDropdownProps extends StrictFormDropdownProps {
  [key: string]: any
}

/**
 * Sugar for <Form.Field control={Dropdown} />.
 * @see Dropdown
 * @see Form
 */
function FormDropdown({ ref, ...props }: FormDropdownProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { control = Dropdown } = props

  const rest = getUnhandledProps(FormDropdown, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })

  return <ElementType {...rest} control={control} ref={ref} />
}

FormDropdown.displayName = 'FormDropdown'
FormDropdown.handledProps = [
  'as',
  'control',
]

export default FormDropdown
