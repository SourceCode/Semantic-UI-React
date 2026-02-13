import { useFormStatus } from 'react-dom'

export interface FormStatusRenderProps {
  pending: boolean
  data: FormData | null
  method: string | null
  action: string | ((formData: FormData) => void | Promise<void>) | null
}

export interface StrictFormStatusProps {
  /** Render function or React node. When a function, receives form status as argument. */
  children: React.ReactNode | ((status: FormStatusRenderProps) => React.ReactNode)
}

export interface FormStatusProps extends StrictFormStatusProps {
  [key: string]: any
}

/**
 * FormStatus provides the pending state of the nearest parent Form's action.
 * Must be rendered inside a Form that uses a form action.
 *
 * @see Form
 */
function FormStatus(props: FormStatusProps) {
  const { children } = props
  const status = useFormStatus()

  if (typeof children === 'function') {
    return children(status as FormStatusRenderProps)
  }

  return children
}

FormStatus.displayName = 'FormStatus'
FormStatus.handledProps = ['children']

export default FormStatus
