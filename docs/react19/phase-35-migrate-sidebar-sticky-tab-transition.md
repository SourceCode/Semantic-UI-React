# Phase 35: Migrate Sidebar, Sticky, Tab, Transition

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-35                                                              |
| **Title**      | Migrate Sidebar, Sticky, Tab, Transition                              |
| **Stage**      | 6 -- Component Migration - Modules                                    |
| **Dependencies** | Phase 16 (TypeScript Infrastructure), Phase 17 (Hook Utilities)      |
| **Complexity** | High                                                                  |
| **Scope**      | 4 module families totaling 10 components + 3 utility files, critical class-to-functional conversion for Transition, Context API update |

---

## Objective

Convert Sidebar, Sticky, Tab, and Transition modules from JavaScript to TypeScript. The critical migration is Transition -- the only remaining class component in the modules layer that uses `getDerivedStateFromProps` for a state machine pattern. Transition must be converted to a functional component using `useReducer` or equivalent hook-based state machine. The Tab component's usage of `ModernAutoControlledComponent` (which has already been replaced with `useAutoControlledValue` in the current source) requires only TypeScript conversion. Sticky's 7 `useRef` calls need proper typing. Sidebar's dependency on `@fluentui/react-component-event-listener` must be evaluated for replacement.

---

## Background

### Sidebar (`src/modules/Sidebar/Sidebar.js`)

Sidebar is a functional component using `React.forwardRef` with a custom `useAnimationTick` hook for managing animation state. Key characteristics:

- **`useAnimationTick(visible)`** (lines 29-47): A custom hook that tracks animation state using `usePrevious`, `useRef`, and `useForceUpdate`. It computes a `tickIncrement` when `visible` changes and provides a `resetAnimationTick` callback. This drives the CSS animation classes.

- **External dependency: `@fluentui/react-component-event-listener`** (line 1): Provides the `<EventListener>` component and `documentRef` for declarative document-level event binding. The `EventListener` component at line 128 handles document clicks when the sidebar is visible.

- **`Sidebar.animationDuration = 500`** (line 202): A static property defining the default animation duration, used in `setTimeout` for animation end detection (line 81).

- **Subcomponents**: `SidebarPushable` and `SidebarPusher` -- both simple presentational components.

- **The `target` prop** defaults to `documentRef` from the Fluentui event listener library. This prop controls where click events are listened for.

### Sticky (`src/modules/Sticky/Sticky.js`)

Sticky is a functional component using `React.forwardRef` with 7 `useRef` calls and complex scroll-position calculations:

- **Refs** (lines 37-45):
  1. `stickyRef` -- ref to the sticky element
  2. `triggerRef` -- ref to a zero-height trigger div that marks the original position
  3. `triggerRect` -- stores the trigger's `DOMRect` (ref, not state, for performance)
  4. `contextRect` -- stores the context element's `DOMRect`
  5. `stickyRect` -- stores the sticky element's `DOMRect`
  6. `frameId` -- `requestAnimationFrame` ID for cleanup
  7. `ticking` -- boolean flag to throttle updates to one RAF per frame

- **State** (5 `useState` calls): `sticky`, `bound`, `bottom`, `pushing`, `top`

- **The `update` function** (lines 145-187): Complex positioning logic with multiple conditional branches for stick-to-screen-top, stick-to-screen-bottom, stick-to-context-top, stick-to-context-bottom, and "pushing" mode.

- **Event listeners** (lines 226-238): Uses native `addEventListener`/`removeEventListener` for scroll and resize events on the `scrollContext`. This is already the modern pattern (no eventStack).

- **The `context` prop**: Can be a DOM node or a ref object. The `assignRects` function (line 51) handles both via `isRefObject`.

### Tab (`src/modules/Tab/Tab.js`)

Tab is already a functional component using `React.forwardRef` with `useAutoControlledValue` for `activeIndex` state. It has been modernized in a previous effort. Key points:

- Uses `useAutoControlledValue` for `activeIndex` (lines 30-34)
- Renders a `Menu` for tab headers and either `TabPane.create` or `render` functions for content
- Supports vertical layout via Grid
- The `menu` prop (line 57) is mutated directly: `menu.tabular = 'right'` -- this should be refactored to avoid prop mutation
- `TabPane` uses `createShorthandFactory`

### Transition (`src/modules/Transition/Transition.js`)

Transition is the most critical component in this phase. It is a **class component** (line 32) extending `React.Component` with a state machine pattern. Key characteristics:

- **`getDerivedStateFromProps`** (lines 43-55): Calls `computeStatuses()` which takes the current `visible` prop and `status` state and returns the next `{ animating, status, nextStatus }`. This is a state machine with 6 states:
  - `INITIAL` -- before first render
  - `ENTERING` -- animation playing to show
  - `ENTERED` -- visible, animation complete
  - `EXITING` -- animation playing to hide
  - `EXITED` -- hidden, animation complete
  - `UNMOUNTED` -- removed from DOM

- **`componentDidMount` and `componentDidUpdate`** (lines 57-65): Both call `updateStatus(prevState)` which:
  - Clears timeout
  - If `nextStatus` exists, calls `handleStart(nextStatus)` which sets a `setTimeout` for the animation duration, then sets `status` to `nextStatus`
  - Fires `onStart`, `onComplete`, `onShow`, `onHide` callbacks based on animation state transitions

- **`componentWillUnmount`** (lines 67-69): Clears the `timeoutId`.

- **`computeClasses`** (lines 115-138): Computes CSS classes based on animation state (`animating`, `in`, `out`, `hidden`, `visible`, `transition`). Handles both directional and non-directional transitions.

- **`computeStyle`** (lines 140-149): Computes `animationDuration` CSS property from props.

- **`render`** (lines 155-174): Returns `null` if `UNMOUNTED`, otherwise uses `React.cloneElement(children, { className, style })` to inject classes and styles into the single child element.

- **`Transition.defaultProps`** (lines 245-252): `animation: 'fade'`, `duration: 500`, `visible: true`, `mountOnShow: true`, `transitionOnMount: false`, `unmountOnHide: false`.

- **`computeStatuses`** (`src/modules/Transition/utils/computeStatuses.js`): A pure function implementing the state machine transitions. Takes `{ mountOnShow, status, transitionOnMount, visible, unmountOnHide }` and returns `{ animating, status, nextStatus }`. This function can be reused as-is in the functional component.

- **TransitionGroup** (`src/modules/Transition/TransitionGroup.js`): Already a functional component. Uses `useWrappedChildren` hook for managing child enter/exit animations. Uses `useForceUpdate` and `useEventCallback`.

- **Utility files**:
  - `utils/computeStatuses.js` -- state machine logic (reusable)
  - `utils/childMapping.js` -- child reconciliation for TransitionGroup
  - `utils/wrapChild.js` -- wraps children with Transition components

---

## Detailed Tasks

### 1. Convert Transition class component to functional component (CRITICAL)

This is the highest-priority task. Convert `J:\code\semantic\Semantic-UI-React\src\modules\Transition\Transition.js` from a class component to a functional component using hooks.

**State machine with useReducer:**

The `getDerivedStateFromProps` + `computeStatuses` pattern maps cleanly to a `useReducer` that dispatches on `visible` prop changes:

```typescript
type TransitionState = {
  animating: boolean
  status: TransitionStatus
  nextStatus: TransitionStatus | undefined
}

function transitionReducer(
  state: TransitionState,
  action: { type: 'PROPS_CHANGE'; visible: boolean; mountOnShow: boolean; transitionOnMount: boolean; unmountOnHide: boolean }
): TransitionState {
  const result = computeStatuses({
    mountOnShow: action.mountOnShow,
    status: state.status,
    transitionOnMount: action.transitionOnMount,
    visible: action.visible,
    unmountOnHide: action.unmountOnHide,
  })
  return Object.keys(result).length > 0 ? { ...state, ...result } : state
}
```

Alternatively, since `getDerivedStateFromProps` runs synchronously before render, replicate with a ref-based pattern:

```typescript
const [state, setState] = React.useState<TransitionState>({
  status: TRANSITION_STATUS_INITIAL,
  animating: false,
  nextStatus: undefined,
})

// Synchronous state derivation (replaces getDerivedStateFromProps)
const derivedState = React.useMemo(() => {
  const result = computeStatuses({
    mountOnShow, status: state.status, transitionOnMount, visible, unmountOnHide,
  })
  return Object.keys(result).length > 0 ? { ...state, ...result } : state
}, [visible, state.status, mountOnShow, transitionOnMount, unmountOnHide])
```

**Timeout management:**

Replace `this.timeoutId` with a ref:
```typescript
const timeoutId = React.useRef<ReturnType<typeof setTimeout>>()
```

**`updateStatus` logic in useEffect:**

```typescript
const prevState = usePrevious(derivedState)
React.useEffect(() => {
  if (prevState?.status !== derivedState.status) {
    clearTimeout(timeoutId.current)
    if (derivedState.nextStatus) {
      handleStart(derivedState.nextStatus)
    }
  }
  // Fire callbacks
  if (!prevState?.animating && derivedState.animating) {
    onStart?.(null, { ...props, status: derivedState.status })
  }
  if (prevState?.animating && !derivedState.animating) {
    const callback = derivedState.status === TRANSITION_STATUS_ENTERED ? onShow : onHide
    onComplete?.(null, { ...props, status: derivedState.status })
    callback?.(null, { ...props, status: derivedState.status })
  }
}, [derivedState])
```

**Cleanup:**
```typescript
React.useEffect(() => {
  return () => clearTimeout(timeoutId.current)
}, [])
```

### 2. Convert Transition utilities to TypeScript

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Transition\utils\computeStatuses.js` to `computeStatuses.ts`:
- Define `TransitionStatus` type as union of the 6 status constants
- Type the `computeStatuses` function parameters and return type
- Export the `TransitionStatus` type for use in other files

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Transition\utils\childMapping.js` to `childMapping.ts`:
- Type `getChildMapping` and `mergeChildMappings` functions
- Type the child mapping objects

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Transition\utils\wrapChild.js` to `wrapChild.ts`:
- Type the `wrapChild` function and its parameters

### 3. Convert TransitionGroup.js to TransitionGroup.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Transition\TransitionGroup.js` to `TransitionGroup.tsx`:

- Define `TransitionGroupProps` interface
- Type the `useWrappedChildren` hook
- Type the `forceUpdate` and `handleChildHide` callbacks
- The `previousChildren.current` ref needs typing as `Record<string, React.ReactElement>`

### 4. Replace @fluentui/react-component-event-listener in Sidebar

The `@fluentui/react-component-event-listener` package provides the `<EventListener>` component used in Sidebar. This is an unnecessary dependency when native `useEffect` + `addEventListener` works:

Replace:
```jsx
{visible && <EventListener listener={handleDocumentClick} type='click' {...targetProp} />}
```

With:
```typescript
React.useEffect(() => {
  if (!visible) return
  const targetNode = isRefObject(target) ? target.current : target
  const node = targetNode === documentRef ? document : targetNode
  node?.addEventListener('click', handleDocumentClick)
  return () => {
    node?.removeEventListener('click', handleDocumentClick)
  }
}, [visible, target])
```

Remove the `@fluentui/react-component-event-listener` import and the `documentRef` import. Replace the `target` prop default with `null` and use `document` directly in the effect.

### 5. Convert Sidebar.js to Sidebar.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Sidebar\Sidebar.js` to `Sidebar.tsx`:

- Define `SidebarProps` interface
- Type the `useAnimationTick` hook return value
- Type the `animation` prop as union of string literals
- Type `animationTimer` and `skipNextCallback` refs
- Type the `handleAnimationEnd`, `handleAnimationStart`, `handleDocumentClick` handlers
- Convert `SidebarPushable.js` to `SidebarPushable.tsx`
- Convert `SidebarPusher.js` to `SidebarPusher.tsx`

### 6. Type Sticky's 7 refs

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Sticky\Sticky.js` to `Sticky.tsx`:

- Define `StickyProps` interface
- Type all 7 refs:
  - `stickyRef: React.RefObject<HTMLDivElement>`
  - `triggerRef: React.RefObject<HTMLDivElement>`
  - `triggerRect: React.MutableRefObject<DOMRect | undefined>`
  - `contextRect: React.MutableRefObject<DOMRect | undefined>`
  - `stickyRect: React.MutableRefObject<DOMRect | undefined>`
  - `frameId: React.MutableRefObject<number | undefined>`
  - `ticking: React.MutableRefObject<boolean>`
- Type the `context` and `scrollContext` props (DOM node or ref object)
- Type the positioning helper functions (`didReachContextBottom`, `didTouchScreenTop`, etc.)
- Type the `update` and `handleUpdate` functions
- Type the 5 state variables: `sticky`, `bound`, `bottom`, `pushing`, `top`

### 7. Fix Tab's prop mutation

In `J:\code\semantic\Semantic-UI-React\src\modules\Tab\Tab.js` (to become `Tab.tsx`), line 57 mutates the `menu` prop directly:

```javascript
if (menu.tabular === true && menuPosition === 'right') {
  menu.tabular = 'right'
}
```

This mutates the default value object, which persists across renders. Fix by creating a copy:

```typescript
const renderMenu = () => {
  const menuProps = { ...menu }
  if (menuProps.tabular === true && menuPosition === 'right') {
    menuProps.tabular = 'right'
  }
  return Menu.create(menuProps, { ... })
}
```

### 8. Convert Tab.js to Tab.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Tab\Tab.js` to `Tab.tsx`:

- Define `TabProps` interface
- Define `TabPaneConfig` type for the `panes` prop items
- Type `useAutoControlledValue` for `activeIndex`
- Type the `handleItemClick` callback
- Type the `renderItems`, `renderMenu`, `renderVertical` functions

Convert `J:\code\semantic\Semantic-UI-React\src\modules\Tab\TabPane.js` to `TabPane.tsx`:
- Define `TabPaneProps` interface
- Type the `createShorthandFactory` static

### 9. Consolidate type definitions

Delete all `.d.ts` files and merge types into `.tsx` files:

Transition:
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Transition\Transition.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Transition\TransitionGroup.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Transition\index.d.ts`
- Rename `index.js` to `index.ts`

Sidebar:
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Sidebar\Sidebar.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Sidebar\SidebarPushable.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Sidebar\SidebarPusher.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Sidebar\index.d.ts`
- Rename `index.js` to `index.ts`

Sticky:
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Sticky\Sticky.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Sticky\index.d.ts`
- Rename `index.js` to `index.ts`

Tab:
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Tab\Tab.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Tab\TabPane.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Tab\index.d.ts`
- Rename `index.js` to `index.ts`

### 10. Update React 19 Context usage in TransitionGroup

The TransitionGroup does not currently use React Context explicitly, but if any `TransitionContext` exists in the codebase, it must be updated for React 19's `Context as Provider` pattern where `<Context>` can be used directly as a provider instead of `<Context.Provider>`. Verify and update if applicable.

### 11. Update all tests

- Transition tests need significant updates for the functional component conversion
- Verify animation state machine transitions work identically
- Test `onStart`, `onComplete`, `onShow`, `onHide` callback timing
- Test `mountOnShow`, `unmountOnHide`, `transitionOnMount` props
- Test TransitionGroup enter/exit animations
- Test Sidebar animation callbacks
- Test Sticky scroll positioning
- Test Tab active index controlled/uncontrolled modes

---

## Files Affected

| File | Action |
|------|--------|
| `src/modules/Transition/Transition.js` | RENAME to `.tsx`, MAJOR REWRITE (class to functional) |
| `src/modules/Transition/TransitionGroup.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Transition/utils/computeStatuses.js` | RENAME to `.ts`, MODIFY |
| `src/modules/Transition/utils/childMapping.js` | RENAME to `.ts`, MODIFY |
| `src/modules/Transition/utils/wrapChild.js` | RENAME to `.ts`, MODIFY |
| `src/modules/Sidebar/Sidebar.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Sidebar/SidebarPushable.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Sidebar/SidebarPusher.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Sticky/Sticky.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Tab/Tab.js` | RENAME to `.tsx`, MODIFY |
| `src/modules/Tab/TabPane.js` | RENAME to `.tsx`, MODIFY |
| Various `.d.ts` files (14 files) | DELETE |
| Various `index.js` files (4 files) | RENAME to `.ts` |

**Total: 15 files renamed/modified, 14 files deleted**

---

## Acceptance Criteria

- [ ] Transition class component is fully converted to a functional component
- [ ] Transition state machine produces identical state sequences for all `visible` transitions
- [ ] Transition `onStart`, `onComplete`, `onShow`, `onHide` fire at correct times
- [ ] Transition `mountOnShow` delays DOM insertion until first show
- [ ] Transition `unmountOnHide` removes element from DOM after hide animation
- [ ] Transition `transitionOnMount` plays animation on initial render
- [ ] Transition directional animations apply correct `in`/`out` classes
- [ ] TransitionGroup correctly animates enter/exit of dynamic children
- [ ] Sidebar animation start/end callbacks fire correctly
- [ ] Sidebar document click handler works (closing sidebar on outside click)
- [ ] `@fluentui/react-component-event-listener` import is removed from Sidebar
- [ ] Sticky correctly sticks to top/bottom of viewport
- [ ] Sticky respects `context` boundaries
- [ ] Sticky `pushing` mode works for oversized content
- [ ] Sticky scroll and resize listeners are properly cleaned up
- [ ] Tab controlled and uncontrolled `activeIndex` works
- [ ] Tab vertical layout with Grid works
- [ ] Tab prop mutation bug is fixed (menu.tabular no longer mutated)
- [ ] All components compile as TypeScript without errors
- [ ] All existing tests pass
- [ ] No `getDerivedStateFromProps` usage remains

---

## Rollback Strategy

1. All changes tracked in git. To rollback: `git checkout HEAD -- src/modules/Transition/ src/modules/Sidebar/ src/modules/Sticky/ src/modules/Tab/`
2. Transition rollback is the highest risk. The class-to-functional conversion changes timing behavior. If animation timing issues are discovered post-merge, revert only `Transition.tsx` to the class component `.js` version.
3. Sidebar's `@fluentui/react-component-event-listener` removal can be independently reverted by restoring the import and JSX usage.
4. Tab's prop mutation fix is a bug fix and should not be rolled back.

---

## Notes for AI Agents

1. **The Transition conversion is the most delicate task in the entire migration.** The `getDerivedStateFromProps` + `componentDidUpdate` pattern creates a synchronous state derivation followed by an asynchronous side effect (setTimeout for animation duration). In a functional component, `getDerivedStateFromProps` is typically replaced by computing derived state during render (not in an effect). The key insight is that `computeStatuses` is a pure function of `(visible, currentStatus, options)` and can be called during render to compute the next state.

2. **Do NOT use `useEffect` to replace `getDerivedStateFromProps`.** Effects run after render and paint, which would cause a visible flash. Instead, compute the derived state synchronously during render using `useMemo` or inline computation. The `useEffect` should only handle side effects (setTimeout, callback invocation).

3. **The Transition `handleStart` method** sets a `setTimeout` that calls `setState({ status: nextStatus })`. In the functional component, this becomes `setTimeout(() => setState(prev => ({ ...prev, status: nextStatus })), durationValue)`. The functional updater form is essential to avoid stale state in the timeout callback.

4. **The `computeStatuses` function** (`utils/computeStatuses.js`) is a pure state machine. It returns `{}` (empty object) when no state change is needed. In the functional component, check `Object.keys(result).length > 0` before applying the derived state to avoid unnecessary re-renders.

5. **Transition's `cloneElement` usage** (line 166) injects `className` and `style` into the single child element. This is a core part of the API -- consumers pass a single element child and Transition adds animation classes to it. This pattern is flagged in Phase 18 for potential refactoring, but for this phase, preserve it as-is and add TypeScript types. The child must be typed as `React.ReactElement`.

6. **Sidebar's `@fluentui/react-component-event-listener` removal** is straightforward. The `<EventListener>` component is a declarative wrapper around `addEventListener`. Replace with a `useEffect` that adds/removes the listener. The `documentRef` import can be replaced with direct `document` reference.

7. **Sidebar's `useAnimationTick` hook** is a clever but non-obvious pattern. It increments a tick counter when `visible` changes, which triggers CSS animation classes. The `resetAnimationTick` callback sets the counter back to 0 after animation completes. Type this hook carefully: `function useAnimationTick(visible: boolean): [number, () => void]`.

8. **Sticky's 7 refs** are split into two categories:
   - Element refs (`stickyRef`, `triggerRef`) -- `React.RefObject<HTMLDivElement>`
   - Value refs (`triggerRect`, `contextRect`, `stickyRect`, `frameId`, `ticking`) -- `React.MutableRefObject<T>`
   Value refs store DOMRect snapshots for performance -- reading `getBoundingClientRect()` on every frame would be wasteful. The rects are snapped in `assignRects()` and then read by the various `did*` helper functions.

9. **Tab's prop mutation** at line 57 is a real bug. The `menu` prop defaults to `{ attached: true, tabular: true }`, which is a module-level constant object. Mutating it affects all subsequent renders. Always create a shallow copy before mutation.

10. **Execution order:** Start with Tab (simplest, already functional). Then Sticky (functional, needs typing only). Then Sidebar (functional, needs event listener refactor). Then Transition utilities (pure functions, easy to type). Then TransitionGroup (functional). Finally, Transition itself (class-to-functional, highest complexity).
