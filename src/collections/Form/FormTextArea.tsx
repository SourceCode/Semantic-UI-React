import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'
import type { StrictTextAreaProps } from '../../addons/TextArea'
import TextArea from '../../addons/TextArea'
import type { StrictFormFieldProps } from './FormField'
import FormField from './FormField'

export interface StrictFormTextAreaProps extends StrictFormFieldProps, StrictTextAreaProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A FormField control prop. */
  control?: any
}

export interface FormTextAreaProps extends StrictFormTextAreaProps {
  [key: string]: any
}

/**
 * Sugar for <Form.Field control={TextArea} />.
 * @see Form
 * @see TextArea
 */
function FormTextArea({ ref, ...props }: FormTextAreaProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
  const { control = TextArea } = props

  const rest = getUnhandledProps(FormTextArea, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })

  return <ElementType {...rest} control={control} ref={ref} />
}

FormTextArea.displayName = 'FormTextArea'
FormTextArea.handledProps = [
  'as',
  'control',
]

export default FormTextArea
