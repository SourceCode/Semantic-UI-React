# Phase 15: Remove forwardRef Wrappers (ref as Regular Prop)

| Field            | Value                                      |
|------------------|--------------------------------------------|
| **Phase ID**     | PHASE-15                                   |
| **Title**        | Remove forwardRef Wrappers (ref as Regular Prop) |
| **Stage**        | 3 - Core Library Modernization             |
| **Dependencies** | Phase 14 (Convert Source to TypeScript)     |
| **Complexity**   | High                                       |
| **Scope**        | 158 components using `React.forwardRef`, `useMergedRefs` hook, `generic.d.ts` / `generic.ts` type definitions, test helpers |

---

## Objective

Remove the `React.forwardRef()` wrapper from all 158 components in the library. In React 19, `ref` is a regular prop on function components -- the `forwardRef` API is deprecated and unnecessary. Each component must be unwrapped from `forwardRef`, its function signature changed from `(props, ref)` to destructuring `ref` from props, and all TypeScript types updated to reflect that `ref` is part of the props interface rather than passed through `React.RefAttributes`.

---

## Background

### React 19 Change: ref as a Regular Prop

In React 18 and earlier, passing a `ref` to a function component required wrapping it with `React.forwardRef()`:

```javascript
// React 18 pattern
const Button = React.forwardRef(function (props, ref) {
  return <button ref={ref} {...props} />
})
```

In React 19, `ref` is available as a regular prop on any function component:

```javascript
// React 19 pattern
function Button({ ref, ...props }) {
  return <button ref={ref} {...props} />
}
```

`React.forwardRef` still works in React 19 but is deprecated and will be removed in a future version.

### Current State in Semantic UI React

All 158 component files follow this pattern:

```javascript
const ComponentName = React.forwardRef(function (props, ref) {
  // ... component logic
})
ComponentName.displayName = 'ComponentName'
```

The `useMergedRefs` hook is used in many components to combine the forwarded ref with internal refs:

```javascript
const ComponentName = React.forwardRef(function (props, ref) {
  const elementRef = useMergedRefs(ref, React.useRef())
  return <div ref={elementRef}>...</div>
})
```

### Type System Impact

The current type system in `src/generic.d.ts` (or `src/generic.ts` after Phase 14) defines:

```typescript
export type ForwardRefComponent<P, T> = React.ForwardRefExoticComponent<P & React.RefAttributes<T>>
```

This type is used in 313 locations across the `.d.ts` files. It must be replaced with a simpler function component type that includes `ref` in its props.

---

## Detailed Tasks

### Task 1: Update the `ForwardRefComponent` type definition

**File:** `src/generic.ts` (renamed from `src/generic.d.ts` in Phase 14)

1.1. Replace the `ForwardRefComponent` type with a new type that models `ref` as a regular prop:

```typescript
// BEFORE
export type ForwardRefComponent<P, T> = React.ForwardRefExoticComponent<P & React.RefAttributes<T>>

// AFTER
export type ForwardRefComponent<P, T> = React.FC<P & { ref?: React.Ref<T> }> & {
  displayName?: string
}
```

1.2. Alternatively, create a new type and deprecate the old one for a transition period:

```typescript
/** @deprecated Use SemanticComponent instead */
export type ForwardRefComponent<P, T> = SemanticComponent<P & { ref?: React.Ref<T> }>

export type SemanticComponent<P> = React.FC<P> & {
  displayName?: string
  handledProps?: string[]
  create?: (...args: any[]) => React.ReactElement | null
}
```

1.3. The type must support:
- Static properties like `displayName`, `handledProps`, and shorthand factory methods (e.g., `Button.Group`)
- Sub-components (e.g., `Form.Field`, `Dropdown.Item`)
- The `ref` prop with proper typing for the underlying DOM element

---

### Task 2: Remove `React.forwardRef` from all 158 components

For each of the 158 components, apply this transformation:

2.1. **Simple component pattern** (the majority -- approximately 140 components):

```typescript
// BEFORE
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function (props, ref) {
  const { active, animated, as, children, className, ...rest } = props
  const ElementType = getComponentType(props, { defaultAs: 'button' })
  return <ElementType {...rest} className={classes} ref={ref} />
})

Button.displayName = 'Button'

// AFTER
function Button({ ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { active, animated, as, children, className, ...rest } = props
  const ElementType = getComponentType(props, { defaultAs: 'button' })
  return <ElementType {...rest} className={classes} ref={ref} />
}

Button.displayName = 'Button'
```

Or using the single-destructure approach:

```typescript
// AFTER (alternative -- single destructure)
function Button({
  ref,
  active,
  animated,
  as,
  children,
  className,
  ...rest
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const ElementType = getComponentType({ active, animated, as, children, className, ...rest }, { defaultAs: 'button' })
  return <ElementType {...rest} className={classes} ref={ref} />
}
```

2.2. **Components using `useMergedRefs`** (approximately 15-20 components):

```typescript
// BEFORE
const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function (props, ref) {
  const { as, onChange, rows, value, ...rest } = props
  const elementRef = useMergedRefs(ref, React.useRef<HTMLTextAreaElement>(null))
  return <ElementType {...rest} ref={elementRef} />
})

// AFTER
function TextArea({ ref, ...props }: TextAreaProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
  const { as, onChange, rows, value, ...rest } = props
  const elementRef = useMergedRefs(ref, React.useRef<HTMLTextAreaElement>(null))
  return <ElementType {...rest} ref={elementRef} />
}
```

The `useMergedRefs` call remains the same -- only the source of `ref` changes (from second parameter to destructured prop).

2.3. **Components with sub-components** (e.g., `Form`, `Dropdown`, `Card`):

```typescript
// BEFORE
const Form = React.forwardRef<HTMLFormElement, FormProps>(function (props, ref) {
  // ...
})
Form.displayName = 'Form'
Form.Field = FormField
Form.Button = FormButton

// AFTER
function Form({ ref, ...props }: FormProps & { ref?: React.Ref<HTMLFormElement> }) {
  // ...
}
Form.displayName = 'Form'
Form.Field = FormField
Form.Button = FormButton
```

Sub-component assignments work the same way since the function object supports arbitrary properties.

---

### Task 3: Update component props interfaces to include `ref`

3.1. For each component, add `ref` to the props interface (if using inline types after Phase 14):

```typescript
export interface ButtonProps extends StrictButtonProps {
  [key: string]: any
}

export interface StrictButtonProps {
  /** A ref to the underlying DOM element. */
  ref?: React.Ref<HTMLButtonElement>
  /** An element type to render as. */
  as?: React.ElementType
  // ... other props
}
```

3.2. Alternatively, use an intersection type at the function signature level and keep `ref` out of the domain-specific props interface:

```typescript
// Props interface does NOT include ref (cleaner separation)
export interface ButtonProps {
  as?: React.ElementType
  active?: boolean
  // ...
}

// ref is added at the function level
function Button({ ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  // ...
}
```

3.3. Choose one approach and apply consistently across all 158 components.

---

### Task 4: Update `useMergedRefs` hook

**File:** `src/lib/hooks/useMergedRefs.ts`

4.1. The hook itself does not need to change for the `forwardRef` removal. However, React 19 introduces ref cleanup functions. Update `setRef` to handle cleanup return values:

```typescript
// BEFORE
export function setRef<T>(ref: React.Ref<T> | null | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value
  }
}

// AFTER (React 19 -- handle cleanup functions)
export function setRef<T>(ref: React.Ref<T> | null | undefined, value: T | null): (() => void) | void {
  if (typeof ref === 'function') {
    const cleanup = ref(value)
    // React 19: ref callbacks can return a cleanup function
    return typeof cleanup === 'function' ? cleanup : undefined
  } else if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value
  }
}
```

4.2. Update `useMergedRefs` to collect and call cleanup functions:

```typescript
export default function useMergedRefs<T>(
  refA: React.Ref<T> | null | undefined,
  refB: React.Ref<T> | null | undefined
): React.RefCallback<T> & { current: T | null } {
  const mergedCallback = React.useCallback(
    (value: T | null) => {
      mergedCallback.current = value
      const cleanupA = setRef(refA, value)
      const cleanupB = setRef(refB, value)

      // Return combined cleanup (React 19 ref cleanup support)
      return () => {
        if (cleanupA) cleanupA()
        if (cleanupB) cleanupB()
      }
    },
    [refA, refB],
  ) as React.RefCallback<T> & { current: T | null }

  mergedCallback.current = null
  return mergedCallback
}
```

---

### Task 5: Update `handledProps` arrays to include `ref`

5.1. After `forwardRef` removal, `ref` becomes a regular prop that flows through the component's props. It should be added to `handledProps` to prevent it from being passed through by `getUnhandledProps`:

```typescript
Button.handledProps = [
  'active',
  'animated',
  // ...
  'ref',  // NEW: prevent ref from being spread onto DOM elements as an attribute
  // ...
]
```

5.2. Alternatively, update `getUnhandledProps` to always filter out `ref`:

```typescript
const getUnhandledProps = (Component: { handledProps?: string[] }, props: Record<string, any>) => {
  const { handledProps = [] } = Component
  return Object.keys(props).reduce<Record<string, any>>((acc, prop) => {
    if (prop === 'childKey' || prop === 'ref') return acc  // Always filter ref
    if (handledProps.indexOf(prop) === -1) acc[prop] = props[prop]
    return acc
  }, {})
}
```

Option (b) is preferred because it avoids updating 158 `handledProps` arrays.

---

### Task 6: Update test utilities and helpers

**File:** `test/utils/getComponentName.js` (or `.ts` after Phase 14)

6.1. The `ForwardRef` detection path is no longer the primary path. Update the function:

```typescript
export default function getComponentName(Component: React.ComponentType | any): string {
  // Direct displayName (post-forwardRef removal)
  if (Component.displayName) {
    return Component.displayName
  }

  // Function name
  if (Component.name) {
    return Component.name
  }

  // Legacy: Memo wrapping (still used by some components)
  if (Component.$$typeof === ReactIs.Memo) {
    return getComponentName(Component.type)
  }

  // Legacy: ForwardRef (during transition period)
  if (Component.$$typeof === ReactIs.ForwardRef) {
    return Component.displayName || 'Unknown'
  }

  return Component.prototype?.constructor?.name || 'Unknown'
}
```

6.2. **File:** `test/specs/commonTests/forwardsRef.js`

This common test validates that components forward refs correctly. After `forwardRef` removal, the test still validates the same behavior (that a ref prop reaches the DOM element), but the assertion about `ReactIs.isForwardRef()` must be removed:

```typescript
// BEFORE
it('is a forwardRef', () => {
  expect(ReactIs.isForwardRef(<Component />)).to.equal(true)
})

// AFTER
it('forwards ref to the root element', () => {
  const ref = React.createRef<HTMLElement>()
  render(<Component ref={ref} />)
  expect(ref.current).toBeInstanceOf(HTMLElement)
})
```

---

### Task 7: Remove `ForwardRefExoticComponent` references from types

7.1. Search for all remaining `ForwardRefExoticComponent` references:

```bash
grep -rn "ForwardRefExoticComponent" src/ --include="*.ts" --include="*.tsx"
```

7.2. Replace with the updated `ForwardRefComponent` type (or `SemanticComponent` if renamed in Task 1).

7.3. Remove any `React.RefAttributes<T>` intersections that were used to add `ref` -- since `ref` is now in the props, `RefAttributes` is redundant.

---

### Task 8: Verify ref forwarding works correctly

8.1. Write or update integration tests that verify ref forwarding for representative components:

```typescript
import { render } from '@testing-library/react'
import { Button, Dropdown, Input, Modal, TextArea } from 'semantic-ui-react'

describe('ref forwarding after forwardRef removal', () => {
  it('Button forwards ref to button element', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Click</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('Input forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('TextArea forwards ref to textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<TextArea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('ref callback receives the DOM node', () => {
    let node: HTMLButtonElement | null = null
    render(<Button ref={(el) => { node = el }}>Click</Button>)
    expect(node).toBeInstanceOf(HTMLButtonElement)
  })

  it('ref cleanup function is called on unmount (React 19)', () => {
    const cleanup = vi.fn()
    const refCallback = (el: HTMLButtonElement | null) => {
      if (el) return cleanup
    }
    const { unmount } = render(<Button ref={refCallback}>Click</Button>)
    unmount()
    expect(cleanup).toHaveBeenCalled()
  })
})
```

---

## Files Affected

### Source Files (158 component files)

Every file that currently uses `React.forwardRef`. Key examples:

| Directory | Count | Example Files |
|-----------|-------|---------------|
| `src/addons/` | ~10 | `Confirm.tsx`, `Pagination.tsx`, `PaginationItem.tsx`, `PortalInner.tsx`, `Radio.tsx`, `Select.tsx`, `TextArea.tsx`, `TransitionablePortal.tsx` |
| `src/collections/` | ~25 | `Breadcrumb.tsx`, `Form.tsx`, `Grid.tsx`, `Menu.tsx`, `Message.tsx`, `Table.tsx` and their sub-components |
| `src/elements/` | ~35 | `Button.tsx`, `Container.tsx`, `Divider.tsx`, `Flag.tsx`, `Header.tsx`, `Icon.tsx`, `Image.tsx`, `Input.tsx`, `Label.tsx`, `List.tsx`, `Loader.tsx`, `Segment.tsx`, `Step.tsx` |
| `src/modules/` | ~50 | `Accordion.tsx`, `Checkbox.tsx`, `Dimmer.tsx`, `Embed.tsx`, `Modal.tsx`, `Popup.tsx`, `Progress.tsx`, `Rating.tsx`, `Sidebar.tsx`, `Sticky.tsx`, `Tab.tsx` |
| `src/views/` | ~25 | `Advertisement.tsx`, `Card.tsx`, `Comment.tsx`, `Feed.tsx`, `Item.tsx`, `Statistic.tsx` |

### Utility and Type Files

| File | Change |
|------|--------|
| `src/generic.ts` | Replace `ForwardRefComponent` type definition |
| `src/lib/hooks/useMergedRefs.ts` | Update for React 19 ref cleanup functions |
| `src/lib/getUnhandledProps.ts` | Filter out `ref` prop |
| `test/utils/getComponentName.ts` | Update ForwardRef detection logic |
| `test/specs/commonTests/forwardsRef.ts` | Rewrite ForwardRef conformance test |

---

## Acceptance Criteria

- [ ] Zero files in `src/` contain `React.forwardRef` (`grep -rn "forwardRef" src/ --include="*.ts" --include="*.tsx"` returns zero, excluding comments)
- [ ] All 158 components accept `ref` as a regular prop via destructuring
- [ ] `src/generic.ts` `ForwardRefComponent` type is updated to not use `React.ForwardRefExoticComponent`
- [ ] `useMergedRefs` handles React 19 ref cleanup functions (callback refs returning a cleanup function)
- [ ] `getUnhandledProps` filters out `ref` from forwarded props
- [ ] Ref forwarding works for all components (refs reach the underlying DOM elements)
- [ ] Ref callback functions work (function refs receive the DOM node)
- [ ] Ref cleanup functions work (React 19 feature -- cleanup called on unmount)
- [ ] TypeScript consumers can pass `ref` to any component without type errors
- [ ] `displayName` is preserved on all components
- [ ] Sub-component static properties (e.g., `Form.Field`, `Dropdown.Item`) are preserved
- [ ] `tsc --noEmit` passes with zero errors
- [ ] All existing tests pass (with updated ref-related assertions)

---

## Rollback Strategy

1. Revert all component files to their `React.forwardRef` versions from the pre-Phase-15 git tag.
2. Restore the original `ForwardRefComponent` type in `src/generic.ts`.
3. Restore original `useMergedRefs` without cleanup function handling.
4. Restore original `getUnhandledProps` without `ref` filtering.
5. Since this phase touches 158+ files, a full branch revert (`git revert` or `git reset`) is the safest approach.

---

## Notes for AI Agents

- **The transformation is mechanical but repetitive.** The same pattern applies to all 158 components. Consider writing a codemod script (using jscodeshift or ts-morph) to automate it.
- **The function declaration style changes from `const X = React.forwardRef(function (...) { ... })` to `function X({ ref, ...props })`.** This means the component is no longer assigned to a `const` -- it is a named function declaration. Named function declarations are hoisted, which can affect files that reference the component before its declaration (though this is rare in this codebase).
- **`displayName` is still needed.** React DevTools use `displayName` or `Function.name`. After removing `forwardRef`, the function name is available directly, but explicitly setting `displayName` provides consistency and ensures minified builds show readable names.
- **Static properties work differently on function declarations vs const assignments.** With `const X = React.forwardRef(...)`, `X.displayName = '...'` works because `X` is an object. With `function X() {}`, `X.displayName = '...'` also works because functions are objects. No issues here.
- **The `ref` prop must be removed from `...rest` before spreading onto DOM elements.** The component patterns in this codebase destructure `ref` separately, so this is already handled. But verify that no component accidentally spreads `ref` onto a DOM element via `{...props}` or `{...rest}`.
- **Testing pattern change.** Tests that check `ReactIs.isForwardRef()` will fail. Replace with tests that verify the component accepts and forwards a ref.
- **Order of operations.** Process `src/lib/hooks/useMergedRefs.ts` first (Task 4), then `src/generic.ts` (Task 1), then components in batches.
- **The `as` prop complicates ref typing.** When a component supports `as`, the ref type should match the rendered element. For now, use the default element type for the ref generic (e.g., `HTMLButtonElement` for Button). Full polymorphic ref typing is a follow-up concern.
- Watch for components that use `ref` internally with a different name (like `innerRef` in Dropdown and Search). Those patterns should be unified in this phase.
