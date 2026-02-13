# Phase 11: Update Test Utilities and Helpers

| Field            | Value                                      |
|------------------|--------------------------------------------|
| **Phase ID**     | PHASE-11                                   |
| **Title**        | Update Test Utilities and Helpers           |
| **Stage**        | 2 - Testing Infrastructure                 |
| **Dependencies** | Phase 9 (Vitest Migration), Phase 10 (RTL Migration) |
| **Complexity**   | Medium                                     |
| **Scope**        | 11 test utility files in `test/utils/`     |

---

## Objective

Rewrite, replace, or remove every test utility in `test/utils/` so that the shared helpers align with the new Vitest + React Testing Library (RTL) + `@testing-library/user-event` stack. After this phase, no test utility should reference Enzyme, Sinon, `simulant`, or any other legacy test dependency. New shared helpers must be created for common Semantic UI component testing patterns.

---

## Background

The current test utilities were built around Enzyme shallow/mount rendering and the `simulant` library for raw DOM event dispatch. Several utilities are Enzyme-specific (`nestedShallow.js`), Sinon-specific (`sandbox.js`), or use patterns incompatible with React 19 (`syntheticEvent.js` references the legacy `persist()` method removed in React 19). Migrating these first ensures all subsequent component test migrations (Phases 18-24) have a clean, consistent foundation.

### Current Utility Inventory

| File | Purpose | Action |
|------|---------|--------|
| `assertNodeContains.js` | DOM node querySelector assertions | Rewrite for RTL `within()` patterns |
| `assertWithTimeout.js` | Retry assertion with timeout | Replace with RTL `waitFor()` |
| `consoleUtil.js` | Silence/enable console during tests | Rewrite for Vitest `vi.spyOn(console, ...)` |
| `domEvent.js` | Fire raw DOM events via `simulant` | Rewrite using `@testing-library/user-event` |
| `getComponentName.js` | Extract displayName from ForwardRef/Memo | Update for React 19 component types |
| `getComponentProps.js` | Extract propTypes/handledProps from components | Update for post-PropTypes world |
| `index.js` | Barrel export for all utilities | Update to reflect new utility set |
| `nestedShallow.js` | Enzyme shallow render with nesting | Remove entirely (Enzyme-specific) |
| `sandbox.js` | Sinon sandbox with auto-restore | Remove entirely (replaced by Vitest mocks) |
| `syntheticEvent.js` | Synthetic event shape definitions and validators | Rewrite for React 19 event system |
| `wait.js` | Simple setTimeout promise wrapper | Keep or replace with RTL `waitFor` |

---

## Detailed Tasks

### Task 1: Remove Enzyme-specific utility `nestedShallow.js`

**File:** `test/utils/nestedShallow.js`

1.1. Delete `test/utils/nestedShallow.js` entirely. This utility imports `enzyme` directly and provides `enzyme.shallow()` wrappers with child-diving logic. There is no RTL equivalent because RTL does not support shallow rendering.

1.2. Search the entire `test/` directory for any imports of `nestedShallow` and remove them. Update any tests that use `nestedShallow()` to use RTL `render()` instead.

```
// Search command:
grep -rn "nestedShallow" test/ --include="*.js"
```

1.3. Remove the `nestedShallow` export from `test/utils/index.js`.

---

### Task 2: Remove Sinon sandbox utility `sandbox.js`

**File:** `test/utils/sandbox.js`

2.1. Delete `test/utils/sandbox.js`. This utility creates a `sinon.createSandbox()` with automatic `afterEach` restoration. Vitest provides `vi.fn()`, `vi.spyOn()`, and automatic mock restoration via `restoreMocks: true` in the Vitest config.

2.2. Search for all imports of `sandbox` from test utilities and replace with Vitest equivalents:

```javascript
// BEFORE (Sinon sandbox)
import { sandbox } from 'test/utils'
const spy = sandbox.spy(console, 'error')

// AFTER (Vitest)
const spy = vi.spyOn(console, 'error')
```

2.3. Remove the `sandbox` export from `test/utils/index.js`.

---

### Task 3: Rewrite `assertNodeContains.js` for RTL patterns

**File:** `test/utils/assertNodeContains.js`

3.1. Rewrite `assertNodeContains()` to use RTL's `within()` and `queryBySelector()` patterns instead of raw `parentNode.querySelector()`:

```javascript
// BEFORE
export const assertNodeContains = (parentNode, childSelector, isPresent = true) => {
  const didFind = parentNode.querySelector(childSelector) !== null
  // ...
}

// AFTER
import { within } from '@testing-library/react'

export const assertNodeContains = (container, childSelector, isPresent = true) => {
  const element = container.querySelector(childSelector)
  if (isPresent) {
    expect(element).toBeInTheDocument()
  } else {
    expect(element).not.toBeInTheDocument()
  }
}
```

3.2. Rewrite `assertBodyContains()` to use `screen` from RTL where possible.

3.3. Update all call sites across the test suite. Run a search:

```
grep -rn "assertNodeContains\|assertBodyContains" test/ --include="*.js"
```

---

### Task 4: Rewrite `domEvent.js` using `@testing-library/user-event`

**File:** `test/utils/domEvent.js`

4.1. Remove the `simulant` import. The `simulant` library dispatches raw DOM events outside React's event system, which is unreliable with React 19's event delegation changes.

4.2. Rewrite all event helpers (`fire`, `click`, `keyDown`, `mouseDown`, `mouseEnter`, `mouseLeave`, `mouseOver`, `mouseUp`, `resize`, `scroll`) using `@testing-library/user-event` and `fireEvent` from RTL:

```javascript
// AFTER
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'

export const user = userEvent.setup()

export const click = async (element) => {
  await user.click(element)
}

export const keyDown = (element, options) => {
  fireEvent.keyDown(element, options)
}

// For events user-event does not cover (resize, scroll):
export const resize = (element, data) => {
  fireEvent(element, new Event('resize', { ...data, bubbles: true }))
}

export const scroll = (element, data) => {
  fireEvent.scroll(element, data)
}
```

4.3. Note that `user-event` methods are async. All call sites must be updated to `await` the event calls. This will be a widespread change across test files.

4.4. Update the default export to match the new API surface.

---

### Task 5: Rewrite `syntheticEvent.js` for React 19 event system

**File:** `test/utils/syntheticEvent.js`

5.1. Remove the `persist: noop` property from the base event shape. React 19 removes the pooling system entirely -- `persist()` is a no-op in React 17+18 and does not exist on the event object in React 19.

5.2. Remove `isDefaultPrevented` and `isPropagationStopped` from the base shape. React 19 uses standard DOM event methods exclusively.

5.3. Update the event shape to reflect React 19's native event proxying:

```javascript
const baseShape = {
  bubbles: null,
  cancelable: null,
  currentTarget: null,
  defaultPrevented: null,
  eventPhase: null,
  isTrusted: null,
  nativeEvent: null,
  preventDefault: expect.any(Function),
  stopPropagation: expect.any(Function),
  target: null,
  timeStamp: null,
  type: null,
}
```

5.4. Update the `hasShape` method to validate against the updated shapes.

5.5. Search for all usages of `syntheticEvent` in the test suite and verify they still match:

```
grep -rn "syntheticEvent" test/ --include="*.js"
```

---

### Task 6: Replace `assertWithTimeout.js` with RTL `waitFor`

**File:** `test/utils/assertWithTimeout.js`

6.1. The `assertWithTimeout` pattern (polling retry with `setTimeout`) is directly replaced by RTL's `waitFor()` utility which provides the same retry-until-passing behavior with better integration.

6.2. Either delete the file entirely and replace all usages with `waitFor`, or rewrite as a thin wrapper:

```javascript
import { waitFor } from '@testing-library/react'

const assertWithTimeout = async (assertion, timeout = 1000) => {
  await waitFor(assertion, { timeout })
}

export default assertWithTimeout
```

6.3. Search for and update all call sites:

```
grep -rn "assertWithTimeout" test/ --include="*.js"
```

Note: The old API used a `done` callback (Mocha style). The new API should use async/await (Vitest style).

---

### Task 7: Rewrite `consoleUtil.js` for Vitest

**File:** `test/utils/consoleUtil.js`

7.1. Replace the manual `Object.assign(console, ...)` approach with Vitest spy utilities:

```javascript
let consoleSpy

export const disable = () => {
  consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
  }
}

export const enable = () => {
  if (consoleSpy) {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore())
    consoleSpy = null
  }
}

export const disableOnce = () => {
  disable()
  afterEach(() => enable())  // Vitest afterEach
}
```

7.2. Replace the `afterEach` hook (which currently uses Mocha's implicit global) with an explicit Vitest `afterEach` import or rely on Vitest's `restoreMocks` config.

---

### Task 8: Update `getComponentName.js` for React 19

**File:** `test/utils/getComponentName.js`

8.1. Update the `ReactIs.ForwardRef` check. In React 19, `forwardRef` is deprecated and components will eventually be plain function components. The utility needs to handle both the legacy `ForwardRef` wrapper and plain named function components:

```javascript
export default function getComponentName(Component) {
  // React 19: components may be plain functions with displayName
  if (Component.displayName) {
    return Component.displayName
  }

  if (Component.$$typeof === ReactIs.Memo) {
    return getComponentName(Component.type)
  }

  // Legacy forwardRef support (during migration)
  if (Component.$$typeof === ReactIs.ForwardRef) {
    return Component.displayName
  }

  return Component.name || Component.prototype?.constructor?.name
}
```

---

### Task 9: Update `getComponentProps.js` for post-PropTypes world

**File:** `test/utils/getComponentProps.js`

9.1. After Phase 13 removes PropTypes, the `propTypes` property will no longer exist on components. Update this utility to not rely on `Component.propTypes`:

```javascript
export default function getComponentProps(Component) {
  if (Component.$$typeof === ReactIs.Memo) {
    return getComponentProps(Component.type)
  }

  return {
    autoControlledProps: Component.autoControlledProps,
    handledProps: Component.handledProps,
    // propTypes removed in Phase 13 -- only include if still present
    ...(Component.propTypes && { propTypes: Component.propTypes }),
  }
}
```

9.2. This change should be backward-compatible during the transition period.

---

### Task 10: Update `wait.js`

**File:** `test/utils/wait.js`

10.1. This utility is a simple `setTimeout` promise wrapper. It can be kept as-is since it has no framework dependencies. However, consider adding a note that `waitFor` from RTL is preferred for assertion-based waiting.

10.2. Optionally rename to `delay.js` to avoid confusion with RTL's `waitFor`.

---

### Task 11: Create new shared test matchers

**File (new):** `test/utils/matchers.js`

11.1. Create custom Vitest matchers for Semantic UI-specific assertions:

```javascript
import { expect } from 'vitest'

expect.extend({
  toHaveSemanticClass(received, className) {
    const element = received
    const classes = element.className.split(/\s+/)
    const pass = classes.includes(className)
    return {
      pass,
      message: () =>
        `expected element ${pass ? 'not ' : ''}to have Semantic UI class "${className}", ` +
        `found classes: "${element.className}"`,
    }
  },

  toBeSemanticComponent(received, componentName) {
    const hasClass = received.classList.contains('ui')
    const hasComponentClass = received.classList.contains(componentName.toLowerCase())
    const pass = hasClass && hasComponentClass
    return {
      pass,
      message: () =>
        `expected element ${pass ? 'not ' : ''}to be a Semantic UI "${componentName}" component`,
    }
  },
})
```

---

### Task 12: Create component test helpers

**File (new):** `test/utils/componentHelpers.js`

12.1. Create shared helpers that wrap RTL patterns for Semantic UI components:

```javascript
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Render a Semantic UI component and return RTL utilities plus user-event instance.
 */
export function renderComponent(ui, options = {}) {
  const user = userEvent.setup()
  const result = render(ui, options)
  return {
    ...result,
    user,
  }
}

/**
 * Find an element by its Semantic UI CSS class within a container.
 */
export function getBySemanticClass(container, semanticClass) {
  return container.querySelector(`.ui.${semanticClass}`)
}

/**
 * Find all elements matching a Semantic UI CSS class.
 */
export function getAllBySemanticClass(container, semanticClass) {
  return Array.from(container.querySelectorAll(`.${semanticClass}`))
}

/**
 * Assert a component renders with the expected Semantic UI classes.
 */
export function expectSemanticClasses(element, expectedClasses) {
  expectedClasses.forEach(cls => {
    expect(element).toHaveClass(cls)
  })
}
```

---

### Task 13: Update barrel export `index.js`

**File:** `test/utils/index.js`

13.1. Remove exports for deleted utilities (`nestedShallow`, `sandbox`).

13.2. Add exports for new utilities (`matchers`, `componentHelpers`).

13.3. Final barrel export should look like:

```javascript
export * from './assertNodeContains'
export { default as assertWithTimeout } from './assertWithTimeout'
export { default as consoleUtil } from './consoleUtil'
export * from './domEvent'
export { default as getComponentName } from './getComponentName'
export { default as getComponentProps } from './getComponentProps'
export { default as syntheticEvent } from './syntheticEvent'
export { default as wait } from './wait'
export * from './matchers'
export * from './componentHelpers'
```

---

## Files Affected

| File | Action |
|------|--------|
| `test/utils/assertNodeContains.js` | Rewrite |
| `test/utils/assertWithTimeout.js` | Rewrite or replace |
| `test/utils/consoleUtil.js` | Rewrite |
| `test/utils/domEvent.js` | Rewrite (remove `simulant` dependency) |
| `test/utils/getComponentName.js` | Update |
| `test/utils/getComponentProps.js` | Update |
| `test/utils/index.js` | Update exports |
| `test/utils/nestedShallow.js` | Delete |
| `test/utils/sandbox.js` | Delete |
| `test/utils/syntheticEvent.js` | Rewrite |
| `test/utils/wait.js` | Keep / minor update |
| `test/utils/matchers.js` | Create (new) |
| `test/utils/componentHelpers.js` | Create (new) |

### Dependencies to Remove

| Package | Reason |
|---------|--------|
| `simulant` | Replaced by `@testing-library/user-event` and RTL `fireEvent` |
| `sinon` | Replaced by Vitest built-in mocking (`vi.fn()`, `vi.spyOn()`) |
| `sinon-chai` | Replaced by Vitest matchers |

---

## Acceptance Criteria

- [ ] `test/utils/nestedShallow.js` is deleted and no remaining imports reference it
- [ ] `test/utils/sandbox.js` is deleted and no remaining imports reference it
- [ ] `test/utils/domEvent.js` no longer imports `simulant`; all event helpers use `@testing-library/user-event` or RTL `fireEvent`
- [ ] `test/utils/syntheticEvent.js` base shape does not include `persist`, `isDefaultPrevented`, or `isPropagationStopped`
- [ ] `test/utils/consoleUtil.js` uses Vitest `vi.spyOn()` instead of manual `Object.assign(console, ...)`
- [ ] `test/utils/assertWithTimeout.js` uses RTL `waitFor` or async/await pattern (no `done` callback)
- [ ] `test/utils/getComponentName.js` handles both forwardRef (legacy) and plain function components
- [ ] `test/utils/getComponentProps.js` works without `Component.propTypes` being present
- [ ] New `test/utils/matchers.js` provides `toHaveSemanticClass` and `toBeSemanticComponent` matchers
- [ ] New `test/utils/componentHelpers.js` provides `renderComponent`, `getBySemanticClass`, and related helpers
- [ ] `test/utils/index.js` exports all new utilities and does not export removed ones
- [ ] `simulant`, `sinon`, and `sinon-chai` packages are removed from `devDependencies` in `package.json`
- [ ] All existing tests that import from `test/utils` still compile and pass with the new utilities
- [ ] No test file imports from `enzyme` through any utility

---

## Rollback Strategy

1. Restore deleted files (`nestedShallow.js`, `sandbox.js`) from git history.
2. Revert modified utilities to their pre-Phase-11 state.
3. Re-add `simulant`, `sinon`, and `sinon-chai` to `devDependencies`.
4. Restore original `test/utils/index.js` barrel exports.
5. All changes in this phase are confined to `test/utils/` and can be reverted without affecting source code.

---

## Notes for AI Agents

- **Do not modify source code (`src/`) in this phase.** This phase is strictly about test utilities.
- When rewriting `domEvent.js`, note that `user-event` methods are **async** -- every call site must be updated to use `await`. Track these changes carefully and batch them.
- The `consoleUtil.js` rewrite must maintain the `disableOnce()` pattern that silences console for a single test. Many Semantic UI tests use this to suppress expected PropTypes warnings.
- The `syntheticEvent.js` shapes are used by conformance tests (`test/specs/commonTests/`) to validate event handler signatures. When updating shapes, cross-reference with `implementsCommonProps.js` and `implementsShorthandProp.js`.
- `getComponentName.js` and `getComponentProps.js` rely on `react-is` to detect `ForwardRef` and `Memo` wrappers. After Phase 15 removes `forwardRef`, these checks become legacy fallbacks. Keep the `ForwardRef` path but add the plain function path as the primary check.
- The new `matchers.js` should be registered in the Vitest setup file (created in Phase 9) so matchers are available globally.
- Prefer creating the new utility files (`matchers.js`, `componentHelpers.js`) alongside the existing ones rather than restructuring the directory.
- Run `grep -rn "from.*test/utils" test/` to find every import site that may need updating.
