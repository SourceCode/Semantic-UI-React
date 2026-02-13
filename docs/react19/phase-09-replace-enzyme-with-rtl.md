# Phase 09: Replace Enzyme with React Testing Library

| Field         | Value                                          |
|---------------|------------------------------------------------|
| **Phase ID**  | PHASE-09                                       |
| **Title**     | Replace Enzyme with React Testing Library      |
| **Stage**     | 2 -- Testing Infrastructure                    |
| **Dependencies** | Phase 03 (React 19 API migration -- components must work with React 19 before tests are rewritten) |
| **Complexity** | High                                          |
| **Scope**     | All test files, test utilities, test setup, common test helpers |

---

## Objective

Remove Enzyme and its React 17 adapter entirely and replace all test rendering, querying, and assertion patterns with React Testing Library (RTL). This is the single largest task in the entire migration by file count: 189 test spec files, 13 common test helpers, 11 test utility files, and the test setup file must all be rewritten. The migration shifts the testing philosophy from implementation-detail testing (shallow rendering, instance inspection, prop checking) to behavior-driven testing (user-visible output, accessibility queries, user interactions).

---

## Background

### Current Test Architecture

The test system is structured in three layers:

**Layer 1: Test Setup (`test/setup.js`)**
Bootstraps the entire test environment by:
- Importing and configuring Enzyme with `@wojtekmaj/enzyme-adapter-react-17`
- Setting Enzyme to `disableLifecycleMethods: true` for shallow rendering
- Exposing Enzyme globals: `global.enzyme`, `global.shallow` (custom `nestedShallow`), `global.render` (`enzyme.render`), `global.mount` (`enzyme.mount`)
- Configuring Chai with `chai-enzyme`, `dirty-chai`, and `sinon-chai` plugins
- Exposing `global.expect = chai.expect`
- Configuring Mocha UI (`bdd`)
- Overriding `console.log/info/warn/error` to throw in tests (fail-on-console pattern)

**Layer 2: Common Test Helpers (`test/specs/commonTests/`)**
13 reusable test functions that every component test imports. These are the backbone of the test suite:

| Helper | Purpose | Enzyme APIs Used |
|--------|---------|-----------------|
| `isConformant.js` | Validates component structure, props forwarding, event handlers, className merging | `shallow()`, `.find()`, `.props()`, `.simulate()`, `.getDOMNode()`, `.instance()` |
| `forwardsRef.js` | Verifies ref forwarding with `React.createRef()` | `mount()`, `.getDOMNode()` |
| `hasSubcomponents.js` | Checks static subcomponent properties | Direct property access (no rendering) |
| `hasUIClassName.js` | Checks for "ui" className on root element | `shallow()`, `.hasClass()` |
| `hasValidTypings.js` | Validates TypeScript definitions exist | File system checks (no rendering) |
| `implementsClassNameProps.js` | Tests className-related props (7 sub-functions) | `shallow()`, `.hasClass()`, `.should.have.className()` |
| `implementsCommonProps.js` | Tests common props: `as`, `children`, `className` | `shallow()`, `.type()`, `.props()`, `.text()` |
| `implementsCreateMethod.js` | Tests static `Component.create()` method | `shallow()`, `.type()` |
| `implementsShorthandProp.js` | Tests shorthand prop rendering | `shallow()`, `.find()`, `.props()`, `.type()` |
| `rendersChildren.js` | Verifies children rendering | `shallow()`, `.text()`, `.contains()` |
| `classNameHelpers.js` | Shared className assertion utilities | `shallow()`, `.hasClass()` |
| `commonHelpers.js` | Shared test setup utilities | Various Enzyme APIs |
| `tsHelpers.js` | TypeScript test utilities | No rendering |

**Layer 3: Test Utilities (`test/utils/`)**
11 utility files:

| Utility | Purpose | Dependencies |
|---------|---------|-------------|
| `sandbox.js` | Sinon sandbox with auto-restore after each test | `sinon` |
| `nestedShallow.js` | Custom shallow renderer that auto-dives through Fragment wrappers | `enzyme.shallow`, `lodash` |
| `consoleUtil.js` | Console enable/disable helpers for suppressing expected warnings | Native `console` |
| `domEvent.js` | DOM event firing utilities (`click`, `keyDown`, `mouseDown`, etc.) | `simulant` |
| `syntheticEvent.js` | Synthetic event shape definitions for all React event types | None (pure data) |
| `assertNodeContains.js` | DOM node containment assertions | Native DOM |
| `assertWithTimeout.js` | Retry-based assertion for async tests | None |
| `getComponentName.js` | Extracts display name from component | None |
| `getComponentProps.js` | Extracts prop definitions from component | None |
| `wait.js` | Promise-based delay utility | None |
| `index.js` | Re-exports all utilities | None |

### Current Enzyme Usage Patterns (by frequency)

Analyzing the test files reveals these dominant patterns:

1. **`shallow(<Component />)`** -- Used in nearly every test. The custom `nestedShallow` wrapper is exposed as `global.shallow`. It auto-dives through React.Fragment wrappers.

2. **`.should.have.className('foo')`** -- Chai-enzyme assertion. Used extensively in `implementsClassNameProps.js` and all component tests that verify CSS classes.

3. **`.simulate('click', eventData)`** -- Enzyme's event simulation. Used for testing onClick, onChange, and other event handlers.

4. **`.find(Selector)`** -- CSS selector or component selector queries. Used to find child components or DOM elements.

5. **`.props()`** / `.prop('name')`** -- Direct prop inspection on rendered elements. Tests verify that props are correctly passed through.

6. **`.text()`** -- Extracts text content from rendered output.

7. **`.type()`** -- Returns the component type of the rendered element (e.g., checks if `<Button as="a" />` renders an `<a>` tag).

8. **`mount(<Component />)`** -- Full DOM rendering. Used for tests that need lifecycle methods, refs, or real DOM interaction (Portal tests, Dropdown tests, etc.).

9. **`.instance()`** -- Access to class component instance. Used in `ModernAutoControlledComponent` tests. This will not work with function components.

10. **`.getDOMNode()`** -- Access to the underlying DOM node. Used in ref forwarding tests.

### Why This Is the Hardest Phase

1. **189 test spec files** must be individually rewritten. There is no automated codemod that handles the `shallow()` + `chai-enzyme` + `sinon` combination.

2. **13 common test helpers** provide reusable test functions called by every component test. These must be rewritten first, as they establish the patterns all other tests follow. The `isConformant` helper alone generates dozens of `it()` blocks per component.

3. **Philosophy change:** Enzyme tests inspect implementation details (component instances, prop values, shallow rendering). RTL tests query the DOM by accessibility roles, labels, and text content. Many tests must be fundamentally rethought, not just syntax-translated.

4. **The `chai-enzyme` assertion chain** (`wrapper.should.have.className('active')`) has no direct RTL equivalent. These must be converted to `expect(element).toHaveClass('active')` using `@testing-library/jest-dom` matchers.

---

## Detailed Tasks

### 1. Install React Testing Library packages

Add to devDependencies in `J:\code\semantic\Semantic-UI-React\package.json`:
```
"@testing-library/react": "^16.0.0"
"@testing-library/jest-dom": "^6.0.0"
"@testing-library/user-event": "^14.0.0"
```

Note: `@testing-library/react` v16 supports React 19. Earlier versions do not.

### 2. Remove Enzyme and related packages

Remove from devDependencies in `J:\code\semantic\Semantic-UI-React\package.json`:
```
"enzyme": "^3.11.0"
"@wojtekmaj/enzyme-adapter-react-17": "^0.1.1"
"chai-enzyme": "^1.0.0-beta.1"
"simulant": "^0.2.2"
```

The `simulant` package is used only in `test/utils/domEvent.js` for firing real DOM events. RTL's `fireEvent` and `@testing-library/user-event` replace this functionality.

### 3. Rewrite test/setup.js

Replace `J:\code\semantic\Semantic-UI-React\test\setup.js` entirely.

Current file configures: Enzyme adapter, Enzyme globals, Mocha UI, Chai plugins, console overrides.

New file should configure:
- `@testing-library/jest-dom` matchers (extends `expect` with `.toHaveClass()`, `.toBeInTheDocument()`, etc.)
- Console override pattern (preserved -- this is independent of the test renderer)
- Any global RTL configuration (e.g., custom `render` function)

```js
// test/setup.js (new)
import '@testing-library/jest-dom'

// Re-export the custom render if needed
// (The actual render function comes from the custom render utility)

// Console override pattern (preserved from current setup)
const throwOnConsole = (method) => (...args) => {
  throw new Error(
    `console.${method} should never be called but was called with:\n${args.join(' ')}`,
  )
}

let log, info, warn, error
beforeEach(() => {
  log = console.log
  info = console.info
  warn = console.warn
  error = console.error
  console.log = throwOnConsole('log')
  console.info = throwOnConsole('info')
  console.warn = throwOnConsole('warn')
  console.error = throwOnConsole('error')
})
afterEach(() => {
  console.log = log
  console.info = info
  console.warn = warn
  console.error = error
})
```

Note: The `beforeEach`/`afterEach` lifecycle hooks are framework-agnostic (they work in both Mocha and Vitest). This setup file will continue to work after Phase 10 (Vitest migration).

### 4. Create custom RTL render function

Create `J:\code\semantic\Semantic-UI-React\test\utils\renderComponent.js`:

```js
import { render } from '@testing-library/react'

/**
 * Custom render function that wraps RTL's render with any providers
 * or configuration needed for Semantic UI React components.
 *
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - RTL render options
 * @returns {Object} RTL render result plus any custom utilities
 */
function renderComponent(ui, options = {}) {
  const result = render(ui, {
    // Add wrapper providers here if needed in the future
    ...options,
  })

  return {
    ...result,
    // Custom helpers can be added here
  }
}

export { renderComponent }
export { render, screen, within, waitFor, act } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
```

### 5. Create migration helper utilities

Create `J:\code\semantic\Semantic-UI-React\test\utils\migrationHelpers.js` with bridge utilities that ease the transition from Enzyme patterns:

```js
import { screen, within } from '@testing-library/react'

/**
 * Find an element by its CSS class name.
 * Bridge from Enzyme's .find('.className') pattern.
 * Prefer role-based queries in new tests.
 */
export function getByClassName(container, className) {
  return container.querySelector(`.${className}`)
}

/**
 * Get all elements matching a CSS class name.
 * Bridge from Enzyme's .find('.className') pattern.
 */
export function getAllByClassName(container, className) {
  return [...container.querySelectorAll(`.${className}`)]
}

/**
 * Check if an element has a specific tag name.
 * Bridge from Enzyme's .should.have.tagName() pattern.
 */
export function expectTagName(element, tagName) {
  expect(element.tagName.toLowerCase()).toBe(tagName.toLowerCase())
}

/**
 * Simulate a keyboard event on an element.
 * Bridge from the old domEvent.js utilities.
 */
export { fireEvent } from '@testing-library/react'
```

### 6. Rewrite common test helpers (test/specs/commonTests/)

This is the critical path. All 189 test files depend on these helpers. They must be rewritten first.

#### 6a. Rewrite `isConformant.js`

The most complex helper. Currently tests:
- Component has a `displayName`
- Component has `handledProps` array
- Component renders with `as` prop
- Component spreads unhandled props to root element
- Component applies `className` prop
- Component renders children (for non-void components)
- Event handlers are called with correct arguments

RTL replacement approach:
- `displayName`: Direct property check (no rendering needed)
- `handledProps`: Direct property check (no rendering needed)
- `as` prop: `render(<Component as="a" />)` then check `container.firstChild.tagName`
- Prop spreading: `render(<Component data-testid="test" data-custom="value" />)` then check `screen.getByTestId('test').getAttribute('data-custom')`
- `className`: `render(<Component className="custom" />)` then check `container.firstChild.classList.contains('custom')`
- Children: `render(<Component>test child</Component>)` then check `screen.getByText('test child')`
- Event handlers: `render(<Component onClick={spy} />)` then `userEvent.click(element)` then check spy

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\isConformant.js`

#### 6b. Rewrite `forwardsRef.js`

Current: `mount(<Component ref={ref} />)` then check `ref.current` via `.getDOMNode()`
RTL: `render(<Component ref={ref} />)` then check `ref.current` is the expected DOM node

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\forwardsRef.js`

#### 6c. Rewrite `hasUIClassName.js`

Current: `shallow(<Component />).hasClass('ui')` returns true
RTL: `render(<Component />)` then check `container.firstChild.classList.contains('ui')`

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\hasUIClassName.js`

#### 6d. Rewrite `implementsClassNameProps.js` (7 functions)

All className test helpers follow a pattern: render with a prop, check that the correct CSS class appears on the root element.

Functions to rewrite:
- `propKeyOnlyToClassName(Component, propName)` -- e.g., `<Button active />` has class `active`
- `propValueOnlyToClassName(Component, propName, values)` -- e.g., `<Button color="red" />` has class `red`
- `propKeyAndValueToClassName(Component, propName, values)` -- e.g., `<Button floated="left" />` has class `left floated`
- `propKeyOrValueAndKeyToClassName(Component, propName, values)` -- e.g., `<Button animated />` has class `animated`, `<Button animated="fade" />` has class `fade animated`

RTL pattern for all:
```js
const { container } = render(<Component propName={value} />)
expect(container.firstChild).toHaveClass('expected-class')
```

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\implementsClassNameProps.js`

#### 6e. Rewrite `implementsCommonProps.js`

Tests for `as`, `children`, `className` props.

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\implementsCommonProps.js`

#### 6f. Rewrite `implementsCreateMethod.js`

Tests static `Component.create()` shorthand factory method.

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\implementsCreateMethod.js`

#### 6g. Rewrite `implementsShorthandProp.js`

Tests shorthand prop rendering (string, number, element, object, function shorthands).

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\implementsShorthandProp.js`

#### 6h. Rewrite `rendersChildren.js`

Current: `shallow(<Component>{children}</Component>).text()` includes children text
RTL: `render(<Component>{children}</Component>)` then `screen.getByText(childText)`

File: `J:\code\semantic\Semantic-UI-React\test\specs\commonTests\rendersChildren.js`

### 7. Rewrite test utilities (test/utils/)

#### 7a. Remove `nestedShallow.js`

This utility only exists because Enzyme's `shallow()` does not render through Fragment wrappers. RTL renders the full tree, so this is unnecessary.

File: `J:\code\semantic\Semantic-UI-React\test\utils\nestedShallow.js` -- DELETE

#### 7b. Rewrite `sandbox.js`

Current: Creates a Sinon sandbox with auto-restore.

This will be addressed in Phase 10 when Sinon is replaced with Vitest's `vi.fn()`. For now, keep the Sinon sandbox if Phase 10 has not been executed yet. If Phase 10 is executed first, this file will already be gone.

File: `J:\code\semantic\Semantic-UI-React\test\utils\sandbox.js` -- KEEP (temporary)

#### 7c. Rewrite `domEvent.js`

Current: Uses `simulant` to dispatch real DOM events.
RTL replacement: Use `fireEvent` from `@testing-library/react` or `userEvent` from `@testing-library/user-event`.

Replace the entire file with re-exports:
```js
export { fireEvent } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
```

Or, if backward compatibility is needed during gradual migration:
```js
import { fireEvent } from '@testing-library/react'

export const click = (element) => fireEvent.click(element)
export const keyDown = (element, data) => fireEvent.keyDown(element, data)
export const mouseDown = (element, data) => fireEvent.mouseDown(element, data)
// ... etc
```

File: `J:\code\semantic\Semantic-UI-React\test\utils\domEvent.js` -- REWRITE

#### 7d. Keep `consoleUtil.js`

This utility is independent of the test renderer and still useful. No changes needed.

File: `J:\code\semantic\Semantic-UI-React\test\utils\consoleUtil.js` -- KEEP

#### 7e. Keep `assertWithTimeout.js`

Useful for async tests. RTL has `waitFor()` which serves a similar purpose, but this utility can remain for backward compatibility.

File: `J:\code\semantic\Semantic-UI-React\test\utils\assertWithTimeout.js` -- KEEP (consider deprecation note)

#### 7f. Update `index.js`

Remove exports for deleted utilities, add exports for new ones.

File: `J:\code\semantic\Semantic-UI-React\test\utils\index.js` -- MODIFY

### 8. Migrate all 189 test spec files

This is the bulk of the work. Organize the migration by component category for parallelization:

| Category | Test File Count | Complexity |
|----------|----------------|------------|
| addons/ | 10 files | High (Portal, Pagination involve DOM positioning) |
| collections/Breadcrumb/ | 3 files | Low |
| collections/Form/ | 11 files | Medium (form interactions) |
| collections/Grid/ | 3 files | Low |
| collections/Menu/ | 4 files | Medium (active state management) |
| collections/Message/ | 5 files | Low |
| collections/Table/ | 7 files | Low |
| elements/Button/ | 4 files | Low-Medium |
| elements/Container/ | 1 file | Low |
| elements/Divider/ | 1 file | Low |
| elements/Flag/ | 1 file | Low |
| elements/Header/ | 3 files | Low |
| elements/Icon/ | 2 files | Low |
| elements/Image/ | 2 files | Low |
| elements/Input/ | 1 file | Medium (focus management) |
| elements/Label/ | 3 files | Low |
| elements/List/ | 7 files | Low-Medium |
| elements/Loader/ | 1 file | Low |
| elements/Placeholder/ | 5 files | Low |
| elements/Rail/ | 1 file | Low |
| elements/Reveal/ | 2 files | Low |
| elements/Segment/ | 3 files | Low |
| elements/Step/ | 5 files | Low |
| modules/ (Accordion, Checkbox, Dimmer, Dropdown, Embed, Modal, Popup, Progress, Rating, Search, Sidebar, Sticky, Tab, Transition, Visibility) | ~60+ files | HIGH (stateful, portal-based, animation-dependent) |
| views/ (Advertisement, Card, Comment, Feed, Item, Statistic) | ~20+ files | Low-Medium |
| lib/ (hooks, factories, utilities) | ~20 files | Medium |
| docs/ | 1 file (examples-test.js) | Medium |

### 9. Handle the highest-risk component tests

These components have complex Enzyme usage that requires careful RTL translation:

#### 9a. Dropdown tests
- Uses `mount()` extensively (needs real DOM for portal-like behavior)
- Tests search input, filtering, keyboard navigation, multiple selection
- Heavy use of `.simulate()` for keyboard events
- RTL approach: `userEvent.type()` for search, `userEvent.click()` for selection, `userEvent.keyboard()` for navigation

#### 9b. Modal tests
- Portal-based rendering (renders outside component tree)
- Tests open/close transitions, dimmer, keyboard dismiss
- RTL approach: Query `document.body` for portal content, use `screen.getByRole('dialog')`

#### 9c. Popup tests
- Popper.js positioning (uses `@popperjs/core` and `react-popper`)
- Tests trigger events, positioning, hover/click behaviors
- RTL approach: May need `jest-dom` custom matchers or style assertions for positioning

#### 9d. Transition tests
- CSS animation class toggling
- Tests animation lifecycle callbacks
- RTL approach: Use `waitFor()` with class checks, or mock `requestAnimationFrame`

#### 9e. Accordion/Tab tests
- Panel expand/collapse state management
- Tests active index management
- RTL approach: Click panels, check `aria-expanded` or visibility

### 10. Document testing conventions

Create `J:\code\semantic\Semantic-UI-React\test\TESTING.md` (or inline in README) documenting:

1. Standard import patterns:
   ```js
   import { render, screen } from '@testing-library/react'
   import userEvent from '@testing-library/user-event'
   ```

2. Query priority (per RTL guidelines):
   - `getByRole` (preferred)
   - `getByLabelText`
   - `getByText`
   - `getByTestId` (last resort)
   - `container.querySelector` (escape hatch for className checks)

3. Common patterns for Semantic UI React:
   - Checking CSS classes: `expect(container.firstChild).toHaveClass('ui', 'button', 'active')`
   - Checking `as` prop: `expect(container.firstChild.tagName).toBe('A')`
   - Checking children: `expect(screen.getByText('content')).toBeInTheDocument()`
   - Testing events: `await userEvent.click(screen.getByRole('button'))`

---

## Files Affected

| File | Action |
|------|--------|
| `test/setup.js` | REWRITE |
| `test/utils/nestedShallow.js` | DELETE |
| `test/utils/domEvent.js` | REWRITE |
| `test/utils/sandbox.js` | KEEP (temporary, rewritten in Phase 10) |
| `test/utils/index.js` | MODIFY |
| `test/utils/renderComponent.js` | CREATE |
| `test/utils/migrationHelpers.js` | CREATE |
| `test/specs/commonTests/isConformant.js` | REWRITE |
| `test/specs/commonTests/forwardsRef.js` | REWRITE |
| `test/specs/commonTests/hasUIClassName.js` | REWRITE |
| `test/specs/commonTests/implementsClassNameProps.js` | REWRITE |
| `test/specs/commonTests/implementsCommonProps.js` | REWRITE |
| `test/specs/commonTests/implementsCreateMethod.js` | REWRITE |
| `test/specs/commonTests/implementsShorthandProp.js` | REWRITE |
| `test/specs/commonTests/rendersChildren.js` | REWRITE |
| `test/specs/commonTests/classNameHelpers.js` | REWRITE |
| `test/specs/commonTests/commonHelpers.js` | REWRITE |
| `test/specs/commonTests/index.js` | MODIFY |
| All 189 `test/specs/**/*-test.js` files | REWRITE |
| `package.json` | MODIFY (add RTL packages, remove Enzyme packages) |
| `test/TESTING.md` | CREATE |

**Total: ~189 test specs rewritten, ~13 common test files rewritten, ~5 utility files modified/rewritten, 2 files created, 1 file deleted, 1 file modified (package.json)**

---

## Acceptance Criteria

- [ ] `enzyme`, `@wojtekmaj/enzyme-adapter-react-17`, `chai-enzyme`, and `simulant` are removed from devDependencies
- [ ] `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` are in devDependencies
- [ ] `test/setup.js` does not import or reference Enzyme in any way
- [ ] No file in the `test/` directory imports from `enzyme` or `chai-enzyme`
- [ ] All 189 test spec files pass with RTL-based rendering and assertions
- [ ] The `isConformant` common test helper works with RTL and generates equivalent coverage for every component
- [ ] All `forwardsRef` tests pass using RTL rendering
- [ ] All className assertion tests pass using `toHaveClass()` from `@testing-library/jest-dom`
- [ ] Portal-based component tests (Modal, Popup, Confirm, TransitionablePortal) pass with RTL
- [ ] Dropdown search, selection, and keyboard navigation tests pass with `userEvent`
- [ ] Transition/animation tests pass with `waitFor()` or equivalent async utilities
- [ ] No global `shallow`, `mount`, `render`, or `enzyme` variables are referenced anywhere
- [ ] Test coverage is equivalent to or greater than the pre-migration baseline
- [ ] `nestedShallow.js` is deleted and not imported anywhere

---

## Rollback Strategy

1. This phase modifies test files only -- no production source code is changed.
2. To rollback: `git checkout HEAD -- test/ package.json`
3. Run `yarn install` to restore Enzyme dependencies.
4. Verify with `yarn test`.

**Important:** Because this phase rewrites 189+ files, a partial rollback is impractical. The recommended approach is to migrate in branches organized by component category (e.g., `migrate-tests/elements`, `migrate-tests/collections`, `migrate-tests/modules`), merging each branch only after all tests in that category pass.

---

## Notes for AI Agents

1. **Start with the common test helpers, not individual test files.** The 189 test files depend on `test/specs/commonTests/*`. If you rewrite `isConformant.js` first, every component test that calls `common.isConformant(Button)` will automatically use the new RTL-based implementation. This reduces the per-file migration effort dramatically.

2. **The `shallow()` to `render()` conversion is NOT one-to-one.** Enzyme's `shallow()` does not render child components. RTL's `render()` renders the full component tree. This means:
   - Tests that assert on wrapper elements returned by `shallow()` must now query the actual DOM output
   - Tests that check `.type()` of the wrapper must check `container.firstChild.tagName` instead
   - Tests that use `.instance()` to access class component internals cannot be directly translated (the components should be refactored to expose behavior through the DOM instead)

3. **The `chai.should()` chain syntax** (`wrapper.should.have.className('active')`) is deeply embedded in the test suite. This must be systematically replaced with `expect(...).toHaveClass('active')`. The `should` syntax is provided by Chai; the RTL equivalent uses Jest-compatible `expect()`.

4. **Do not blindly add `data-testid` attributes to production components.** While `getByTestId` is available as an escape hatch, prefer using existing DOM structure (roles, tag names, text content, CSS classes) for queries. Adding `data-testid` to the component source code just for testing is an anti-pattern for a UI library.

5. **The `disableLifecycleMethods: true` Enzyme setting** means current shallow tests do not run `useEffect` or `useLayoutEffect`. RTL always runs effects. This means some tests may expose new bugs where effects cause unexpected console warnings or state updates. This is a feature, not a bug -- fix the underlying issues.

6. **Batch the migration by difficulty.** Recommended order:
   - **Batch 1:** Common test helpers (13 files) -- unlocks everything else
   - **Batch 2:** Simple elements (Container, Divider, Flag, Loader, Rail, Reveal, Placeholder) -- ~15 files, low complexity
   - **Batch 3:** Medium elements (Button, Header, Icon, Image, Input, Label, List, Segment, Step) -- ~30 files
   - **Batch 4:** Collections (Breadcrumb, Grid, Message, Table) -- ~20 files, low-medium complexity
   - **Batch 5:** Collections (Form, Menu) -- ~15 files, medium complexity
   - **Batch 6:** Views (Advertisement, Card, Comment, Feed, Item, Statistic) -- ~20 files
   - **Batch 7:** Addons (Radio, Select, TextArea, Pagination) -- ~6 files
   - **Batch 8:** Complex modules (Accordion, Checkbox, Dimmer, Progress, Rating, Embed, Sidebar, Sticky, Tab, Visibility) -- ~30 files
   - **Batch 9:** High-complexity modules (Dropdown, Modal, Popup, Search, Transition) -- ~15 files
   - **Batch 10:** Addons with portals (Portal, PortalInner, Confirm, TransitionablePortal) -- ~5 files
   - **Batch 11:** Library tests (hooks, factories, utilities) -- ~20 files
   - **Batch 12:** Docs examples test -- 1 file

7. **The `syntheticEvent.js` utility** defines event shapes for all React synthetic event types. This is used by `isConformant.js` to verify that event handlers receive correctly-shaped event objects. With RTL + `userEvent`, real synthetic events are dispatched, so the manual shape verification may be unnecessary. Review whether this utility is still needed.

8. **Keep the console override pattern.** The `throwOnConsole` pattern in `test/setup.js` is valuable regardless of the test renderer. It catches unexpected `console.warn` and `console.error` calls that indicate bugs (like missing keys, deprecated API usage, etc.). RTL itself may trigger some expected console output; use `consoleUtil.disableOnce()` or `jest.spyOn(console, 'error').mockImplementation()` in those specific tests.

9. **The `assertWithTimeout` utility** can be replaced by RTL's `waitFor()` in most cases:
   ```js
   // Old:
   assertWithTimeout(() => expect(result).to.equal(true), done)
   // New:
   await waitFor(() => expect(result).toBe(true))
   ```

10. **This phase is intentionally decoupled from Phase 10** (Karma/Mocha to Vitest). The RTL migration can be completed while still using Mocha/Chai as the test runner, as long as the Chai assertions are converted to a compatible format. However, if Phase 10 is done first, the assertion syntax must use Vitest's `expect()` from the start. Coordinate with the Phase 10 plan to avoid double-rewriting assertions.
