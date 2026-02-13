import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'
import type { StrictSelectProps } from '../../addons/Select'
import type { DropdownItemProps } from '../../modules/Dropdown/DropdownItem'
import Select from '../../addons/Select'
import type { StrictFormFieldProps } from './FormField'
import FormField from './FormField'

export interface StrictFormSelectProps extends StrictFormFieldProps, StrictSelectProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A FormField control prop. */
  control?: any

  /** Individual fields may display an error state along with a message. */
  error?: any

  /** Array of Dropdown.Item props e.g. `{ text: '', value: '' }` */
  options: DropdownItemProps[]
}

export interface FormSelectProps extends StrictFormSelectProps {
  [key: string]: any
}

/**
 * Sugar for <Form.Field control={Select} />.
 * @see Form
 * @see Select
 */
function FormSelect({ ref, ...props }: FormSelectProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { control = Select, options } = props

  const rest = getUnhandledProps(FormSelect, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })

  return <ElementType {...rest} control={control} options={options} ref={ref} />
}

FormSelect.displayName = 'FormSelect'
FormSelect.handledProps = [
  'as',
  'control',
  'options',
]

export default FormSelect
