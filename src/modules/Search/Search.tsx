import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'
import shallowEqual from '../../lib/shallowEqual'

import {
  getComponentType,
  getUnhandledProps,
  htmlInputAttrs,
  isBrowser,
  makeDebugger,
  partitionHTMLProps,
  useAutoControlledValue,
  useEventCallback,
  getKeyOnly,
  getValueAndKey,
} from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import type { InputProps } from '../../elements/Input'
import Input from '../../elements/Input'
import SearchCategory from './SearchCategory'
import type { SearchCategoryProps } from './SearchCategory'
import SearchCategoryLayout from './SearchCategoryLayout'
import type { SearchCategoryLayoutProps } from './SearchCategoryLayout'
import SearchResult from './SearchResult'
import type { SearchResultProps } from './SearchResult'
import SearchResults from './SearchResults'

const debug = makeDebugger('search')

export interface StrictSearchProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  // ------------------------------------
  // Behavior
  // ------------------------------------

  /** Initial value of open. */
  defaultOpen?: boolean

  /** Initial value. */
  defaultValue?: string

  /** Shorthand for Icon. */
  icon?: any

  /** Minimum characters to query for results. */
  minCharacters?: number

  /** Additional text for "No Results" message with less emphasis. */
  noResultsDescription?: React.ReactNode

  /** Message to display when there are no results. */
  noResultsMessage?: React.ReactNode

  /** Controls whether or not the results menu is displayed. */
  open?: boolean

  /**
   * One of:
   * - array of Search.Result props e.g. `{ title: '', description: '' }` or
   * - object of categories e.g. `{ name: '', results: [{ title: '', description: '' }]`
   */
  results?: any[] | Record<string, any>

  /** Whether the search should automatically select the first result after searching. */
  selectFirstResult?: boolean

  /** Whether a "no results" message should be shown if no results are found. */
  showNoResults?: boolean

  /** Current value of the search input. Creates a controlled component. */
  value?: string

  // ------------------------------------
  // Rendering
  // ------------------------------------

  /**
   * Renders the SearchCategory layout.
   *
   * @param {object} props - The SearchCategoryLayout props object.
   * @returns {*} - Renderable SearchCategory layout.
   */
  categoryLayoutRenderer?: (
    props: Pick<SearchCategoryLayoutProps, 'categoryContent' | 'resultsContent'>,
  ) => React.ReactElement<any>

  /**
   * Renders the SearchCategory contents.
   *
   * @param {object} props - The SearchCategory props object.
   * @returns {*} - Renderable SearchCategory contents.
   */
  categoryRenderer?: (props: SearchCategoryProps) => React.ReactElement<any>

  /**
   * Renders the SearchResult contents.
   *
   * @param {object} props - The SearchResult props object.
   * @returns {*} - Renderable SearchResult contents.
   */
  resultRenderer?: (props: SearchResultProps) => React.ReactElement<any>

  // ------------------------------------
  // Callbacks
  // ------------------------------------

  /**
   * Called on blur.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>, data: SearchProps) => void

  /**
   * Called on focus.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onFocus?: (event: React.FocusEvent<HTMLElement>, data: SearchProps) => void

  /**
   * Called on mousedown.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onMouseDown?: (event: React.MouseEvent<HTMLElement>, data: SearchProps) => void

  /**
   * Called when a result is selected.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onResultSelect?: (event: React.MouseEvent<HTMLDivElement>, data: SearchResultData) => void

  /**
   * Called on search input change.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props, includes current value of search input.
   */
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>, data: SearchProps) => void

  /**
   * Called when the active selection index is changed.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onSelectionChange?: (event: React.KeyboardEvent<HTMLElement> | KeyboardEvent, data: SearchResultData) => void

  // ------------------------------------
  // Style
  // ------------------------------------

  /** A search can have its results aligned to its left or right container edge. */
  aligned?: string

  /** A search can display results from remote content ordered by categories. */
  category?: boolean

  /** Additional classes. */
  className?: string

  /** A search can have its results take up the width of its container. */
  fluid?: boolean

  /** Shorthand for input element. */
  input?: SemanticShorthandItem<InputProps>

  /** A search can show a loading indicator. */
  loading?: boolean

  /** A search can have different sizes. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'

  /** A search can show placeholder text when empty. */
  placeholder?: string
}

export interface SearchProps extends StrictSearchProps {
  [key: string]: any
}

export interface SearchResultData extends SearchProps {
  result: any
}

const overrideSearchInputProps = (predefinedProps: any) => {
  const { input } = predefinedProps

  if (_.isUndefined(input)) {
    return { ...predefinedProps, input: { className: 'prompt' } }
  }
  if (_.isPlainObject(input)) {
    return { ...predefinedProps, input: { ...input, className: cx(input.className, 'prompt') } }
  }

  return predefinedProps
}

/**
 * A search module allows a user to query for results from a selection of data
 */
function Search(props: SearchProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    ref,
    aligned,
    category,
    categoryLayoutRenderer,
    categoryRenderer,
    className,
    defaultOpen,
    defaultValue,
    fluid,
    icon = 'search',
    input = 'text',
    loading,
    minCharacters = 1,
    noResultsDescription,
    noResultsMessage = 'No results found.',
    onBlur,
    onFocus,
    onMouseDown,
    onResultSelect,
    onSearchChange,
    onSelectionChange,
    open: openProp,
    placeholder,
    resultRenderer,
    results,
    selectFirstResult,
    showNoResults = true,
    size,
    value: valueProp,
  } = props

  // ----------------------------------------
  // Auto-controlled state
  // ----------------------------------------

  const [open, setOpen] = useAutoControlledValue({
    state: openProp,
    defaultState: defaultOpen,
    initialState: false,
  })

  const [value, setValue] = useAutoControlledValue({
    state: valueProp,
    defaultState: defaultValue,
    initialState: '',
  })

  // ----------------------------------------
  // Regular state
  // ----------------------------------------

  const [focus, setFocus] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(selectFirstResult ? 0 : -1)

  // ----------------------------------------
  // Derived state (replaces getAutoControlledStateFromProps)
  // ----------------------------------------

  const [prevValue, setPrevValue] = React.useState(value)

  if (!shallowEqual(prevValue, value)) {
    setPrevValue(value)
    setSelectedIndex(selectFirstResult ? 0 : -1)
  }

  // ----------------------------------------
  // Refs
  // ----------------------------------------

  const isMouseDownRef = React.useRef(false)

  // ----------------------------------------
  // Props object for callbacks
  // ----------------------------------------

  const propsWithDefaults = {
    ...props,
    icon,
    input,
    minCharacters,
    noResultsMessage,
    showNoResults,
  }

  // ----------------------------------------
  // Track previous values for transition detection
  // ----------------------------------------

  const prevFocusRef = React.useRef(false)
  const prevOpenRef = React.useRef(open)

  // ----------------------------------------
  // Document Event Handlers (replaces EventStack)
  // ----------------------------------------

  function handleResultSelect(e: any, result: any) {
    debug('handleResultSelect()')
    debug(result)

    if (onResultSelect) onResultSelect(e, { ...propsWithDefaults, result })
  }

  function handleSelectionChange(e: any, index?: number) {
    debug('handleSelectionChange()')

    const result = getSelectedResult(index !== undefined ? index : selectedIndex)
    if (onSelectionChange) onSelectionChange(e, { ...propsWithDefaults, result })
  }

  function closeSearch() {
    debug('close()')
    setOpen(false)
  }

  function openSearch() {
    debug('open()')
    setOpen(true)
  }

  // Open if the current value is greater than the minCharacters prop
  function tryOpen(currentValue: string = value as string) {
    debug('open()')

    if (currentValue.length < minCharacters) return

    openSearch()
  }

  function getFlattenedResults(): any[] {
    return !category
      ? (results as any[])
      : _.reduce(results as any, (memo: any[], categoryData: any) => memo.concat(categoryData.results), [])
  }

  function getSelectedResult(index: number = selectedIndex): any {
    const flatResults = getFlattenedResults()
    return _.get(flatResults, index)
  }

  function setSearchValue(val: string) {
    debug('setValue()')
    debug('value', val)

    setValue(val)
    setSelectedIndex(selectFirstResult ? 0 : -1)
  }

  function scrollSelectedItemIntoView() {
    debug('scrollSelectedItemIntoView()')
    // Do not access document when server side rendering
    if (!isBrowser()) return
    const menu = document.querySelector('.ui.search.active.visible .results.visible')
    if (!menu) return
    debug(`menu (results): ${menu}`)
    const menuItem = menu.querySelector('.result.active') as HTMLElement | null
    if (!menuItem) return
    debug(`menu (results): ${menu}`)
    debug(`item (result): ${menuItem}`)
    const isOutOfUpperView = menuItem.offsetTop < menu.scrollTop
    const isOutOfLowerView =
      menuItem.offsetTop + menuItem.clientHeight > menu.scrollTop + menu.clientHeight

    if (isOutOfUpperView) {
      menu.scrollTop = menuItem.offsetTop
    } else if (isOutOfLowerView) {
      menu.scrollTop = menuItem.offsetTop + menuItem.clientHeight - menu.clientHeight
    }
  }

  function moveSelectionBy(e: any, offset: number) {
    debug('moveSelectionBy()')
    debug(`offset: ${offset}`)

    const flatResults = getFlattenedResults()
    const lastIndex = flatResults.length - 1

    // next is after last, wrap to beginning
    // next is before first, wrap to end
    let nextIndex = selectedIndex + offset
    if (nextIndex > lastIndex) nextIndex = 0
    else if (nextIndex < 0) nextIndex = lastIndex

    setSelectedIndex(nextIndex)
    scrollSelectedItemIntoView()
    handleSelectionChange(e, nextIndex)
  }

  // Stable references for document event listeners
  const closeOnEscape = useEventCallback((e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    e.preventDefault()
    closeSearch()
  })

  const moveSelectionOnKeyDown = useEventCallback((e: KeyboardEvent) => {
    debug('moveSelectionOnKeyDown()')
    debug(e.key)
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        moveSelectionBy(e, 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        moveSelectionBy(e, -1)
        break
      default:
        break
    }
  })

  const selectItemOnEnter = useEventCallback((e: KeyboardEvent) => {
    debug('selectItemOnEnter()')
    debug(e.key)
    if (e.key !== 'Enter') return

    const result = getSelectedResult()

    // prevent selecting null if there was no selected item value
    if (!result) return

    e.preventDefault()

    // notify the onResultSelect prop that the user is trying to change value
    setSearchValue(result.title)
    handleResultSelect(e, result)
    closeSearch()
  })

  const closeOnDocumentClick = useEventCallback(() => {
    debug('closeOnDocumentClick()')
    closeSearch()
  })

  const handleDocumentMouseUp = useEventCallback(() => {
    debug('handleDocumentMouseUp()')
    isMouseDownRef.current = false
  })

  // ----------------------------------------
  // Effects (replaces EventStack)
  // ----------------------------------------

  // When focused and open, subscribe to keydown for navigation
  React.useEffect(() => {
    if (!focus) return
    if (!open) return

    document.addEventListener('keydown', moveSelectionOnKeyDown)
    document.addEventListener('keydown', selectItemOnEnter)
    return () => {
      document.removeEventListener('keydown', moveSelectionOnKeyDown)
      document.removeEventListener('keydown', selectItemOnEnter)
    }
  }, [focus, open, moveSelectionOnKeyDown, selectItemOnEnter])

  // When open, subscribe to close on escape and close on document click
  React.useEffect(() => {
    if (!open) return

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('click', closeOnDocumentClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('click', closeOnDocumentClick)
    }
  }, [open, closeOnEscape, closeOnDocumentClick])

  // Track focus/blur transitions for open/close
  React.useEffect(() => {
    const prevFocus = prevFocusRef.current
    const prevOpen = prevOpenRef.current

    prevFocusRef.current = focus
    prevOpenRef.current = open

    debug('componentDidUpdate()')

    // focused / blurred
    if (!prevFocus && focus) {
      debug('search focused')
      if (!isMouseDownRef.current) {
        debug('mouse is not down, opening')
        tryOpen()
      }
    } else if (prevFocus && !focus) {
      debug('search blurred')
      if (!isMouseDownRef.current) {
        debug('mouse is not down, closing')
        closeSearch()
      }
    }

    // opened / closed
    if (!prevOpen && open) {
      debug('search opened')
      openSearch()
    } else if (prevOpen && !open) {
      debug('search closed')
      closeSearch()
    }
  })

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      debug('componentWillUnmount()')
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  }, [])

  // ----------------------------------------
  // Component Event Handlers
  // ----------------------------------------

  function handleMouseDownEvt(e: React.MouseEvent<HTMLElement>) {
    debug('handleMouseDown()')

    isMouseDownRef.current = true
    if (onMouseDown) onMouseDown(e, propsWithDefaults)
    document.addEventListener('mouseup', handleDocumentMouseUp, { once: true })
  }

  function handleInputClick(e: React.MouseEvent<HTMLInputElement>) {
    debug('handleInputClick()', e)

    // prevent closeOnDocumentClick()
    e.nativeEvent.stopImmediatePropagation()

    tryOpen()
  }

  function handleItemClick(e: React.MouseEvent<HTMLDivElement>, { id }: any) {
    debug('handleItemClick()')
    debug(id)
    const result = getSelectedResult(id)

    // prevent closeOnDocumentClick()
    e.nativeEvent.stopImmediatePropagation()

    // notify the onResultSelect prop that the user is trying to change value
    setSearchValue(result.title)
    handleResultSelect(e, result)
    closeSearch()
  }

  function handleItemMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    debug('handleItemMouseDown()')

    // Heads up! We should prevent default to prevent blur events.
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/3298
    e.preventDefault()
  }

  function handleFocus(e: React.FocusEvent<HTMLElement>) {
    debug('handleFocus()')

    if (onFocus) onFocus(e, propsWithDefaults)
    setFocus(true)
  }

  function handleBlur(e: React.FocusEvent<HTMLElement>) {
    debug('handleBlur()')

    if (onBlur) onBlur(e, propsWithDefaults)
    setFocus(false)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    debug('handleSearchChange()')
    debug(e.target.value)
    // prevent propagating to this.props.onChange()
    e.stopPropagation()
    const newQuery = e.target.value

    if (onSearchChange) onSearchChange(e, { ...propsWithDefaults, value: newQuery })

    // open search dropdown on search query
    if (newQuery.length < minCharacters) {
      closeSearch()
    } else if (!open) {
      tryOpen(newQuery)
    }

    setSearchValue(newQuery)
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  function renderSearchInput(rest: any) {
    return Input.create(input, {
      autoGenerateKey: false,
      defaultProps: {
        ...rest,
        autoComplete: 'off',
        icon,
        onChange: handleSearchChange,
        onClick: handleInputClick,
        tabIndex: '0',
        value,
        placeholder,
      },
      // Nested shorthand props need special treatment to survive the shallow merge
      overrideProps: overrideSearchInputProps,
    })
  }

  function renderNoResults() {
    return (
      <div className='message empty'>
        <div className='header'>{noResultsMessage}</div>
        {noResultsDescription && <div className='description'>{noResultsDescription}</div>}
      </div>
    )
  }

  /**
   * Offset is needed for determining the active item for results within a
   * category. Since the index is reset to 0 for each new category, an offset
   * must be passed in.
   */
  function renderResult({ childKey, ...result }: any, index: number, _array: any, offset = 0) {
    const offsetIndex = index + offset

    return (
      <SearchResult
        key={childKey ?? (result.id || result.title)}
        active={selectedIndex === offsetIndex}
        onClick={handleItemClick}
        onMouseDown={handleItemMouseDown}
        renderer={resultRenderer}
        {...result}
        id={offsetIndex} // Used to lookup the result on item click
      />
    )
  }

  function renderResults() {
    return _.map(results as any[], renderResult)
  }

  function renderCategories() {
    let count = 0

    return _.map(results as any, ({ childKey, ...categoryItem }: any) => {
      const categoryKey = childKey ?? categoryItem.name
      const categoryProps = {
        active: _.inRange(selectedIndex, count, count + categoryItem.results.length),
        layoutRenderer: categoryLayoutRenderer,
        renderer: categoryRenderer,
        ...categoryItem,
      }
      const renderFn = _.partialRight(renderResult, count)

      count += categoryItem.results.length

      return (
        <SearchCategory key={categoryKey} {...categoryProps}>{categoryItem.results.map(renderFn)}</SearchCategory>
      )
    })
  }

  function renderMenuContent() {
    if (_.isEmpty(results)) {
      return showNoResults ? renderNoResults() : null
    }

    return category ? renderCategories() : renderResults()
  }

  function renderResultsMenu() {
    const resultsClasses = open ? 'visible' : ''
    const menuContent = renderMenuContent()

    if (!menuContent) return

    return <SearchResults className={resultsClasses}>{menuContent}</SearchResults>
  }

  // ----------------------------------------
  // Main render
  // ----------------------------------------

  debug('render()')
  debug('props', props)
  debug('state', { open, value, focus, selectedIndex })

  // Classes
  const classes = cx(
    'ui',
    open && 'active visible',
    size,
    getKeyOnly(category, 'category'),
    getKeyOnly(focus, 'focus'),
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(loading, 'loading'),
    getValueAndKey(aligned, 'aligned'),
    'search',
    className,
  )
  const unhandled = getUnhandledProps(Search, props)
  const ElementType = getComponentType(props)
  const [htmlInputProps, rest] = partitionHTMLProps(unhandled, {
    htmlProps: htmlInputAttrs,
  })

  return (
    <ElementType
      {...rest}
      className={classes}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={handleMouseDownEvt}
      ref={ref}
    >
      {renderSearchInput(htmlInputProps)}
      {renderResultsMenu()}
    </ElementType>
  )
}

Search.displayName = 'Search'
Search.handledProps = [
  'as',
  'aligned',
  'category',
  'categoryLayoutRenderer',
  'categoryRenderer',
  'className',
  'defaultOpen',
  'defaultValue',
  'fluid',
  'icon',
  'input',
  'loading',
  'minCharacters',
  'noResultsDescription',
  'noResultsMessage',
  'onBlur',
  'onFocus',
  'onMouseDown',
  'onResultSelect',
  'onSearchChange',
  'onSelectionChange',
  'open',
  'placeholder',
  'resultRenderer',
  'results',
  'selectFirstResult',
  'showNoResults',
  'size',
  'value',
]

Search.Category = SearchCategory
Search.CategoryLayout = SearchCategoryLayout
Search.Result = SearchResult
Search.Results = SearchResults

export default Search
