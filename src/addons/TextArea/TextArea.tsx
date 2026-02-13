import _ from 'lodash'
import * as React from 'react'

import { getComponentType, getUnhandledProps, useMergedRefs } from '../../lib'

export interface StrictTextAreaProps {
  /** An element type to render as (string or function). */
  as?: any

  /**
   * Called on change.
   *
   * @param {SyntheticEvent} event - The React SyntheticEvent object
   * @param {object} data - All props and the event value.
   */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => void

  /**
   * Called on input.
   *
   * @param {SyntheticEvent} event - The React SyntheticEvent object
   * @param {object} data - All props and the event value.
   */
  onInput?: (event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => void

  /** Indicates row count for a TextArea. */
  rows?: number | string

  /** The value of the textarea. */
  value?: number | string
}

export interface TextAreaProps extends StrictTextAreaProps {
  [key: string]: any
}

/**
 * A TextArea can be used to allow for extended user input.
 * @see Form
 */
function TextArea({ ref, ...props }: TextAreaProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
  const { rows = 3, value } = props
  const elementRef = useMergedRefs(ref, React.useRef<HTMLTextAreaElement>(null))

  const handleChange = (e: any) => {
    const newValue = _.get(e, 'target.value')

    _.invoke(props, 'onChange', e, { ...props, value: newValue })
  }

  const handleInput = (e: any) => {
    const newValue = _.get(e, 'target.value')

    _.invoke(props, 'onInput', e, { ...props, value: newValue })
  }

  const rest = getUnhandledProps(TextArea, props)
  const ElementType = getComponentType(props, { defaultAs: 'textarea' })

  return (
    <ElementType
      {...rest}
      onChange={handleChange}
      onInput={handleInput}
      ref={elementRef}
      rows={rows}
      value={value}
    />
  )
}

TextArea.displayName = 'TextArea'
TextArea.handledProps = [
  'as',
  'onChange',
  'onInput',
  'rows',
  'value',
]

export default TextArea
