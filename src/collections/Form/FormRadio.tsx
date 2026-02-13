import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'
import type { StrictRadioProps } from '../../addons/Radio'
import Radio from '../../addons/Radio'
import type { StrictFormFieldProps } from './FormField'
import FormField from './FormField'

export interface StrictFormRadioProps extends StrictFormFieldProps, StrictRadioProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A FormField control prop. */
  control?: any

  /** HTML input type, either checkbox or radio. */
  type?: 'checkbox' | 'radio'
}

export interface FormRadioProps extends StrictFormRadioProps {
  [key: string]: any
}

/**
 * Sugar for <Form.Field control={Radio} />.
 * @see Form
 * @see Radio
 */
function FormRadio({ ref, ...props }: FormRadioProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { control = Radio } = props

  const rest = getUnhandledProps(FormRadio, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })

  return <ElementType {...rest} control={control} ref={ref} />
}

FormRadio.displayName = 'FormRadio'
FormRadio.handledProps = [
  'as',
  'control',
]

export default FormRadio
