# Phase 31: Migrate Dropdown and All Subcomponents

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Phase ID**   | 31                                           |
| **Title**      | Migrate Dropdown and All Subcomponents        |
| **Stage**      | 6 - Component Migration: Modules              |
| **Dependencies** | Phase 16 (Module Hooks), Phase 18 (ModernAutoControlledComponent removal), Phase 15 (Shared Infrastructure) |
| **Complexity** | High -- THIS IS THE MOST COMPLEX MIGRATION IN THE ENTIRE PROJECT |
| **Scope**      | 8 component files, 2 utility files, 8 type definition files, 1 barrel index, 1 TODO.md |

---

## Objective

Convert the Dropdown module from its current mixed architecture (functional wrapper + class component inner with `ModernAutoControlledComponent` base class) to a fully functional TypeScript implementation using React 19.2 ref-as-prop semantics and hooks. This is the single most complex component in the Semantic-UI-React library, with ~1500 lines of logic in the main component, 5 auto-controlled state properties, 31+ event handlers, complex keyboard navigation, search filtering, multiple selection with labels, and a legacy `EventStack` dependency. The class component `DropdownInner` must be completely rewritten as a functional component with hooks.

---

## Background

### Current Architecture

The Dropdown has a two-layer architecture that exists specifically to work around `forwardRef` limitations with class components:

**Outer `Dropdown`** (`src/modules/Dropdown/Dropdown.js`, lines 68-107): A functional component wrapped in `React.forwardRef` that extracts default prop values and passes everything (including `innerRef={ref}`) to the class component `DropdownInner`.

**Inner `DropdownInner`** (lines 109-1162): A class component extending `ModernAutoControlledComponent` (aliased as `Component`). This is the actual implementation with all the behavior. Key characteristics:

**Auto-controlled state** (5 properties via `DropdownInner.autoControlledProps`):
- `open` -- whether the dropdown menu is visible
- `searchQuery` -- current text in the search input
- `selectedLabel` -- currently selected label in multi-select
- `value` -- the selected value(s)
- `upward` -- whether the menu opens upward

Additional non-auto-controlled state:
- `focus` -- whether the dropdown has focus
- `selectedIndex` -- index of the keyboard-highlighted option

**`getAutoControlledStateFromProps`** (static method, lines 123-152): Derives `selectedIndex` from props and computed state. Uses `shallowEqual` to compare previous and current values/options to avoid unnecessary recalculation. This must be converted to `useMemo` or `useEffect` logic.

**Lifecycle methods**:
- `componentDidMount`: Opens dropdown if `open` state is true
- `shouldComponentUpdate`: Shallow comparison of props and state for performance
- `componentDidUpdate`: Complex multi-concern method (~30 lines) that handles:
  - Dev-mode validation of value type (array vs non-array vs multiple prop)
  - Focus/blur transitions -> open/close behavior
  - Open/close transitions -> menu direction and scroll into view

**Refs** (3 `createRef` calls + 1 callback ref):
- `searchRef = createRef()` -- search input element
- `sizerRef = createRef()` -- hidden span for measuring search input width
- `ref = createRef()` -- root dropdown element
- `handleRef(el)` -- callback ref that sets both `this.ref.current` and the forwarded `innerRef`

**Event handlers** (31+ methods organized into sections):

*Document Event Handlers:*
- `handleChange(e, value)` -- core onChange dispatch
- `closeOnChange(e)` -- conditional close after selection
- `closeOnEscape(e)` -- escape key handler (via EventStack)
- `moveSelectionOnKeyDown(e)` -- arrow key navigation
- `openOnSpace(e)` -- spacebar opens
- `openOnArrow(e)` -- arrow keys open
- `makeSelectedItemActive(e, selectedIndex)` -- activates the highlighted item
- `selectItemOnEnter(e)` -- enter/space selects
- `removeItemOnBackspace(e)` -- backspace removes last label (via EventStack)
- `closeOnDocumentClick(e)` -- click outside closes (via EventStack)

*Component Event Handlers:*
- `handleMouseDown(e)` -- tracks mouse state
- `handleDocumentMouseUp()` -- clears mouse state
- `handleClick(e)` -- main click handler with search/non-search branching
- `handleIconClick(e)` -- clear or toggle
- `handleItemClick(e, item)` -- option selection
- `handleFocus(e)` -- focus tracking
- `handleBlur(e)` -- blur with selectOnBlur behavior
- `handleSearchChange(e, { value })` -- search input change
- `handleKeyDown(e)` -- keyboard event router
- `handleLabelClick(e, labelProps)` -- multi-select label selection
- `handleLabelRemove(e, labelProps)` -- multi-select label removal

*Getters:*
- `getSelectedItem(selectedIndex)` -- gets item at index from filtered options
- `getItemByValue(value)` -- finds item in original options by value
- `getDropdownAriaOptions()` -- ARIA attributes for root
- `getDropdownMenuAriaOptions()` -- ARIA attributes for menu

*Setters:*
- `clearSearchQuery()` -- resets search
- `getSelectedIndexAfterMove(offset, startIndex)` -- recursive function for keyboard navigation with disabled item skipping and wrap-around

*Overrides:*
- `handleIconOverrides(predefinedProps)` -- icon click/class merging
- `handleSearchInputOverrides(predefinedProps)` -- search input change/ref merging

*Helpers:*
- `clearValue(e)` -- clears to empty
- `computeSearchInputTabIndex()` -- tabIndex for search input
- `computeSearchInputWidth()` -- measures sizer span for search input width
- `computeTabIndex()` -- tabIndex for root
- `hasValue()` -- checks if current value is non-empty

*Behavior:*
- `scrollSelectedItemIntoView()` -- DOM query + scroll positioning
- `setOpenDirection()` -- measures viewport space and sets `upward` state
- `open(e, triggerSetState)` -- opens the dropdown
- `close(e, callback)` -- closes the dropdown
- `handleClose()` -- post-close blur and focus management
- `toggle(e)` -- open/close toggle

*Render methods:*
- `renderText()` -- displays selected value or placeholder
- `renderSearchInput()` -- search input with sizer width
- `renderSearchSizer()` -- hidden span for width measurement
- `renderLabels()` -- multi-select value labels
- `renderOptions()` -- filtered option list
- `renderMenu()` -- menu container (cloneElement or DropdownMenu)
- `render()` -- main render with all sub-renders composed

**EventStack dependency**: The component uses `@semantic-ui-react/event-stack` for document-level event listeners (`keydown` for escape/backspace, `click` for outside click). These are rendered as JSX elements:
```jsx
{open && <EventStack name='keydown' on={this.closeOnEscape} />}
{open && <EventStack name='click' on={this.closeOnDocumentClick} />}
{focus && <EventStack name='keydown' on={this.removeItemOnBackspace} />}
```
These must be replaced with `useEffect` + `addEventListener`/`removeEventListener`.

**`cloneElement` usage**: The `renderMenu()` method uses `cloneElement` when children are provided (instead of `options` shorthand) to merge className and ARIA options onto the child DropdownMenu. This should be evaluated for replacement.

### Subcomponents (6 simple functional components)

**DropdownDivider** (`DropdownDivider.js`): Minimal -- just renders `divider` class. No props beyond `as` and `className`.

**DropdownHeader** (`DropdownHeader.js`): Renders `header` class with optional `Icon.create(icon)`. Has `createShorthandFactory`.

**DropdownItem** (`DropdownItem.js`): Renders an option with `active`, `selected`, `disabled` states. Supports `flag`, `icon`, `image`, `label`, `description`, `text`/`content` shorthand elements. Uses `createShorthand` for description and text spans. ARIA attributes: `role='option'`, `aria-disabled`, `aria-checked`, `aria-selected`. Has `createShorthandFactory`.

**DropdownMenu** (`DropdownMenu.js`): Renders menu container with `direction`, `open` (visible), `scrolling` classes plus `menu transition` base classes.

**DropdownSearchInput** (`DropdownSearchInput.js`): Renders search `<input>` with `aria-autocomplete='list'`. Defaults to `<input>` element. Has `createShorthandFactory`.

**DropdownText** (`DropdownText.js`): Renders selected value text with `aria-atomic`, `aria-live='polite'`, `role='alert'` for accessibility. Has `createShorthandFactory`. Note: className is `'divider'` which appears to be a bug -- should likely be `'text'`. Investigate during migration.

### Utility Files

**`utils/getMenuOptions.js`**: Filters and sorts dropdown options based on search, multiple selection, and addition configuration. Uses lodash `_.filter`, `_.isFunction`, `_.deburr`, `_.escapeRegExp`, `_.some`. Also uses `React.isValidElement` and `React.cloneElement` for the addition label.

**`utils/getSelectedIndex.js`**: Computes the selected index from filtered menu options. Uses lodash `_.reduce`, `_.findIndex`, `_.find`, `_.includes`.

---

## Detailed Tasks

### Phase 31a: Migrate Subcomponents (simple, do first)

#### 1. Convert DropdownDivider to TypeScript

**File**: `src/modules/Dropdown/DropdownDivider.js` -> `DropdownDivider.tsx`

1.1. Create `DropdownDividerProps` with `as`, `className`.
1.2. Standard migration (remove forwardRef, PropTypes).
1.3. Delete `DropdownDivider.d.ts`.

#### 2. Convert DropdownHeader to TypeScript

**File**: `src/modules/Dropdown/DropdownHeader.js` -> `DropdownHeader.tsx`

2.1. Create `DropdownHeaderProps` with `as`, `children`, `className`, `content`, `icon`.
2.2. Standard migration. Retain `Icon.create`, `createShorthandFactory`.
2.3. Delete `DropdownHeader.d.ts`.

#### 3. Convert DropdownItem to TypeScript

**File**: `src/modules/Dropdown/DropdownItem.js` -> `DropdownItem.tsx`

3.1. Create `DropdownItemProps` interface with all props:
```typescript
interface DropdownItemProps {
  as?: React.ElementType
  active?: boolean
  children?: React.ReactNode
  className?: string
  content?: SemanticShorthandContent
  description?: SemanticShorthandItem<{ children?: React.ReactNode }>
  disabled?: boolean
  flag?: SemanticShorthandItem<FlagProps>
  icon?: SemanticShorthandItem<IconProps>
  image?: SemanticShorthandItem<ImageProps>
  label?: SemanticShorthandItem<LabelProps>
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: DropdownItemProps) => void
  selected?: boolean
  text?: SemanticShorthandContent
  value?: boolean | number | string
  'data-additional'?: boolean  // internal: marks addition items
}
```

3.2. Remove `React.forwardRef`. Accept `ref` as prop.
3.3. Remove PropTypes.
3.4. Replace `_.invoke(props, 'onClick', e, props)` with `props.onClick?.(e, props)`.
3.5. Retain `Flag.create`, `Icon.create`, `Image.create`, `Label.create`, `createShorthand` for description/text.
3.6. Retain `createShorthandFactory`.
3.7. Delete `DropdownItem.d.ts`.

#### 4. Convert DropdownMenu to TypeScript

**File**: `src/modules/Dropdown/DropdownMenu.js` -> `DropdownMenu.tsx`

4.1. Create `DropdownMenuProps` with `as`, `children`, `className`, `content`, `direction`, `open`, `scrolling`.
4.2. Standard migration. Delete `DropdownMenu.d.ts`.

#### 5. Convert DropdownSearchInput to TypeScript

**File**: `src/modules/Dropdown/DropdownSearchInput.js` -> `DropdownSearchInput.tsx`

5.1. Create `DropdownSearchInputProps` with `as`, `autoComplete`, `className`, `tabIndex`, `type`, `value`, `onChange`.
5.2. Standard migration. Replace `_.get(e, 'target.value')` with `(e.target as HTMLInputElement).value`.
5.3. Replace `_.invoke(props, 'onChange', e, ...)` with `props.onChange?.(e, ...)`.
5.4. Retain `createShorthandFactory`.
5.5. Delete `DropdownSearchInput.d.ts`.

#### 6. Convert DropdownText to TypeScript

**File**: `src/modules/Dropdown/DropdownText.js` -> `DropdownText.tsx`

6.1. Create `DropdownTextProps` with `as`, `children`, `className`, `content`.
6.2. Standard migration. Retain `createShorthandFactory`.
6.3. **Investigate**: The className is `'divider'` -- this appears to be a bug. The class should likely be `'text'` based on the component name and usage. Check if Semantic UI CSS uses `'divider'` class for the text display area. If this is a bug, fix it. If intentional, document why.
6.4. Delete `DropdownText.d.ts`.

### Phase 31b: Migrate Utility Files

#### 7. Convert getMenuOptions to TypeScript

**File**: `src/modules/Dropdown/utils/getMenuOptions.js` -> `getMenuOptions.ts`

7.1. Create typed config interface:
```typescript
interface GetMenuOptionsConfig {
  additionLabel?: React.ReactNode
  additionPosition?: 'top' | 'bottom'
  allowAdditions?: boolean
  deburr?: boolean
  multiple?: boolean
  options?: DropdownItemProps[]
  search?: boolean | ((options: DropdownItemProps[], query: string) => DropdownItemProps[])
  searchQuery?: string
  value?: any
}
```

7.2. Replace lodash utilities:
- `_.filter(options, pred)` -> `options.filter(pred)`
- `_.isFunction(search)` -> `typeof search === 'function'`
- `_.deburr(str)` -> Keep lodash for this (deburr is complex Unicode normalization) OR use `str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')`
- `_.escapeRegExp(str)` -> Implement a simple escapeRegExp utility or import from a small package
- `_.some(options, { text: searchQuery })` -> `options.some(opt => opt.text === searchQuery)`
- `_.includes(value, opt.value)` -> `Array.isArray(value) && value.includes(opt.value)`

7.3. Address `React.cloneElement` usage for addition label. The line:
```javascript
const additionLabelElement = React.isValidElement(additionLabel)
  ? React.cloneElement(additionLabel, { key: 'addition-label' })
  : additionLabel || ''
```
In React 19, this `cloneElement` is only adding a `key` prop. Consider replacing with a Fragment wrapper or keeping as-is (adding a key is a benign use of cloneElement).

#### 8. Convert getSelectedIndex to TypeScript

**File**: `src/modules/Dropdown/utils/getSelectedIndex.js` -> `getSelectedIndex.ts`

8.1. Create typed config interface extending GetMenuOptionsConfig with `selectedIndex` and `value`.

8.2. Replace lodash utilities:
- `_.reduce(options, fn, [])` -> `options.reduce(fn, [])`
- `_.findIndex(options, ['value', value])` -> `options.findIndex(opt => opt.value === value)`
- `_.find(enabledIndexes, index => index >= selectedIndex)` -> `enabledIndexes.find(index => index >= selectedIndex)`
- `_.includes(enabledIndexes, activeIndex)` -> `enabledIndexes.includes(activeIndex)`

### Phase 31c: REWRITE DropdownInner as Functional Component (THE MAIN EVENT)

#### 9. Convert Dropdown to TypeScript with Full Functional Rewrite

**File**: `src/modules/Dropdown/Dropdown.js` -> `Dropdown.tsx`

This is the largest single task in the entire React 19 migration. The class component `DropdownInner` (~1050 lines) must be rewritten as a functional component using hooks.

##### 9.1. Create `DropdownProps` interface

Use the existing `Dropdown.d.ts` as the source of truth. All ~50 props must be typed.

##### 9.2. Eliminate the two-component architecture

Merge the outer `Dropdown` and inner `DropdownInner` into a single functional component:

```typescript
function Dropdown(props: DropdownProps & { ref?: React.Ref<HTMLDivElement> }) {
  // Destructure with defaults (currently in the outer wrapper)
  const {
    additionLabel = 'Add ',
    additionPosition = 'top',
    closeOnBlur = true,
    closeOnEscape = true,
    deburr = false,
    icon = 'dropdown',
    minCharacters = 1,
    noResultsMessage = 'No results found.',
    openOnFocus = true,
    renderLabel = renderItemContent,
    searchInput = 'text',
    selectOnBlur = true,
    selectOnNavigation = true,
    wrapSelection = true,
    ref,
    ...restProps
  } = props
  // ... all logic here
}
```

##### 9.3. Convert auto-controlled state to hooks

Replace `ModernAutoControlledComponent` and `autoControlledProps` with individual `useAutoControlledValue` calls:

```typescript
const [open, setOpen] = useAutoControlledValue({
  state: props.open,
  defaultState: props.defaultOpen,
  initialState: false,
})

const [value, setValue] = useAutoControlledValue({
  state: props.value,
  defaultState: props.defaultValue,
  initialState: props.multiple ? [] : '',
})

const [searchQuery, setSearchQuery] = useAutoControlledValue({
  state: props.searchQuery,
  defaultState: props.defaultSearchQuery,
  initialState: '',
})

const [selectedLabel, setSelectedLabel] = useAutoControlledValue({
  state: props.selectedLabel,
  defaultState: props.defaultSelectedLabel,
  initialState: undefined,
})

const [upward, setUpward] = useAutoControlledValue({
  state: props.upward,
  defaultState: props.defaultUpward,
  initialState: false,
})
```

Additional state (not auto-controlled):
```typescript
const [focus, setFocus] = React.useState(false)
const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(undefined)
```

##### 9.4. Convert refs

```typescript
const searchRef = React.useRef<HTMLInputElement>(null)
const sizerRef = React.useRef<HTMLSpanElement>(null)
const dropdownRef = React.useRef<HTMLDivElement>(null)
const isMouseDown = React.useRef(false)

// Merge external ref with internal ref
const mergedRef = useMergedRefs(dropdownRef, ref)
```

##### 9.5. Convert `getAutoControlledStateFromProps` to `useMemo` / derived state

The `selectedIndex` derivation logic from `getAutoControlledStateFromProps`:
```typescript
const prevOptionsRef = React.useRef(options)
const prevValueRef = React.useRef(value)

// Recompute selectedIndex when value or options change
React.useEffect(() => {
  const shouldRecompute =
    !shallowEqual(prevValueRef.current, value) ||
    !_.isEqual(getKeyAndValues(options), getKeyAndValues(prevOptionsRef.current))

  if (shouldRecompute) {
    setSelectedIndex(getSelectedIndex({
      additionLabel, additionPosition, allowAdditions, deburr,
      multiple, search, selectedIndex, value, options, searchQuery: '',
    }))
  }

  prevOptionsRef.current = options
  prevValueRef.current = value
}, [value, options])
```

##### 9.6. Convert lifecycle methods to hooks

**componentDidMount -> useEffect:**
```typescript
React.useEffect(() => {
  if (open) {
    openDropdown(null, false)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // mount only
```

**shouldComponentUpdate**: Remove entirely. React functional components can use `React.memo` if needed, but the hook-based approach with proper dependency tracking should handle performance.

**componentDidUpdate -> multiple useEffects:**

```typescript
// Focus/blur transitions
const prevFocusRef = React.useRef(false)
React.useEffect(() => {
  if (!prevFocusRef.current && focus) {
    // Dropdown just focused
    if (!isMouseDown.current) {
      const openable = !search || (search && minCharacters === 1 && !open)
      if (openOnFocus && openable) openDropdown()
    }
  } else if (prevFocusRef.current && !focus) {
    // Dropdown just blurred
    if (!isMouseDown.current && closeOnBlur) {
      closeDropdown()
    }
  }
  prevFocusRef.current = focus
}, [focus])

// Open/close transitions
const prevOpenRef = React.useRef(false)
React.useEffect(() => {
  if (!prevOpenRef.current && open) {
    setOpenDirection()
    scrollSelectedItemIntoView()
  }
  prevOpenRef.current = open
}, [open])

// Selected index scroll
const prevSelectedIndexRef = React.useRef(selectedIndex)
React.useEffect(() => {
  if (prevSelectedIndexRef.current !== selectedIndex) {
    scrollSelectedItemIntoView()
  }
  prevSelectedIndexRef.current = selectedIndex
}, [selectedIndex])

// Dev-mode value type validation
if (process.env.NODE_ENV !== 'production') {
  React.useEffect(() => {
    // validation logic...
  }, [value, multiple])
}
```

##### 9.7. Replace EventStack with useEffect event listeners

Replace the JSX-based EventStack elements:
```typescript
// Replace: {open && <EventStack name='keydown' on={closeOnEscape} />}
React.useEffect(() => {
  if (!open) return
  const handler = (e: KeyboardEvent) => {
    if (!closeOnEscapeProp) return
    if (e.key !== 'Escape') return
    e.preventDefault()
    closeDropdown(e as any)
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [open, closeOnEscapeProp])

// Replace: {open && <EventStack name='click' on={closeOnDocumentClick} />}
React.useEffect(() => {
  if (!open) return
  const handler = (e: MouseEvent) => {
    if (!closeOnBlur) return
    if (dropdownRef.current && doesNodeContainClick(dropdownRef.current, e as any)) return
    closeDropdown()
  }
  document.addEventListener('click', handler)
  return () => document.removeEventListener('click', handler)
}, [open, closeOnBlur])

// Replace: {focus && <EventStack name='keydown' on={removeItemOnBackspace} />}
React.useEffect(() => {
  if (!focus) return
  const handler = (e: KeyboardEvent) => {
    if (e.key !== 'Backspace') return
    if (searchQuery || !search || !multiple || !value?.length) return
    e.preventDefault()
    const newValue = (value as any[]).slice(0, -1)
    setValue(newValue)
    handleChange(e as any, newValue)
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [focus, searchQuery, search, multiple, value])
```

##### 9.8. Convert all event handlers to functions / useCallback

Convert class methods to local functions or `useCallback` hooks. Group by logical concern:

- Core handlers: `handleChange`, `handleClick`, `handleIconClick`, `handleItemClick`, `handleFocus`, `handleBlur`, `handleSearchChange`, `handleKeyDown`, `handleMouseDown`
- Label handlers: `handleLabelClick`, `handleLabelRemove`
- Keyboard navigation: `moveSelectionOnKeyDown`, `openOnSpace`, `openOnArrow`, `selectItemOnEnter`
- State management: `openDropdown`, `closeDropdown`, `toggle`, `clearValue`, `clearSearchQuery`
- Computations: `computeTabIndex`, `computeSearchInputTabIndex`, `computeSearchInputWidth`, `hasValue`, `canToggle`

Use `useCallback` judiciously -- only for handlers passed to child components that might benefit from referential stability. For internal helper functions, regular functions are fine.

##### 9.9. Convert instance variable `isMouseDown` to useRef

Already handled in 9.4. Replace `this.isMouseDown = true/false` with `isMouseDown.current = true/false`.

##### 9.10. Convert render methods to local functions

Convert `renderText`, `renderSearchInput`, `renderSearchSizer`, `renderLabels`, `renderOptions`, `renderMenu` to local functions within the component.

##### 9.11. Address `cloneElement` in renderMenu

The `renderMenu()` method:
```javascript
if (!childrenUtils.isNil(children)) {
  const menuChild = Children.only(children)
  const className = cx(direction, getKeyOnly(open, 'visible'), menuChild.props.className)
  return cloneElement(menuChild, { className, ...ariaOptions })
}
```
Options:
- Keep `cloneElement` for now with a TODO (pragmatic)
- Wrap children in a new DropdownMenu element and merge props
- **Recommended**: Keep with TODO for this phase

##### 9.12. Remove `ModernAutoControlledComponent` import

After the functional rewrite, `ModernAutoControlledComponent` should no longer be imported. If this was the last consumer, the class can be removed in a cleanup phase.

##### 9.13. Remove `@semantic-ui-react/event-stack` import

After replacing EventStack with useEffect, remove this dependency entirely.

##### 9.14. Remove `shallowequal` import if no longer needed

If the selectedIndex derivation logic uses a different comparison approach, the `shallowequal` package may no longer be needed.

##### 9.15. Attach subcomponent statics and displayName

```typescript
Dropdown.displayName = 'Dropdown'
Dropdown.Divider = DropdownDivider
Dropdown.Header = DropdownHeader
Dropdown.Item = DropdownItem
Dropdown.Menu = DropdownMenu
Dropdown.SearchInput = DropdownSearchInput
Dropdown.Text = DropdownText
```

##### 9.16. Delete `Dropdown.d.ts`.

### Phase 31d: Index and Tests

#### 10. Update Barrel Index

**File**: `src/modules/Dropdown/index.js` -> `index.ts`
10.1. Export all. Delete `index.d.ts`.

#### 11. Delete TODO.md

**File**: `src/modules/Dropdown/TODO.md`
11.1. The TODO describes animation support using CSS transitions. After migration, this TODO is either addressed or re-documented. If animations are not being added in this phase, create a new GitHub issue or add a TODO comment in the source. Delete the standalone `TODO.md` file.

#### 12. Write RTL Tests

This requires the most comprehensive test suite of any component:

**12.1. Dropdown-test.tsx (core behavior):**
- Test `ui dropdown` className
- Test all boolean classes: `active visible`, `disabled`, `error`, `loading`, `basic`, `button`, `compact`, `fluid`, `floating`, `inline`, `labeled`, `item`, `multiple`, `search`, `selection`, `simple`, `scrolling`, `upward`
- Test `pointing` variant classes
- Test controlled `open` prop
- Test uncontrolled open/close toggle
- Test controlled `value` prop
- Test uncontrolled value selection
- Test `placeholder` rendering
- Test `trigger` prop replaces text
- Test ref attaches to root element

**12.2. Dropdown keyboard navigation tests:**
- Test ArrowDown/ArrowUp opens dropdown when closed and focused
- Test ArrowDown/ArrowUp moves selection when open
- Test Enter selects the highlighted item
- Test Spacebar opens when closed (non-search mode)
- Test Spacebar selects when open (non-search mode)
- Test Escape closes the dropdown
- Test Backspace removes last label in multiple+search mode
- Test `wrapSelection` wraps from last to first and vice versa
- Test disabled items are skipped during navigation

**12.3. Dropdown search tests:**
- Test search input appears when `search` prop is true
- Test typing filters options
- Test custom search function receives (options, query)
- Test `deburr` prop strips diacritics during search
- Test `minCharacters` delays opening
- Test search query clears after selection

**12.4. Dropdown multiple selection tests:**
- Test multiple values render as labels
- Test clicking option adds to selection
- Test clicking label remove button removes from selection
- Test `renderLabel` custom render function
- Test backspace removes last value

**12.5. Dropdown addition tests:**
- Test `allowAdditions` shows "Add: ..." item
- Test `additionPosition` controls top/bottom placement
- Test `additionLabel` customizes the label text
- Test `onAddItem` callback fires

**12.6. Dropdown accessibility tests:**
- Test `role='listbox'` on root (non-search)
- Test `role='combobox'` on root (search)
- Test `aria-expanded` reflects open state
- Test `aria-busy` reflects loading state
- Test `aria-disabled` reflects disabled state
- Test `aria-multiselectable` in listbox mode for multiple
- Test DropdownItem `role='option'`, `aria-disabled`, `aria-checked`, `aria-selected`

**12.7. Subcomponent tests:**
- DropdownDivider: `divider` class
- DropdownHeader: `header` class, icon rendering
- DropdownItem: all state classes, shorthand elements (flag, icon, image, label, description, text)
- DropdownMenu: `menu transition` classes, `visible` when open, `scrolling`, `direction`
- DropdownSearchInput: `search` class, `aria-autocomplete='list'`, onChange callback
- DropdownText: classes, ARIA live region attributes

---

## Files Affected

| Action   | File Path                                                        |
| -------- | ---------------------------------------------------------------- |
| Rename   | `src/modules/Dropdown/Dropdown.js` -> `.tsx`                     |
| Rename   | `src/modules/Dropdown/DropdownDivider.js` -> `.tsx`              |
| Rename   | `src/modules/Dropdown/DropdownHeader.js` -> `.tsx`               |
| Rename   | `src/modules/Dropdown/DropdownItem.js` -> `.tsx`                 |
| Rename   | `src/modules/Dropdown/DropdownMenu.js` -> `.tsx`                 |
| Rename   | `src/modules/Dropdown/DropdownSearchInput.js` -> `.tsx`          |
| Rename   | `src/modules/Dropdown/DropdownText.js` -> `.tsx`                 |
| Rename   | `src/modules/Dropdown/utils/getMenuOptions.js` -> `.ts`          |
| Rename   | `src/modules/Dropdown/utils/getSelectedIndex.js` -> `.ts`        |
| Rename   | `src/modules/Dropdown/index.js` -> `.ts`                         |
| Delete   | `src/modules/Dropdown/Dropdown.d.ts`                             |
| Delete   | `src/modules/Dropdown/DropdownDivider.d.ts`                      |
| Delete   | `src/modules/Dropdown/DropdownHeader.d.ts`                       |
| Delete   | `src/modules/Dropdown/DropdownItem.d.ts`                         |
| Delete   | `src/modules/Dropdown/DropdownMenu.d.ts`                         |
| Delete   | `src/modules/Dropdown/DropdownSearchInput.d.ts`                  |
| Delete   | `src/modules/Dropdown/index.d.ts`                                |
| Delete   | `src/modules/Dropdown/TODO.md`                                   |
| Create   | `test/specs/modules/Dropdown/Dropdown-test.tsx`                  |
| Create   | `test/specs/modules/Dropdown/DropdownDivider-test.tsx`           |
| Create   | `test/specs/modules/Dropdown/DropdownHeader-test.tsx`            |
| Create   | `test/specs/modules/Dropdown/DropdownItem-test.tsx`              |
| Create   | `test/specs/modules/Dropdown/DropdownMenu-test.tsx`              |
| Create   | `test/specs/modules/Dropdown/DropdownSearchInput-test.tsx`       |
| Create   | `test/specs/modules/Dropdown/DropdownText-test.tsx`              |

---

## Acceptance Criteria

- [ ] **DropdownInner class component is completely eliminated** -- Dropdown is a single functional component
- [ ] **ModernAutoControlledComponent is no longer imported** by Dropdown
- [ ] **@semantic-ui-react/event-stack is no longer imported** -- replaced with useEffect listeners
- [ ] All 8 component files compile with zero TypeScript errors
- [ ] Both utility files compile with zero TypeScript errors
- [ ] No `React.forwardRef` wrappers remain
- [ ] No `PropTypes` imports remain
- [ ] No `.d.ts` declaration files remain in `src/modules/Dropdown/`
- [ ] All 5 auto-controlled states (open, value, searchQuery, selectedLabel, upward) work correctly in both controlled and uncontrolled modes
- [ ] Keyboard navigation works: arrow keys, enter, spacebar, escape, backspace
- [ ] Search filtering works with default and custom search functions
- [ ] Deburr search works (diacritics stripped)
- [ ] Multiple selection works: add, remove, labels, backspace removal
- [ ] Addition items work: `allowAdditions`, `additionPosition`, `onAddItem`
- [ ] `clearable` + clear icon works
- [ ] `lazyLoad` defers option rendering until open
- [ ] `selectOnBlur` and `selectOnNavigation` behaviors work correctly
- [ ] `upward` auto-detection works (viewport space measurement)
- [ ] `scrollSelectedItemIntoView` scrolls the menu to show the selected item
- [ ] ARIA attributes are correct for both search and non-search modes
- [ ] All subcomponent statics are correctly typed
- [ ] All `createShorthandFactory` statics work
- [ ] Document event listeners are properly cleaned up on unmount
- [ ] No memory leaks from event listeners
- [ ] RTL tests pass comprehensively
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

---

## Rollback Strategy

1. Revert `Dropdown.tsx` to `Dropdown.js` from version control -- this restores the entire class component.
2. Revert all subcomponent `.tsx` files to `.js`.
3. Revert utility `.ts` files to `.js`.
4. Restore all deleted `.d.ts` files and `TODO.md`.
5. Delete test files.

**Critical note**: Because the Dropdown rewrite is so extensive, consider doing it on a dedicated branch with incremental commits. The class-to-functional conversion changes nearly every line of the main file. If rollback is needed, it is an all-or-nothing revert for the main component.

**Downstream consumers**: FormDropdown (Phase 26), FormSelect (Phase 26), MenuItem (Phase 28), and Select (addons) all depend on Dropdown. Ensure these consumers continue to work after migration. Since they import Dropdown through its barrel index, the import paths should be stable.

---

## Notes for AI Agents

- **THIS IS THE HARDEST MIGRATION IN THE ENTIRE PROJECT.** Plan for this to take significantly more time and iteration than any other phase. Consider breaking it into sub-tasks: (a) subcomponents, (b) utilities, (c) main component shell with state/refs, (d) event handlers, (e) render methods, (f) integration testing.

- **Do NOT attempt to simplify the event handling logic.** The complexity exists for good reasons -- browser inconsistencies, accessibility requirements, and edge cases accumulated over years. Port the logic faithfully first, then optimize in a separate pass if needed.

- **The `isMouseDown` ref pattern is critical.** It prevents blur-then-reopen cycles when clicking inside the dropdown. Without it, clicking an option would blur the dropdown (closing it) before the click registers. The mouseDown/mouseUp tracking via document event listener is essential.

- **`handleDocumentMouseUp` uses document.addEventListener directly** (not EventStack). This is a per-instance listener added in handleMouseDown and removed in handleDocumentMouseUp. Convert to a ref-based pattern or useEffect cleanup.

- **`computeSearchInputWidth` measures a hidden sizer span.** The sizer is temporarily displayed, its textContent set to the search query, measured via `getBoundingClientRect()`, then hidden again. This is a synchronous DOM measurement -- ensure it works correctly in the functional component (it should, since it reads from a ref).

- **`setOpenDirection` measures viewport space.** It uses `getBoundingClientRect()` on the dropdown ref and `document.documentElement.clientHeight`. This is also synchronous DOM measurement that should work fine from a ref.

- **The `handleClose` callback pattern**: `this.close(e, callback)` accepts an optional callback that runs after state is set (`setState(state, callback)`). In functional components, `setState` does not have a callback form. Replace with a useEffect that detects the close transition and runs the blur logic.

- **`renderItemContent` is a top-level function** used as the default `renderLabel` prop. It constructs label content from item's `flag`, `image`, and `text` properties. It contains a `// TODO: remove this in v3` comment about backward compatibility with v1 shorthand API. Since we are building v3, this TODO should be addressed -- remove the `_.isFunction(text)` check.

- **DropdownText className bug**: The component uses `cx('divider', className)` but the component is named `DropdownText` and renders the selected value text. Investigate whether `'divider'` is intentional (Semantic UI CSS might use this class for the text display element) or a copy-paste bug. The Semantic UI CSS docs show the text element should have class `text`, not `divider`.

- **Lodash usage is heavy in Dropdown.** Key replacements:
  - `_.invoke(obj, 'method', args)` -> `obj?.method?.(args)` (used ~20 times)
  - `_.isNil(val)` -> `val == null`
  - `_.isEmpty(val)` -> `!val?.length` or `val?.length === 0`
  - `_.isUndefined(val)` -> `val === undefined`
  - `_.get(obj, 'path')` -> optional chaining `obj?.path`
  - `_.map(arr, fn)` -> `arr?.map(fn)`
  - `_.find(arr, pred)` -> `arr?.find(pred)`
  - `_.union(arr1, arr2)` -> `[...new Set([...arr1, ...arr2])]`
  - `_.without(arr, val)` -> `arr.filter(v => v !== val)`
  - `_.includes(arr, val)` -> `arr?.includes(val)`
  - `_.difference(arr1, arr2)` -> `arr1.filter(v => !arr2.includes(v))`
  - `_.dropRight(arr)` -> `arr.slice(0, -1)`
  - `_.compact(arr)` -> `arr.filter(Boolean)`
  - `_.pick(obj, keys)` -> manual destructuring
  - `_.noop` -> `() => {}`
  - `_.startCase(str)` -> keep lodash or implement simple version
  - `_.deburr(str)` -> keep lodash (complex Unicode)
  - `_.escapeRegExp(str)` -> implement: `str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`

- **`objectDiff` from lib**: Used only in debug logging. Can be removed along with debug statements if desired, or kept for development mode.

- **`keyboardKey` from `keyboard-key` package**: Used extensively for key code checking. This dependency should be retained -- it provides cross-browser key identification.

- **Test strategy**: Write tests incrementally as you build. Start with the subcomponents (easy wins), then test the main component's basic rendering, then add keyboard navigation tests, then search tests, then multiple selection tests. Do not try to write all tests at once.
