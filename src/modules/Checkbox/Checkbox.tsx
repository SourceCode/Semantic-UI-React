import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  createHTMLLabel,
  getComponentType,
  getUnhandledProps,
  htmlInputAttrs,
  makeDebugger,
  partitionHTMLProps,
  getKeyOnly,
  useAutoControlledValue,
  useMergedRefs,
  useIsomorphicLayoutEffect,
} from '../../lib'
import type { HtmlLabelProps, SemanticShorthandItem } from '../../generic'

const debug = makeDebugger('checkbox')

export interface StrictCheckboxProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Whether or not checkbox is checked. */
  checked?: boolean

  /** Additional classes. */
  className?: string

  /** The initial value of checked. */
  defaultChecked?: boolean

  /** Whether or not checkbox is indeterminate. */
  defaultIndeterminate?: boolean

  /** A checkbox can appear disabled and be unable to change states */
  disabled?: boolean

  /** Removes padding for a label. Auto applied when there is no label. */
  fitted?: boolean

  /** A unique identifier. */
  id?: number | string

  /** Whether or not checkbox is indeterminate. */
  indeterminate?: boolean

  /** The text of the associated label element. */
  label?: SemanticShorthandItem<HtmlLabelProps>

  /** The HTML input name. */
  name?: string

  /**
   * Called when the user attempts to change the checked state.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and proposed checked/indeterminate state.
   */
  onChange?: (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => void

  /**
   * Called when the checkbox or label is clicked.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and current checked/indeterminate state.
   */
  onClick?: (event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) => void

  /**
   * Called when the user presses down on the mouse.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and current checked/indeterminate state.
   */
  onMouseDown?: (event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) => void

  /**
   * Called when the user releases the mouse.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and current checked/indeterminate state.
   */
  onMouseUp?: (event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) => void

  /** Format as a radio element. This means it is an exclusive option. */
  radio?: boolean

  /** A checkbox can be read-only and unable to change states. */
  readOnly?: boolean

  /** Format to emphasize the current selection state. */
  slider?: boolean

  /** A checkbox can receive focus. */
  tabIndex?: number | string

  /** Format to show an on or off choice. */
  toggle?: boolean

  /** HTML input type, either checkbox or radio. */
  type?: 'checkbox' | 'radio'

  /** The HTML input value. */
  value?: number | string
}

export interface CheckboxProps extends StrictCheckboxProps {
  [key: string]: any
}

/**
 * A checkbox allows a user to select a value from a small set of options, often binary.
 * @see Form
 * @see Radio
 */
function Checkbox({ ref, ...props }: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  const {
    className,
    disabled,
    label,
    id,
    name,
    radio,
    readOnly,
    slider,
    tabIndex,
    toggle,
    type = 'checkbox',
    value,
  } = props

  const [checked, setChecked] = useAutoControlledValue({
    state: props.checked,
    defaultState: props.defaultChecked,
    initialState: false,
  })
  const [indeterminate, setIndeterminate] = useAutoControlledValue({
    state: props.indeterminate,
    defaultState: props.defaultIndeterminate,
    initialState: false,
  })

  const internalInputRef = React.useRef<HTMLInputElement>(null)
  const inputRef = useMergedRefs(internalInputRef, ref)
  const labelRef = React.useRef<HTMLLabelElement>(null)

  const isClickFromMouse = React.useRef(false)

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  useIsomorphicLayoutEffect(() => {
    // Note: You can't directly set the indeterminate prop on the input, so we
    // need to maintain a ref to the input and set it manually whenever the
    // component updates.
    if (internalInputRef.current) {
      internalInputRef.current.indeterminate = !!indeterminate
    }
  })

  // ----------------------------------------
  // Helpers
  // ----------------------------------------

  const canToggle = () => {
    return !disabled && !readOnly && !(radio && checked)
  }

  const computeTabIndex = () => {
    if (!_.isNil(tabIndex)) {
      return tabIndex
    }

    return disabled ? -1 : 0
  }

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleChange = (e: React.SyntheticEvent) => {
    if (!canToggle()) {
      return
    }

    debug('handleChange()', _.get(e, 'target.tagName'))

    _.invoke(props, 'onChange', e, {
      ...props,
      checked: !checked,
      indeterminate: false,
    })
    setChecked(!checked)
    setIndeterminate(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    debug('handleClick()', _.get(e, 'target.tagName'))

    const isInputClick = _.invoke(internalInputRef.current, 'contains', e.target)
    const isLabelClick = _.invoke(labelRef.current, 'contains', e.target)
    const isRootClick = !isLabelClick && !isInputClick

    const hasId = !_.isNil(id)
    const isLabelClickAndForwardedToInput = isLabelClick && hasId

    // https://github.com/Semantic-Org/Semantic-UI-React/pull/3351
    if (!isLabelClickAndForwardedToInput) {
      _.invoke(props, 'onClick', e, {
        ...props,
        checked: !checked,
        indeterminate: !!indeterminate,
      })
    }

    if (isClickFromMouse.current) {
      isClickFromMouse.current = false

      if (isLabelClick && !hasId) {
        handleChange(e)
      }

      // Changes should be triggered for the slider variation
      if (isRootClick) {
        handleChange(e)
      }

      if (isLabelClick && hasId) {
        // To prevent two clicks from being fired from the component we have to stop the propagation
        // from the "input" click: https://github.com/Semantic-Org/Semantic-UI-React/issues/3433
        e.stopPropagation()
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    debug('handleMouseDown()')

    _.invoke(props, 'onMouseDown', e, {
      ...props,
      checked: !!checked,
      indeterminate: !!indeterminate,
    })

    if (!e.defaultPrevented) {
      _.invoke(internalInputRef.current, 'focus')
    }

    // Heads up!
    // We need to call "preventDefault" to keep element focused.
    e.preventDefault()
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    debug('handleMouseUp()')

    isClickFromMouse.current = true
    _.invoke(props, 'onMouseUp', e, {
      ...props,
      checked: !!checked,
      indeterminate: !!indeterminate,
    })
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  const classes = cx(
    'ui',
    getKeyOnly(checked, 'checked'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(indeterminate, 'indeterminate'),
    // auto apply fitted class to compact white space when there is no label
    // https://semantic-ui.com/modules/checkbox.html#fitted
    getKeyOnly(_.isNil(label), 'fitted'),
    getKeyOnly(radio, 'radio'),
    getKeyOnly(readOnly, 'read-only'),
    getKeyOnly(slider, 'slider'),
    getKeyOnly(toggle, 'toggle'),
    'checkbox',
    className,
  )
  const unhandled = getUnhandledProps(Checkbox, props)
  const ElementType = getComponentType(props)
  const [htmlInputProps, rest] = partitionHTMLProps(unhandled, { htmlProps: htmlInputAttrs })

  // Heads Up!
  // Do not remove empty labels, they are required by SUI CSS
  const labelElement = createHTMLLabel(label, {
    defaultProps: { htmlFor: id },
    autoGenerateKey: false,
  }) || <label htmlFor={id as string | undefined} />

  return (
    <ElementType
      {...rest}
      className={classes}
      onClick={handleClick}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <input
        {...htmlInputProps}
        checked={checked as boolean}
        className='hidden'
        disabled={disabled}
        id={id as string | undefined}
        name={name}
        readOnly
        ref={inputRef}
        tabIndex={computeTabIndex() as number}
        type={type}
        value={value}
      />
      {/* TODO: React 19 - cloneElement retained for labelRef */}
      {React.cloneElement(labelElement as React.ReactElement, { ref: labelRef } as any)}
    </ElementType>
  )
}

Checkbox.displayName = 'Checkbox'
Checkbox.handledProps = [
  'as',
  'checked',
  'className',
  'defaultChecked',
  'defaultIndeterminate',
  'disabled',
  'fitted',
  'id',
  'indeterminate',
  'label',
  'name',
  'onChange',
  'onClick',
  'onMouseDown',
  'onMouseUp',
  'radio',
  'readOnly',
  'slider',
  'tabIndex',
  'toggle',
  'type',
  'value',
]

export default Checkbox
