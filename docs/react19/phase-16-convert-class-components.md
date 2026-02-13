# Phase 16: Convert Remaining Class Components to Function Components

| Field            | Value                                      |
|------------------|--------------------------------------------|
| **Phase ID**     | PHASE-16                                   |
| **Title**        | Convert Remaining Class Components to Function Components |
| **Stage**        | 3 - Core Library Modernization             |
| **Dependencies** | Phase 14 (Convert Source to TypeScript)     |
| **Complexity**   | High                                       |
| **Scope**        | 5 class components + 1 base class (6 files total) |

---

## Objective

Convert the remaining 5 class components and 1 base class to function components with hooks. After this phase, the entire codebase uses function components exclusively. The `ModernAutoControlledComponent` base class is eliminated entirely, replaced by the existing `useAutoControlledValue` hook. All lifecycle methods (`componentDidUpdate`, `getDerivedStateFromProps`, class `state`) are replaced with their hooks equivalents (`useEffect`, `useMemo`, `useState`/`useReducer`).

---

## Background

### Current Class Components

The codebase has exactly 5 class components and 1 base class:

| File | Component | Extends | Why It Is a Class |
|------|-----------|---------|-------------------|
| `src/lib/ModernAutoControlledComponent.js` | `ModernAutoControlledComponent` | `React.Component` | Base class providing auto-controlled state pattern |
| `src/modules/Transition/Transition.js` | `Transition` | `React.Component` | Uses `getDerivedStateFromProps`, complex state machine |
| `src/modules/Dropdown/Dropdown.js` | `DropdownInner` (class wrapper) | `ModernAutoControlledComponent` | Auto-controlled state, complex lifecycle, inner class wraps functional outer |
| `src/modules/Search/Search.js` | `SearchInner` (class wrapper) | `ModernAutoControlledComponent` | Auto-controlled state, complex lifecycle, inner class wraps functional outer |
| `src/modules/Accordion/AccordionPanel.js` | `AccordionPanel` | `React.Component` | Uses `shouldComponentUpdate` equivalent pattern |

### Architecture Pattern: Auto-Controlled Components

`Dropdown` and `Search` use a split architecture:
- An **outer functional component** wrapped in `React.forwardRef` handles ref forwarding
- An **inner class component** extends `ModernAutoControlledComponent` for auto-controlled state

This split exists because the auto-controlled pattern required class inheritance. With the `useAutoControlledValue` hook (already implemented at `src/lib/hooks/useAutoControlledValue.js`), the inner class can be eliminated and merged into the outer functional component.

### `ModernAutoControlledComponent` Functionality

The base class provides (from `src/lib/ModernAutoControlledComponent.js`, 213 lines):

1. **Auto-controlled state initialization:** Reads props, defaultProps, and initial state to determine initial values for controlled/uncontrolled props
2. **`getDerivedStateFromProps`:** Syncs controlled props from parent into component state on every render
3. **Development warnings:** Validates that auto-controlled props have proper default prop types, are not in `defaultProps`, and do not have both controlled and default values
4. **`getAutoControlledStateFromProps`:** Allows subclasses to compute additional state from props

All of this is already available via `useAutoControlledValue` hook, which handles the controlled/uncontrolled pattern per-prop.

---

## Detailed Tasks

### Task 1: Convert `AccordionPanel` to a function component

**File:** `src/modules/Accordion/AccordionPanel.tsx`

This is the simplest conversion -- start here to establish the pattern.

1.1. Read the current class component to understand its lifecycle:

```typescript
// Current structure:
class AccordionPanel extends React.Component {
  // Uses this.props to render AccordionTitle and AccordionContent
  // Passes onClick handler that calls this.props.onTitleClick
}
```

1.2. Convert to a function component:

```typescript
// BEFORE
class AccordionPanel extends React.Component<AccordionPanelProps> {
  render() {
    const { active, content, index, title, onTitleClick } = this.props
    // ...
  }
}

// AFTER
function AccordionPanel({ ref, active, content, index, title, onTitleClick, ...rest }: AccordionPanelProps & { ref?: React.Ref<HTMLDivElement> }) {
  // Direct render -- no lifecycle needed
  // ...
}

AccordionPanel.displayName = 'AccordionPanel'
```

1.3. If `AccordionPanel` uses `shouldComponentUpdate` or `React.memo` equivalent, wrap with `React.memo`:

```typescript
const AccordionPanel = React.memo(function AccordionPanel({ ... }: AccordionPanelProps) {
  // ...
})
```

1.4. Update `AccordionPanel.handledProps` static array.

---

### Task 2: Convert `Transition` to a function component

**File:** `src/modules/Transition/Transition.tsx`

This is a medium-complexity conversion due to its state machine pattern.

2.1. Analyze the current class component's state and lifecycle:

```typescript
// Current class structure:
class Transition extends React.Component {
  static getDerivedStateFromProps(props, state) {
    // Derives animation status from props changes
    // Manages: animating, status (ENTERED, ENTERING, EXITING, EXITED, UNMOUNTED)
  }

  componentDidUpdate(prevProps, prevState) {
    // Triggers animation callbacks
    // Sets timers for animation completion
  }

  // State machine: visible prop -> animation states -> DOM class changes
}
```

2.2. Convert lifecycle methods to hooks:

```typescript
function Transition({
  ref,
  animation,
  children,
  directional,
  duration,
  mountOnShow,
  onComplete,
  onHide,
  onShow,
  onStart,
  reactKey,
  transitionOnMount,
  unmountOnHide,
  visible,
  ...rest
}: TransitionProps & { ref?: React.Ref<HTMLElement> }) {
  const [status, setStatus] = useState<TransitionStatus>(
    visible ? 'ENTERED' : 'UNMOUNTED'
  )
  const [animating, setAnimating] = useState(false)

  const prevVisible = usePrevious(visible)

  // Replace getDerivedStateFromProps
  useEffect(() => {
    if (prevVisible !== visible) {
      if (visible) {
        setStatus('ENTERING')
        setAnimating(true)
      } else {
        setStatus('EXITING')
        setAnimating(true)
      }
    }
  }, [visible, prevVisible])

  // Replace componentDidUpdate animation timer logic
  useEffect(() => {
    if (!animating) return

    const timer = setTimeout(() => {
      setAnimating(false)
      setStatus(visible ? 'ENTERED' : unmountOnHide ? 'UNMOUNTED' : 'EXITED')
      // Call completion callbacks
    }, normalizeTransitionDuration(duration, directional))

    return () => clearTimeout(timer)
  }, [animating, visible, duration, directional, unmountOnHide])

  // ... render logic
}
```

2.3. Preserve the `cloneElement` usage. `Transition` wraps its children and adds CSS classes for animations. The `React.cloneElement` calls should be preserved (they are addressed separately in the cloneElement modernization if applicable).

2.4. Ensure the animation state machine transitions are correct by cross-referencing with the existing test suite at `test/specs/modules/Transition/Transition-test.js`.

---

### Task 3: Convert `Dropdown` inner class to a fully functional component

**File:** `src/modules/Dropdown/Dropdown.tsx`

This is the most complex conversion in the entire migration.

3.1. Analyze the current split architecture:

```typescript
// Current structure:
const Dropdown = React.forwardRef(function DropdownOuter(props, ref) {
  return <DropdownInner {...props} forwardedRef={ref} />
})

class DropdownInner extends ModernAutoControlledComponent {
  static autoControlledProps = ['open', 'searchQuery', 'selectedLabel', 'value']

  static getAutoControlledStateFromProps(nextProps, computedState, prevState) {
    // Complex state derivation
  }

  getInitialAutoControlledState() {
    return { focus: false, ... }
  }

  componentDidUpdate(prevProps, prevState) {
    // Scroll management, focus management, value sync
  }

  // 20+ instance methods for event handling, rendering, etc.
}
```

3.2. Merge the outer and inner components into a single function component:

```typescript
function Dropdown({
  ref,
  additionLabel,
  additionPosition,
  allowAdditions,
  basic,
  button,
  children,
  className,
  clearable,
  closeOnBlur,
  closeOnChange,
  closeOnEscape,
  compact,
  deburr,
  // ... all props
}: DropdownProps & { ref?: React.Ref<HTMLDivElement> }) {
  // Auto-controlled state using hook
  const [open, setOpen] = useAutoControlledValue({
    state: propOpen,
    defaultState: defaultOpen,
    initialState: false,
  })

  const [searchQuery, setSearchQuery] = useAutoControlledValue({
    state: propSearchQuery,
    defaultState: defaultSearchQuery,
    initialState: '',
  })

  const [selectedLabel, setSelectedLabel] = useAutoControlledValue({
    state: propSelectedLabel,
    defaultState: defaultSelectedLabel,
    initialState: undefined,
  })

  const [value, setValue] = useAutoControlledValue({
    state: propValue,
    defaultState: defaultValue,
    initialState: multiple ? [] : '',
  })

  const [focus, setFocus] = useState(false)

  // Internal refs
  const searchRef = useRef<HTMLInputElement>(null)
  const sizerRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const elementRef = useMergedRefs(ref, useRef<HTMLDivElement>(null))

  // Replace componentDidUpdate effects
  const prevOpen = usePrevious(open)
  const prevValue = usePrevious(value)
  const prevSearchQuery = usePrevious(searchQuery)

  useEffect(() => {
    // Scroll selected item into view when dropdown opens
    if (open && !prevOpen) {
      scrollSelectedItemIntoView()
    }
  }, [open, prevOpen])

  useEffect(() => {
    // Focus search input when dropdown opens
    if (open && search && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open, search])

  // ... convert all 20+ methods to functions/callbacks
}
```

3.3. Convert all instance methods to `useCallback` or regular functions:

| Instance Method | Hook Replacement |
|----------------|------------------|
| `this.handleClick` | `const handleClick = useEventCallback(...)` |
| `this.handleKeyDown` | `const handleKeyDown = useEventCallback(...)` |
| `this.handleSearchChange` | `const handleSearchChange = useEventCallback(...)` |
| `this.handleItemClick` | `const handleItemClick = useEventCallback(...)` |
| `this.handleBlur` | `const handleBlur = useEventCallback(...)` |
| `this.handleFocus` | `const handleFocus = useEventCallback(...)` |
| `this.scrollSelectedItemIntoView` | `const scrollSelectedItemIntoView = useCallback(...)` |
| `this.selectItemOnEnter` | `const selectItemOnEnter = useCallback(...)` |
| `this.renderMenu` | `const renderMenu = () => ...` (inline or extracted) |

3.4. Remove the `DropdownInner` class entirely. Remove the `forwardedRef` prop (no longer needed -- `ref` comes from destructuring).

3.5. Remove the `innerRef` prop handling. The comment in `getUnhandledProps.js` states: `"innerRef" can be removed when "Search" & "Dropdown components will be removed to be functional`. This is that moment.

---

### Task 4: Convert `Search` inner class to a fully functional component

**File:** `src/modules/Search/Search.tsx`

This follows the same pattern as Dropdown.

4.1. Analyze the current split architecture:

```typescript
const Search = React.forwardRef(function SearchOuter(props, ref) {
  return <SearchInner {...props} forwardedRef={ref} />
})

class SearchInner extends ModernAutoControlledComponent {
  static autoControlledProps = ['open', 'value']
  // Event handlers, result selection, keyboard navigation
}
```

4.2. Merge into a single function component:

```typescript
function Search({
  ref,
  aligned,
  category,
  className,
  defaultOpen,
  defaultValue,
  fluid,
  icon,
  input,
  loading,
  minCharacters,
  noResultsDescription,
  noResultsMessage,
  onBlur,
  onChange,
  onFocus,
  onMouseDown,
  onResultSelect,
  onSearchChange,
  onSelectionChange,
  open: propOpen,
  placeholder,
  results,
  selectFirstResult,
  showNoResults,
  size,
  value: propValue,
  ...rest
}: SearchProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [open, setOpen] = useAutoControlledValue({
    state: propOpen,
    defaultState: defaultOpen,
    initialState: false,
  })

  const [value, setValue] = useAutoControlledValue({
    state: propValue,
    defaultState: defaultValue,
    initialState: '',
  })

  const [focus, setFocus] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(
    selectFirstResult ? 0 : -1
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const elementRef = useMergedRefs(ref, useRef<HTMLDivElement>(null))

  // ... convert lifecycle and methods to hooks
}
```

4.3. Convert all instance methods to functions/callbacks, same pattern as Dropdown (Task 3.3).

4.4. Remove `SearchInner` class and `forwardedRef` prop.

---

### Task 5: Remove `ModernAutoControlledComponent` base class

**File:** `src/lib/ModernAutoControlledComponent.tsx`

5.1. After Dropdown and Search are converted, `ModernAutoControlledComponent` has zero consumers. Delete the entire file (213 lines).

5.2. Remove the export from `src/lib/index.ts`:

```typescript
// BEFORE
export { default as ModernAutoControlledComponent } from './ModernAutoControlledComponent'

// AFTER
// (line removed)
```

5.3. Remove any test files for `ModernAutoControlledComponent`:

```
test/specs/lib/ModernAutoControlledComponent-test.js
```

Either delete this test file or convert it to test the `useAutoControlledValue` hook instead (if not already tested).

5.4. Verify that no other file imports `ModernAutoControlledComponent`:

```bash
grep -rn "ModernAutoControlledComponent" src/ --include="*.ts" --include="*.tsx"
```

---

### Task 6: Remove `innerRef` handling from `getUnhandledProps`

**File:** `src/lib/getUnhandledProps.ts`

6.1. Now that Dropdown and Search are functional and use regular `ref`, the `innerRef` special case is no longer needed:

```typescript
// BEFORE
const getUnhandledProps = (Component, props) => {
  const { handledProps = [] } = Component
  return Object.keys(props).reduce((acc, prop) => {
    if (prop === 'childKey' || prop === 'innerRef') return acc  // <-- remove innerRef
    if (handledProps.indexOf(prop) === -1) acc[prop] = props[prop]
    return acc
  }, {})
}

// AFTER
const getUnhandledProps = (Component: { handledProps?: string[] }, props: Record<string, any>) => {
  const { handledProps = [] } = Component
  return Object.keys(props).reduce<Record<string, any>>((acc, prop) => {
    if (prop === 'childKey' || prop === 'ref') return acc
    if (handledProps.indexOf(prop) === -1) acc[prop] = props[prop]
    return acc
  }, {})
}
```

---

### Task 7: Replace lifecycle patterns with hooks across all converted components

7.1. **`getDerivedStateFromProps`** -> `useMemo` or inline computation:

```typescript
// BEFORE (class)
static getDerivedStateFromProps(props, state) {
  if (props.value !== undefined) {
    return { value: props.value }
  }
  return null
}

// AFTER (function)
// Handled by useAutoControlledValue hook -- no explicit derivation needed
```

7.2. **`componentDidUpdate`** -> `useEffect` with dependency array:

```typescript
// BEFORE (class)
componentDidUpdate(prevProps, prevState) {
  if (this.state.open !== prevState.open) {
    this.handleOpenChange()
  }
}

// AFTER (function)
const prevOpen = usePrevious(open)
useEffect(() => {
  if (open !== prevOpen) {
    handleOpenChange()
  }
}, [open, prevOpen])
```

7.3. **`componentWillUnmount`** -> `useEffect` cleanup:

```typescript
// BEFORE (class)
componentWillUnmount() {
  clearTimeout(this.timer)
}

// AFTER (function)
useEffect(() => {
  return () => clearTimeout(timerRef.current)
}, [])
```

7.4. **Class `state`** -> `useState` or `useReducer`:

```typescript
// BEFORE (class)
state = { focus: false, searchQuery: '' }
this.setState({ focus: true })

// AFTER (function)
const [focus, setFocus] = useState(false)
setFocus(true)
```

7.5. **Instance variables** -> `useRef`:

```typescript
// BEFORE (class)
this.timer = setTimeout(...)

// AFTER (function)
const timerRef = useRef<ReturnType<typeof setTimeout>>()
timerRef.current = setTimeout(...)
```

---

## Files Affected

| File | Change |
|------|--------|
| `src/modules/Accordion/AccordionPanel.tsx` | Convert class to function component |
| `src/modules/Transition/Transition.tsx` | Convert class to function component with hooks |
| `src/modules/Dropdown/Dropdown.tsx` | Merge outer/inner into single function component |
| `src/modules/Search/Search.tsx` | Merge outer/inner into single function component |
| `src/lib/ModernAutoControlledComponent.tsx` | Delete entirely |
| `src/lib/index.ts` | Remove `ModernAutoControlledComponent` export |
| `src/lib/getUnhandledProps.ts` | Remove `innerRef` special case |
| `test/specs/lib/ModernAutoControlledComponent-test.js` | Delete or convert |
| `test/specs/modules/Accordion/AccordionPanel-test.js` | Update for function component |
| `test/specs/modules/Transition/Transition-test.js` | Update for function component |
| `test/specs/modules/Dropdown/Dropdown-test.js` | Update for merged component |
| `test/specs/modules/Search/Search-test.js` | Update for merged component |

---

## Acceptance Criteria

- [ ] `AccordionPanel` is a function component (zero class syntax)
- [ ] `Transition` is a function component with hooks replacing all lifecycle methods
- [ ] `Dropdown` is a single function component (no `DropdownInner` class, no `forwardedRef` prop)
- [ ] `Search` is a single function component (no `SearchInner` class, no `forwardedRef` prop)
- [ ] `ModernAutoControlledComponent.tsx` is deleted
- [ ] `ModernAutoControlledComponent` is not exported from `src/lib/index.ts`
- [ ] Zero class components remain in `src/` (`grep -rn "extends React.Component\|extends ModernAutoControlledComponent" src/ --include="*.ts" --include="*.tsx"` returns zero)
- [ ] `innerRef` is no longer referenced anywhere in `src/` (`grep -rn "innerRef" src/ --include="*.ts" --include="*.tsx"` returns zero)
- [ ] Auto-controlled state works correctly: uncontrolled props use internal state, controlled props use parent value
- [ ] Dropdown search, selection, keyboard navigation, and multi-select all work correctly
- [ ] Search result selection, keyboard navigation, and category rendering all work correctly
- [ ] Transition animation lifecycle (enter, entered, exit, exited, unmounted) works correctly
- [ ] All converted components pass their existing test suites
- [ ] `tsc --noEmit` passes with zero errors

---

## Rollback Strategy

1. Restore the 5 class component files from the pre-Phase-16 git tag.
2. Restore `ModernAutoControlledComponent.tsx` from git history.
3. Restore `ModernAutoControlledComponent` export in `src/lib/index.ts`.
4. Restore `innerRef` handling in `getUnhandledProps.ts`.
5. This phase modifies only 6 source files plus related test files, making targeted rollback feasible.

---

## Notes for AI Agents

- **Start with `AccordionPanel`** -- it is the simplest class component and establishes the pattern for the others.
- **`Dropdown` and `Search` are the most complex files in the entire codebase.** The Dropdown component alone has 700+ lines with 20+ methods. Take extra care with the conversion and test thoroughly.
- **The `useAutoControlledValue` hook already exists** at `src/lib/hooks/useAutoControlledValue.ts`. Use it directly -- do not reimplement auto-controlled state logic.
- **When converting Dropdown's event handlers to hooks**, use `useEventCallback` for handlers that are passed to child components. This prevents unnecessary re-renders of child components when the handler reference changes.
- **Timer cleanup is critical** in Dropdown and Search. Both components use `setTimeout` for debouncing and animation timing. Every `setTimeout` must have a corresponding `clearTimeout` in a `useEffect` cleanup function.
- **The `getInitialAutoControlledState` pattern** in `ModernAutoControlledComponent` maps to the `initialState` parameter of `useAutoControlledValue`. Ensure default values for `checked` and `value` props are preserved (empty string for value, false for checked, empty array for multiple value).
- **Transition's state machine** is the trickiest part. The animation states (ENTERING, ENTERED, EXITING, EXITED, UNMOUNTED) and their transitions must be preserved exactly. Consider using `useReducer` instead of multiple `useState` calls if the state transitions are interdependent.
- **Do not remove `cloneElement` usage in Transition** during this phase. That is a separate concern. Just convert the class structure to function component structure.
- **The `lodash` dependency** (`_`) is used heavily in Dropdown and Search for utility functions. Keep these usages for now -- lodash removal is a separate optimization.
- **After deleting `ModernAutoControlledComponent`**, also remove the `lodash` import it uses if no other file in `src/lib/` imports lodash.
- **Integration test strategy.** After converting each component, run its full test suite before moving to the next. Do not batch all conversions and test at the end.
