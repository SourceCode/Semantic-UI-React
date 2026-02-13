import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import { getComponentType, getUnhandledProps, getKeyOnly, getWidthProp } from '../../lib'
import type { SemanticSIZES } from '../../generic'
import FormButton from './FormButton'
import FormCheckbox from './FormCheckbox'
import FormDropdown from './FormDropdown'
import FormField from './FormField'
import FormGroup from './FormGroup'
import FormInput from './FormInput'
import FormRadio from './FormRadio'
import FormSelect from './FormSelect'
import FormStatus from './FormStatus'
import FormTextArea from './FormTextArea'

export interface StrictFormProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** The HTML form action URL, or a React 19 form action function. */
  action?: string | ((formData: FormData) => void | Promise<void>)

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Automatically show any error Message children. */
  error?: boolean

  /** A form can have its color inverted for contrast. */
  inverted?: boolean

  /** Automatically show a loading indicator. */
  loading?: boolean

  /** The HTML form submit handler. */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>, data: FormProps) => void

  /** A comment can contain a form to reply to a comment. This may have arbitrary content. */
  reply?: boolean

  /** A form can vary in size. */
  size?: SemanticSIZES

  /** Automatically show any success Message children. */
  success?: boolean

  /** A form can prevent itself from stacking on mobile. */
  unstackable?: boolean

  /** Automatically show any warning Message children. */
  warning?: boolean

  /** Forms can automatically divide fields to be equal width. */
  widths?: 'equal'
}

export interface FormProps extends StrictFormProps {
  [key: string]: any
}

/**
 * A Form displays a set of related user input fields in a structured way.
 * @see Button
 * @see Checkbox
 * @see Dropdown
 * @see Input
 * @see Message
 * @see Radio
 * @see Select
 */
function Form({ ref, ...props }: FormProps & { ref?: React.Ref<HTMLFormElement> }) {
  const {
    action,
    children,
    className,
    error,
    inverted,
    loading,
    reply,
    size,
    success,
    unstackable,
    warning,
    widths,
  } = props

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, ...args: any[]) => {
    // If action is a function (React 19 form action), let React handle it natively
    if (typeof action === 'function') {
      _.invoke(props, 'onSubmit', e, props, ...args)
      return
    }
    // Heads up! Third party libs can pass own data as first argument, we need to check that it has preventDefault()
    // method.
    if (typeof action !== 'string') _.invoke(e, 'preventDefault')
    _.invoke(props, 'onSubmit', e, props, ...args)
  }

  const classes = cx(
    'ui',
    size,
    getKeyOnly(error, 'error'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(loading, 'loading'),
    getKeyOnly(reply, 'reply'),
    getKeyOnly(success, 'success'),
    getKeyOnly(unstackable, 'unstackable'),
    getKeyOnly(warning, 'warning'),
    getWidthProp(widths, null, true),
    'form',
    className,
  )
  const rest = getUnhandledProps(Form, props)
  const ElementType = getComponentType(props, { defaultAs: 'form' })

  return (
    <ElementType {...rest} action={action} className={classes} onSubmit={handleSubmit} ref={ref}>
      {children}
    </ElementType>
  )
}

Form.displayName = 'Form'

Form.handledProps = [
  'as',
  'action',
  'children',
  'className',
  'error',
  'inverted',
  'loading',
  'onSubmit',
  'reply',
  'size',
  'success',
  'unstackable',
  'warning',
  'widths',
]

Form.Field = FormField
Form.Button = FormButton
Form.Checkbox = FormCheckbox
Form.Dropdown = FormDropdown
Form.Group = FormGroup
Form.Input = FormInput
Form.Radio = FormRadio
Form.Select = FormSelect
Form.Status = FormStatus
Form.TextArea = FormTextArea

export default Form
