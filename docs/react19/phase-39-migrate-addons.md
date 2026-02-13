# Phase 39: Migrate Addons (Confirm, Pagination, Portal, Radio, Select, TextArea, TransitionablePortal)

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-39                                                              |
| **Title**      | Migrate Addons (Confirm, Pagination, Portal, Radio, Select, TextArea, TransitionablePortal) |
| **Stage**      | 7 -- Component Migration - Views & Addons                             |
| **Dependencies** | Phase 18 (cloneElement/Shorthand Updates), Phase 30 (Checkbox Migration), Phase 31 (Dropdown Migration), Phase 32 (Modal Migration), Phase 35 (Transition Migration) |
| **Complexity** | High                                                                  |
| **Scope**      | 7 addon families totaling 9 component files + 3 utility files, Portal trigger pattern update, createPortal usage, cloneElement modernization |

---

## Objective

Convert all Addon components from JavaScript to TypeScript. The critical component in this phase is Portal, which is the foundation for Modal, Popup, and TransitionablePortal. Portal uses `React.cloneElement` to inject event handlers into trigger elements and `createPortal` from `react-dom` for off-tree rendering. The trigger pattern must be evaluated for React 19 compatibility where `cloneElement` is discouraged. The `useTrigger` utility and `usePortalElement` utility must be updated for the new ref handling in React 19. Additionally, Radio wraps Checkbox and Select wraps Dropdown, creating cross-layer dependencies that must be properly typed.

---

## Background

### Portal (`src/addons/Portal/Portal.js`)

Portal is the most critical addon component. It serves as the rendering foundation for Modal, Popup, Confirm, and TransitionablePortal. Key architecture:

- **Not a `forwardRef` component** -- Portal is a plain function component (line 26). It does not accept a `ref` prop.
- **Auto-controlled `open` state** via `useAutoControlledValue` (lines 45-49)
- **Trigger rendering** via `React.cloneElement` (lines 301-309): Injects `onBlur`, `onClick`, `onFocus`, `onMouseLeave`, `onMouseEnter`, and `ref` into the trigger element
- **Content rendering** via `PortalInner` + `createPortal` (lines 275-282)
- **Event handling** via `@semantic-ui-react/event-stack` `<EventStack>` component (lines 284-298): Declarative event listeners for `mouseleave`, `mouseenter`, `mousedown`, `click`, `keydown` on the document or portal content
- **6 `useRef` calls**: `contentRef`, `triggerRef` (via `useTrigger`), `mouseEnterTimer`, `mouseLeaveTimer`, `latestDocumentMouseDownEvent`
- **`Portal.handledProps`** (computed from propTypes) is used by Modal and Popup to partition props

### PortalInner (`src/addons/Portal/PortalInner.js`)

The actual portal renderer:
- Uses `React.forwardRef`
- Uses `createPortal(element, mountNode || document.body)` from `react-dom`
- Uses `usePortalElement` hook to wrap children in a ref-able container
- Fires `onMount`/`onUnmount` callbacks via `useEventCallback`

### useTrigger (`src/addons/Portal/utils/useTrigger.js`)

A custom hook that:
1. Calls `validateTrigger` to ensure the trigger is a single, non-Fragment element
2. Merges refs from the trigger element, the `triggerRef` prop, and internal ref via `useMergedRefs`
3. Returns `[ref, clonedTrigger]` where `clonedTrigger` is `React.cloneElement(trigger, { ref })`

The `cloneElement` usage here is a key React 19 concern. React 19 does not remove `cloneElement` but marks it as a legacy API. The recommended alternative is to pass a render function or use composition.

### usePortalElement (`src/addons/Portal/usePortalElement.js`)

A custom hook that:
1. Checks if the node is a valid element
2. If it is a `forwardRef` component or HTML element, clones it with a merged ref
3. Otherwise, wraps it in a `<div data-suir-portal="true" ref={ref}>` wrapper

This also uses `React.cloneElement` and `ReactIs.isForwardRef`. In React 19, `isForwardRef` returns `false` for all components because `forwardRef` is no longer a distinct component type.

### validateTrigger (`src/addons/Portal/utils/validateTrigger.js`)

Validates that the trigger is a single element and not a Fragment. Uses `React.Children.only` and `ReactIs.isFragment`.

### Confirm (`src/addons/Confirm/Confirm.js`)

A thin wrapper around Modal:
- Uses `React.forwardRef`
- Renders `<Modal>` with `Modal.Header`, `Modal.Content`, `Modal.Actions`
- Provides `cancelButton` and `confirmButton` shorthand via `Button.create()`
- Has an unusual pattern for the `open` prop: manually checks `_.has(props, 'open')` to avoid passing `undefined` to Modal's auto-controlled state

### Pagination (`src/addons/Pagination/Pagination.js`)

A functional component using `React.forwardRef` with `useAutoControlledValue` for `activePage`:
- Renders a `<Menu pagination>` with `PaginationItem` components
- Uses `createPaginationItems` utility from `../../lib` to compute page items
- Has shorthand for all item types: `firstItem`, `lastItem`, `nextItem`, `prevItem`, `pageItem`, `ellipsisItem`
- `PaginationItem` uses `MenuItem.create()` shorthand and `createShorthandFactory`

### Radio (`src/addons/Radio/Radio.js`)

A thin wrapper around Checkbox:
```javascript
const Radio = React.forwardRef(function (props, ref) {
  const { slider, toggle, type = 'radio' } = props
  const rest = getUnhandledProps(Radio, props)
  const radio = !(slider || toggle) || undefined
  return <Checkbox {...rest} type={type} radio={radio} slider={slider} toggle={toggle} ref={ref} />
})
```

Depends on Phase 30 (Checkbox migration) being complete.

### Select (`src/addons/Select/Select.js`)

A thin wrapper around Dropdown:
```javascript
const Select = React.forwardRef(function (props, ref) {
  return <Dropdown {...props} selection ref={ref} />
})
```

Has static subcomponents re-exported from Dropdown: `Select.Divider`, `Select.Header`, `Select.Item`, `Select.Menu`. Depends on Phase 31 (Dropdown migration) being complete.

### TextArea (`src/addons/TextArea/TextArea.js`)

A simple functional component:
- Uses `React.forwardRef` with `useMergedRefs`
- Handles `onChange` and `onInput` events
- Default `as` is `'textarea'` (overridable)
- Default `rows` is 3

### TransitionablePortal (`src/addons/TransitionablePortal/TransitionablePortal.js`)

Combines Portal and Transition:
- **Not a `forwardRef` component** -- plain function component
- Uses a custom `usePortalState` hook (lines 12-42) that manages portal open state with a ref and `useForceUpdate`. Contains a hack: `portalOpen.current === -1` is used as a sentinel value to force close.
- Renders `<Portal>` wrapping a `<Transition>` wrapping `{children}`
- The `transition` prop passes animation configuration to Transition
- Fires `onOpen`, `onClose`, `onStart`, `onHide` callbacks at different points in the animation lifecycle

---

## Detailed Tasks

### 1. Address React 19 cloneElement usage in Portal trigger

The Portal trigger pattern uses `React.cloneElement` in two places:
1. `useTrigger.js` (line 19): Clones the trigger with a merged ref
2. `Portal.js` (lines 301-309): Clones the trigger with event handler props

React 19 does not remove `cloneElement` but discourages its use. Options:

**Option A: Keep cloneElement (pragmatic approach)**
- `cloneElement` still works in React 19
- The existing API (`trigger={<Button>Open</Button>}`) is well-established
- Add a deprecation warning and plan to remove in v4.0.0

**Option B: Add render function alternative**
- Support both `trigger` (element, uses cloneElement) and `renderTrigger` (function, no cloneElement):
  ```typescript
  // New API
  <Portal renderTrigger={(props) => <Button {...props}>Open</Button>} />
  // Legacy API still works
  <Portal trigger={<Button>Open</Button>} />
  ```
- The `renderTrigger` function receives `{ ref, onClick, onFocus, onBlur, onMouseEnter, onMouseLeave }` as its argument

**Option C: Use callback ref composition (internal only)**
- Keep the `trigger` prop API unchanged
- Internally use `React.cloneElement` only for the ref
- Use event delegation or context for event handlers instead of cloning them onto the trigger

For this phase, implement **Option A** (keep cloneElement) with TypeScript types that support **Option B** as a future addition. Add the `renderTrigger` prop type but do not implement it yet.

### 2. Fix usePortalElement for React 19

`J:\code\semantic\Semantic-UI-React\src\addons\Portal\usePortalElement.js` uses `ReactIs.isForwardRef(node)` at line 16. In React 19, `forwardRef` is no longer a distinct component type -- `React.forwardRef` still works but `isForwardRef` from `react-is` may return `false` for components that use `forwardRef` in React 19.

Update the logic:
```typescript
// Before (React 18)
if (ReactIs.isForwardRef(node)) {
  return React.cloneElement(node, { ref })
}
if (typeof node.type === 'string') {
  return React.cloneElement(node, { ref })
}

// After (React 19)
if (typeof node.type === 'string') {
  // HTML elements always support ref
  return React.cloneElement(node, { ref })
}
if (typeof node.type === 'function' || typeof node.type === 'object') {
  // In React 19, all function components accept ref as a prop
  return React.cloneElement(node, { ref })
}
```

In React 19, `ref` is a regular prop on all function components, so the `forwardRef` check is unnecessary. Any component can receive a `ref` prop.

### 3. Convert Portal.js to Portal.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Portal\Portal.js` to `Portal.tsx`:

- Define `PortalProps` interface:
  ```typescript
  export interface PortalProps extends StrictPortalProps {
    [key: string]: any
  }
  export interface StrictPortalProps {
    children: React.ReactNode
    closeOnDocumentClick?: boolean
    closeOnEscape?: boolean
    closeOnPortalMouseLeave?: boolean
    closeOnTriggerBlur?: boolean
    closeOnTriggerClick?: boolean
    closeOnTriggerMouseLeave?: boolean
    defaultOpen?: boolean
    eventPool?: string
    hideOnScroll?: boolean
    mountNode?: Element | null
    mouseEnterDelay?: number
    mouseLeaveDelay?: number
    onClose?: (event: React.SyntheticEvent, data: PortalProps) => void
    onMount?: (nothing: null, data: PortalProps) => void
    onOpen?: (event: React.SyntheticEvent, data: PortalProps) => void
    onUnmount?: (nothing: null, data: PortalProps) => void
    open?: boolean
    openOnTriggerClick?: boolean
    openOnTriggerFocus?: boolean
    openOnTriggerMouseEnter?: boolean
    trigger?: React.ReactNode
    triggerRef?: React.Ref<HTMLElement>
  }
  ```
- Type all event handlers
- Type all refs
- Type the `EventStack` component props
- Replace `@semantic-ui-react/event-stack` `<EventStack>` components with native `useEffect` + `addEventListener` for cleaner typing and fewer dependencies
- Compute `Portal.handledProps` from the TypeScript interface keys

### 4. Convert PortalInner.js to PortalInner.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Portal\PortalInner.js` to `PortalInner.tsx`:

- Define `PortalInnerProps` interface
- Type the `createPortal` call from `react-dom`
- Type the `usePortalElement` return value
- Type the `mountNode` prop as `Element | null`

### 5. Convert useTrigger.js to useTrigger.ts

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Portal\utils\useTrigger.js` to `useTrigger.ts`:

- Type the function signature: `(trigger: React.ReactNode | undefined, triggerRef: React.Ref<HTMLElement> | undefined) => [React.Ref<HTMLElement>, React.ReactElement | null]`
- Type the `useMergedRefs` call
- Type the `React.cloneElement` call
- Keep the `validateTrigger` call

### 6. Convert validateTrigger.js to validateTrigger.ts

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Portal\utils\validateTrigger.js` to `validateTrigger.ts`:

- Type the function signature: `(element: React.ReactNode) => void`
- `React.Children.only` already throws if not exactly one child
- `ReactIs.isFragment` check remains valid in React 19

### 7. Convert usePortalElement.js to usePortalElement.ts

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Portal\usePortalElement.js` to `usePortalElement.ts`:

- Type the function signature: `(node: React.ReactNode, userRef: React.Ref<HTMLElement>) => React.ReactElement`
- Update the `ReactIs.isForwardRef` check for React 19 compatibility (see Task 2)
- Type the fallback `<div data-suir-portal>` wrapper

### 8. Convert Confirm.js to Confirm.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Confirm\Confirm.js` to `Confirm.tsx`:

- Define `ConfirmProps` interface
- Type the `cancelButton` and `confirmButton` shorthand props
- Type the `handleCancel` and `handleConfirmOverrides` functions
- Type the Modal shorthand usage: `Modal.Header.create()`, `Modal.Content.create()`
- Handle the `_.has(props, 'open')` pattern -- in TypeScript, this can be `'open' in props`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Confirm\Confirm.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Confirm\index.d.ts`
- Rename `index.js` to `index.ts`

### 9. Convert Pagination.js to Pagination.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Pagination\Pagination.js` to `Pagination.tsx`:

- Define `PaginationProps` interface
- Type `useAutoControlledValue` for `activePage`
- Type the `createPaginationItems` return value
- Type the `handleItemClick` and `handleItemOverrides` functions
- Type all shorthand item props (`firstItem`, `lastItem`, `nextItem`, `prevItem`, `pageItem`, `ellipsisItem`)

Convert `J:\code\semantic\Semantic-UI-React\src\addons\Pagination\PaginationItem.js` to `PaginationItem.tsx`:
- Define `PaginationItemProps` interface
- Type the `MenuItem.create()` shorthand
- Type the `type` prop union
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Pagination\Pagination.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Pagination\PaginationItem.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Pagination\index.d.ts`
- Rename `index.js` to `index.ts`

### 10. Convert Radio.js to Radio.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Radio\Radio.js` to `Radio.tsx`:

- Define `RadioProps` interface extending/referencing `CheckboxProps`
- Type the `slider`, `toggle`, `type` props
- Ensure Checkbox types from Phase 30 are available
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Radio\Radio.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Radio\index.d.ts`
- Rename `index.js` to `index.ts`

### 11. Convert Select.js to Select.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\Select\Select.js` to `Select.tsx`:

- Define `SelectProps` interface extending/referencing `DropdownProps`
- Type the `options` prop as `Array<DropdownItemProps>`
- Type the re-exported static subcomponents: `Select.Divider`, `Select.Header`, `Select.Item`, `Select.Menu`
- Ensure Dropdown types from Phase 31 are available
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Select\Select.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\Select\index.d.ts`
- Rename `index.js` to `index.ts`

### 12. Convert TextArea.js to TextArea.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\TextArea\TextArea.js` to `TextArea.tsx`:

- Define `TextAreaProps` interface:
  ```typescript
  export interface StrictTextAreaProps {
    as?: React.ElementType
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => void
    onInput?: (event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => void
    rows?: number | string
    value?: number | string
  }
  ```
- Type the `handleChange` and `handleInput` events
- Type the `useMergedRefs` call
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\TextArea\TextArea.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\TextArea\index.d.ts`
- Rename `index.js` to `index.ts`

### 13. Convert TransitionablePortal.js to TransitionablePortal.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\addons\TransitionablePortal\TransitionablePortal.js` to `TransitionablePortal.tsx`:

- Define `TransitionablePortalProps` interface
- Type the `usePortalState` hook: `(props: TransitionablePortalProps) => [boolean, (value: boolean | -1) => void]`
- Type the `transition` prop as `TransitionProps` (from Phase 35)
- Type the hack: `setPortalOpen(-1)` -- the `-1` sentinel is typed as `boolean | -1` or refactored to use a more explicit state machine
- Type all callback handlers
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\TransitionablePortal\TransitionablePortal.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\addons\TransitionablePortal\index.d.ts`
- Rename `index.js` to `index.ts`

### 14. Replace EventStack components in Portal with native event listeners

The Portal component uses 5 `<EventStack>` component instances for declarative event handling:
```jsx
<EventStack name='mouseleave' on={handlePortalMouseLeave} pool={eventPool} target={contentRef} />
<EventStack name='mouseenter' on={handlePortalMouseEnter} pool={eventPool} target={contentRef} />
<EventStack name='mousedown' on={handleDocumentMouseDown} pool={eventPool} />
<EventStack name='click' on={handleDocumentClick} pool={eventPool} />
<EventStack name='keydown' on={handleEscape} pool={eventPool} />
```

Replace with `useEffect` hooks:
```typescript
React.useEffect(() => {
  if (!open) return
  const node = contentRef.current
  if (node) {
    node.addEventListener('mouseleave', handlePortalMouseLeave)
    node.addEventListener('mouseenter', handlePortalMouseEnter)
  }
  document.addEventListener('mousedown', handleDocumentMouseDown)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
  return () => {
    if (node) {
      node.removeEventListener('mouseleave', handlePortalMouseLeave)
      node.removeEventListener('mouseenter', handlePortalMouseEnter)
    }
    document.removeEventListener('mousedown', handleDocumentMouseDown)
    document.removeEventListener('click', handleDocumentClick)
    document.removeEventListener('keydown', handleEscape)
  }
}, [open])
```

This eliminates the `@semantic-ui-react/event-stack` dependency from Portal.

### 15. Update all tests

- Update imports for new file extensions
- Test Portal open/close with trigger click, focus, hover
- Test Portal document click closes portal
- Test Portal escape key closes portal
- Test Portal `hideOnScroll` behavior
- Test Confirm cancel/confirm button clicks
- Test Pagination page changes, keyboard navigation
- Test TransitionablePortal animation lifecycle
- Test Radio delegates to Checkbox correctly
- Test Select delegates to Dropdown correctly
- Test TextArea onChange/onInput events
- Verify React 19 compatibility of `usePortalElement` (no `isForwardRef` dependency)

---

## Files Affected

| File | Action |
|------|--------|
| `src/addons/Portal/Portal.js` | RENAME to `.tsx`, MODIFY (major: EventStack removal) |
| `src/addons/Portal/PortalInner.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/Portal/usePortalElement.js` | RENAME to `.ts`, MODIFY (React 19 fix) |
| `src/addons/Portal/utils/useTrigger.js` | RENAME to `.ts`, MODIFY |
| `src/addons/Portal/utils/validateTrigger.js` | RENAME to `.ts`, MODIFY |
| `src/addons/Confirm/Confirm.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/Pagination/Pagination.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/Pagination/PaginationItem.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/Radio/Radio.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/Select/Select.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/TextArea/TextArea.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/TransitionablePortal/TransitionablePortal.js` | RENAME to `.tsx`, MODIFY |
| `src/addons/Portal/Portal.d.ts` | DELETE |
| `src/addons/Portal/PortalInner.d.ts` | DELETE |
| `src/addons/Portal/index.d.ts` | DELETE |
| `src/addons/Confirm/Confirm.d.ts` | DELETE |
| `src/addons/Confirm/index.d.ts` | DELETE |
| `src/addons/Pagination/Pagination.d.ts` | DELETE |
| `src/addons/Pagination/PaginationItem.d.ts` | DELETE |
| `src/addons/Pagination/index.d.ts` | DELETE |
| `src/addons/Radio/Radio.d.ts` | DELETE |
| `src/addons/Radio/index.d.ts` | DELETE |
| `src/addons/Select/Select.d.ts` | DELETE |
| `src/addons/Select/index.d.ts` | DELETE |
| `src/addons/TextArea/TextArea.d.ts` | DELETE |
| `src/addons/TextArea/index.d.ts` | DELETE |
| `src/addons/TransitionablePortal/TransitionablePortal.d.ts` | DELETE |
| `src/addons/TransitionablePortal/index.d.ts` | DELETE |
| Various `index.js` files (7 files) | RENAME to `.ts` |

**Total: 19 files renamed/modified, 18 files deleted**

---

## Acceptance Criteria

- [ ] Portal opens/closes correctly with trigger click
- [ ] Portal opens/closes correctly with trigger hover (with delays)
- [ ] Portal opens/closes correctly with trigger focus/blur
- [ ] Portal document click closes portal (when not clicking inside portal or trigger)
- [ ] Portal escape key closes portal
- [ ] Portal `hideOnScroll` closes portal on page scroll
- [ ] Portal `mountNode` renders content to specified DOM node
- [ ] Portal `closeOnPortalMouseLeave` works with `mouseLeaveDelay`
- [ ] `<EventStack>` components are replaced with native event listeners in Portal
- [ ] `usePortalElement` works in React 19 without `ReactIs.isForwardRef`
- [ ] PortalInner `createPortal` renders to correct mount node
- [ ] Confirm renders Modal with cancel/confirm buttons
- [ ] Confirm `onCancel` fires on cancel click and backdrop click
- [ ] Confirm `onConfirm` fires on confirm click
- [ ] Pagination `activePage` controlled and uncontrolled modes work
- [ ] Pagination page changes fire `onPageChange`
- [ ] Pagination keyboard navigation (Enter on items) works
- [ ] Pagination ellipsis items are non-clickable
- [ ] Radio delegates to Checkbox with `type="radio"`
- [ ] Select delegates to Dropdown with `selection` prop
- [ ] Select re-exports Dropdown subcomponents
- [ ] TextArea `onChange` and `onInput` fire with correct data
- [ ] TextArea `rows` prop works
- [ ] TransitionablePortal animates open/close
- [ ] TransitionablePortal `onOpen`, `onClose`, `onStart`, `onHide` fire at correct lifecycle points
- [ ] All components compile as TypeScript without errors
- [ ] All existing tests pass
- [ ] No separate `.d.ts` files remain in addon directories
- [ ] `@semantic-ui-react/event-stack` import is removed from Portal

---

## Rollback Strategy

1. All changes tracked in git. To rollback: `git checkout HEAD -- src/addons/`
2. Portal is the highest-risk component. If the EventStack removal causes event handling regressions, revert Portal specifically: `git checkout HEAD -- src/addons/Portal/`
3. The `usePortalElement` React 19 fix is critical. If it causes issues, the `isForwardRef` check can be temporarily restored since `react-is` still provides the function (it just may return different results in React 19).
4. Radio, Select, and TextArea are thin wrappers with minimal risk.
5. TransitionablePortal's `portalOpen.current === -1` hack is preserved as-is. Refactoring it is optional and can be deferred.

---

## Notes for AI Agents

1. **Portal is the keystone component of the addons layer.** Modal, Popup, Confirm, and TransitionablePortal all depend on it. Any regression in Portal will cascade. Test Portal thoroughly before converting dependent components.

2. **The `React.cloneElement` usage in Portal and useTrigger is the most significant React 19 compatibility concern** in the entire library. While `cloneElement` still works in React 19, the React team discourages it. For v3.0.0, keeping it is acceptable. Document the plan to migrate to render functions in v4.0.0.

3. **The `usePortalElement` React 19 fix is critical.** In React 18, `ReactIs.isForwardRef` correctly identifies `forwardRef` components. In React 19, `forwardRef` is essentially a no-op (all function components accept `ref`), and `isForwardRef` may return `false`. The fix is to remove the `isForwardRef` check entirely and clone the ref onto any valid element. Test with both React 18 and React 19.

4. **The `@semantic-ui-react/event-stack` package** provides the `<EventStack>` declarative component. It is a library-internal package. Replacing it with `useEffect` + `addEventListener` reduces dependencies and improves TypeScript typing. However, the EventStack component handles event delegation and pooling that raw `addEventListener` does not. Ensure the replacement correctly handles:
   - Multiple event listeners of the same type on the same target
   - Event listener cleanup when the portal closes
   - The `target` prop (contentRef for portal-level events, document for document-level events)

5. **TransitionablePortal's `portalOpen.current === -1` hack** is documented with a comment linking to issue #2382. This sentinel value forces the portal state to `false` bypassing the normal controlled/uncontrolled flow. In TypeScript, type this as `boolean | -1` or refactor to use a separate `forceClose` ref. Refactoring is recommended but optional for this phase.

6. **Confirm's `_.has(props, 'open')` pattern** checks whether the `open` prop was explicitly passed (even as `undefined`). In TypeScript, this is `'open' in props`. This is needed because Modal uses auto-controlled state -- passing `open={undefined}` is different from not passing `open` at all.

7. **Select re-exports Dropdown subcomponents** as static properties. In TypeScript, these need to be declared on the component type:
   ```typescript
   declare const Select: ForwardRefComponent<SelectProps, HTMLDivElement> & {
     Divider: typeof Dropdown.Divider
     Header: typeof Dropdown.Header
     Item: typeof Dropdown.Item
     Menu: typeof Dropdown.Menu
   }
   ```

8. **Radio's prop types reference Checkbox.propTypes** directly (`slider: Checkbox.propTypes.slider`). In TypeScript, this becomes an interface extension or reference: `slider?: CheckboxProps['slider']`.

9. **Portal.handledProps** is computed from `Portal.propTypes` at runtime and used by Modal and Popup to split their props into portal props and content props. In TypeScript, this should be computed from the interface keys. Consider exporting a `PORTAL_HANDLED_PROPS` constant array typed as `(keyof StrictPortalProps)[]`.

10. **Execution order within this phase:**
    - Convert utilities first: `validateTrigger.ts`, `useTrigger.ts`, `usePortalElement.ts`
    - Then `PortalInner.tsx`
    - Then `Portal.tsx` (depends on all above)
    - Then simple wrappers: `Radio.tsx`, `Select.tsx`, `TextArea.tsx` (can be parallel)
    - Then `Confirm.tsx` (depends on Modal types from Phase 32)
    - Then `Pagination.tsx` + `PaginationItem.tsx`
    - Finally `TransitionablePortal.tsx` (depends on both Portal and Transition types)
