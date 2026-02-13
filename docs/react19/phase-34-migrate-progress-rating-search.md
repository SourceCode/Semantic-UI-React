# Phase 34: Migrate Progress, Rating, Search

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-34                                                              |
| **Title**      | Migrate Progress, Rating, Search                                      |
| **Stage**      | 6 -- Component Migration - Modules                                    |
| **Dependencies** | Phase 16 (TypeScript Infrastructure), Phase 18 (Shorthand Factory Updates) |
| **Complexity** | High                                                                  |
| **Scope**      | 3 module families totaling 8 components, class-to-functional conversion for SearchInner, ModernAutoControlledComponent removal |

---

## Objective

Convert Progress, Rating, and Search modules from JavaScript to TypeScript. The critical migration in this phase is Search, which contains `SearchInner` -- one of the last remaining class components in the library. `SearchInner` extends `ModernAutoControlledComponent` (a legacy base class) and uses class-based lifecycle methods (`shouldComponentUpdate`, `componentDidUpdate`, `componentWillUnmount`), instance properties (`this.isMouseDown`), and the `eventStack` utility. This must be fully converted to a functional component with hooks. Progress and Rating are already functional components and require only TypeScript conversion.

---

## Background

### Progress (`src/modules/Progress/Progress.js`)

Progress is a straightforward functional component using `React.forwardRef`. It computes a percentage from `percent`, `total`, and `value` props, renders a bar with inline `style={{ width: '..%' }}`, and optionally displays a text label. It uses two helper functions (`calculatePercent`, `getPercent`) that are defined outside the component. No refs, no state, no effects -- purely computed rendering. This is one of the simplest module conversions.

Key details:
- Uses `getKeyOnly`, `getValueAndKey` for class computation
- Uses `createHTMLDivision` for the label shorthand
- The `autoSuccess` prop auto-triggers success state when progress reaches 100%
- The `progress` prop accepts `boolean | 'percent' | 'ratio' | 'value'` controlling display format

### Rating (`src/modules/Rating/Rating.js`)

Rating is a functional component using `React.forwardRef` with `useAutoControlledValue` for the `rating` state. It manages two additional local states: `selectedIndex` and `isSelecting` for hover feedback. It renders `maxRating` number of `RatingIcon` subcomponents.

Key details:
- Uses `useAutoControlledValue` for `rating` (controlled/uncontrolled)
- Uses `_.times(maxRating, ...)` to render icons
- `clearable` prop with `'auto'` default has complex toggle logic (lines 50-55)
- `RatingIcon` (`src/modules/Rating/RatingIcon.js`) handles click, keyup (Enter/Space), and mouseenter events
- RatingIcon uses `role='radio'`, `aria-checked`, `aria-posinset`, `aria-setsize` for accessibility
- There is a TODO comment at line 94: `/* TODO: use .create() factory */`

### Search (`src/modules/Search/Search.js`)

Search is the most complex component in this phase. It uses a two-layer architecture:

1. **`Search`** (lines 47-68): A thin `React.forwardRef` wrapper that provides default prop values and passes them to `SearchInner` with an `innerRef` prop.

2. **`SearchInner`** (lines 70-540): A class component extending `ModernAutoControlledComponent` (aliased as `Component` at import). This is one of the last class components in the library.

`SearchInner` class features that must be converted to hooks:

- **`getAutoControlledStateFromProps`** (static, lines 71-83): Custom state derivation that tracks `prevValue` to detect value changes and reset `selectedIndex`. This replaces `getDerivedStateFromProps` via the `ModernAutoControlledComponent` base class.

- **`shouldComponentUpdate`** (line 86-88): Shallow comparison of props and state. In a functional component, this is replaced by `React.memo`.

- **`componentDidUpdate`** (lines 90-133): Complex side-effect logic that:
  - Subscribes/unsubscribes `eventStack` listeners when focus changes (keydown for selection navigation)
  - Subscribes/unsubscribes `eventStack` listeners when open state changes (click for document close, keydown for escape/navigation/enter)

- **`componentWillUnmount`** (lines 136-145): Cleans up all eventStack subscriptions.

- **`autoControlledProps`** (line 701): `['open', 'value']` -- both are auto-controlled.

- **Instance properties**: `this.isMouseDown` (boolean flag, not state) used to prevent blur-triggered close when mouse is down.

- **Instance methods** (19 total): `handleResultSelect`, `handleSelectionChange`, `closeOnEscape`, `moveSelectionOnKeyDown`, `selectItemOnEnter`, `closeOnDocumentClick`, `handleMouseDown`, `handleDocumentMouseUp`, `handleInputClick`, `handleItemClick`, `handleItemMouseDown`, `handleFocus`, `handleBlur`, `handleSearchChange`, `getFlattenedResults`, `getSelectedResult`, `setValue`, `moveSelectionBy`, `scrollSelectedItemIntoView`, `tryOpen`, `open`, `close`, plus render methods.

- **`scrollSelectedItemIntoView`** (lines 350-369): Uses direct DOM queries (`document.querySelector('.ui.search.active.visible .results.visible')`) instead of refs. This is fragile and should be refactored to use a ref to the results container.

Search also has 4 subcomponents:
- `SearchCategory` -- functional, uses a render prop pattern for `layoutRenderer` and `renderer`
- `SearchCategoryLayout` -- functional, simple layout wrapper
- `SearchResult` -- functional, renders individual results with click/mousedown handlers
- `SearchResults` -- functional, simple wrapper for the results container

---

## Detailed Tasks

### 1. Convert Progress.js to Progress.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Progress\Progress.js` to `Progress.tsx`:

- Define `ProgressProps` interface from existing `Progress.d.ts`
- Type the helper functions `calculatePercent` and `getPercent` with proper parameter and return types
- Type the `progress` prop as `boolean | 'percent' | 'ratio' | 'value'`
- Type the `label` shorthand usage with `createHTMLDivision`
- Remove lodash imports (`_.isUndefined`, `_.clamp`, `_.round`) and replace with native equivalents: `=== undefined`, `Math.max(0, Math.min(100, ...))`, `Number(x.toFixed(precision))`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Progress\Progress.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Progress\index.d.ts`
- Rename `J:\code\semantic\Semantic-UI-React\src\modules\Progress\index.js` to `index.ts`

### 2. Convert Rating.js to Rating.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Rating\Rating.js` to `Rating.tsx`:

- Define `RatingProps` interface from existing `Rating.d.ts`
- Type `useAutoControlledValue` usage for `rating` state
- Type the `clearable` prop as `boolean | 'auto'`
- Type `handleIconClick` and `handleIconMouseEnter` parameters
- Replace `_.times(maxRating, ...)` with `Array.from({ length: maxRating }, (_, i) => ...)`
- Replace `_.invoke(props, 'onRate', ...)` with `props.onRate?.(e, { ...props, rating: newRating })`

### 3. Convert RatingIcon.js to RatingIcon.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Rating\RatingIcon.js` to `RatingIcon.tsx`:

- Define `RatingIconProps` interface from existing `RatingIcon.d.ts`
- Type the keyboard event handling (keyboardKey codes)
- Type the `onClick`, `onKeyUp`, `onMouseEnter` callbacks
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Rating\Rating.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Rating\RatingIcon.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Rating\index.d.ts`
- Rename `J:\code\semantic\Semantic-UI-React\src\modules\Rating\index.js` to `index.ts`

### 4. Convert SearchInner class component to functional component (CRITICAL)

This is the most complex task in this phase. The `SearchInner` class component must be fully decomposed into hooks.

**State migration:**

Replace `ModernAutoControlledComponent` auto-controlled state with explicit hooks:
```typescript
const [open, setOpen] = useAutoControlledValue({
  state: props.open,
  defaultState: props.defaultOpen,
  initialState: false,
})
const [value, setValue] = useAutoControlledValue({
  state: props.value,
  defaultState: props.defaultValue,
  initialState: '',
})
const [selectedIndex, setSelectedIndex] = React.useState(
  props.selectFirstResult ? 0 : -1,
)
const [focus, setFocus] = React.useState(false)
```

**`getAutoControlledStateFromProps` replacement:**

The static method tracks `prevValue` and resets `selectedIndex` when value changes. Replace with a `useEffect`:
```typescript
const prevValue = usePrevious(value)
React.useEffect(() => {
  if (prevValue !== undefined && prevValue !== value) {
    setSelectedIndex(props.selectFirstResult ? 0 : -1)
  }
}, [value])
```

**`shouldComponentUpdate` replacement:**

Wrap the component with `React.memo` with a custom comparison function:
```typescript
const Search = React.memo(React.forwardRef(function SearchInner(props, ref) {
  // ...
}), (prevProps, nextProps) => shallowEqual(prevProps, nextProps))
```

Note: `React.memo` compares props only. The old `shouldComponentUpdate` also compared state, but in a functional component, state changes always trigger re-render. The `React.memo` wrapper prevents re-renders when parent re-renders with same props.

**`componentDidUpdate` replacement:**

Split into multiple `useEffect` hooks:

```typescript
// Focus/blur eventStack management
React.useEffect(() => {
  if (focus && open) {
    eventStack.sub('keydown', [moveSelectionOnKeyDown, selectItemOnEnter])
  }
  return () => {
    eventStack.unsub('keydown', [moveSelectionOnKeyDown, selectItemOnEnter])
  }
}, [focus, open])

// Open/close eventStack management
React.useEffect(() => {
  if (open) {
    eventStack.sub('click', closeOnDocumentClick)
    eventStack.sub('keydown', [closeOnEscape, moveSelectionOnKeyDown, selectItemOnEnter])
  }
  return () => {
    eventStack.unsub('click', closeOnDocumentClick)
    eventStack.unsub('keydown', [closeOnEscape, moveSelectionOnKeyDown, selectItemOnEnter])
  }
}, [open])
```

**Instance property replacement:**

`this.isMouseDown` is a mutable flag that should not trigger re-renders. Replace with a ref:
```typescript
const isMouseDown = React.useRef(false)
```

**`scrollSelectedItemIntoView` refactoring:**

Replace `document.querySelector('.ui.search.active.visible .results.visible')` with a ref to the results container:
```typescript
const resultsRef = React.useRef<HTMLDivElement>(null)
```

### 5. Merge Search and SearchInner into a single functional component

The current two-layer architecture (`Search` wrapper + `SearchInner` class) exists because:
- `Search` is a `forwardRef` wrapper that provides default props
- `SearchInner` is a class that cannot use `forwardRef` directly

After converting `SearchInner` to a functional component, merge the two into a single `React.forwardRef` functional component. The `innerRef` prop indirection is no longer needed.

Update `J:\code\semantic\Semantic-UI-React\src\modules\Search\Search.js` (to become `Search.tsx`):
- Remove the separate `Search` forwardRef wrapper
- Remove `innerRef` prop from `SearchInner`
- Make the functional component directly use `React.forwardRef`

### 6. Convert SearchCategory.js to SearchCategory.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchCategory.js` to `SearchCategory.tsx`:

- Define `SearchCategoryProps` interface
- Type the `layoutRenderer` and `renderer` function props
- Type the `results` prop as array of `SearchResultProps`

### 7. Convert SearchCategoryLayout.js to SearchCategoryLayout.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchCategoryLayout.js` to `SearchCategoryLayout.tsx`:

- Define `SearchCategoryLayoutProps` interface
- Type the `categoryContent` and `resultsContent` render props

### 8. Convert SearchResult.js to SearchResult.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchResult.js` to `SearchResult.tsx`:

- Define `SearchResultProps` interface
- Type the `renderer` prop and the `onClick`/`onMouseDown` handlers
- Type the `active` prop and `id` prop

### 9. Convert SearchResults.js to SearchResults.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchResults.js` to `SearchResults.tsx`:

- Define `SearchResultsProps` interface
- Simple wrapper component

### 10. Consolidate type definitions

Delete all `.d.ts` files and merge types into `.tsx` files:
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Search\Search.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchCategory.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchCategoryLayout.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchResult.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Search\SearchResults.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Search\index.d.ts`
- Rename `J:\code\semantic\Semantic-UI-React\src\modules\Search\index.js` to `index.ts`

### 11. Replace eventStack with native event listeners in Search

The Search component's `eventStack` usage is particularly complex, with different event subscriptions depending on focus and open state. Replace with `useEffect` hooks that use native `addEventListener`/`removeEventListener`. This eliminates the dependency on the `eventStack` utility.

### 12. Update all tests

- Update imports for new file extensions
- Remove tests specific to class component lifecycle methods
- Add tests for the hooks-based state management
- Ensure keyboard navigation (arrow keys, enter, escape) still works
- Ensure search input change triggers search
- Ensure result selection (click and keyboard) works
- Ensure focus/blur behavior is preserved
- Test category mode rendering

---

## Files Affected

| File | Action |
|------|--------|
| `src/modules/Progress/Progress.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Progress/Progress.d.ts` | DELETE |
| `src/modules/Progress/index.d.ts` | DELETE |
| `src/modules/Progress/index.js` | RENAME to `.ts` |
| `src/modules/Rating/Rating.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Rating/RatingIcon.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Rating/Rating.d.ts` | DELETE |
| `src/modules/Rating/RatingIcon.d.ts` | DELETE |
| `src/modules/Rating/index.d.ts` | DELETE |
| `src/modules/Rating/index.js` | RENAME to `.ts` |
| `src/modules/Search/Search.js` | RENAME to `.tsx`, MAJOR REWRITE |
| `src/modules/Search/SearchCategory.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Search/SearchCategoryLayout.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Search/SearchResult.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Search/SearchResults.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Search/Search.d.ts` | DELETE |
| `src/modules/Search/SearchCategory.d.ts` | DELETE |
| `src/modules/Search/SearchCategoryLayout.d.ts` | DELETE |
| `src/modules/Search/SearchResult.d.ts` | DELETE |
| `src/modules/Search/SearchResults.d.ts` | DELETE |
| `src/modules/Search/index.d.ts` | DELETE |
| `src/modules/Search/index.js` | RENAME to `.ts` |

**Total: 11 files renamed/modified, 11 files deleted**

---

## Acceptance Criteria

- [ ] Progress renders bar with correct width percentage
- [ ] Progress `autoSuccess` triggers success state at 100%
- [ ] Progress `progress` display modes (percent, ratio, value) all work
- [ ] Rating controlled and uncontrolled modes work
- [ ] Rating `clearable` toggle behavior works (auto, true, false)
- [ ] Rating keyboard navigation (Enter/Space) selects icons
- [ ] Rating hover feedback highlights correct icons
- [ ] Search class component (`SearchInner`) is fully eliminated
- [ ] Search `ModernAutoControlledComponent` dependency is removed
- [ ] Search controlled and uncontrolled modes work for both `open` and `value`
- [ ] Search keyboard navigation (ArrowUp, ArrowDown, Enter, Escape) works
- [ ] Search `selectFirstResult` auto-selects first result
- [ ] Search category mode renders categories with results
- [ ] Search `scrollSelectedItemIntoView` uses refs instead of `document.querySelector`
- [ ] Search blur/focus correctly opens/closes results
- [ ] Search document click closes results
- [ ] All components compile as TypeScript without errors
- [ ] All existing tests pass
- [ ] No `ModernAutoControlledComponent` import remains in Search

---

## Rollback Strategy

1. All changes tracked in git. To rollback: `git checkout HEAD -- src/modules/Progress/ src/modules/Rating/ src/modules/Search/`
2. Progress and Rating rollbacks are low risk (already functional components).
3. Search rollback restores the class component. This is safe since the class component is the known-working state.
4. If the Search functional conversion introduces subtle timing bugs (focus/blur race conditions), the class component can be temporarily restored while debugging.

---

## Notes for AI Agents

1. **The Search conversion is the highest-risk task in this phase.** The class component has intricate focus/blur/open/close state interactions. The `componentDidUpdate` method (lines 90-133) contains conditional logic that subscribes and unsubscribes event listeners based on state transitions. When converting to `useEffect`, be extremely careful about:
   - Effect dependency arrays: `[focus]`, `[open]`, `[focus, open]`
   - Cleanup functions: each effect must properly unsubscribe listeners
   - Stale closure issues: handler functions captured in effect closures may reference stale state. Use `useEventCallback` or refs for handlers that need current state.

2. **The `isMouseDown` flag is NOT state.** It is a synchronous flag that prevents the blur handler from closing the dropdown when a result item is being clicked. Converting this to state would cause an extra render and potentially break the click-before-blur timing. Keep it as a `useRef`.

3. **The `scrollSelectedItemIntoView` method uses global DOM queries** (`document.querySelector`). This is fragile -- it will break if multiple Search components are open simultaneously. Refactor to use a ref to the results container element. Pass a ref to `SearchResults` and use `ref.current.querySelector('.result.active')` instead.

4. **The `eventStack` subscriptions in Search are duplicated.** Both the focus effect and the open effect subscribe to `keydown` with `moveSelectionOnKeyDown` and `selectItemOnEnter`. When converting to `useEffect`, be careful not to double-subscribe. Consider a single combined effect for keyboard handling.

5. **Progress and Rating are safe, straightforward conversions.** Start with these to build momentum and verify the TypeScript conversion pipeline, then tackle Search.

6. **The `ModernAutoControlledComponent` base class** provides `getAutoControlledStateFromProps` and manages auto-controlled props (`open`, `value`). The `useAutoControlledValue` hook is the direct replacement. Search needs TWO auto-controlled values: `open` and `value`.

7. **The `shallowEqual` in `shouldComponentUpdate`** compares both props AND state. Since functional components with `React.memo` only compare props, the state comparison is implicitly handled by React's own re-render mechanism. `React.memo` alone is sufficient.

8. **Search's `handleSearchChange`** calls `e.stopPropagation()` to prevent the event from propagating to `props.onChange`. This is intentional -- the search input has its own `onSearchChange` callback. Preserve this behavior in the functional conversion.

9. **The `overrideSearchInputProps` function** (lines 31-42) is defined outside the component and modifies the `input` prop to add the `'prompt'` CSS class. This can remain as-is in the TypeScript conversion.

10. **Execution order:** Convert Progress first (simplest), then Rating (simple with hooks), then Search subcomponents (SearchCategory, SearchCategoryLayout, SearchResult, SearchResults -- all simple), then SearchInner last (most complex). This ensures all dependencies are typed before the main component conversion.
