import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'
import shallowEqual from '../../lib/shallowEqual'

import {
  childrenUtils,
  doesNodeContainClick,
  getComponentType,
  getUnhandledProps,
  makeDebugger,
  setRef,
  useAutoControlledValue,
  useEventCallback,
  getKeyOnly,
  getKeyOrValueAndKey,
} from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'
import type { LabelProps } from '../../elements/Label'
import Label from '../../elements/Label'
import Flag from '../../elements/Flag'
import Image from '../../elements/Image'
import DropdownDivider from './DropdownDivider'
import type { DropdownItemProps } from './DropdownItem'
import DropdownItem from './DropdownItem'
import DropdownHeader from './DropdownHeader'
import DropdownMenu from './DropdownMenu'
import DropdownSearchInput from './DropdownSearchInput'
import DropdownText from './DropdownText'
import getMenuOptions from './utils/getMenuOptions'
import getSelectedIndex from './utils/getSelectedIndex'

const debug = makeDebugger('dropdown')

const getKeyOrValue = (key: any, value: any) => (_.isNil(key) ? value : key)
const getKeyAndValues = (options: any) =>
  options ? options.map((option: any) => _.pick(option, ['key', 'value'])) : options

function renderItemContent(item: any) {
  const { flag, image, text } = item

  if (_.isFunction(text)) {
    return text
  }

  return {
    content: (
      <>
        {Flag.create(flag)}
        {Image.create(image)}

        {text}
      </>
    ),
  }
}

export interface StrictDropdownProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Label prefixed to an option added by a user. */
  additionLabel?: number | string | React.ReactNode

  /** Position of the `Add: ...` option in the dropdown list ('top' or 'bottom'). */
  additionPosition?: 'top' | 'bottom'

  /**
   * Allow user additions to the list of options (boolean).
   * Requires the use of `selection`, `options` and `search`.
   */
  allowAdditions?: boolean

  /** A Dropdown can reduce its complexity. */
  basic?: boolean

  /** Format the Dropdown to appear as a button. */
  button?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Using the clearable setting will let users remove their selection from a dropdown. */
  clearable?: boolean

  /** Whether or not the menu should close when the dropdown is blurred. */
  closeOnBlur?: boolean

  /** Whether or not the dropdown should close when the escape key is pressed. */
  closeOnEscape?: boolean

  /**
   * Whether or not the menu should close when a value is selected from the dropdown.
   * By default, multiple selection dropdowns will remain open on change, while single
   * selection dropdowns will close on change.
   */
  closeOnChange?: boolean

  /** A compact dropdown has no minimum width. */
  compact?: boolean

  /** Whether or not the dropdown should strip diacritics in options and input search */
  deburr?: boolean

  /** Initial value of open. */
  defaultOpen?: boolean

  /** Initial value of searchQuery. */
  defaultSearchQuery?: string

  /** Currently selected label in multi-select. */
  defaultSelectedLabel?: number | string

  /** Initial value of upward. */
  defaultUpward?: boolean

  /** Initial value or value array if multiple. */
  defaultValue?: string | number | boolean | (number | string | boolean)[]

  /** A dropdown menu can open to the left or to the right. */
  direction?: 'left' | 'right'

  /** A disabled dropdown menu or item does not allow user interaction. */
  disabled?: boolean

  /** An errored dropdown can alert a user to a problem. */
  error?: boolean

  /** A dropdown menu can contain floated content. */
  floating?: boolean

  /** A dropdown can take the full width of its parent */
  fluid?: boolean

  /** A dropdown menu can contain a header. */
  header?: React.ReactNode

  /** Shorthand for Icon. */
  icon?: SemanticShorthandItem<IconProps>

  /** A dropdown can be formatted to appear inline in other content. */
  inline?: boolean

  /** A dropdown can be formatted as a Menu item. */
  item?: boolean

  /** A dropdown can be labeled. */
  labeled?: boolean

  /** A dropdown can defer rendering its options until it is open. */
  lazyLoad?: boolean

  /** A dropdown can show that it is currently loading data. */
  loading?: boolean

  /** The minimum characters for a search to begin showing results. */
  minCharacters?: number

  /** A selection dropdown can allow multiple selections. */
  multiple?: boolean

  /** Message to display when there are no results. */
  noResultsMessage?: React.ReactNode

  /**
   * Called when a user adds a new item. Use this to update the options list.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and the new item's value.
   */
  onAddItem?: (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => void

  /**
   * Called on blur.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>, data: DropdownProps) => void

  /**
   * Called when the user attempts to change the value.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and proposed value.
   */
  onChange?: (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => void

  /**
   * Called on click.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>, data: DropdownProps) => void

  /**
   * Called when a close event happens.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClose?: (event: React.SyntheticEvent<HTMLElement> | null, data: DropdownProps) => void

  /**
   * Called on focus.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onFocus?: (event: React.FocusEvent<HTMLElement>, data: DropdownProps) => void

  /**
   * Called on key down.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void

  /**
   * Called when a multi-select label is clicked.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All label props.
   */
  onLabelClick?: (event: React.MouseEvent<HTMLElement>, data: LabelProps) => void

  /**
   * Called on mousedown.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onMouseDown?: (event: React.MouseEvent<HTMLElement>, data: DropdownProps) => void

  /**
   * Called when an open event happens.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onOpen?: (event: React.SyntheticEvent<HTMLElement> | null, data: DropdownProps) => void

  /**
   * Called on search input change.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props, includes current value of searchQuery.
   */
  onSearchChange?: (
    event: React.SyntheticEvent<HTMLElement>,
    data: DropdownOnSearchChangeData,
  ) => void

  /** Controls whether or not the dropdown menu is displayed. */
  open?: boolean

  /** Whether or not the menu should open when the dropdown is focused. */
  openOnFocus?: boolean

  /** Array of Dropdown.Item props e.g. `{ text: '', value: '' }` */
  options?: DropdownItemProps[]

  /** Placeholder text. */
  placeholder?: string

  /** A dropdown can be formatted so that its menu is pointing. */
  pointing?:
    | boolean
    | 'left'
    | 'right'
    | 'top'
    | 'top left'
    | 'top right'
    | 'bottom'
    | 'bottom left'
    | 'bottom right'

  /**
   * Mapped over the active items and returns shorthand for the active item Labels.
   * Only applies to `multiple` Dropdowns.
   *
   * @param {object} item - A currently active dropdown item.
   * @param {number} index - The current index.
   * @param {object} defaultLabelProps - The default props for an active item Label.
   * @returns {*} Shorthand for a Label.
   */
  renderLabel?: (item: DropdownItemProps, index: number, defaultLabelProps: LabelProps) => any

  /** A dropdown can have its menu scroll. */
  scrolling?: boolean

  /**
   * A selection dropdown can allow a user to search through a large list of choices.
   * Pass a function here to replace the default search.
   */
  search?: boolean | ((options: DropdownItemProps[], value: string) => DropdownItemProps[])

  /** A shorthand for a search input. */
  searchInput?: any

  /** Current value of searchQuery. Creates a controlled component. */
  searchQuery?: string

  /** Define whether the highlighted item should be selected on blur. */
  selectOnBlur?: boolean

  /** Whether dropdown should select new option when using keyboard shortcuts. Setting to false will require enter or left click to confirm a choice. */
  selectOnNavigation?: boolean

  /** Currently selected label in multi-select. */
  selectedLabel?: number | string

  /** A dropdown can be used to select between choices in a form. */
  selection?: any

  /** A simple dropdown can open without Javascript. */
  simple?: boolean

  /** A dropdown can receive focus. */
  tabIndex?: number | string

  /** The text displayed in the dropdown, usually for the active item. */
  text?: string

  /** Custom element to trigger the menu to become visible. Takes place of 'text'. */
  trigger?: React.ReactNode

  /** Current value or value array if multiple. Creates a controlled component. */
  value?: boolean | number | string | (boolean | number | string)[]

  /** Controls whether the dropdown will open upward. */
  upward?: boolean

  /**
   * A dropdown will go to the last element when ArrowUp is pressed on the first,
   * or go to the first when ArrowDown is pressed on the last( aka infinite selection )
   */
  wrapSelection?: boolean
}

export interface DropdownProps extends StrictDropdownProps {
  [key: string]: any
}

export interface DropdownOnSearchChangeData extends DropdownProps {
  searchQuery: string
}

/**
 * A dropdown allows a user to select a value from a series of options.
 * @see Form
 * @see Select
 * @see Menu
 */
function Dropdown({ ref, ...props }: DropdownProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    additionLabel = 'Add ',
    additionPosition = 'top',
    allowAdditions,
    basic,
    button,
    children,
    className,
    clearable,
    closeOnBlur = true,
    closeOnChange: closeOnChangeProp,
    closeOnEscape: closeOnEscapeProp = true,
    compact,
    deburr = false,
    defaultOpen,
    defaultSearchQuery,
    defaultSelectedLabel,
    defaultUpward,
    defaultValue,
    direction,
    disabled,
    error,
    floating,
    fluid,
    header,
    icon = 'dropdown',
    inline,
    item,
    labeled,
    lazyLoad,
    loading,
    minCharacters = 1,
    multiple,
    noResultsMessage = 'No results found.',
    onAddItem,
    onBlur,
    onChange,
    onClick,
    onClose,
    onFocus,
    onKeyDown,
    onLabelClick,
    onMouseDown,
    onOpen,
    onSearchChange,
    open: openProp,
    openOnFocus = true,
    options: optionsProp,
    placeholder,
    pointing,
    renderLabel = renderItemContent,
    scrolling,
    search,
    searchInput = 'text',
    searchQuery: searchQueryProp,
    selectOnBlur = true,
    selectOnNavigation = true,
    selectedLabel: selectedLabelProp,
    selection,
    simple,
    tabIndex,
    text,
    trigger,
    upward: upwardProp,
    value: valueProp,
    wrapSelection = true,
  } = props

  // ----------------------------------------
  // Auto-controlled state
  // ----------------------------------------

  const [open, setOpen] = useAutoControlledValue({
    state: openProp,
    defaultState: defaultOpen,
    initialState: false,
  })

  const [searchQuery, setSearchQuery] = useAutoControlledValue({
    state: searchQueryProp,
    defaultState: defaultSearchQuery,
    initialState: '',
  })

  const [selectedLabel, setSelectedLabel] = useAutoControlledValue({
    state: selectedLabelProp,
    defaultState: defaultSelectedLabel,
    initialState: undefined,
  })

  const [value, setValue] = useAutoControlledValue({
    state: valueProp,
    defaultState: defaultValue,
    initialState: multiple ? [] : '',
  })

  const [upward, setUpward] = useAutoControlledValue({
    state: upwardProp,
    defaultState: defaultUpward,
    initialState: undefined,
  })

  // ----------------------------------------
  // Regular state
  // ----------------------------------------

  const [focus, setFocus] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(() =>
    getSelectedIndex({
      additionLabel,
      additionPosition,
      allowAdditions,
      deburr,
      multiple,
      search,
      selectedIndex: 0,
      value,
      options: optionsProp,
      searchQuery,
    }),
  )

  // ----------------------------------------
  // Refs
  // ----------------------------------------

  const searchRef = React.useRef<HTMLInputElement>(null)
  const sizerRef = React.useRef<HTMLSpanElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const isMouseDownRef = React.useRef(false)
  const skipHandleCloseRef = React.useRef(false)

  // Ref callback to merge internal ref with forwarded ref
  const handleRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      dropdownRef.current = el
      setRef(ref, el)
    },
    [ref],
  )

  // ----------------------------------------
  // Derived state (replaces getAutoControlledStateFromProps)
  // ----------------------------------------

  const [prevTracking, setPrevTracking] = React.useState({ value, options: optionsProp })

  if (
    !shallowEqual(prevTracking.value, value) ||
    !_.isEqual(getKeyAndValues(optionsProp), getKeyAndValues(prevTracking.options))
  ) {
    setPrevTracking({ value, options: optionsProp })
    setSelectedIndex(
      getSelectedIndex({
        additionLabel,
        additionPosition,
        allowAdditions,
        deburr,
        multiple,
        search,
        selectedIndex,
        value,
        options: optionsProp,
        searchQuery,
      }),
    )
  }

  // ----------------------------------------
  // Props object for callbacks
  // ----------------------------------------

  const propsWithDefaults: any = {
    ...props,
    additionLabel,
    additionPosition,
    closeOnBlur,
    closeOnEscape: closeOnEscapeProp,
    deburr,
    icon,
    minCharacters,
    noResultsMessage,
    openOnFocus,
    renderLabel,
    searchInput,
    selectOnBlur,
    selectOnNavigation,
    wrapSelection,
  }

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  // Stable handler for document mouseup
  const handleDocumentMouseUp = React.useCallback(() => {
    debug('handleDocumentMouseUp()')
    isMouseDownRef.current = false
  }, [])

  // Track previous values for transition detection
  const prevFocusRef = React.useRef(false)
  const prevOpenRef = React.useRef(open)
  const prevSelectedIndexRef = React.useRef(selectedIndex)

  // Component did mount: open if initially open
  React.useEffect(() => {
    debug('componentDidMount()')
    if (open) {
      openDropdown(null, false)
    }
  }, [])

  // Component did update: manage focus, open/close, and selectedIndex transitions
  React.useEffect(() => {
    const prevFocus = prevFocusRef.current
    const prevOpen = prevOpenRef.current
    const prevSelectedIndex = prevSelectedIndexRef.current

    prevFocusRef.current = focus
    prevOpenRef.current = open
    prevSelectedIndexRef.current = selectedIndex

    debug('componentDidUpdate()')

    if (process.env.NODE_ENV !== 'production') {
      const isValueArray = Array.isArray(value)
      const hasValueProp = valueProp !== undefined

      if (hasValueProp && multiple && !isValueArray) {
        console.error(
          'Dropdown `value` must be an array when `multiple` is set.' +
            ` Received type: \`${Object.prototype.toString.call(value)}\`.`,
        )
      } else if (hasValueProp && !multiple && isValueArray) {
        console.error(
          'Dropdown `value` must not be an array when `multiple` is not set.' +
            ' Either set `multiple={true}` or use a string or number value.',
        )
      }
    }

    // focused / blurred
    if (!prevFocus && focus) {
      debug('dropdown focused')
      if (!isMouseDownRef.current) {
        const openable = !search || (search && minCharacters === 1 && !open)

        debug('mouse is not down, opening')
        if (openOnFocus && openable) openDropdown()
      }
    } else if (prevFocus && !focus) {
      debug('dropdown blurred')
      if (!isMouseDownRef.current && closeOnBlur) {
        debug('mouse is not down and closeOnBlur=true, closing')
        closeDropdown()
      }
    }

    // opened / closed
    if (!prevOpen && open) {
      debug('dropdown opened')
      setOpenDirection()
      scrollSelectedItemIntoView()
    } else if (prevOpen && !open) {
      debug('dropdown closed')
      if (!skipHandleCloseRef.current) {
        handleClose()
      }
      skipHandleCloseRef.current = false
    }

    if (prevSelectedIndex !== selectedIndex) {
      scrollSelectedItemIntoView()
    }
  })

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  }, [handleDocumentMouseUp])

  // ----------------------------------------
  // Document Event Handlers (replaces EventStack)
  // ----------------------------------------

  function handleChange(e: any, newValue: any) {
    debug('handleChange()', newValue)
    if (onChange) onChange(e, { ...propsWithDefaults, value: newValue })
  }

  function handleCloseOnChange(e: any) {
    const shouldClose = _.isUndefined(closeOnChangeProp) ? !multiple : closeOnChangeProp

    if (shouldClose) {
      closeDropdown(e, true) // skip handleClose
    }
  }

  // Stable reference for document event listener
  const handleCloseOnEscape = useEventCallback((e: KeyboardEvent) => {
    if (!closeOnEscapeProp) return
    if (e.key !== 'Escape') return
    e.preventDefault()

    debug('closeOnEscape()')
    closeDropdown(e as any)
  })

  // Stable reference for document event listener
  const removeItemOnBackspace = useEventCallback((e: KeyboardEvent) => {
    debug('removeItemOnBackspace()', e.key)

    if (e.key !== 'Backspace') return
    if (searchQuery || !search || !multiple || _.isEmpty(value)) return
    e.preventDefault()

    // remove most recent value
    const newValue = _.dropRight(value as any[])

    setValue(newValue)
    handleChange(e, newValue)
  })

  // Stable reference for document event listener
  const closeOnDocumentClick = useEventCallback((e: MouseEvent) => {
    debug('closeOnDocumentClick()')
    debug(e)

    if (!closeOnBlur) return

    // If event happened in the dropdown, ignore it
    if (dropdownRef.current && doesNodeContainClick(dropdownRef.current, e as any)) return

    closeDropdown()
  })

  // Replace EventStack: close on escape when open
  React.useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleCloseOnEscape)
    return () => document.removeEventListener('keydown', handleCloseOnEscape)
  }, [open, handleCloseOnEscape])

  // Replace EventStack: close on document click when open
  React.useEffect(() => {
    if (!open) return
    document.addEventListener('click', closeOnDocumentClick)
    return () => document.removeEventListener('click', closeOnDocumentClick)
  }, [open, closeOnDocumentClick])

  // Replace EventStack: remove item on backspace when focused
  React.useEffect(() => {
    if (!focus) return
    document.addEventListener('keydown', removeItemOnBackspace)
    return () => document.removeEventListener('keydown', removeItemOnBackspace)
  }, [focus, removeItemOnBackspace])

  // ----------------------------------------
  // Keyboard Navigation
  // ----------------------------------------

  function moveSelectionOnKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    debug('moveSelectionOnKeyDown()', e.key)

    if (!open) {
      return
    }

    const moves: Record<string, number> = {
      ArrowDown: 1,
      ArrowUp: -1,
    }
    const move = moves[e.key]

    if (move === undefined) {
      return
    }

    e.preventDefault()
    const nextIndex = getSelectedIndexAfterMove(move)

    if (!multiple && selectOnNavigation) {
      makeSelectedItemActive(e, nextIndex)
    }

    setSelectedIndex(nextIndex)
  }

  function openOnSpace(e: React.KeyboardEvent<HTMLElement>) {
    debug('openOnSpace()')

    const shouldHandleEvent =
      focus && !open && e.key === ' '
    const shouldPreventDefault =
      (e.target as HTMLElement)?.tagName !== 'INPUT' &&
      (e.target as HTMLElement)?.tagName !== 'TEXTAREA' &&
      (e.target as HTMLElement)?.isContentEditable !== true

    if (shouldHandleEvent) {
      if (shouldPreventDefault) {
        e.preventDefault()
      }

      openDropdown(e)
    }
  }

  function openOnArrow(e: React.KeyboardEvent<HTMLElement>) {
    debug('openOnArrow()')

    if (focus && !open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        openDropdown(e)
      }
    }
  }

  function makeSelectedItemActive(e: any, idx: any) {
    const selectedItem = getSelectedItem(idx)
    const selectedValue = _.get(selectedItem, 'value')
    const isDisabled = _.get(selectedItem, 'disabled')

    // prevent selecting null if there was no selected item value
    // prevent selecting duplicate items when the dropdown is closed
    // prevent selecting disabled items
    if (_.isNil(selectedValue) || !open || isDisabled) {
      return value
    }

    // state value may be undefined
    const newValue = multiple ? _.union(value as any[], [selectedValue]) : selectedValue
    const valueHasChanged = multiple ? !!_.difference(newValue as any[], value as any[]).length : newValue !== value

    if (valueHasChanged) {
      // notify the onChange prop that the user is trying to change value
      setValue(newValue)
      handleChange(e, newValue)

      // Heads up! This event handler should be called after `onChange`
      // Notify the onAddItem prop if this is a new value
      if (selectedItem?.['data-additional']) {
        if (onAddItem) onAddItem(e, { ...propsWithDefaults, value: selectedValue })
      }
    }

    return value
  }

  function selectItemOnEnter(e: React.KeyboardEvent<HTMLElement>) {
    debug('selectItemOnEnter()', e.key)

    if (!open) {
      return
    }

    const shouldSelect =
      e.key === 'Enter' ||
      // https://github.com/Semantic-Org/Semantic-UI-React/pull/3766
      (!search && e.key === ' ')

    if (!shouldSelect) {
      return
    }

    e.preventDefault()

    const optionSize = _.size(
      getMenuOptions({
        value,
        options: optionsProp,
        searchQuery,

        additionLabel,
        additionPosition,
        allowAdditions,
        deburr,
        multiple,
        search,
      }),
    )

    if (search && optionSize === 0) {
      return
    }

    const nextValue = makeSelectedItemActive(e, selectedIndex)

    // This is required as selected value may be the same
    setSelectedIndex(
      getSelectedIndex({
        additionLabel,
        additionPosition,
        allowAdditions,
        deburr,
        multiple,
        search,
        selectedIndex,

        value: nextValue,
        options: optionsProp,
        searchQuery: '',
      }),
    )

    handleCloseOnChange(e)
    clearSearchQuery()

    if (search) {
      searchRef.current?.focus()
    }
  }

  // ----------------------------------------
  // Component Event Handlers
  // ----------------------------------------

  function handleMouseDown_(e: React.MouseEvent<HTMLElement>) {
    debug('handleMouseDown()')

    isMouseDownRef.current = true
    if (onMouseDown) onMouseDown(e, propsWithDefaults)
    document.addEventListener('mouseup', handleDocumentMouseUp, { once: true })
  }

  function handleClick_(e: React.MouseEvent<HTMLElement>) {
    debug('handleClick()', e)

    if (onClick) onClick(e, propsWithDefaults)
    // prevent closeOnDocumentClick()
    e.stopPropagation()

    if (!search) return toggleDropdown(e)
    if (open) {
      searchRef.current?.focus()
      return
    }
    if ((searchQuery as string).length >= minCharacters || minCharacters === 1) {
      openDropdown(e)
      return
    }
    searchRef.current?.focus()
  }

  function handleIconClick(e: React.MouseEvent<HTMLElement>) {
    const hasVal = hasValue()
    debug('handleIconClick()', { e, clearable, hasValue: hasVal })

    if (onClick) onClick(e, propsWithDefaults)
    // prevent handleClick()
    e.stopPropagation()

    if (clearable && hasVal) {
      clearValue(e)
    } else {
      toggleDropdown(e)
    }
  }

  function handleItemClick(e: React.MouseEvent<HTMLElement>, clickedItem: any) {
    debug('handleItemClick()', clickedItem)

    const itemValue = clickedItem.value

    // prevent toggle() in handleClick()
    e.stopPropagation()

    // prevent closeOnDocumentClick() if multiple or item is disabled
    if (multiple || clickedItem.disabled) {
      e.nativeEvent.stopImmediatePropagation()
    }
    if (clickedItem.disabled) {
      return
    }

    const isAdditionItem = clickedItem['data-additional']
    const newValue = multiple ? _.union(value as any[], [itemValue]) : itemValue
    const valueHasChanged = multiple
      ? !!_.difference(newValue as any[], value as any[]).length
      : newValue !== value

    // notify the onChange prop that the user is trying to change value
    if (valueHasChanged) {
      setValue(newValue)
      handleChange(e, newValue)
    }

    clearSearchQuery()

    if (search) {
      searchRef.current?.focus()
    } else {
      dropdownRef.current?.focus()
    }

    handleCloseOnChange(e)

    // Heads up! This event handler should be called after `onChange`
    // Notify the onAddItem prop if this is a new value
    if (isAdditionItem) {
      if (onAddItem) onAddItem(e, { ...propsWithDefaults, value: itemValue })
    }
  }

  function handleFocus_(e: React.FocusEvent<HTMLElement>) {
    debug('handleFocus()')
    if (focus) return

    if (onFocus) onFocus(e, propsWithDefaults)
    setFocus(true)
  }

  function handleBlur_(e: React.FocusEvent<HTMLElement>) {
    debug('handleBlur()')

    // Heads up! Don't remove this.
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/1315
    const currentTarget = _.get(e, 'currentTarget')
    if (currentTarget && currentTarget.contains(document.activeElement)) return

    // do not "blur" when the mouse is down inside of the Dropdown
    if (isMouseDownRef.current) return

    if (onBlur) onBlur(e, propsWithDefaults)

    if (selectOnBlur && !multiple) {
      makeSelectedItemActive(e, selectedIndex)
      if (closeOnBlur) closeDropdown()
    }

    setFocus(false)
    clearSearchQuery()
  }

  function handleSearchChange_(e: React.SyntheticEvent<HTMLElement>, { value: inputValue }: any) {
    debug('handleSearchChange()')
    debug(inputValue)

    // prevent propagating to this.props.onChange()
    e.stopPropagation()

    const newQuery = inputValue

    if (onSearchChange) onSearchChange(e, { ...propsWithDefaults, searchQuery: newQuery })
    setSearchQuery(newQuery)
    setSelectedIndex(0)

    // open search dropdown on search query
    if (!open && newQuery.length >= minCharacters) {
      openDropdown()
      return
    }
    // close search dropdown if search query is too small
    if (open && minCharacters !== 1 && newQuery.length < minCharacters) closeDropdown()
  }

  function handleKeyDown_(e: React.KeyboardEvent<HTMLElement>) {
    moveSelectionOnKeyDown(e)
    openOnArrow(e)
    openOnSpace(e)
    selectItemOnEnter(e)

    if (onKeyDown) onKeyDown(e)
  }

  // ----------------------------------------
  // Getters
  // ----------------------------------------

  function getSelectedItem(idx: any) {
    const options = getMenuOptions({
      value,
      options: optionsProp,
      searchQuery,

      additionLabel,
      additionPosition,
      allowAdditions,
      deburr,
      multiple,
      search,
    })

    return _.get(options, `[${idx}]`)
  }

  function getItemByValue(val: any) {
    return _.find(optionsProp, { value: val })
  }

  function getDropdownAriaOptions(): Record<string, any> {
    const ariaOptions: Record<string, any> = {
      role: search ? 'combobox' : 'listbox',
      'aria-busy': loading,
      'aria-disabled': disabled,
      'aria-expanded': !!open,
    }
    if (ariaOptions.role === 'listbox') {
      ariaOptions['aria-multiselectable'] = multiple
    }
    return ariaOptions
  }

  function getDropdownMenuAriaOptions(): Record<string, any> {
    const ariaOptions: Record<string, any> = {}

    if (search) {
      ariaOptions['aria-multiselectable'] = multiple
      ariaOptions.role = 'listbox'
    }
    return ariaOptions
  }

  // ----------------------------------------
  // Setters
  // ----------------------------------------

  function clearSearchQuery() {
    debug('clearSearchQuery()')

    if (searchQuery === undefined || searchQuery === '') return

    setSearchQuery('')
  }

  function handleLabelClick(e: React.MouseEvent<HTMLElement>, labelProps: any) {
    debug('handleLabelClick()')
    // prevent focusing search input on click
    e.stopPropagation()

    setSelectedLabel(labelProps.value)
    if (onLabelClick) onLabelClick(e, labelProps)
  }

  function handleLabelRemove(e: React.MouseEvent<HTMLElement>, labelProps: any) {
    debug('handleLabelRemove()')
    // prevent focusing search input on click
    e.stopPropagation()
    const newValue = _.without(value as any[], labelProps.value)
    debug('label props:', labelProps)
    debug('current value:', value)
    debug('remove value:', labelProps.value)
    debug('new value:', newValue)

    setValue(newValue)
    handleChange(e, newValue)
  }

  function getSelectedIndexAfterMove(offset: number, startIndex: number = selectedIndex): any {
    debug('moveSelectionBy()')
    debug(`offset: ${offset}`)

    const options = getMenuOptions({
      value,
      options: optionsProp,
      searchQuery,

      additionLabel,
      additionPosition,
      allowAdditions,
      deburr,
      multiple,
      search,
    })

    // Prevent infinite loop
    // TODO: remove left part of condition after children API will be removed
    if (options === undefined || _.every(options, 'disabled')) return

    const lastIndex = options.length - 1
    // next is after last, wrap to beginning
    // next is before first, wrap to end
    let nextIndex = startIndex + offset

    // if 'wrapSelection' is set to false and selection is after last or before first, it just does not change
    if (!wrapSelection && (nextIndex > lastIndex || nextIndex < 0)) {
      nextIndex = startIndex
    } else if (nextIndex > lastIndex) {
      nextIndex = 0
    } else if (nextIndex < 0) {
      nextIndex = lastIndex
    }

    if (options[nextIndex].disabled) {
      return getSelectedIndexAfterMove(offset, nextIndex)
    }

    return nextIndex
  }

  // ----------------------------------------
  // Overrides
  // ----------------------------------------

  function handleIconOverrides(predefinedProps: any) {
    const classes = cx(clearable && hasValue() && 'clear', predefinedProps.className)

    return {
      className: classes,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        predefinedProps?.onClick?.(e, predefinedProps)
        handleIconClick(e)
      },
    }
  }

  // ----------------------------------------
  // Helpers
  // ----------------------------------------

  function clearValue(e: any) {
    const newValue = multiple ? [] : ''

    setValue(newValue)
    handleChange(e, newValue)
  }

  function computeSearchInputTabIndex() {
    if (!_.isNil(tabIndex)) return tabIndex
    return disabled ? -1 : 0
  }

  function computeSearchInputWidth(): number | undefined {
    if (sizerRef.current && searchQuery) {
      // resize the search input, temporarily show the sizer so we can measure it

      sizerRef.current.style.display = 'inline'
      sizerRef.current.textContent = searchQuery as string
      const searchWidth = Math.ceil(sizerRef.current.getBoundingClientRect().width)
      sizerRef.current.style.removeProperty('display')

      return searchWidth
    }
    return undefined
  }

  function computeTabIndex() {
    // don't set a root node tabIndex as the search input has its own tabIndex
    if (search) return undefined
    if (disabled) return -1
    return _.isNil(tabIndex) ? 0 : tabIndex
  }

  function handleSearchInputOverrides(predefinedProps: any) {
    return {
      onChange: (e: any, inputProps: any) => {
        predefinedProps?.onChange?.(e, inputProps)
        handleSearchChange_(e, inputProps)
      },
      ref: searchRef,
    }
  }

  function hasValue() {
    return multiple ? !_.isEmpty(value) : !_.isNil(value) && value !== ''
  }

  // ----------------------------------------
  // Behavior
  // ----------------------------------------

  function scrollSelectedItemIntoView() {
    debug('scrollSelectedItemIntoView()')
    if (!dropdownRef.current) return
    const menu = dropdownRef.current.querySelector('.menu.visible') as HTMLElement
    if (!menu) return
    const menuItem = menu.querySelector('.item.selected') as HTMLElement
    if (!menuItem) return
    debug(`menu: ${menu}`)
    debug(`item: ${menuItem}`)
    const isOutOfUpperView = menuItem.offsetTop < menu.scrollTop
    const isOutOfLowerView =
      menuItem.offsetTop + menuItem.clientHeight > menu.scrollTop + menu.clientHeight

    if (isOutOfUpperView) {
      menu.scrollTop = menuItem.offsetTop
    } else if (isOutOfLowerView) {
      menu.scrollTop = menuItem.offsetTop + menuItem.clientHeight - menu.clientHeight
    }
  }

  function setOpenDirection() {
    if (!dropdownRef.current) return

    const menu = dropdownRef.current.querySelector('.menu.visible') as HTMLElement

    if (!menu) return

    const dropdownRect = dropdownRef.current.getBoundingClientRect()
    const menuHeight = menu.clientHeight
    const spaceAtTheBottom =
      document.documentElement.clientHeight - dropdownRect.top - dropdownRect.height - menuHeight
    const spaceAtTheTop = dropdownRect.top - menuHeight

    const newUpward = spaceAtTheBottom < 0 && spaceAtTheTop > spaceAtTheBottom

    // set state only if there's a relevant difference
    if (!newUpward !== !upward) {
      setUpward(newUpward)
    }
  }

  function openDropdown(e: any = null, triggerSetState = true) {
    debug('open()', { disabled, search, open })

    if (disabled) return
    if (search) searchRef.current?.focus()

    if (onOpen) onOpen(e, propsWithDefaults)

    if (triggerSetState) {
      setOpen(true)
    }
    scrollSelectedItemIntoView()
  }

  function closeDropdown(e: any = null, skipClose = false) {
    debug('close()', { open })

    if (open) {
      if (onClose) onClose(e, propsWithDefaults)
      skipHandleCloseRef.current = skipClose
      setOpen(false)
    }
  }

  function handleClose() {
    debug('handleClose()')

    const hasSearchFocus = document.activeElement === searchRef.current
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/627
    // Blur the Dropdown on close so it is blurred after selecting an item.
    // This is to prevent it from re-opening when switching tabs after selecting an item.
    if (!hasSearchFocus && dropdownRef.current) {
      dropdownRef.current.blur()
    }

    const hasDropdownFocus = document.activeElement === dropdownRef.current
    const hasFocus = hasSearchFocus || hasDropdownFocus

    // We need to keep the virtual model in sync with the browser focus change
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/692
    setFocus(hasFocus)
  }

  function toggleDropdown(e: any) {
    return open ? closeDropdown(e) : openDropdown(e)
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  function renderText() {
    const hasVal = hasValue()

    const classes = cx(
      placeholder && !hasVal && 'default',
      'text',
      search && searchQuery && 'filtered',
    )
    let _text: any = placeholder
    let selectedItem: any

    if (text) {
      _text = text
    } else if (open && !multiple) {
      selectedItem = getSelectedItem(selectedIndex)
    } else if (hasVal) {
      selectedItem = getItemByValue(value)
    }

    return DropdownText.create(selectedItem ? renderItemContent(selectedItem) : _text, {
      defaultProps: {
        className: classes,
      },
    })
  }

  function renderSearchInput() {
    return (
      search &&
      DropdownSearchInput.create(searchInput, {
        defaultProps: {
          style: { width: computeSearchInputWidth() },
          tabIndex: computeSearchInputTabIndex(),
          value: searchQuery,
        },
        overrideProps: handleSearchInputOverrides,
      })
    )
  }

  function renderSearchSizer() {
    return search && multiple && <span className='sizer' ref={sizerRef} />
  }

  function renderLabels() {
    debug('renderLabels()')
    if (!multiple || _.isEmpty(value)) {
      return
    }
    const selectedItems = _.map(value as any[], getItemByValue)
    debug('selectedItems', selectedItems)

    // if no item could be found for a given state value the selected item will be undefined
    // compact the selectedItems so we only have actual objects left
    return _.map(_.compact(selectedItems), (labelItem: any, index: number) => {
      const defaultProps = {
        active: labelItem.value === selectedLabel,
        as: 'a',
        key: getKeyOrValue(labelItem.key, labelItem.value),
        onClick: handleLabelClick,
        onRemove: handleLabelRemove,
        value: labelItem.value,
      }

      return Label.create(renderLabel(labelItem, index, defaultProps as any), { defaultProps })
    })
  }

  function renderOptions() {
    // lazy load, only render options when open
    if (lazyLoad && !open) return null

    const options = getMenuOptions({
      value,
      options: optionsProp,
      searchQuery,

      additionLabel,
      additionPosition,
      allowAdditions,
      deburr,
      multiple,
      search,
    })

    if (noResultsMessage !== null && search && _.isEmpty(options)) {
      return <div className='message'>{noResultsMessage}</div>
    }

    const isActive = multiple
      ? (optValue: any) => _.includes(value as any[], optValue)
      : (optValue: any) => optValue === value

    return _.map(options, (opt: any, i: number) =>
      DropdownItem.create(
        {
          active: isActive(opt.value),
          selected: selectedIndex === i,
          ...opt,
          key: getKeyOrValue(opt.key, opt.value),
          // Needed for handling click events on disabled items
          style: { ...opt.style, pointerEvents: 'all' },
        },
        {
          generateKey: false,
          overrideProps: (predefinedProps: any) => ({
            onClick: (e: React.MouseEvent<HTMLElement>, clickedItem: any) => {
              predefinedProps.onClick?.(e, clickedItem)
              handleItemClick(e, clickedItem)
            },
          }),
        },
      ),
    )
  }

  function renderMenu() {
    const ariaOptions = getDropdownMenuAriaOptions()

    // Single menu child: cloneElement is retained here to merge className and
    // aria props onto the user-supplied DropdownMenu child. This is the children
    // API path (as opposed to the `options` prop shorthand). A Context-based
    // approach (DropdownMenuContext) could replace this in a future version.
    if (!childrenUtils.isNil(children)) {
      const menuChild = React.Children.only(children) as React.ReactElement
      const menuClassName = cx(direction, getKeyOnly(open, 'visible'), (menuChild.props as any).className)

      return React.cloneElement(menuChild, { className: menuClassName, ...ariaOptions } as any)
    }

    return (
      <DropdownMenu {...ariaOptions} direction={direction} open={open}>
        {DropdownHeader.create(header, { autoGenerateKey: false })}
        {renderOptions()}
      </DropdownMenu>
    )
  }

  // ----------------------------------------
  // Main render
  // ----------------------------------------

  debug('render()')
  debug('props', props)
  debug('state', { open, searchQuery, selectedLabel, value, upward, focus, selectedIndex })

  // Classes
  const classes = cx(
    'ui',
    getKeyOnly(open, 'active visible'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(error, 'error'),
    getKeyOnly(loading, 'loading'),

    getKeyOnly(basic, 'basic'),
    getKeyOnly(button, 'button'),
    getKeyOnly(compact, 'compact'),
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(floating, 'floating'),
    getKeyOnly(inline, 'inline'),
    // TODO: consider augmentation to render Dropdowns as Button/Menu, solves icon/link item issues
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/401#issuecomment-240487229
    // TODO: the icon class is only required when a dropdown is a button
    // getKeyOnly(icon, 'icon'),
    getKeyOnly(labeled, 'labeled'),
    getKeyOnly(item, 'item'),
    getKeyOnly(multiple, 'multiple'),
    getKeyOnly(search, 'search'),
    getKeyOnly(selection, 'selection'),
    getKeyOnly(simple, 'simple'),
    getKeyOnly(scrolling, 'scrolling'),
    getKeyOnly(upward, 'upward'),

    getKeyOrValueAndKey(pointing, 'pointing'),
    'dropdown',
    className,
  )
  const rest = getUnhandledProps(Dropdown, props)
  const ElementType = getComponentType(props)
  const ariaOptions = getDropdownAriaOptions()

  return (
    <ElementType
      {...rest}
      {...ariaOptions}
      className={classes}
      onBlur={handleBlur_}
      onClick={handleClick_}
      onKeyDown={handleKeyDown_}
      onMouseDown={handleMouseDown_}
      onFocus={handleFocus_}
      onChange={handleChange}
      tabIndex={computeTabIndex()}
      ref={handleRef}
    >
      {renderLabels()}
      {renderSearchInput()}
      {renderSearchSizer()}
      {trigger || renderText()}
      {Icon.create(icon, {
        overrideProps: handleIconOverrides,
        autoGenerateKey: false,
      })}
      {renderMenu()}
    </ElementType>
  )
}

Dropdown.handledProps = [
  'as',
  'additionLabel',
  'additionPosition',
  'allowAdditions',
  'basic',
  'button',
  'children',
  'className',
  'clearable',
  'closeOnBlur',
  'closeOnChange',
  'closeOnEscape',
  'compact',
  'deburr',
  'defaultOpen',
  'defaultSearchQuery',
  'defaultSelectedLabel',
  'defaultUpward',
  'defaultValue',
  'direction',
  'disabled',
  'error',
  'floating',
  'fluid',
  'header',
  'icon',
  'inline',
  'item',
  'labeled',
  'lazyLoad',
  'loading',
  'minCharacters',
  'multiple',
  'noResultsMessage',
  'onAddItem',
  'onBlur',
  'onChange',
  'onClick',
  'onClose',
  'onFocus',
  'onKeyDown',
  'onLabelClick',
  'onMouseDown',
  'onOpen',
  'onSearchChange',
  'open',
  'openOnFocus',
  'options',
  'placeholder',
  'pointing',
  'renderLabel',
  'scrolling',
  'search',
  'searchInput',
  'searchQuery',
  'selectOnBlur',
  'selectOnNavigation',
  'selectedLabel',
  'selection',
  'simple',
  'tabIndex',
  'text',
  'trigger',
  'upward',
  'value',
  'wrapSelection',
]

Dropdown.displayName = 'Dropdown'

Dropdown.Divider = DropdownDivider
Dropdown.Header = DropdownHeader
Dropdown.Item = DropdownItem
Dropdown.Menu = DropdownMenu
Dropdown.SearchInput = DropdownSearchInput
Dropdown.Text = DropdownText

export default Dropdown
