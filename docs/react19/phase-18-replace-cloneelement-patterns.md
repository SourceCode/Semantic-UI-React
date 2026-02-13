# Phase 18: Replace React.cloneElement Patterns

| Field           | Value                                      |
|-----------------|--------------------------------------------|
| **Phase ID**    | 18                                         |
| **Stage**       | 3 - Core Library Modernization             |
| **Dependencies**| Phase 15 (Ref Handling Modernization), Phase 16 (Utility Migration) |
| **Complexity**  | High                                       |
| **Scope**       | 8 source files across addons, modules, elements, and lib layers |

---

## Objective

Replace all uses of `React.cloneElement` with idiomatic React 19 patterns (render props, Context, direct prop passing, composition). `React.cloneElement` is not removed in React 19.x but is explicitly discouraged in the React documentation as of React 19 because it obscures data flow, creates fragile implicit contracts between parent and child, and interferes with React's ability to optimize rendering. Every replacement must preserve the existing external API so that consumers experience zero breaking changes.

---

## Background

The Semantic-UI-React codebase currently contains 12 call sites for `React.cloneElement` spread across 8 files. These fall into four distinct usage categories:

1. **Portal trigger pattern** -- Cloning a user-supplied trigger element to attach event handlers (onClick, onFocus, onBlur, onMouseEnter, onMouseLeave) and a ref. Used in `Portal.js` and `useTrigger.js`.

2. **Portal element ref injection** -- Cloning a React element to merge a ref onto it so the portal can track its DOM node. Used in `usePortalElement.js` and `PortalInner.js` (via `usePortalElement`).

3. **Transition child decoration** -- Cloning the single child of `<Transition>` to inject computed `className` and `style` props for animation. Used in `Transition.js` (render method) and `TransitionGroup.js` (setting `visible: false` on exiting children).

4. **Shorthand factory element passthrough** -- When a user passes a React element as a shorthand value (e.g., `<Icon name="user" />` as the `icon` prop), `createShorthand` in `factories.js` clones it to merge default, user, and override props. Also used in `Input.js` to inject `htmlInputProps` into a child `<input>` element, and in `Dropdown.js` to merge className into a child menu element.

Each category requires a different replacement strategy. The high complexity rating reflects the fact that the Portal and Transition patterns are deeply integrated with event handling, ref management, and animation lifecycle logic.

### Current cloneElement call sites

| File | Line(s) | Purpose |
|------|---------|---------|
| `src/addons/Portal/Portal.js` | 302-309 | Clone trigger to attach 5 event handlers + ref |
| `src/addons/Portal/usePortalElement.js` | 17, 21 | Clone element to attach merged ref |
| `src/addons/Portal/utils/useTrigger.js` | 19 | Clone trigger to attach merged ref |
| `src/modules/Transition/Transition.js` | 166-173 | Clone child to inject className + style |
| `src/modules/Transition/TransitionGroup.js` | 83 | Clone prev child to set `visible: false` |
| `src/elements/Input/Input.js` | 120-128 | Clone `<input>` child to inject htmlInputProps + ref |
| `src/modules/Dropdown/Dropdown.js` | 1056 | Clone single menu child to merge className + aria |
| `src/lib/factories.js` | 118 | Clone React element shorthand to merge props |

---

## Detailed Tasks

### Category A: Portal Trigger Pattern (3 files)

#### Task 18.1 -- Replace cloneElement in `useTrigger.js`

**File:** `src/addons/Portal/utils/useTrigger.js`

The current implementation clones the trigger element solely to attach a merged ref:

```js
return [ref, React.cloneElement(trigger, { ref })]
```

**Replacement strategy:** In React 19, refs are regular props. The merged ref can be passed directly when the trigger is rendered. Convert `useTrigger` to return the raw trigger and the computed ref separately, and let the call site handle rendering.

1. Modify `useTrigger` to return `[ref, trigger]` without cloning -- the ref will be applied at the render site in `Portal.js`.
2. Update `validateTrigger.js` if it makes assumptions about the cloned element structure.
3. Update all tests in the Portal test suite that assert on the trigger ref being applied.

#### Task 18.2 -- Replace cloneElement in `Portal.js`

**File:** `src/addons/Portal/Portal.js`

The current implementation (lines 301-309) clones the trigger element to attach five event handlers and a ref:

```js
{trigger &&
  React.cloneElement(trigger, {
    onBlur: handleTriggerBlur,
    onClick: handleTriggerClick,
    onFocus: handleTriggerFocus,
    onMouseLeave: handleTriggerMouseLeave,
    onMouseEnter: handleTriggerMouseEnter,
    ref: triggerRef,
  })}
```

**Replacement strategy:** Wrap the trigger in a transparent `<span>` or use a render-prop pattern.

Option A (Wrapper element -- simpler, minimal API change):
```jsx
{trigger && (
  <span
    style={{ display: 'contents' }}
    onBlur={handleTriggerBlur}
    onClick={handleTriggerClick}
    onFocus={handleTriggerFocus}
    onMouseLeave={handleTriggerMouseLeave}
    onMouseEnter={handleTriggerMouseEnter}
    ref={triggerRef}
  >
    {trigger}
  </span>
)}
```

Note: `display: contents` removes the wrapper from the visual layout. However, it does affect event delegation. If `display: contents` causes issues with `doesNodeContainClick`, use a zero-margin, zero-padding `<span style={{ display: 'inline' }}>` instead.

Option B (Render prop -- more idiomatic, minor API change):
```jsx
// Consumer:
<Portal trigger={(props) => <Button {...props}>Open</Button>}>
  ...
</Portal>
```

**Recommended:** Option A for backward compatibility with the existing `trigger` prop accepting a React node. Document Option B as the preferred pattern going forward and deprecate the element-based trigger prop in a future major version.

1. Remove the `React.cloneElement(trigger, {...})` call.
2. Wrap the trigger rendering in a container element with the event handlers and ref.
3. Ensure `doesNodeContainClick` still correctly identifies clicks inside the trigger.
4. Update the `useTrigger` hook call to align with Task 18.1 changes.
5. Run the full Portal test suite and fix any failures related to event handler attachment.

#### Task 18.3 -- Replace cloneElement in `usePortalElement.js`

**File:** `src/addons/Portal/usePortalElement.js`

Two `cloneElement` calls exist (lines 17 and 21), both injecting a merged ref:

```js
if (ReactIs.isForwardRef(node)) {
  return React.cloneElement(node, { ref })
}
if (typeof node.type === 'string') {
  return React.cloneElement(node, { ref })
}
```

**Replacement strategy:** In React 19, `ref` is a regular prop on all elements. The `ReactIs.isForwardRef` check becomes unnecessary. The function can be simplified:

1. If the node is a valid React element (string type or component), render it inside a wrapper `<div>` with the ref, OR use the new React 19 ref-as-prop behavior to pass the ref directly when the element is created by the consumer.
2. Since `usePortalElement` is called from `PortalInner` which passes `props.children` (already a rendered element), the safest approach is to always use the wrapper `<div data-suir-portal="true" ref={ref}>` fallback. This eliminates the cloneElement calls entirely at the cost of always wrapping, which was already the fallback behavior.
3. Alternatively, if unwrapping is important for layout, keep the conditional but use `React.createElement(node.type, { ...node.props, ref })` instead of `cloneElement`.
4. Remove the `react-is` import from this file if no longer needed.
5. Update tests that assert on the portal element structure.

### Category B: Transition Child Decoration (2 files)

#### Task 18.4 -- Replace cloneElement in `Transition.js`

**File:** `src/modules/Transition/Transition.js`

The render method (line 166-173) clones the single child to inject `className` and `style`:

```js
return React.cloneElement(children, {
  className: this.computeClasses(),
  style: this.computeStyle(),
  ...(process.env.NODE_ENV !== 'production' && {
    'data-test-status': status,
    'data-test-next-status': nextStatus,
  }),
})
```

**Replacement strategy:** Use a render-prop or Context pattern.

Option A (Render prop):
```jsx
<Transition visible={visible} animation="fade">
  {(transitionProps) => <div {...transitionProps}>Content</div>}
</Transition>
```

Option B (Context):
```jsx
const TransitionContext = React.createContext(null)

// Inside Transition render:
return (
  <TransitionContext.Provider value={{ className, style, status }}>
    {children}
  </TransitionContext.Provider>
)

// Consumer uses useTransition() hook
```

**Recommended:** Support both patterns. Accept children as a function (render prop) as the primary path. For backward compatibility, if children is a React element (not a function), use the Context approach and provide a `useTransition()` hook that consumers can use to read the transition state.

**Important:** `Transition` is currently a class component (the only class component identified in this scope). It uses `getDerivedStateFromProps`, `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. Converting it to a function component is a prerequisite (or co-requisite) to this task. This may need to be coordinated with Phase 17 (Class Component Migration).

1. Convert `Transition` from a class component to a function component with hooks (`useState`, `useEffect`, `useRef`).
2. Implement the render-prop pattern: if `typeof children === 'function'`, call `children({ className, style, ...testProps })`.
3. Implement the Context fallback: if `children` is a React element, wrap it in a `TransitionContext.Provider`.
4. Create a `useTransition()` hook that reads from `TransitionContext`.
5. Update `wrapChild.js` in `src/modules/Transition/utils/wrapChild.js` to pass children as a render prop to `<Transition>`.
6. Preserve all animation lifecycle callbacks (`onStart`, `onComplete`, `onShow`, `onHide`).
7. Maintain the static `Transition.Group = TransitionGroup` assignment.
8. Update all Transition tests.

#### Task 18.5 -- Replace cloneElement in `TransitionGroup.js`

**File:** `src/modules/Transition/TransitionGroup.js`

Line 83 clones a previous child to set `visible: false` for the exit animation:

```js
wrappedChildren[key] = React.cloneElement(prevChild, { visible: false })
```

**Replacement strategy:** Since `prevChild` is a `<Transition>` element (created by `wrapChild`), and we control the `Transition` component, we can replace this with a new call to `wrapChild` with `visible: false` instead of cloning:

```js
wrappedChildren[key] = wrapChild(child, handleChildHide, {
  animation,
  duration,
  directional,
  transitionOnMount: prevChild.props.transitionOnMount,
  visible: false,
})
```

1. Replace the `React.cloneElement(prevChild, { visible: false })` call with a fresh `wrapChild` call.
2. Ensure that the `key` is preserved correctly.
3. Verify the exit animation still triggers correctly by running TransitionGroup tests.
4. If `wrapChild` changes in Task 18.4, coordinate the API.

### Category C: Input Child Decoration (1 file)

#### Task 18.6 -- Replace cloneElement in `Input.js`

**File:** `src/elements/Input/Input.js`

Lines 118-131 clone `<input>` children to inject `htmlInputProps` and merge refs:

```js
const childElements = _.map(React.Children.toArray(children), (child) => {
  if (child.type === 'input') {
    return React.cloneElement(child, {
      ...htmlInputProps,
      ...child.props,
      ref: (c) => {
        setRef(child.ref, c)
        setRef(ref, c)
      },
    })
  }
  return child
})
```

**Replacement strategy:** Use a Context or render-prop pattern to pass input props down.

Option A (Context):
```jsx
const InputPropsContext = React.createContext(null)

// In Input component:
<InputPropsContext.Provider value={htmlInputProps}>
  {children}
</InputPropsContext.Provider>

// New hook:
export function useInputProps() {
  return React.useContext(InputPropsContext)
}
```

Option B (Preserve current pattern using wrapper):
Since this code specifically targets `<input>` elements (native HTML, not components), and users pass `<input>` as a child, a wrapper-based approach is fragile. The Context approach is better.

Option C (Keep cloneElement for native elements only):
React 19 still supports `cloneElement`. For this specific case where we are only cloning native `<input>` elements (not components), the pattern is less problematic. Consider keeping it with a code comment explaining the rationale, and mark it for future migration when a children-as-function API is adopted.

**Recommended:** Option C for now (keep with documentation), then Option A for v4. The `<input>` child pattern is niche and rarely used by consumers (the shorthand API via the `input` prop is far more common).

1. Add a code comment explaining why cloneElement is retained for native `<input>` elements.
2. Alternatively, implement Context pattern with `useInputProps()` hook.
3. Update Input tests to cover both the shorthand and children patterns.

### Category D: Dropdown Menu Child (1 file)

#### Task 18.7 -- Replace cloneElement in `Dropdown.js`

**File:** `src/modules/Dropdown/Dropdown.js`

Line 1056 in the `renderMenu` method clones the single menu child to merge className and aria options:

```js
const menuChild = Children.only(children)
const className = cx(direction, getKeyOnly(open, 'visible'), menuChild.props.className)
return cloneElement(menuChild, { className, ...ariaOptions })
```

**Replacement strategy:** Since Dropdown is a class component (`DropdownInner extends Component`), and this code handles the case where consumers pass a `<DropdownMenu>` as children, the replacement should use a Context pattern:

1. Create a `DropdownMenuContext` that provides `{ direction, open, ariaOptions }`.
2. In `DropdownMenu`, consume the context and merge the className and aria props internally.
3. Remove the `cloneElement` call in `renderMenu`.
4. Ensure backward compatibility: if consumers pass a custom menu child that is not `DropdownMenu`, fall back to the wrapper approach.
5. Note: Dropdown will be migrated from a class component in a later phase. This task should be structured so the Context pattern works with both the class component and the eventual function component.

### Category E: Shorthand Factory (1 file)

#### Task 18.8 -- Replace cloneElement in `factories.js`

**File:** `src/lib/factories.js`

Line 118 clones a React element shorthand value to merge computed props:

```js
if (valIsReactElement) {
  return React.cloneElement(val, props)
}
```

This is the most impactful call site because `createShorthand` (and thus `createShorthandFactory`) is used across the entire component library. Every component that has a `.create()` static method goes through this code path when a consumer passes a React element as a shorthand value.

**Replacement strategy:** This is the hardest call site to replace because the shorthand API is a core library concept. Options:

Option A (Keep cloneElement with explicit documentation):
This is a legitimate use case where the library needs to merge default props onto a user-supplied element. React 19 still supports this. Add a code comment and a lint suppression.

Option B (Use render prop pattern in shorthand):
Already partially implemented -- line 121-123 handles `children` as a function:
```js
if (typeof props.children === 'function') {
  return props.children(Component, { ...props, children: undefined })
}
```

Option C (Create new element instead of cloning):
```js
if (valIsReactElement) {
  return React.createElement(val.type, { ...val.props, ...props })
}
```
This loses the element's `key` and `ref` unless explicitly transferred. In React 19, ref is a regular prop, so it would be preserved in `val.props`. The `key` needs special handling.

**Recommended:** Option A for now. The shorthand factory's element-cloning behavior is foundational and changing it risks breaking the entire library. Mark it with a detailed comment and plan for a v4 redesign of the shorthand system.

1. Add a detailed comment explaining why cloneElement is retained in this specific location.
2. Consider adding a deprecation warning when a React element is passed as a shorthand value, encouraging the props-object form instead.
3. Ensure that the function-as-shorthand deprecation warning (already present, line 132-144) is emitted correctly.
4. Write a test that explicitly covers the React element shorthand path.

---

## Files Affected

| File | Action |
|------|--------|
| `src/addons/Portal/Portal.js` | Modify -- replace cloneElement with wrapper element |
| `src/addons/Portal/usePortalElement.js` | Modify -- simplify or eliminate cloneElement calls |
| `src/addons/Portal/utils/useTrigger.js` | Modify -- remove cloneElement, return raw trigger |
| `src/addons/Portal/utils/validateTrigger.js` | Review -- may need updates |
| `src/addons/Portal/PortalInner.js` | Review -- uses usePortalElement |
| `src/modules/Transition/Transition.js` | Major rewrite -- class to function component, render prop pattern |
| `src/modules/Transition/TransitionGroup.js` | Modify -- replace cloneElement with wrapChild call |
| `src/modules/Transition/utils/wrapChild.js` | Modify -- update for new Transition API |
| `src/modules/Transition/utils/computeStatuses.js` | Review -- may need adjustments |
| `src/modules/Transition/utils/childMapping.js` | Review -- may need adjustments |
| `src/elements/Input/Input.js` | Modify -- add Context or document retained cloneElement |
| `src/modules/Dropdown/Dropdown.js` | Modify -- replace cloneElement with Context |
| `src/lib/factories.js` | Modify -- document retained cloneElement, add deprecation path |

---

## Acceptance Criteria

- [ ] `React.cloneElement` is removed from `Portal.js` -- trigger rendering uses a wrapper element or render prop
- [ ] `React.cloneElement` is removed from `useTrigger.js` -- ref is passed without cloning
- [ ] `React.cloneElement` is removed from `usePortalElement.js` -- ref injection uses React 19 ref-as-prop or wrapper
- [ ] `React.cloneElement` is removed from `Transition.js` -- render prop or Context pattern is used
- [ ] `React.cloneElement` is removed from `TransitionGroup.js` -- fresh element creation replaces cloning
- [ ] `React.cloneElement` in `Input.js` is either removed (Context pattern) or documented with rationale for retention
- [ ] `React.cloneElement` in `Dropdown.js` is removed -- Context pattern for menu child
- [ ] `React.cloneElement` in `factories.js` is documented with rationale for retention and has a deprecation path
- [ ] All existing Portal tests pass (trigger click, focus, blur, mouse enter/leave, document click to close)
- [ ] All existing Transition tests pass (enter, exit, mount/unmount, TransitionGroup add/remove children)
- [ ] All existing Input tests pass (children mode, shorthand mode)
- [ ] All existing Dropdown tests pass (children menu, options menu, search, multiple)
- [ ] No new runtime warnings from React 19 related to cloneElement usage
- [ ] External API of all affected components remains unchanged -- no breaking changes for consumers
- [ ] Bundle size does not increase by more than 1KB gzipped

---

## Rollback Strategy

Each category (A through E) can be rolled back independently since they operate on separate component trees:

1. **Portal (Category A):** Revert `Portal.js`, `useTrigger.js`, and `usePortalElement.js` to their cloneElement implementations. These three files are tightly coupled and must be reverted together.
2. **Transition (Category B):** Revert `Transition.js`, `TransitionGroup.js`, and `wrapChild.js`. If `Transition.js` was converted from class to function, the class version must be restored.
3. **Input (Category C):** Revert `Input.js`. This is a single-file change.
4. **Dropdown (Category D):** Revert `Dropdown.js` and remove any `DropdownMenuContext` additions. Single-component scope.
5. **Factories (Category E):** Revert `factories.js`. Since the recommendation is to keep cloneElement here with documentation, rollback means removing the new comments/deprecation warnings.

All rollbacks should be verified by running the full test suite for the affected component.

---

## Notes for AI Agents

1. **Transition.js is a class component.** It is the only class component in this phase scope. It uses `getDerivedStateFromProps`, instance methods with arrow functions (`handleStart`, `updateStatus`, `computeClasses`, `computeStyle`), `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`, and `Transition.defaultProps`. Converting it to a function component requires replacing each lifecycle method with the appropriate hook. The state machine logic in `computeStatuses.js` should be preserved as-is and called from a `useMemo` or within a state setter function.

2. **Dropdown.js uses `ModernAutoControlledComponent`.** The `DropdownInner` class extends `ModernAutoControlledComponent`, which is a custom base class in this library. Do not attempt to convert Dropdown to a function component in this phase -- that is a separate, much larger task. Only replace the single `cloneElement` call in `renderMenu`.

3. **The `factories.js` cloneElement is used by every component with a `.create()` method.** This includes Icon, Image, Label, Button, Flag, Step, ListItem, HeaderSubheader, HeaderContent, LabelDetail, StepContent, StepTitle, StepDescription, DropdownItem, DropdownHeader, DropdownText, DropdownSearchInput, and more. Any change here has library-wide impact. Test exhaustively.

4. **Event handler merging in Portal.** The current cloneElement approach in `Portal.js` merges event handlers such that the Portal's handlers override the trigger's handlers. The existing code also explicitly calls the original trigger's handlers via `_.invoke(trigger, 'props.onClick', e, ...rest)`. When replacing with a wrapper element, ensure that event bubbling correctly handles both the wrapper's handlers and the trigger element's own handlers. The wrapper approach may cause double-firing if not handled carefully.

5. **`usePortalElement.js` uses `react-is` for `isForwardRef` checks.** In React 19, `forwardRef` is no longer needed -- all function components accept `ref` as a prop. The `ReactIs.isForwardRef` check is therefore less meaningful. Consider removing the `react-is` dependency from this file entirely.

6. **`TransitionGroup.js` stores previous children in a ref.** The `previousChildren.current` ref holds wrapped `<Transition>` elements from the previous render. The cloneElement on line 83 modifies one of these stored elements. When replacing with a fresh `wrapChild` call, ensure the `child` variable at that point holds the correct underlying child element (not the `<Transition>` wrapper), and that the `key` is transferred.

7. **Order of operations matters.** Complete Tasks 18.1-18.3 (Portal) together. Complete Tasks 18.4-18.5 (Transition) together. Tasks 18.6, 18.7, and 18.8 can be done independently.

8. **The `display: contents` CSS property** is supported in all modern browsers but has known accessibility issues with some screen readers when applied to elements with semantic roles. Since the Portal trigger wrapper is a `<span>` with no semantic role, this should be safe. Test with screen readers if possible.

9. **Do not remove `React.Children.toArray` from `Input.js`.** Even if cloneElement is removed, the `React.Children` API is still used to iterate over children. `React.Children` is not deprecated in React 19.
