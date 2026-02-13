import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import type { LabelProps } from '../../elements/Label'
import type { StrictInputProps } from '../../elements/Input'
import Input from '../../elements/Input'
import type { StrictFormFieldProps } from './FormField'
import FormField from './FormField'

export interface StrictFormInputProps
  extends Omit<StrictFormFieldProps, 'label'>,
    StrictInputProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A FormField control prop. */
  control?: any

  /** Individual fields may display an error state along with a message. */
  error?: any

  /** Shorthand for a Label. */
  label?: SemanticShorthandItem<LabelProps>
}

export interface FormInputProps extends StrictFormInputProps {
  [key: string]: any
}

/**
 * Sugar for <Form.Field control={Input} />.
 * @see Form
 * @see Input
 */
function FormInput({ ref, ...props }: FormInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { control = Input } = props

  const rest = getUnhandledProps(FormInput, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })

  return <ElementType {...rest} control={control} ref={ref} />
}

FormInput.displayName = 'FormInput'
FormInput.handledProps = [
  'as',
  'control',
]

export default FormInput
