# Phase 17: Modernize Custom Hooks for React 19

| Field            | Value                                      |
|------------------|--------------------------------------------|
| **Phase ID**     | PHASE-17                                   |
| **Title**        | Modernize Custom Hooks for React 19        |
| **Stage**        | 3 - Core Library Modernization             |
| **Dependencies** | Phase 14 (Convert Source to TypeScript)     |
| **Complexity**   | Medium                                     |
| **Scope**        | 7 custom hooks in `src/lib/hooks/`         |

---

## Objective

Review and update all 7 custom hooks in the library to be fully compatible with React 19 semantics, remove legacy workarounds (IE11, SSR hacks), ensure compatibility with the React Compiler (React Forget), and evaluate which hooks can be replaced by new React 19 built-in APIs. After this phase, every hook follows React 19 best practices and is safe for automatic memoization by the React Compiler.

---

## Background

### Current Hook Inventory

| Hook | File | Lines | Purpose |
|------|------|-------|---------|
| `useAutoControlledValue` | `src/lib/hooks/useAutoControlledValue.ts` | 45 | Controlled/uncontrolled state management |
| `useClassNamesOnNode` | `src/lib/hooks/useClassNamesOnNode.ts` | 145 | Imperatively manage CSS classes on DOM nodes |
| `useEventCallback` | `src/lib/hooks/useEventCallback.ts` | 35 | Stable callback reference with latest closure |
| `useForceUpdate` | `src/lib/hooks/useForceUpdate.ts` | 8 | Force component re-render |
| `useIsomorphicLayoutEffect` | `src/lib/hooks/useIsomorphicLayoutEffect.ts` | 9 | SSR-safe `useLayoutEffect` |
| `useMergedRefs` | `src/lib/hooks/useMergedRefs.ts` | 40 | Merge multiple refs into one |
| `usePrevious` | `src/lib/hooks/usePrevious.ts` | 18 | Track previous value of a variable |

### React 19 Changes Affecting Hooks

1. **`useEffectEvent`** (experimental -> potentially stable): Replaces the `useEventCallback` pattern of using a ref to capture the latest closure.

2. **Ref cleanup functions**: Ref callbacks can now return a cleanup function, affecting `useMergedRefs`.

3. **Automatic batching improvements**: React 19 batches all state updates, which may affect `useAutoControlledValue`'s stateRef pattern.

4. **React Compiler compatibility**: The React Compiler (React Forget) automatically memoizes components and hooks. Hooks must follow the Rules of Hooks strictly and avoid patterns that confuse the compiler.

5. **`useLayoutEffect` SSR behavior**: React 19 handles `useLayoutEffect` during SSR differently than React 18. The `useIsomorphicLayoutEffect` workaround may no longer be necessary.

6. **IE11 no longer supported**: React 18+ dropped IE11 support. Any workarounds for IE11 (like the `Set()` constructor workaround in `useClassNamesOnNode`) can be removed.

---

## Detailed Tasks

### Task 1: Update `useIsomorphicLayoutEffect`

**File:** `src/lib/hooks/useIsomorphicLayoutEffect.ts`

**Current implementation:**

```typescript
import * as React from 'react'
import isBrowser from '../isBrowser'

const useIsomorphicLayoutEffect =
  isBrowser() && process.env.NODE_ENV !== 'test' ? React.useLayoutEffect : React.useEffect

export default useIsomorphicLayoutEffect
```

1.1. **Evaluate if this hook is still needed in React 19.**

React 19 improves SSR handling of `useLayoutEffect`. In React 18, `useLayoutEffect` during SSR emitted a warning. In React 19, the behavior is:
- During SSR, `useLayoutEffect` fires after the component tree is committed to the DOM during hydration
- The warning is removed in React 19 for components that are only rendered on the client

1.2. **If the hook is still needed** (for strict SSR compatibility), simplify by removing the `process.env.NODE_ENV !== 'test'` condition:

```typescript
// BEFORE
const useIsomorphicLayoutEffect =
  isBrowser() && process.env.NODE_ENV !== 'test' ? React.useLayoutEffect : React.useEffect

// AFTER
import * as React from 'react'
import isBrowser from '../isBrowser'

const useIsomorphicLayoutEffect: typeof React.useLayoutEffect = isBrowser()
  ? React.useLayoutEffect
  : React.useEffect

export default useIsomorphicLayoutEffect
```

The `process.env.NODE_ENV !== 'test'` condition was added because `useLayoutEffect` emits warnings in the test environment with `jsdom` (which does not implement layout). With Vitest and `happy-dom` or properly configured `jsdom`, this may no longer be an issue.

1.3. **If the hook can be eliminated**, replace all usages across the codebase with `React.useLayoutEffect` directly. Search for consumers:

```bash
grep -rn "useIsomorphicLayoutEffect" src/ --include="*.ts" --include="*.tsx"
```

Consumers include:
- `src/lib/hooks/useClassNamesOnNode.ts`
- `src/lib/hooks/useEventCallback.ts`
- Various component files

1.4. Add proper TypeScript typing:

```typescript
const useIsomorphicLayoutEffect: typeof React.useEffect = isBrowser()
  ? React.useLayoutEffect
  : React.useEffect
```

---

### Task 2: Update `useMergedRefs` for React 19 ref cleanup functions

**File:** `src/lib/hooks/useMergedRefs.ts`

**Current implementation:**

```typescript
export function setRef(ref, value) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

export default function useMergedRefs(refA, refB) {
  const mergedCallback = React.useCallback(
    (value) => {
      mergedCallback.current = value
      setRef(refA, value)
      setRef(refB, value)
    },
    [refA, refB],
  )
  return mergedCallback
}
```

2.1. **React 19 change:** Ref callbacks can return a cleanup function. When the component unmounts or the ref changes, React will call this cleanup function:

```typescript
<div ref={(node) => {
  // setup
  return () => {
    // cleanup
  }
}} />
```

2.2. Update `setRef` to capture and return cleanup functions:

```typescript
export function setRef<T>(
  ref: React.Ref<T> | null | undefined,
  value: T | null
): (() => void) | void {
  if (typeof ref === 'function') {
    // React 19: ref callbacks may return a cleanup function
    const cleanup = ref(value)
    if (typeof cleanup === 'function') {
      return cleanup
    }
  } else if (ref && typeof ref === 'object') {
    (ref as React.MutableRefObject<T | null>).current = value
  }
}
```

2.3. Update `useMergedRefs` to aggregate cleanup functions:

```typescript
export default function useMergedRefs<T>(
  refA: React.Ref<T> | null | undefined,
  refB: React.Ref<T> | null | undefined
): React.RefCallback<T> & { current: T | null } {
  const mergedCallback = React.useCallback(
    (value: T | null) => {
      (mergedCallback as any).current = value

      const cleanupA = setRef(refA, value)
      const cleanupB = setRef(refB, value)

      // Return combined cleanup for React 19
      if (cleanupA || cleanupB) {
        return () => {
          if (cleanupA) cleanupA()
          if (cleanupB) cleanupB()
        }
      }
    },
    [refA, refB],
  ) as React.RefCallback<T> & { current: T | null }

  ;(mergedCallback as any).current = null

  return mergedCallback
}
```

2.4. The `.current` property on the callback is a non-standard pattern used throughout the codebase. Document this:

```typescript
/**
 * Merges two React refs into a single ref callback.
 *
 * The returned callback also has a `.current` property that holds the latest
 * ref value, allowing it to be used as both a RefCallback and a RefObject.
 *
 * Supports React 19 ref cleanup functions: if either ref callback returns
 * a cleanup function, the merged callback will return a combined cleanup.
 */
```

---

### Task 3: Update `useEventCallback` for React 19

**File:** `src/lib/hooks/useEventCallback.ts`

**Current implementation:**

```typescript
export default function useEventCallback(fn) {
  const callbackRef = React.useRef(() => {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Cannot call an event handler while rendering...')
    }
  })

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = fn
  }, [fn])

  return React.useCallback(
    (...args) => {
      const callback = callbackRef.current
      return callback(...args)
    },
    [callbackRef],
  )
}
```

3.1. **Evaluate `useEffectEvent` replacement.** React 19 may include `useEffectEvent` (previously experimental). If available:

```typescript
// If useEffectEvent is stable in React 19:
import { useEffectEvent } from 'react'

export default function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  return useEffectEvent(fn)
}
```

3.2. **If `useEffectEvent` is not yet stable**, keep the current pattern but modernize:

```typescript
export default function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const callbackRef = React.useRef<T>(fn)

  // Update the ref on every render (not in an effect) for React 19 compatibility
  // React 19 with React Compiler expects refs to be updated synchronously
  callbackRef.current = fn

  return React.useCallback(
    ((...args: any[]) => {
      return callbackRef.current(...args)
    }) as T,
    [],
  )
}
```

3.3. **React Compiler consideration.** The React Compiler may auto-memoize this pattern. Ensure the hook does not have patterns that the compiler cannot analyze:
- Avoid mutating refs inside `useCallback` dependency arrays
- Ensure the `useCallback` has an empty dependency array `[]` (since the ref handles the latest value)

3.4. Remove the development-only error thrown when calling during render. React 19's stricter mode will surface these issues through better error boundaries.

3.5. Add proper TypeScript generics:

```typescript
export default function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  // ...
}
```

---

### Task 4: Review `useAutoControlledValue` for React 19 batching

**File:** `src/lib/hooks/useAutoControlledValue.ts`

**Current implementation:**

```typescript
function useAutoControlledValue(options) {
  const initialState =
    typeof options.defaultState === 'undefined' ? options.initialState : options.defaultState
  const [internalState, setInternalState] = React.useState(initialState)

  const state = typeof options.state === 'undefined' ? internalState : options.state
  const stateRef = React.useRef(state)

  React.useEffect(() => {
    stateRef.current = state
  }, [state])

  const setState = React.useCallback((newState) => {
    if (typeof newState === 'function') {
      stateRef.current = newState(stateRef.current)
    } else {
      stateRef.current = newState
    }
    setInternalState(stateRef.current)
  }, [])

  return [state, setState]
}
```

4.1. **Review the `stateRef` pattern.** The `stateRef` is used to ensure the `setState` callback always has access to the latest state without being in the dependency array. In React 19 with automatic batching, this pattern is still valid but may be simplified.

4.2. **Potential issue with `stateRef.current` assignment in `setState`.** The ref update in `setState` is synchronous, but the `useEffect` that updates `stateRef.current = state` runs after render. If `setState` is called multiple times before the effect runs, the ref may hold a stale value. React 19's batching makes this more likely.

4.3. **Recommended fix:** Update the ref synchronously in the render phase instead of in an effect:

```typescript
function useAutoControlledValue<T>(options: UseAutoControlledValueOptions<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
  const initialState = options.defaultState ?? options.initialState
  const [internalState, setInternalState] = React.useState<T>(initialState)

  const isControlled = options.state !== undefined
  const state = isControlled ? options.state! : internalState

  // Update ref synchronously (not in effect) for React 19 compatibility
  const stateRef = React.useRef<T>(state)
  stateRef.current = state

  const setState = React.useCallback<React.Dispatch<React.SetStateAction<T>>>((newState) => {
    const nextState = typeof newState === 'function'
      ? (newState as (prev: T) => T)(stateRef.current)
      : newState

    stateRef.current = nextState
    setInternalState(nextState)
  }, [])

  return [state, setState]
}
```

4.4. Remove the `useEffect` that was previously syncing `stateRef.current`. Synchronous assignment during render is safe because the ref is not used for side effects during render.

4.5. Add TypeScript generics for type safety:

```typescript
interface UseAutoControlledValueOptions<T> {
  /** The controlled state value (from props). undefined means uncontrolled. */
  state?: T
  /** The default state value (used on first render if uncontrolled). */
  defaultState?: T
  /** The initial state value (fallback if defaultState is also undefined). */
  initialState: T
}

function useAutoControlledValue<T>(
  options: UseAutoControlledValueOptions<T>
): [T, React.Dispatch<React.SetStateAction<T>>]
```

---

### Task 5: Review `useForceUpdate` necessity

**File:** `src/lib/hooks/useForceUpdate.ts`

**Current implementation:**

```typescript
export default function useForceUpdate() {
  return React.useReducer((x) => x + 1, 0)[1]
}
```

5.1. **Determine if `useForceUpdate` is still needed.** Search for consumers:

```bash
grep -rn "useForceUpdate" src/ --include="*.ts" --include="*.tsx"
```

5.2. `useForceUpdate` is a code smell -- it usually indicates that state is being managed outside React's state system (e.g., in refs or external stores). In React 19, `useSyncExternalStore` is the preferred way to subscribe to external state.

5.3. **If consumers can be refactored to use proper state**, remove `useForceUpdate` entirely and update the consumers.

5.4. **If `useForceUpdate` must be kept**, the implementation is fine for React 19. Add TypeScript typing:

```typescript
/**
 * Returns a function that forces a component to re-render.
 *
 * Prefer using React state or useSyncExternalStore over this hook.
 * This hook is a last resort for cases where state is managed externally.
 */
export default function useForceUpdate(): () => void {
  const [, dispatch] = React.useReducer((x: number) => x + 1, 0)
  return dispatch
}
```

5.5. Add a deprecation note if this hook will be removed in a future version:

```typescript
/** @deprecated Prefer React state or useSyncExternalStore. Will be removed in v4. */
```

---

### Task 6: Update `useClassNamesOnNode` -- remove IE11 workaround

**File:** `src/lib/hooks/useClassNamesOnNode.ts`

**Current implementation highlights:**

```typescript
// Line 85-86: IE11 workaround
// IE11 does not support constructor params
const set = new Set()
set.add(classNameRef)
```

6.1. **Remove the IE11 `Set()` constructor workaround.** React 19 does not support IE11. Use the constructor parameter directly:

```typescript
// BEFORE (IE11 workaround)
const set = new Set()
set.add(classNameRef)

// AFTER
const set = new Set([classNameRef])
```

6.2. **Review the `NodeRegistry` class.** The `NodeRegistry` class uses a `Map` and `Set` for tracking nodes and their classname refs. The class pattern is fine but could be simplified:

```typescript
export class NodeRegistry {
  private nodes = new Map<HTMLElement, Set<React.RefObject<string>>>()

  add(node: HTMLElement, classNameRef: React.RefObject<string>): void {
    const existing = this.nodes.get(node)
    if (existing) {
      existing.add(classNameRef)
      return
    }
    this.nodes.set(node, new Set([classNameRef]))
  }

  del(node: HTMLElement, classNameRef: React.RefObject<string>): void {
    const existing = this.nodes.get(node)
    if (!existing) return

    if (existing.size === 1) {
      this.nodes.delete(node)
      return
    }

    existing.delete(classNameRef)
  }

  emit(node: HTMLElement, callback: (node: HTMLElement, refs: Set<React.RefObject<string>> | undefined) => void): void {
    callback(node, this.nodes.get(node))
  }
}
```

6.3. **Review module-level state.** The `prevClassNames` Map and `nodeRegistry` singleton are module-level state. This works in the browser but could cause issues in SSR environments or concurrent React features. Document this limitation:

```typescript
// WARNING: Module-level singleton. This is intentional for cross-component
// className coordination on shared DOM nodes (e.g., document.body).
// Not compatible with React Server Components.
const nodeRegistry = new NodeRegistry()
```

6.4. **Replace `indexOf` with `includes` for modern JavaScript:**

```typescript
// BEFORE
(className, i, array) => className.length > 0 && array.indexOf(className) === i

// AFTER
(className, i, array) => className.length > 0 && array.indexOf(className) === i
// (indexOf is correct here for uniqueness check -- includes would not work for dedup)
```

6.5. **React Compiler compatibility.** The `useIsomorphicLayoutEffect` calls with mutable refs are fine for the compiler. Ensure the `isMounted` ref pattern does not confuse the compiler:

```typescript
// This pattern is safe for React Compiler
const isMounted = React.useRef(false)
useIsomorphicLayoutEffect(() => {
  if (isMounted.current) {
    // ... update logic
  }
  isMounted.current = true
}, [className])
```

---

### Task 7: Update `usePrevious` hook

**File:** `src/lib/hooks/usePrevious.ts`

**Current implementation:**

```typescript
function usePrevious(value) {
  const ref = React.useRef()

  React.useEffect(() => {
    ref.current = value
  })

  return ref.current
}
```

7.1. Add TypeScript generics:

```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined)

  React.useEffect(() => {
    ref.current = value
  })

  return ref.current
}
```

7.2. **React Compiler note.** The `usePrevious` pattern (update ref in unguarded `useEffect` with no deps) is recognized by the React Compiler. No changes needed for compiler compatibility.

7.3. **Consider if React 19 provides a built-in alternative.** As of React 19, there is no built-in `usePrevious`. The hook remains necessary.

7.4. The lack of a dependency array on `useEffect` is intentional -- it runs after every render to capture the current value as the "previous" for the next render. Add a comment explaining this:

```typescript
/**
 * Returns the value from the previous render.
 *
 * The effect intentionally has no dependency array -- it must run after
 * every render to update the ref with the current value.
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined)

  React.useEffect(() => {
    ref.current = value
  }) // No deps -- intentional

  return ref.current
}
```

---

### Task 8: Ensure all hooks are compatible with React Compiler

8.1. **Rules of Hooks compliance.** Verify all 7 hooks follow the Rules of Hooks:
- No conditional hook calls
- No hook calls inside loops
- No hook calls inside nested functions

8.2. **Mutable ref patterns.** The React Compiler treats refs as "escape hatches" that opt out of automatic memoization. Ensure refs are only mutated in effects or event handlers, never during render (with the exception of `useAutoControlledValue`'s stateRef, which is safe because it mirrors React state).

8.3. **No side effects during render.** Verify no hook performs side effects (DOM mutations, network calls, etc.) during the render phase.

8.4. **Stable callback references.** Ensure hooks that return callbacks (like `useEventCallback`, `useAutoControlledValue`'s `setState`, `useMergedRefs`) return stable references that do not change between renders (via `useCallback` with stable deps).

8.5. Run the React Compiler lint rules (if available) on all hook files:

```bash
npx eslint src/lib/hooks/ --rule '{ "react-compiler/react-compiler": "error" }'
```

---

### Task 9: Add new hooks if needed

9.1. **`useEffectEvent` wrapper.** If React 19 ships `useEffectEvent` as stable, create a re-export or wrapper:

```typescript
// src/lib/hooks/useEffectEvent.ts
export { useEffectEvent } from 'react'

// Or if not available, keep useEventCallback as the implementation
```

9.2. **Consider a `useStableCallback` alias.** If the team prefers a name that better describes the intent:

```typescript
// src/lib/hooks/useStableCallback.ts
export { default as useStableCallback } from './useEventCallback'
```

9.3. **Do not add hooks speculatively.** Only add new hooks if they replace existing functionality or are needed by converted components.

---

## Files Affected

| File | Change |
|------|--------|
| `src/lib/hooks/useIsomorphicLayoutEffect.ts` | Review necessity, remove test env condition |
| `src/lib/hooks/useMergedRefs.ts` | Add React 19 ref cleanup function support |
| `src/lib/hooks/useEventCallback.ts` | Evaluate `useEffectEvent` replacement, add TypeScript generics |
| `src/lib/hooks/useAutoControlledValue.ts` | Fix stateRef sync, add TypeScript generics |
| `src/lib/hooks/useForceUpdate.ts` | Review necessity, add deprecation note |
| `src/lib/hooks/useClassNamesOnNode.ts` | Remove IE11 workaround, add TypeScript types |
| `src/lib/hooks/usePrevious.ts` | Add TypeScript generics, add explanatory comments |
| `test/specs/lib/hooks/useClassNamesOnNode-test.js` | Update for IE11 workaround removal |

---

## Acceptance Criteria

- [ ] `useIsomorphicLayoutEffect` either removed (replaced with direct `useLayoutEffect`) or simplified (no `NODE_ENV` condition)
- [ ] `useMergedRefs` handles React 19 ref cleanup functions -- if either ref callback returns a cleanup, the merged ref returns a combined cleanup
- [ ] `useEventCallback` uses `useEffectEvent` if available in React 19, or modernized ref pattern without the layout effect
- [ ] `useAutoControlledValue` updates `stateRef.current` synchronously (not via `useEffect`), has proper TypeScript generics
- [ ] `useForceUpdate` is either removed (consumers refactored) or marked as deprecated with typing
- [ ] `useClassNamesOnNode` has no IE11 workarounds (`new Set()` uses constructor parameter)
- [ ] `usePrevious` has TypeScript generics and explanatory comments
- [ ] All 7 hooks have proper TypeScript signatures with generics where applicable
- [ ] All hooks pass React Compiler lint rules (no violations)
- [ ] `tsc --noEmit` passes with zero errors on all hook files
- [ ] All hook tests pass with the updated implementations
- [ ] No hook mutates a ref during the render phase (except the documented `stateRef` exception in `useAutoControlledValue`)

---

## Rollback Strategy

1. Restore individual hook files from the pre-Phase-17 git tag.
2. Each hook is independent -- individual hooks can be reverted without affecting others.
3. If `useEffectEvent` is used but turns out to be unstable, revert `useEventCallback` to the ref-based pattern.
4. The IE11 workaround removal in `useClassNamesOnNode` is safe and does not need rollback (IE11 is not supported by React 18+).

---

## Notes for AI Agents

- **Each hook should be updated independently** and tested independently. Do not batch all changes.
- **The `useMergedRefs` cleanup function support is the most important change** in this phase. It enables React 19's ref cleanup pattern to work correctly when components merge refs (which approximately 15-20 components in the library do).
- **Check if `useEffectEvent` is available** in the React 19 version being targeted. As of React 19.0, `useEffectEvent` is still experimental. If it is not stable, do not use it -- stick with the `useEventCallback` pattern.
- **The `useIsomorphicLayoutEffect` removal is optional.** If there is any doubt about SSR compatibility, keep the hook but simplify it. The safe default is to keep it.
- **The `useAutoControlledValue` stateRef fix** (synchronous assignment instead of effect) is a subtle but important correctness fix. The current implementation can produce stale values when `setState` is called twice in quick succession before the effect runs. React 19's batching makes this more likely.
- **When adding TypeScript generics**, ensure the generics are constrained enough to be useful but not so constrained that they prevent legitimate usage patterns.
- **The `useForceUpdate` hook** is currently used by `TransitionablePortal`. After Phase 16 converts it to a function component, check if `useForceUpdate` is still needed there. If no consumers remain, delete the hook.
- **Do not introduce new dependencies** in this phase. All modernization should use React 19 built-in APIs or existing patterns.
- **Test each hook in isolation** using the test file at `test/specs/lib/hooks/`. Create new test files for hooks that do not have them (some hooks may only be tested indirectly through component tests).
