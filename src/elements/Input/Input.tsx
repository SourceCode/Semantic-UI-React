import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createHTMLInput,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  partitionHTMLProps,
  getKeyOnly,
  getValueAndKey,
  setRef,
} from '../../lib'
import type {
  SemanticShorthandItem,
  SemanticSIZES,
} from '../../generic'
import type { ButtonProps } from '../Button'
import type { IconProps } from '../Icon'
import type { LabelProps } from '../Label'
import Button from '../Button'
import Icon from '../Icon'
import Label from '../Label'

export interface StrictInputProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** An Input can be formatted to alert the user to an action they may perform. */
  action?: boolean | SemanticShorthandItem<ButtonProps>
  /** An action can appear along side an Input on the left or right. */
  actionPosition?: 'left'
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** An Input field can show that it is disabled. */
  disabled?: boolean
  /** An Input field can show the data contains errors. */
  error?: boolean
  /** Take on the size of its container. */
  fluid?: boolean
  /** An Input field can show a user is currently interacting with it. */
  focus?: boolean
  /** Optional Icon to display inside the Input. */
  icon?: boolean | SemanticShorthandItem<IconProps>
  /** An Icon can appear inside an Input on the left or right. */
  iconPosition?: 'left'
  /** Shorthand for creating the HTML Input. */
  input?: SemanticShorthandItem<React.InputHTMLAttributes<HTMLInputElement>>
  /** Format to appear on dark backgrounds. */
  inverted?: boolean
  /** Optional Label to display along side the Input. */
  label?: SemanticShorthandItem<LabelProps>
  /** A Label can appear outside an Input on the left or right. */
  labelPosition?: 'left' | 'right' | 'left corner' | 'right corner'
  /** An Icon Input field can show that it is currently loading data. */
  loading?: boolean
  /**
   * Called on change.
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and a proposed value.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void
  /** An Input can vary in size. */
  size?: SemanticSIZES
  /** An Input can receive focus. */
  tabIndex?: number | string
  /** Transparent Input has no background. */
  transparent?: boolean
  /** The HTML input type. */
  type?: string
}

export interface InputProps extends StrictInputProps {
  [key: string]: any
}

export interface InputOnChangeData extends InputProps {
  value: string
}

/**
 * An Input is a field used to elicit a response from a user.
 * @see Button
 * @see Form
 * @see Icon
 * @see Label
 */
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const {
    action,
    actionPosition,
    children,
    className,
    disabled,
    error,
    fluid,
    focus,
    icon,
    iconPosition,
    input,
    inverted,
    label,
    labelPosition,
    loading,
    size,
    tabIndex,
    transparent,
    type = 'text',
  } = props

  const computeIcon = () => {
    if (!_.isNil(icon)) {
      return icon
    }

    if (loading) {
      return 'spinner'
    }

    return undefined
  }

  const computeTabIndex = () => {
    if (!_.isNil(tabIndex)) {
      return tabIndex
    }

    if (disabled) {
      return -1
    }

    return undefined
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = _.get(e, 'target.value')

    _.invoke(props, 'onChange', e, { ...props, value: newValue })
  }

  const partitionProps = () => {
    const unhandledProps = getUnhandledProps(Input, props)
    const [htmlInputProps, rest] = partitionHTMLProps(unhandledProps)

    return [
      {
        ...htmlInputProps,
        disabled,
        type,
        tabIndex: computeTabIndex(),
        onChange: handleChange,
        ref,
      },
      rest,
    ] as const
  }

  const classes = cx(
    'ui',
    size,
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(error, 'error'),
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(focus, 'focus'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(loading, 'loading'),
    getKeyOnly(transparent, 'transparent'),
    getValueAndKey(actionPosition, 'action') || getKeyOnly(action, 'action'),
    getValueAndKey(iconPosition, 'icon') || getKeyOnly(icon || loading, 'icon'),
    getValueAndKey(labelPosition, 'labeled') || getKeyOnly(label, 'labeled'),
    'input',
    className,
  )
  const ElementType = getComponentType(props)
  const [htmlInputProps, rest] = partitionProps()

  // Render with children
  // ----------------------------------------
  if (!childrenUtils.isNil(children)) {
    // Add htmlInputProps to the `<input />` child.
    // cloneElement is retained here because this targets native <input> elements
    // (not components), where we need to merge htmlInputProps and refs onto the
    // user-supplied element. This is a niche code path (the shorthand API via the
    // `input` prop is far more common). Consider migrating to a children-as-function
    // or Context pattern in a future major version.
    const childElements = _.map(
      React.Children.toArray(children),
      (child) => {
        if (React.isValidElement(child) && child.type === 'input') {
          return React.cloneElement(
            child as React.ReactElement<any>,
            {
              ...htmlInputProps,
              ...(child.props as Record<string, any>),
              ref: (c: HTMLInputElement | null) => {
                setRef((child as any).ref, c)
                setRef(ref, c)
              },
            },
          )
        }

        return child
      },
    )

    return (
      <ElementType {...rest} className={classes}>
        {childElements}
      </ElementType>
    )
  }

  // Render Shorthand
  // ----------------------------------------
  const actionElement = Button.create(action, { autoGenerateKey: false })
  const labelElement = Label.create(label, {
    defaultProps: {
      className: cx(
        'label',
        // add 'left|right corner'
        _.includes(labelPosition, 'corner') && labelPosition,
      ),
    },
    autoGenerateKey: false,
  })

  return (
    <ElementType {...rest} className={classes}>
      {actionPosition === 'left' && actionElement}
      {labelPosition !== 'right' && labelElement}
      {createHTMLInput(input || type, { defaultProps: htmlInputProps, autoGenerateKey: false })}
      {Icon.create(computeIcon(), { autoGenerateKey: false })}
      {actionPosition !== 'left' && actionElement}
      {labelPosition === 'right' && labelElement}
    </ElementType>
  )
}

Input.displayName = 'Input'
Input.handledProps = [
  'as',
  'action',
  'actionPosition',
  'children',
  'className',
  'disabled',
  'error',
  'fluid',
  'focus',
  'icon',
  'iconPosition',
  'input',
  'inverted',
  'label',
  'labelPosition',
  'loading',
  'onChange',
  'size',
  'tabIndex',
  'transparent',
  'type',
]

Input.create = createShorthandFactory(Input, (type) => ({ type }))

export default Input
