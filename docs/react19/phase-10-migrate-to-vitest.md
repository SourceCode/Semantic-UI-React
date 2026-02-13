# Phase 10: Migrate from Karma/Mocha to Vitest

| Field         | Value                                          |
|---------------|------------------------------------------------|
| **Phase ID**  | PHASE-10                                       |
| **Title**     | Migrate from Karma/Mocha to Vitest             |
| **Stage**     | 2 -- Testing Infrastructure                    |
| **Dependencies** | Phase 09 (Enzyme replaced with RTL -- tests must be rendering with RTL before switching the runner) |
| **Complexity** | High                                          |
| **Scope**     | Test runner, assertion library, spy/stub/mock library, test bundling, coverage, all test files |

---

## Objective

Replace the entire Karma + Mocha + Chai + Sinon test stack with Vitest. Remove the browser-based test execution model (Karma launching Puppeteer/Chrome) and replace it with Vitest's Node.js-based execution using `jsdom` or `happy-dom` for DOM simulation. Replace Chai assertions with Vitest's built-in `expect`, replace Sinon spies/stubs with Vitest's `vi.fn()` and `vi.spyOn()`, and remove the Webpack-based test bundling pipeline.

---

## Background

### Current Test Runner Architecture

The test execution flow is:

```
npm run test
  --> cross-env NODE_ENV=test node -r @babel/register ./node_modules/karma/bin/karma start karma.conf.babel.js
    --> Karma reads karma.conf.babel.js
      --> Webpack bundles test/tests.bundle.js (entry point)
        --> test/tests.bundle.js imports test/setup.js (Enzyme config, Chai plugins)
        --> test/tests.bundle.js uses require.context('./', true, /-test\.js$/) to discover all test files
      --> Karma launches ChromeHeadless (via Puppeteer)
      --> Bundled tests execute in the browser
      --> Mocha BDD UI provides describe/it/before/after
      --> Chai provides expect/should assertions
      --> Sinon provides spy/stub/mock
      --> karma-mocha-reporter formats output
      --> karma-coverage generates coverage reports (lcov)
```

### Current Test Infrastructure Files

**Karma Configuration:** `J:\code\semantic\Semantic-UI-React\karma.conf.babel.js`
- Base path: project root
- Browser: ChromeHeadless (via Puppeteer with custom flags: `--disable-setuid-sandbox`, `--no-sandbox`, `--stack-trace-limit 200000`)
- External scripts loaded before tests: `@babel/standalone`, `lodash`, `react` UMD, `react-dom` UMD, `react-dom/server` UMD
- Static file serving: `docs/public/logo.png`, `docs/public/**/*.jpg`, `docs/public/**/*.png`
- Framework: Mocha (BDD UI)
- Preprocessors: Webpack (via `karma-webpack`)
- Reporters: `mocha` (terminal output), `coverage` (lcov)
- Single run mode by default; `--no-single-run` for watch mode
- Custom `formatError` function that strips Webpack bundle paths and node_modules noise

**Test Bundle Entry Point:** `J:\code\semantic\Semantic-UI-React\test\tests.bundle.js`
- Imports `test/setup.js` first
- Uses Webpack's `require.context('./', true, /-test\.js$/)` to dynamically discover all test files
- Supports incremental testing via `__karmaWebpackManifest__` (only re-run changed tests)

**Webpack Karma Config:** `J:\code\semantic\Semantic-UI-React\webpack.karma.config.js`
- Mode: development
- Externals: `@babel/standalone`, `lodash`, `react`, `react-dom`, `react-dom/server`
- Source map: `cheap-source-map`
- Module alias: `semantic-ui-react` -> `src/index.js`
- Module resolution: project root + `node_modules` (allows `import from 'src/...'` and `import from 'test/...'`)
- Babel loader for `.js` files

### Current Assertion and Mock Libraries

**Chai (^4.2.0):**
- `expect()` style assertions: `expect(foo).to.equal('bar')`, `expect(arr).to.have.length(3)`
- `should` style assertions: `wrapper.should.have.className('active')`
- Plugins: `chai-enzyme` (Enzyme-specific matchers), `dirty-chai` (function-style assertions to avoid lint errors), `sinon-chai` (Sinon-specific matchers like `expect(spy).to.have.been.calledOnce()`)

**Sinon (^9.0.2):**
- `sinon.spy()` -- creates a spy that records calls
- `sinon.stub()` -- creates a stub that can control return values
- `sinon.sandbox.create()` -- auto-restore sandbox (used in `test/utils/sandbox.js`)
- `sandbox.spy(object, 'method')` -- spy on specific method
- Used extensively in event handler tests: `const onClick = sandbox.spy()`, then verify `onClick.should.have.been.calledOnce()`

**dirty-chai (^2.0.1):**
- Converts Chai property assertions to function calls: `.to.be.true()` instead of `.to.be.true` (avoids ESLint `no-unused-expressions` violations)

### Current Test Counts

From the file system analysis:
- **189 test spec files** in `test/specs/`
- **13 common test helper files** in `test/specs/commonTests/`
- **11 test utility files** in `test/utils/`
- **1 test setup file** (`test/setup.js`)
- **1 test bundle entry** (`test/tests.bundle.js`)

### Why Vitest

1. **Native ESM support** -- no need for Webpack bundling of tests
2. **Vite-powered** -- uses the same Vite config from Phase 06, ensuring dev/test parity
3. **Jest-compatible API** -- `describe`, `it`, `expect`, `vi.fn()`, `vi.spyOn()` are drop-in replacements
4. **Built-in coverage** via `@vitest/coverage-v8` (replaces `karma-coverage`)
5. **jsdom or happy-dom** for DOM simulation (replaces Puppeteer/ChromeHeadless)
6. **Watch mode** with HMR-speed file re-execution
7. **No browser process** -- tests run in Node.js, dramatically faster startup
8. **TypeScript support** out of the box (no `@babel/register` needed)
9. **`@testing-library/react` integrates natively** with Vitest

---

## Detailed Tasks

### 1. Install Vitest and related packages

Add to devDependencies in `J:\code\semantic\Semantic-UI-React\package.json`:
```
"vitest": "^3.0.0"
"@vitest/coverage-v8": "^3.0.0"
"jsdom": "^25.0.0"
```

`happy-dom` is an alternative to `jsdom` with faster performance but slightly less complete DOM API coverage. Start with `jsdom` for maximum compatibility, as the existing tests may depend on specific DOM behaviors.

### 2. Create vitest.config.ts

Create `J:\code\semantic\Semantic-UI-React\vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // DOM environment
    environment: 'jsdom',

    // Setup files (runs before each test file)
    setupFiles: ['./test/setup.js'],

    // Test file patterns
    include: ['test/specs/**/*-test.{js,ts,jsx,tsx}'],

    // Module resolution aliases (replaces webpack.karma.config.js resolve)
    alias: {
      'semantic-ui-react': path.resolve(__dirname, 'src/index.js'),
      'src': path.resolve(__dirname, 'src'),
      'test': path.resolve(__dirname, 'test'),
    },

    // Global APIs (describe, it, expect, vi) available without import
    globals: true,

    // Coverage configuration (replaces karma-coverage)
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text', 'text-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/index.js',      // Re-export files
        'src/umd.js',           // UMD entry (if still present)
        'src/**/*.d.ts',        // Type declarations
      ],
    },

    // Reporter configuration (replaces karma-mocha-reporter)
    reporters: ['default'],

    // Timeout for individual tests
    testTimeout: 10000,

    // Report slow tests (replaces karma reportSlowerThan: 100)
    slowTestThreshold: 100,

    // Transform configuration
    // Vitest uses Vite's transform pipeline, which handles Babel automatically
    // via @vitejs/plugin-react if configured

    // Watch mode exclude patterns
    watchExclude: ['node_modules', 'dist'],
  },

  // Resolve configuration (shared with Vite)
  resolve: {
    alias: {
      'semantic-ui-react': path.resolve(__dirname, 'src/index.js'),
      'src': path.resolve(__dirname, 'src'),
      'test': path.resolve(__dirname, 'test'),
    },
  },
})
```

### 3. Remove Karma, Mocha, Chai, Sinon, and related packages

Remove from devDependencies in `J:\code\semantic\Semantic-UI-React\package.json`:

```
"karma": "^5.1.0"
"karma-chrome-launcher": "^3.1.0"
"karma-cli": "^2.0.0"
"karma-coverage": "^2.0.2"
"karma-mocha": "^2.0.1"
"karma-mocha-reporter": "^2.2.5"
"karma-webpack": "^4.0.2"
"mocha": "^8.0.1"
"chai": "^4.2.0"
"chai-enzyme": "^1.0.0-beta.1"  (should already be removed in Phase 09)
"dirty-chai": "^2.0.1"
"sinon": "^9.0.2"
"sinon-chai": "^3.5.0"
"puppeteer": "^13.0.1"
```

Total: 13 packages removed.

### 4. Delete Karma and test bundle files

Delete the following files:
- `J:\code\semantic\Semantic-UI-React\karma.conf.babel.js`
- `J:\code\semantic\Semantic-UI-React\test\tests.bundle.js`

`karma.conf.babel.js` is the Karma configuration (103 lines) that sets up:
- ChromeHeadless browser via Puppeteer
- Webpack preprocessing of test files
- Mocha framework integration
- Coverage reporting
- Static file proxying
- Custom error formatting

`test/tests.bundle.js` is the Webpack entry point (13 lines) that:
- Imports `test/setup.js`
- Uses `require.context()` to discover all `*-test.js` files
- Supports incremental test running via `__karmaWebpackManifest__`

Both are completely replaced by Vitest's configuration, which handles test discovery, bundling, and execution natively.

### 5. Update test/setup.js for Vitest

After Phase 09, `test/setup.js` no longer contains Enzyme configuration. It should contain:
- `@testing-library/jest-dom` import (extends `expect` with DOM matchers)
- Console override pattern

For Vitest, update the file:

```js
// test/setup.js
import '@testing-library/jest-dom/vitest'  // Vitest-specific jest-dom integration

// Console override pattern
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

Note: With `globals: true` in `vitest.config.ts`, `beforeEach` and `afterEach` are available globally without import. If `globals: false`, they must be imported from `vitest`.

### 6. Replace Chai assertions with Vitest expect

This is a systematic find-and-replace across all test files. The conversion patterns are:

| Chai (current) | Vitest (target) |
|----------------|-----------------|
| `expect(x).to.equal(y)` | `expect(x).toBe(y)` |
| `expect(x).to.deep.equal(y)` | `expect(x).toEqual(y)` |
| `expect(x).to.be.true()` | `expect(x).toBe(true)` |
| `expect(x).to.be.false()` | `expect(x).toBe(false)` |
| `expect(x).to.be.null()` | `expect(x).toBeNull()` |
| `expect(x).to.be.undefined()` | `expect(x).toBeUndefined()` |
| `expect(x).to.be.an('array')` | `expect(Array.isArray(x)).toBe(true)` |
| `expect(x).to.be.a('string')` | `expect(typeof x).toBe('string')` |
| `expect(x).to.have.length(n)` | `expect(x).toHaveLength(n)` |
| `expect(x).to.include(y)` | `expect(x).toContain(y)` |
| `expect(x).to.have.property('p')` | `expect(x).toHaveProperty('p')` |
| `expect(x).to.have.property('p', v)` | `expect(x).toHaveProperty('p', v)` |
| `expect(x).to.match(/regex/)` | `expect(x).toMatch(/regex/)` |
| `expect(x).to.throw()` | `expect(() => x()).toThrow()` |
| `expect(x).to.throw('msg')` | `expect(() => x()).toThrow('msg')` |
| `expect(x).to.not.equal(y)` | `expect(x).not.toBe(y)` |
| `expect(x).to.be.at.least(n)` | `expect(x).toBeGreaterThanOrEqual(n)` |
| `expect(x).to.be.above(n)` | `expect(x).toBeGreaterThan(n)` |
| `expect(x).to.be.below(n)` | `expect(x).toBeLessThan(n)` |
| `expect(x).to.contain.oneOf(arr)` | Custom matcher or `expect(arr.some(v => x.includes(v))).toBe(true)` |
| `x.should.have.className('c')` | `expect(x).toHaveClass('c')` |
| `x.should.have.tagName('div')` | `expect(x.tagName).toBe('DIV')` |
| `x.should.not.have.prop('p')` | `expect(x).not.toHaveAttribute('p')` |

**dirty-chai conversions:** The `dirty-chai` plugin converts Chai property assertions to function calls (e.g., `.to.be.true()` instead of `.to.be.true`). After converting to Vitest `expect`, this is no longer needed since Vitest uses function-style assertions natively.

### 7. Replace Sinon with Vitest vi

Replace all Sinon usage across test files:

| Sinon (current) | Vitest (target) |
|-----------------|-----------------|
| `sinon.spy()` | `vi.fn()` |
| `sinon.stub()` | `vi.fn()` |
| `sinon.stub().returns(value)` | `vi.fn().mockReturnValue(value)` |
| `sinon.stub().resolves(value)` | `vi.fn().mockResolvedValue(value)` |
| `sinon.stub().rejects(err)` | `vi.fn().mockRejectedValue(err)` |
| `sinon.stub().callsFake(fn)` | `vi.fn().mockImplementation(fn)` |
| `sandbox.spy(obj, 'method')` | `vi.spyOn(obj, 'method')` |
| `sandbox.stub(obj, 'method')` | `vi.spyOn(obj, 'method').mockImplementation(...)` |
| `spy.calledOnce` | `expect(spy).toHaveBeenCalledOnce()` |
| `spy.calledWith(args)` | `expect(spy).toHaveBeenCalledWith(args)` |
| `spy.callCount` | `spy.mock.calls.length` |
| `spy.firstCall.args` | `spy.mock.calls[0]` |
| `spy.restore()` | `vi.restoreAllMocks()` (or automatic via config) |
| `sandbox.restore()` | `vi.restoreAllMocks()` (automatic in afterEach) |
| `expect(spy).to.have.been.calledOnce()` (sinon-chai) | `expect(spy).toHaveBeenCalledOnce()` |
| `expect(spy).to.have.been.calledWith(x)` (sinon-chai) | `expect(spy).toHaveBeenCalledWith(x)` |
| `expect(spy).to.have.been.calledTwice()` | `expect(spy).toHaveBeenCalledTimes(2)` |
| `expect(spy).to.not.have.been.called()` | `expect(spy).not.toHaveBeenCalled()` |

Delete `J:\code\semantic\Semantic-UI-React\test\utils\sandbox.js` and remove its export from `test/utils/index.js`.

Configure Vitest to auto-restore mocks:
```ts
// vitest.config.ts
test: {
  restoreMocks: true,  // Automatically calls vi.restoreAllMocks() after each test
}
```

### 8. Remove the require.context test discovery pattern

Current `test/tests.bundle.js`:
```js
const testsContext = require.context('./', true, /-test\.js$/)
```

This Webpack-specific API is not needed in Vitest. Vitest discovers tests via the `include` glob pattern in `vitest.config.ts`:
```ts
include: ['test/specs/**/*-test.{js,ts,jsx,tsx}']
```

Delete `J:\code\semantic\Semantic-UI-React\test\tests.bundle.js`.

### 9. Remove the @babel/register requirement

Current test script:
```
node -r @babel/register ./node_modules/karma/bin/karma start karma.conf.babel.js
```

The `-r @babel/register` flag is needed because `karma.conf.babel.js` uses ESM import/export syntax, and Karma does not natively support ESM. Vitest handles ESM natively and uses Vite's transform pipeline for Babel, so `@babel/register` is not needed for test execution.

Note: `@babel/register` may still be used by other scripts (build, docs generation). Do not remove the package itself unless confirmed unused elsewhere.

### 10. Update package.json test scripts

Update `J:\code\semantic\Semantic-UI-React\package.json`:

Current:
```json
{
  "pretest": "yarn satisfied && gulp build:docs:docgen",
  "test": "cross-env NODE_ENV=test node -r @babel/register ./node_modules/karma/bin/karma start karma.conf.babel.js",
  "test:watch": "yarn test --no-single-run",
  "ci": "yarn tsd:test && yarn lint && yarn test"
}
```

New:
```json
{
  "pretest": "",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "ci": "yarn tsd:test && yarn lint && yarn test:coverage"
}
```

Changes:
- `"test"`: `vitest run` executes all tests once (equivalent to Karma's `singleRun: true`)
- `"test:watch"`: `vitest` without `run` starts in watch mode (equivalent to Karma's `--no-single-run`)
- `"test:coverage"`: Separate script for coverage generation (replaces `karma-coverage` reporter)
- `"pretest"`: The `gulp build:docs:docgen` step may still be needed if the `examples-test.js` test depends on generated component info. Update to `node scripts/build-docgen.mjs` if Phase 06 is complete, or remove if the test does not need it.
- `"ci"`: Updated to use `test:coverage` for CI builds

### 11. Handle external script dependencies in tests

The current `karma.conf.babel.js` loads several scripts as externals before the test bundle:
```js
files: [
  './node_modules/@babel/standalone/babel.js',
  './node_modules/lodash/lodash.js',
  './node_modules/react/umd/react.development.js',
  './node_modules/react-dom/umd/react-dom.development.js',
  './node_modules/react-dom/umd/react-dom-server.browser.development.js',
]
```

And the Webpack config declares corresponding externals:
```js
externals: {
  '@babel/standalone': 'Babel',
  lodash: '_',
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/server': 'ReactDOMServer',
}
```

In Vitest, these are handled differently:
- **React and ReactDOM**: Imported normally via `import React from 'react'` -- Vitest resolves them from `node_modules`
- **Lodash**: Imported normally via `import _ from 'lodash'`
- **@babel/standalone**: Only used in the docs examples test (`test/specs/docs/examples-test.js`) for live code compilation. In Vitest, import it normally or mock it if not needed for unit tests
- **react-dom/server**: Imported normally when needed

No external script loading is needed. Remove any test code that depends on global variables (`window.React`, `window.ReactDOM`, `window._`, `window.Babel`).

### 12. Handle static file serving

The Karma config serves static files from `docs/public/`:
```js
{ pattern: 'docs/public/logo.png', watched: false, included: false, served: true },
{ pattern: 'docs/public/**/*.jpg', watched: false, included: false, served: true },
{ pattern: 'docs/public/**/*.png', watched: false, included: false, served: true },
```

And sets up proxies:
```js
proxies: fs.readdirSync(paths.docsPublic()).reduce((acc, file) => { ... }, {})
```

If any tests load images or static files via URL, this must be handled differently in Vitest. Options:
- Mock image/file imports in `vitest.config.ts`
- Use `vi.mock()` for specific static file imports
- Most likely, only the docs `examples-test.js` depends on this. Check if it can be mocked or skipped.

### 13. Handle the docs examples-test.js

`J:\code\semantic\Semantic-UI-React\test\specs\docs\examples-test.js` is a special test that validates all documentation examples compile and render correctly. It likely:
- Reads generated component info JSON (from `gulp build:docs:docgen`)
- Dynamically imports example files
- Renders each example and checks for errors

This test needs special attention because:
- It may depend on `require.context()` (Webpack-specific)
- It may depend on `@babel/standalone` for runtime compilation
- It may depend on generated JSON files that require a build step

Convert the `require.context` usage to Vitest's `import.meta.glob`:
```js
// Old (Webpack):
const examplesContext = require.context('../../docs/src/examples', true, /\.js$/)

// New (Vitest/Vite):
const examples = import.meta.glob('../../docs/src/examples/**/*.js', { eager: true })
```

### 14. Configure coverage to match current baseline

Current coverage config (from `karma.conf.babel.js`):
```js
coverageReporter: {
  reporters: [{ type: 'lcov', dir: 'coverage', subdir: '.' }],
  includeAllSources: true,
}
```

Vitest coverage config (in `vitest.config.ts`):
```ts
coverage: {
  provider: 'v8',
  reporter: ['lcov', 'text', 'text-summary'],
  reportsDirectory: 'coverage',
  include: ['src/**/*.{js,ts,jsx,tsx}'],
  all: true,  // Equivalent to includeAllSources
}
```

Update `J:\code\semantic\Semantic-UI-React\codecov.yml` if it references specific coverage file paths.

### 15. Update .gitignore for Vitest

Verify that `J:\code\semantic\Semantic-UI-React\test\.gitignore` does not interfere with Vitest output. Check if the `coverage/` directory is already gitignored at the root level.

### 16. Remove faker dependency if unused

`faker` (^4.1.0) is imported in several test files for generating random test data:
```js
import faker from 'faker'
// ...
common.forwardsRef(Button, { requiredProps: { label: faker.lorem.word() }, tagName: 'button' })
```

The `faker` package (v4) is abandoned. If still needed, replace with `@faker-js/faker` (the community fork). If only used for simple random strings, replace with inline strings to reduce dependencies.

---

## Files Affected

| File | Action |
|------|--------|
| `karma.conf.babel.js` | DELETE |
| `test/tests.bundle.js` | DELETE |
| `test/utils/sandbox.js` | DELETE |
| `vitest.config.ts` | CREATE |
| `test/setup.js` | MODIFY (update imports for Vitest) |
| `test/utils/index.js` | MODIFY (remove sandbox export) |
| `package.json` | MODIFY (devDependencies, scripts) |
| `codecov.yml` | MODIFY (if coverage paths change) |
| All 189 `test/specs/**/*-test.js` files | MODIFY (Chai -> expect, Sinon -> vi) |
| All 13 `test/specs/commonTests/*.js` files | MODIFY (Chai -> expect, Sinon -> vi) |
| `test/utils/consoleUtil.js` | POSSIBLY MODIFY (may not need changes) |
| `test/utils/assertWithTimeout.js` | POSSIBLY MODIFY (replace with waitFor) |
| `test/utils/syntheticEvent.js` | REVIEW (may be removable) |

**Total: 2 files deleted, 1 file created, ~205+ files modified**

---

## Acceptance Criteria

- [ ] `npm run test` executes all tests via Vitest (not Karma)
- [ ] `npm run test:watch` starts Vitest in watch mode
- [ ] `npm run test:coverage` generates an lcov coverage report in `coverage/`
- [ ] All 189 test spec files pass with Vitest
- [ ] No imports of `chai`, `sinon`, `sinon-chai`, `dirty-chai`, or `mocha` exist in any test file
- [ ] No imports of `karma`, `karma-*` exist in any configuration file
- [ ] `karma.conf.babel.js` is deleted
- [ ] `test/tests.bundle.js` is deleted
- [ ] `test/utils/sandbox.js` is deleted (Sinon sandbox replaced by `vi.restoreAllMocks()`)
- [ ] All Chai assertion chains (`expect(x).to.equal(y)`, `should.have.className`) are replaced with Vitest `expect` assertions
- [ ] All Sinon spies/stubs (`sinon.spy()`, `sandbox.spy()`) are replaced with Vitest `vi.fn()` / `vi.spyOn()`
- [ ] Coverage percentage is equivalent to or greater than the pre-migration baseline
- [ ] Tests execute in under 60 seconds (compared to current Karma+Webpack startup overhead)
- [ ] No `puppeteer`, `webpack` (for test purposes), or `@babel/register` references remain in test-related scripts
- [ ] The `vitest.config.ts` correctly resolves module aliases (`src/*`, `test/*`, `semantic-ui-react`)
- [ ] `jsdom` environment is configured and all DOM-dependent tests pass
- [ ] `import.meta.glob` replaces any `require.context` usage in test files

---

## Rollback Strategy

1. This phase modifies test infrastructure and test files only -- no production source code is changed.
2. To rollback: `git checkout HEAD -- karma.conf.babel.js test/ package.json codecov.yml`
3. Delete `vitest.config.ts`.
4. Run `yarn install` to restore Karma/Mocha/Chai/Sinon dependencies.
5. Verify with `yarn test`.

**Important:** Like Phase 09, the large number of file modifications makes partial rollback impractical. Use feature branches and merge only when all tests pass.

---

## Notes for AI Agents

1. **Phase 09 (Enzyme to RTL) and Phase 10 (Karma/Mocha to Vitest) can be combined** into a single execution if desired. The reason they are separated is to isolate the rendering layer change (Enzyme -> RTL) from the runner/assertion layer change (Mocha/Chai/Sinon -> Vitest). If executing both at once, follow the Vitest assertion syntax from the start to avoid rewriting assertions twice.

2. **The Chai-to-Vitest assertion conversion is highly automatable.** The patterns are regular and predictable. Consider writing a codemod (using jscodeshift or a simple regex-based script) to handle the bulk conversion:
   ```
   .to.equal(x)         -> .toBe(x)
   .to.deep.equal(x)    -> .toEqual(x)
   .to.have.length(x)   -> .toHaveLength(x)
   .to.be.true()        -> .toBe(true)
   .to.be.false()       -> .toBe(false)
   .to.include(x)       -> .toContain(x)
   .to.have.property(x) -> .toHaveProperty(x)
   ```
   Run the codemod first, then manually fix edge cases.

3. **The Sinon-to-Vitest conversion is also highly automatable.** Key patterns:
   ```
   sinon.spy()                    -> vi.fn()
   sandbox.spy()                  -> vi.fn()
   sandbox.spy(obj, 'method')     -> vi.spyOn(obj, 'method')
   spy.should.have.been.calledOnce()          -> expect(spy).toHaveBeenCalledOnce()
   spy.should.have.been.calledWith(x, y)      -> expect(spy).toHaveBeenCalledWith(x, y)
   spy.should.not.have.been.called()          -> expect(spy).not.toHaveBeenCalled()
   expect(spy).to.have.been.calledOnce()      -> expect(spy).toHaveBeenCalledOnce()
   ```

4. **The `globals: true` setting in vitest.config.ts** makes `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` available globally without imports. This matches the current Mocha/Chai pattern where these are all global. If you prefer explicit imports for type safety:
   ```js
   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
   ```
   This is a team preference decision. Using globals minimizes the diff.

5. **The `require.context` usage in `test/tests.bundle.js` is Webpack-specific** and does not exist in Vitest. Vitest discovers tests via glob patterns in the config. The `test/tests.bundle.js` file is deleted entirely -- there is no equivalent needed.

6. **Watch mode works differently.** Karma's `--no-single-run` keeps the browser open and re-runs on file changes. Vitest's watch mode (`vitest` without `run`) detects changes via Vite's file watcher and re-runs only affected tests. This is significantly faster because there is no browser startup overhead.

7. **The `@babel/standalone` dependency in tests** is only needed for the docs examples test that compiles example code at runtime. In Vitest, this can be imported as a regular module. Check if `@babel/standalone` works in a Node.js `jsdom` environment -- it was designed for browsers. If not, mock it or use `@babel/core` (the Node.js version) instead.

8. **Puppeteer removal.** After this phase, `puppeteer` is no longer needed for tests. However, check if Cypress (used for e2e tests) depends on Puppeteer. If not, remove it from devDependencies entirely. Note: `puppeteer` v13 is quite old; if it must remain for any reason, it should be upgraded.

9. **The `faker` package.** The original `faker` (v4.1.0) was abandoned by its maintainer in 2022. The community fork is `@faker-js/faker`. If test data generation is still needed, replace:
   ```
   "faker": "^4.1.0"  -->  "@faker-js/faker": "^9.0.0"
   ```
   And update imports:
   ```js
   // Old: import faker from 'faker'
   // New: import { faker } from '@faker-js/faker'
   ```

10. **Execution time improvement.** Current test execution involves: Webpack bundling all test files (~30-60s for 189 files), launching ChromeHeadless via Puppeteer (~5-10s), executing tests in browser (~30-60s), generating coverage (~10s). Total: ~2-3 minutes. Vitest eliminates the bundling and browser launch steps, reducing total execution to ~30-60 seconds for the same test count. This is a significant developer experience improvement.

11. **The `.should` syntax from Chai** is set up via `chai.should()` in `test/setup.js`, which adds a `should` property to `Object.prototype`. This is a global mutation that must be removed. No equivalent exists in Vitest -- all assertions use `expect()`.

12. **If Phase 06 is not yet complete**, `webpack.karma.config.js` may still exist. This phase should delete it regardless, as the Karma infrastructure it supports is being removed. Coordinate with Phase 06 to avoid conflicts.
