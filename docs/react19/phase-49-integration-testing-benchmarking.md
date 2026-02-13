# Phase 49: Final Integration Testing and Performance Benchmarking

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-49                                                                 |
| **Title**        | Final Integration Testing and Performance Benchmarking                   |
| **Stage**        | 10 -- Documentation, Build & Release                                     |
| **Dependencies** | All previous phases (1-48)                                               |
| **Complexity**   | High                                                                     |
| **Scope**        | Full test suite, performance benchmarks, accessibility, cross-browser, SSR |

---

## Objective

Conduct comprehensive integration testing and performance benchmarking of the fully migrated Semantic-UI-React v4.0.0 library. This phase verifies that all components work correctly after the complete migration from React 17 class components to React 19 function components, from Webpack/Gulp to Vite/Rollup, from semantic-ui-css to self-contained CSS, and from Karma/Mocha/Enzyme to Vitest/RTL. It establishes performance baselines, validates accessibility, confirms tree-shaking, and stress-tests complex interactive components.

---

## Background

### What Has Changed

By the time Phase 49 begins, the following transformations will have been applied:

1. **React version**: 17 to 19 (peerDependency)
2. **Component architecture**: Class components to function components with hooks
3. **Build system**: Webpack 4 + Gulp 4 to Rollup + Vite
4. **Test framework**: Karma + Mocha + Enzyme to Vitest + React Testing Library
5. **CSS**: External `semantic-ui-css` to self-contained `src/styles/`
6. **Theming**: None to CSS custom properties + ThemeProvider
7. **TypeScript**: `.d.ts` declarations only to TypeScript source (after Phase 15)
8. **ESLint**: babel-eslint + eslint v7 to flat config + eslint v9
9. **Browser targets**: IE11+ to Chrome 92+, Firefox 90+, Safari 15.4+
10. **New features**: React Compiler, form actions, ThemeProvider, StylesheetLink, preload utilities

Each of these changes introduces potential regression vectors. This phase systematically validates every surface area.

### What Needs Testing

| Category | Tool | Pass Criteria |
|----------|------|---------------|
| Unit tests | Vitest + RTL | 100% of existing tests pass |
| TypeScript | tsc | Zero type errors |
| Component rendering | Vitest + jsdom | Every component renders without errors |
| Event handling | RTL + fireEvent | All interactive behaviors work |
| Accessibility | axe-core + Vitest | Zero critical/serious violations |
| Performance | Custom benchmarks | No regression vs. v3 baseline |
| Bundle size | size-limit + esbuild | Size reduction or neutral |
| Tree-shaking | Rollup analysis | Single-component imports work |
| SSR | renderToString | All components render server-side |
| Cross-browser | Playwright | Chrome, Firefox, Safari, Edge |
| Memory | Vitest + heap analysis | No memory leaks |
| Visual regression | Cypress + Percy | Screenshots match expected output |
| React Compiler | Compiler output verification | All components compile correctly |

---

## Detailed Tasks

### 1. Run the full Vitest test suite and fix remaining failures

Execute the complete test suite:

```bash
yarn test --run --reporter=verbose
```

Categorize any failures:
- **Migration artifacts**: Tests that reference class component patterns (e.g., `wrapper.instance()`, `wrapper.state()`) that were not fully updated in Phase 10
- **Behavioral changes**: React 19 behavior differences (e.g., `act()` batching changes, `setState` synchronous flushing)
- **CSS dependency**: Tests that assume `semantic-ui-css` class names (these should work since we preserved class names)
- **Timing issues**: Tests with `setTimeout`/`requestAnimationFrame` that behave differently in React 19's concurrent mode

Fix all failures. Track fix count and categories.

### 2. Run TypeScript type checking

```bash
yarn tsd:test
```

Verify:
- All `.d.ts` declarations compile without errors
- All exported types are reachable from `index.d.ts`
- Consumer type patterns work (e.g., `const ButtonProps: ButtonProps = { ... }`)
- New types (ThemeProvider, useFormAction, StylesheetLink, etc.) are included

### 3. Component render smoke test

Create `J:\code\semantic\Semantic-UI-React\test\integration\render-all-components.test.tsx`:

```tsx
import * as React from 'react'
import { render } from '@testing-library/react'
import * as SUI from '../../src/index'

const components = [
  ['Accordion', () => <SUI.Accordion panels={[]} />],
  ['Breadcrumb', () => <SUI.Breadcrumb sections={[]} />],
  ['Button', () => <SUI.Button>Click</SUI.Button>],
  ['Card', () => <SUI.Card />],
  ['Checkbox', () => <SUI.Checkbox />],
  ['Comment', () => <SUI.Comment />],
  ['Confirm', () => <SUI.Confirm open={false} />],
  ['Container', () => <SUI.Container>Content</SUI.Container>],
  ['Dimmer', () => <SUI.Dimmer active={false} />],
  ['Divider', () => <SUI.Divider />],
  ['Dropdown', () => <SUI.Dropdown options={[]} />],
  ['Embed', () => <SUI.Embed id="test" source="youtube" active={false} />],
  ['Feed', () => <SUI.Feed />],
  ['Flag', () => <SUI.Flag name="us" />],
  ['Form', () => <SUI.Form />],
  ['Grid', () => <SUI.Grid />],
  ['Header', () => <SUI.Header>Title</SUI.Header>],
  ['Icon', () => <SUI.Icon name="home" />],
  ['Image', () => <SUI.Image src="test.png" />],
  ['Input', () => <SUI.Input />],
  ['Item', () => <SUI.Item />],
  ['Label', () => <SUI.Label>Tag</SUI.Label>],
  ['List', () => <SUI.List />],
  ['Loader', () => <SUI.Loader />],
  ['Menu', () => <SUI.Menu />],
  ['Message', () => <SUI.Message>Info</SUI.Message>],
  ['Modal', () => <SUI.Modal open={false}>Content</SUI.Modal>],
  ['Pagination', () => <SUI.Pagination totalPages={10} activePage={1} />],
  ['Placeholder', () => <SUI.Placeholder />],
  ['Popup', () => <SUI.Popup trigger={<SUI.Button>Open</SUI.Button>} content="Info" />],
  ['Progress', () => <SUI.Progress percent={50} />],
  ['Rail', () => <SUI.Rail position="left">Rail</SUI.Rail>],
  ['Rating', () => <SUI.Rating />],
  ['Reveal', () => <SUI.Reveal animated="fade"><SUI.Reveal.Content visible>A</SUI.Reveal.Content><SUI.Reveal.Content hidden>B</SUI.Reveal.Content></SUI.Reveal>],
  ['Search', () => <SUI.Search />],
  ['Segment', () => <SUI.Segment>Content</SUI.Segment>],
  ['Sidebar', () => <SUI.Sidebar visible={false}>Side</SUI.Sidebar>],
  ['Statistic', () => <SUI.Statistic />],
  ['Step', () => <SUI.Step.Group><SUI.Step>One</SUI.Step></SUI.Step.Group>],
  ['Tab', () => <SUI.Tab panes={[{ menuItem: 'Tab 1', render: () => <div>Content</div> }]} />],
  ['Table', () => <SUI.Table><SUI.Table.Body><SUI.Table.Row><SUI.Table.Cell>Cell</SUI.Table.Cell></SUI.Table.Row></SUI.Table.Body></SUI.Table>],
  // New components
  ['ThemeProvider', () => <SUI.ThemeProvider>Themed</SUI.ThemeProvider>],
  ['StylesheetLink', () => <SUI.StylesheetLink href="/test.css" />],
]

describe('All components render without errors', () => {
  components.forEach(([name, renderFn]) => {
    it(`${name} renders without throwing`, () => {
      expect(() => render(renderFn())).not.toThrow()
    })
  })
})
```

### 4. Performance benchmarking

Create `J:\code\semantic\Semantic-UI-React\benchmark\` directory with benchmarking scripts:

**4a. Mount time benchmark** (`benchmark/mount-time.mjs`):

Measure initial mount time for each component, averaged over 1000 iterations:

```js
import { renderToString } from 'react-dom/server'
import React from 'react'
import * as SUI from '../dist/es/index.js'

const components = {
  Button: () => React.createElement(SUI.Button, { primary: true }, 'Click'),
  Dropdown: () => React.createElement(SUI.Dropdown, {
    options: Array.from({ length: 100 }, (_, i) => ({ key: i, text: `Option ${i}`, value: i })),
    placeholder: 'Select',
  }),
  Table: () => React.createElement(SUI.Table, null,
    React.createElement(SUI.Table.Body, null,
      Array.from({ length: 100 }, (_, i) =>
        React.createElement(SUI.Table.Row, { key: i },
          React.createElement(SUI.Table.Cell, null, `Cell ${i}`)
        )
      )
    )
  ),
  Form: () => React.createElement(SUI.Form, null,
    Array.from({ length: 20 }, (_, i) =>
      React.createElement(SUI.Form.Input, { key: i, label: `Field ${i}` })
    )
  ),
  Modal: () => React.createElement(SUI.Modal, { open: true },
    React.createElement(SUI.Modal.Header, null, 'Header'),
    React.createElement(SUI.Modal.Content, null, 'Content'),
  ),
}

for (const [name, factory] of Object.entries(components)) {
  const iterations = 1000
  const start = performance.now()

  for (let i = 0; i < iterations; i++) {
    renderToString(factory())
  }

  const elapsed = performance.now() - start
  console.log(`${name}: ${(elapsed / iterations).toFixed(3)}ms avg (${iterations} iterations)`)
}
```

**4b. Re-render benchmark** (`benchmark/rerender-time.mjs`):

Measure re-render time for stateful components (Dropdown search, controlled Input, etc.).

**4c. Memory benchmark** (`benchmark/memory.mjs`):

Measure heap usage before and after mounting/unmounting 1000 component instances to detect memory leaks.

### 5. Bundle size comparison

Run the size-limit measurement and compare against v3 baseline:

```bash
yarn build:size
npx size-limit
```

Create a comparison table:

| Fixture | v3 Size | v4 Size | Delta |
|---------|---------|---------|-------|
| Single Button import | ? KB | ? KB | ? |
| Single Dropdown import | ? KB | ? KB | ? |
| Full library import | ? KB | ? KB | ? |
| CSS (full bundle) | 145 KB (semantic-ui-css gzip) | ? KB | ? |

Document results in `J:\code\semantic\Semantic-UI-React\docs\react19\benchmarks\bundle-size-comparison.md`.

### 6. Tree-shaking verification

Create `J:\code\semantic\Semantic-UI-React\benchmark\tree-shaking\` with test fixtures:

**Fixture 1: Single component import**
```js
import { Button } from 'semantic-ui-react'
export default Button
```

**Fixture 2: Two unrelated components**
```js
import { Button, Table } from 'semantic-ui-react'
export { Button, Table }
```

**Fixture 3: Full import**
```js
import * as SUI from 'semantic-ui-react'
export default SUI
```

Build each fixture with Rollup and verify:
- Fixture 1 does NOT include Dropdown, Modal, or other unrelated component code
- Fixture 2 includes only Button and Table code
- Fixture 3 includes all components
- No `semantic-ui-css` code is included in any fixture
- Lodash functions are individually imported (not the entire library)

### 7. Accessibility audit

Create `J:\code\semantic\Semantic-UI-React\test\integration\accessibility.test.tsx`:

```tsx
import * as React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

const accessibleComponents = [
  ['Button', <Button>Click me</Button>],
  ['Button with icon', <Button icon="home" content="Home" />],
  ['Checkbox', <Checkbox label="Accept terms" />],
  ['Form with labels', (
    <Form>
      <Form.Input label="Name" id="name" />
      <Form.Input label="Email" id="email" type="email" />
    </Form>
  )],
  ['Input with label', <Input label="Search" id="search" />],
  ['Menu with active item', (
    <Menu>
      <Menu.Item active>Home</Menu.Item>
      <Menu.Item>About</Menu.Item>
    </Menu>
  )],
  ['Message', <Message header="Info" content="Information message" />],
  ['Modal', (
    <Modal open>
      <Modal.Header>Title</Modal.Header>
      <Modal.Content>Content</Modal.Content>
      <Modal.Actions>
        <Button>OK</Button>
      </Modal.Actions>
    </Modal>
  )],
  ['Pagination', <Pagination totalPages={10} activePage={1} />],
  ['Progress', <Progress percent={50} label="50% complete" />],
  ['Rating', <Rating maxRating={5} rating={3} />],
  ['Search', <Search />],
  ['Table', (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>John</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )],
]

describe('Accessibility (axe-core)', () => {
  accessibleComponents.forEach(([name, element]) => {
    it(`${name} has no critical accessibility violations`, async () => {
      const { container } = render(element)
      const results = await axe(container, {
        rules: {
          // Disable rules that require full page context
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          region: { enabled: false },
        },
      })
      expect(results).toHaveNoViolations()
    })
  })
})
```

### 8. Cross-browser testing with Playwright

Create `J:\code\semantic\Semantic-UI-React\test\integration\cross-browser.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Cross-browser component rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the documentation site or a test page
    await page.goto('http://localhost:3000/elements/button')
  })

  test('Button renders correctly', async ({ page }) => {
    const button = page.locator('.ui.button').first()
    await expect(button).toBeVisible()
    await expect(button).toHaveCSS('cursor', 'pointer')
  })

  test('Dropdown opens and closes', async ({ page }) => {
    await page.goto('http://localhost:3000/modules/dropdown')
    const dropdown = page.locator('.ui.dropdown').first()
    await dropdown.click()
    await expect(page.locator('.ui.dropdown .menu.visible')).toBeVisible()
  })

  test('Modal opens and closes', async ({ page }) => {
    await page.goto('http://localhost:3000/modules/modal')
    // Find a "Show Modal" button in the examples
    const trigger = page.locator('button:has-text("Show")').first()
    await trigger.click()
    await expect(page.locator('.ui.modal.visible')).toBeVisible()
  })
})
```

Configure Playwright to test against Chrome, Firefox, Safari, and Edge:

Create `J:\code\semantic\Semantic-UI-React\playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'test/integration',
  testMatch: '**/*.spec.ts',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'edge', use: { ...devices['Desktop Edge'] } },
  ],
  webServer: {
    command: 'yarn preview:docs',
    port: 3000,
    reuseExistingServer: true,
  },
})
```

### 9. SSR compatibility testing

Create `J:\code\semantic\Semantic-UI-React\test\integration\ssr.test.tsx`:

```tsx
import * as React from 'react'
import { renderToString, renderToPipeableStream } from 'react-dom/server'
import * as SUI from '../../src/index'

const ssrComponents = [
  ['Button', () => <SUI.Button primary>Click</SUI.Button>],
  ['Dropdown', () => <SUI.Dropdown options={[{ key: 1, text: 'A', value: 1 }]} />],
  ['Form', () => <SUI.Form><SUI.Form.Input label="Name" /></SUI.Form>],
  ['Grid', () => <SUI.Grid><SUI.Grid.Column>Col</SUI.Grid.Column></SUI.Grid>],
  ['Menu', () => <SUI.Menu><SUI.Menu.Item>Home</SUI.Menu.Item></SUI.Menu>],
  ['Modal', () => <SUI.Modal open={false}>Content</SUI.Modal>],
  ['Table', () => <SUI.Table><SUI.Table.Body><SUI.Table.Row><SUI.Table.Cell>Cell</SUI.Table.Cell></SUI.Table.Row></SUI.Table.Body></SUI.Table>],
  ['ThemeProvider', () => <SUI.ThemeProvider theme="default">Themed</SUI.ThemeProvider>],
]

describe('Server-Side Rendering', () => {
  ssrComponents.forEach(([name, factory]) => {
    it(`${name} renders to string without errors`, () => {
      expect(() => renderToString(factory())).not.toThrow()
    })

    it(`${name} produces valid HTML string`, () => {
      const html = renderToString(factory())
      expect(html).toContain('<')
      expect(html).not.toContain('undefined')
      expect(html).not.toContain('NaN')
    })
  })

  it('renderToPipeableStream works for the full library', (done) => {
    const App = () => (
      <SUI.Container>
        <SUI.Header>Test</SUI.Header>
        <SUI.Button>Click</SUI.Button>
      </SUI.Container>
    )

    let html = ''
    const { pipe } = renderToPipeableStream(<App />, {
      onAllReady() {
        // Create a writable stream to capture output
        const writable = new (require('stream').Writable)({
          write(chunk, encoding, callback) {
            html += chunk.toString()
            callback()
          },
        })
        writable.on('finish', () => {
          expect(html).toContain('ui container')
          expect(html).toContain('ui header')
          expect(html).toContain('ui button')
          done()
        })
        pipe(writable)
      },
    })
  })
})
```

### 10. React Compiler optimization verification

Create `J:\code\semantic\Semantic-UI-React\test\integration\compiler.test.tsx`:

Verify that the React Compiler's memoization works correctly:

```tsx
import * as React from 'react'
import { render, act } from '@testing-library/react'

// Test that compiler-optimized components skip unnecessary re-renders
describe('React Compiler Optimization', () => {
  it('Button does not re-render children when parent re-renders with same props', () => {
    let renderCount = 0
    const TrackingButton = (props) => {
      renderCount++
      return <SUI.Button {...props} />
    }

    const Parent = () => {
      const [, setCount] = React.useState(0)
      return (
        <>
          <button onClick={() => setCount(c => c + 1)}>Trigger</button>
          <TrackingButton primary>Click</TrackingButton>
        </>
      )
    }

    const { getByText } = render(<Parent />)
    const initialRenderCount = renderCount

    act(() => { getByText('Trigger').click() })
    act(() => { getByText('Trigger').click() })

    // With compiler optimization, the TrackingButton should not re-render
    // because its props haven't changed
    expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 1)
  })
})
```

### 11. Stress testing complex components

Create `J:\code\semantic\Semantic-UI-React\test\integration\stress.test.tsx`:

Test components under heavy load to identify performance bottlenecks and memory leaks:

**Dropdown with 10,000 options:**
```tsx
it('Dropdown handles 10000 options without crashing', async () => {
  const options = Array.from({ length: 10000 }, (_, i) => ({
    key: i, text: `Option ${i}`, value: i,
  }))
  const { getByRole } = render(<SUI.Dropdown options={options} search selection />)
  // Type to filter
  const input = getByRole('textbox')
  await userEvent.type(input, 'Option 999')
  // Verify filtered results appear
})
```

**Table with 1000 rows:**
```tsx
it('Table renders 1000 rows without excessive render time', () => {
  const start = performance.now()
  render(
    <SUI.Table>
      <SUI.Table.Body>
        {Array.from({ length: 1000 }, (_, i) => (
          <SUI.Table.Row key={i}>
            <SUI.Table.Cell>Cell {i}</SUI.Table.Cell>
          </SUI.Table.Row>
        ))}
      </SUI.Table.Body>
    </SUI.Table>
  )
  const elapsed = performance.now() - start
  expect(elapsed).toBeLessThan(5000) // Should render within 5 seconds
})
```

**Rapid Modal open/close:**
```tsx
it('Modal handles rapid open/close without memory leaks', async () => {
  const TestModal = () => {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <SUI.Button onClick={() => setOpen(true)}>Open</SUI.Button>
        <SUI.Modal open={open} onClose={() => setOpen(false)}>
          <SUI.Modal.Content>Content</SUI.Modal.Content>
        </SUI.Modal>
      </>
    )
  }

  const { getByText } = render(<TestModal />)
  for (let i = 0; i < 100; i++) {
    act(() => { getByText('Open').click() })
    // Modal close
    act(() => {
      const closeButton = document.querySelector('.ui.modal .close')
      if (closeButton) closeButton.click()
    })
  }
  // If we get here without crashing, the test passes
})
```

### 12. Generate final benchmark report

Create `J:\code\semantic\Semantic-UI-React\docs\react19\benchmarks\final-report.md`:

```markdown
# v4.0.0 Migration Benchmark Report

## Test Suite Results
- Total tests: XXXX
- Passed: XXXX
- Failed: 0
- Skipped: XX

## Bundle Size
| Metric | v3 | v4 | Delta |
|--------|----|----|-------|
| Full library (gzip) | XX KB | XX KB | -XX% |
| Single Button (gzip) | XX KB | XX KB | -XX% |
| CSS bundle (gzip) | 145 KB | XX KB | -XX% |

## Performance (avg of 1000 iterations)
| Component | v3 Mount | v4 Mount | Delta |
|-----------|----------|----------|-------|
| Button | X.XXms | X.XXms | -XX% |
| Dropdown (100 options) | X.XXms | X.XXms | -XX% |
| Table (100 rows) | X.XXms | X.XXms | -XX% |

## Accessibility
- Components tested: XX
- Critical violations: 0
- Serious violations: 0

## Cross-Browser
- Chrome: PASS
- Firefox: PASS
- Safari: PASS
- Edge: PASS

## SSR
- All components render server-side: PASS
- renderToPipeableStream: PASS
```

---

## Files Affected

| File | Action |
|------|--------|
| `test/integration/render-all-components.test.tsx` | CREATE |
| `test/integration/accessibility.test.tsx` | CREATE |
| `test/integration/ssr.test.tsx` | CREATE |
| `test/integration/compiler.test.tsx` | CREATE |
| `test/integration/stress.test.tsx` | CREATE |
| `test/integration/cross-browser.spec.ts` | CREATE |
| `benchmark/mount-time.mjs` | CREATE |
| `benchmark/rerender-time.mjs` | CREATE |
| `benchmark/memory.mjs` | CREATE |
| `benchmark/tree-shaking/` (3 fixtures) | CREATE |
| `playwright.config.ts` | CREATE |
| `docs/react19/benchmarks/final-report.md` | CREATE |
| `docs/react19/benchmarks/bundle-size-comparison.md` | CREATE |

**Total: ~15 files created, 0 files modified**

---

## Acceptance Criteria

- [ ] Full Vitest test suite passes with zero failures
- [ ] TypeScript type checking passes with zero errors (`yarn tsd:test`)
- [ ] All 42+ components render without errors in the smoke test
- [ ] Performance benchmarks show no regression vs. v3 baseline (or improvement)
- [ ] Bundle size is equal to or smaller than v3
- [ ] Single-component tree-shaking verified (importing Button does not include Dropdown code)
- [ ] axe-core accessibility audit reports zero critical/serious violations on all tested components
- [ ] Cross-browser tests pass on Chrome, Firefox, Safari, and Edge
- [ ] SSR compatibility verified for all components (renderToString and renderToPipeableStream)
- [ ] React Compiler optimization is verified to reduce unnecessary re-renders
- [ ] Stress tests pass (Dropdown with 10K options, Table with 1K rows, rapid Modal open/close)
- [ ] No memory leaks detected in mount/unmount cycles
- [ ] Final benchmark report is generated and stored in `docs/react19/benchmarks/`
- [ ] All CSS from Phase 40 renders components visually identical to v3 (verified by Percy screenshots)

---

## Rollback Strategy

This phase is purely diagnostic and additive -- it creates test files and benchmark scripts. There is nothing to rollback. If tests reveal failures, the fixes belong to the phases that introduced the regressions (Phase 15 for TypeScript, Phase 17 for hooks, Phase 40 for CSS, etc.).

If critical regressions are found that cannot be fixed:
1. Document the regression and affected components
2. Create GitHub issues for each regression
3. Tag the release as `4.0.0-alpha.X` instead of `4.0.0-rc.1` until regressions are resolved

---

## Notes for AI Agents

1. **This phase is DIAGNOSTIC, not constructive.** It does not change any library code. It creates tests and benchmarks that validate the work done in all previous phases. If tests fail, the fix belongs in the phase that introduced the regression.

2. **Run tests in stages.** Start with the smoke test (Task 3), then unit tests (Task 1), then integration tests. Do not attempt to run everything at once -- failures cascade and obscure root causes.

3. **The accessibility audit (Task 7) will likely find violations.** Many components in the original Semantic UI have accessibility gaps (e.g., Dropdown not announcing selected values, Rating not having keyboard support). Categorize violations as "pre-existing" vs. "introduced by migration" and only block the release for migration-introduced violations.

4. **Cross-browser testing (Task 8) requires Playwright installation.** The Playwright test runner downloads browser binaries. Ensure the CI environment has sufficient disk space and network access.

5. **SSR testing (Task 9) may reveal issues with browser-specific APIs.** Components that use `window`, `document`, or `addEventListener` directly will fail in SSR. The `isBrowser()` utility in `J:\code\semantic\Semantic-UI-React\src\lib\isBrowser.js` should gate these calls, but verify.

6. **Memory leak testing (Task 11)** is best done with Node.js `--expose-gc` flag and `global.gc()` calls to force garbage collection between mount/unmount cycles. Compare heap size before and after 1000 mount/unmount cycles.

7. **The React Compiler verification (Task 10)** tests that the compiler's memoization actually reduces re-renders. This is a behavioral test, not a correctness test. If the compiler opts out of memoizing a component (via heuristics), the test may see more re-renders than expected. This is not necessarily a failure -- check the compiler's opt-out log.

8. **The final benchmark report (Task 12)** is a key deliverable for the v4.0.0 release notes. It demonstrates the value of the migration to stakeholders. Include specific numbers, not just "improved" or "no regression."

9. **Visual regression testing** should compare screenshots of every component variant against a baseline captured from the v3 docs site. This catches CSS differences that unit tests cannot detect.

10. **Coordinate with Phase 50** (Release Preparation). Phase 49's benchmark report and test results feed directly into Phase 50's release notes and CHANGELOG.
