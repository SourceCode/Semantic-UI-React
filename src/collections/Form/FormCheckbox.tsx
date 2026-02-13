import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'
import type { StrictCheckboxProps } from '../../modules/Checkbox'
import Checkbox from '../../modules/Checkbox'
import type { StrictFormFieldProps } from './FormField'
import FormField from './FormField'

export interface StrictFormCheckboxProps extends StrictFormFieldProps, StrictCheckboxProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A FormField control prop. */
  control?: any

  /** HTML input type, either checkbox or radio. */
  type?: 'checkbox' | 'radio'
}

export interface FormCheckboxProps extends StrictFormCheckboxProps {
  [key: string]: any
}

/**
 * Sugar for <Form.Field control={Checkbox} />.
 * @see Checkbox
 * @see Form
 */
function FormCheckbox({ ref, ...props }: FormCheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { control = Checkbox } = props

  const rest = getUnhandledProps(FormCheckbox, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })

  return <ElementType {...rest} control={control} ref={ref} />
}

FormCheckbox.displayName = 'FormCheckbox'
FormCheckbox.handledProps = [
  'as',
  'control',
]

export default FormCheckbox
