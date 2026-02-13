import * as React from 'react'

import { getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import type { LabelProps } from '../../elements/Label'
import type { StrictButtonProps } from '../../elements/Button'
import Button from '../../elements/Button'
import type { StrictFormFieldProps } from './FormField'
import FormField from './FormField'

export interface StrictFormButtonProps
  extends Omit<StrictFormFieldProps, 'label'>,
    Omit<StrictButtonProps, 'type'> {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A FormField control prop. */
  control?: any

  /** Shorthand for a Label. */
  label?: SemanticShorthandItem<LabelProps>
}

export interface FormButtonProps extends StrictFormButtonProps {
  [key: string]: any
}

/**
 * Sugar for <Form.Field control={Button} />.
 * @see Button
 * @see Form
 */
function FormButton({ ref, ...props }: FormButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { control = Button } = props

  const rest = getUnhandledProps(FormButton, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })

  return <ElementType {...rest} control={control} ref={ref} />
}

FormButton.displayName = 'FormButton'
FormButton.handledProps = [
  'as',
  'control',
]

export default FormButton
