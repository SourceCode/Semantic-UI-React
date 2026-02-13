# Semantic-UI-React: React 19.2 Migration Master Plan

**Version:** 3.0.0-beta.2 -> 3.0.0
**Target:** React 19.2
**Created:** 2026-02-12
**Status:** Planning

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Codebase Profile](#current-codebase-profile)
3. [Stage 1: Foundation and Tooling (Phases 1-8)](#stage-1-foundation-and-tooling)
4. [Stage 2: Testing Infrastructure (Phases 9-12)](#stage-2-testing-infrastructure)
5. [Stage 3: Core Library Modernization (Phases 13-18)](#stage-3-core-library-modernization)
6. [Stage 4: Component Migration - Elements (Phases 19-24)](#stage-4-component-migration---elements)
7. [Stage 5: Component Migration - Collections (Phases 25-28)](#stage-5-component-migration---collections)
8. [Stage 6: Component Migration - Modules (Phases 29-35)](#stage-6-component-migration---modules)
9. [Stage 7: Component Migration - Views and Addons (Phases 36-39)](#stage-7-component-migration---views-and-addons)
10. [Stage 8: CSS and Styling Modernization (Phases 40-42)](#stage-8-css-and-styling-modernization)
11. [Stage 9: New React 19 Features (Phases 43-46)](#stage-9-new-react-19-features)
12. [Stage 10: Documentation, Build, and Release (Phases 47-50)](#stage-10-documentation-build-and-release)
13. [Dependency Graph](#dependency-graph)
14. [Parallel Execution Map](#parallel-execution-map)
15. [Risk Register](#risk-register)
16. [Strict TypeScript & Perfectionist Addendum](#strict-typescript--perfectionist-addendum)

---

## Executive Summary

This document defines the complete 50-phase migration plan for upgrading Semantic-UI-React from its current React 16/17/18 compatibility baseline to React 19.2. The migration encompasses tooling modernization, testing infrastructure replacement, **full source conversion from JavaScript to strict TypeScript with zero `any`/`unknown` tolerance**, removal of deprecated React patterns (forwardRef wrappers, PropTypes, class components, cloneElement), adoption of new React 19 features, CSS modernization, and documentation rebuild. **All code must adhere to the strictest perfectionist ESLint ruleset** ([see Addendum](./ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md)).

The codebase is in strong starting condition: all functional components already use forwardRef, there are no legacy lifecycle methods, no findDOMNode usage, no string refs, no legacy context, and no createFactory calls. The five remaining class components are well-identified. This positions the project favorably for migration.

---

## Current Codebase Profile

| Metric | Value |
|---|---|
| Source files (JS) | 257 |
| Primary components | 49+ |
| Subcomponents | 50+ |
| React.forwardRef components | 158 |
| Class components | 5 (Transition, Dropdown, Search, AccordionPanel, ModernAutoControlledComponent) |
| PropTypes usage | 162 files, ~1,541 occurrences |
| defaultProps usage | 2 files |
| React.cloneElement usage | 12 files |
| Custom hooks | 7 (useAutoControlledValue, useMergedRefs, useEventCallback, useIsomorphicLayoutEffect, useForceUpdate, useClassNamesOnNode, usePrevious) |
| Test framework | Karma + Mocha + Enzyme (203 test specs) |
| Build system | Webpack 4, Babel 7, Gulp 4 |
| CSS approach | External semantic-ui-css, className-based via clsx + 7 classNameBuilder utilities |
| Runtime dependencies | lodash, prop-types, react-is, react-popper, @popperjs/core, shallowequal, keyboard-key, @semantic-ui-react/event-stack, clsx |
| TypeScript | 213 .d.ts definition files, JS source with TS declarations |
| Documentation | react-static 5 |
| CI | CircleCI + GitHub Actions (pr-health.yml, size-limit.yml) |
| Peer dependencies | react ^16.8.0 \|\| ^17.0.0 \|\| ^18.0.0 |
| Legacy code | IE11 support only in src/modules/Modal/utils/index.js (isLegacy, getLegacyStyles) |
| Absent legacy patterns | No legacy lifecycle methods, no findDOMNode, no string refs, no legacy context, no createFactory |

### Key Directories

```
src/
  addons/       - Confirm, Pagination, Portal, Radio, Select, TextArea, TransitionablePortal
  collections/  - Breadcrumb, Form, Grid, Menu, Message, Table
  elements/     - Button, Container, Divider, Flag, Header, Icon, Image, Input, Label, List, Loader, Placeholder, Rail, Reveal, Segment, Step
  lib/          - Shared utilities, hooks, factories, classNameBuilders, ModernAutoControlledComponent
  modules/      - Accordion, Checkbox, Dimmer, Dropdown, Embed, Modal, Popup, Progress, Rating, Search, Sidebar, Sticky, Tab, Transition
  views/        - Advertisement, Card, Comment, Feed, Item, Statistic
test/
  specs/        - Component test specs (mirrors src/ structure)
  utils/        - Test utilities (sandbox, syntheticEvent, domEvent, etc.)
docs/
  src/          - Documentation app source (react-static 5)
gulp/
  tasks/        - dist.mjs, docs.mjs
```

---

## Stage 1: Foundation and Tooling

### Phase 01: Project Scaffolding and Branch Setup

| Field | Value |
|---|---|
| **ID** | phase-01 |
| **Complexity** | Low |
| **Dependencies** | None |
| **Parallel Group** | A (standalone) |

**Description:**
Create the migration branch, establish the working environment, and set up tracking infrastructure for the migration.

**Tasks:**
- Create a long-lived `react-19-migration` branch from `master`
- Create a `docs/react19/` directory for migration tracking documents (this plan, phase checklists, decision records)
- Add a `.migration-status.json` file at repo root to track per-phase completion status
- Update `.gitignore` if needed for any new tooling artifacts
- Create GitHub milestone "React 19 Migration" and create one issue per stage
- Tag the current `master` as `pre-react-19-baseline` for rollback reference

**Files affected:**
- `.gitignore`
- `docs/react19/` (new directory)
- `.migration-status.json` (new file)

---

### Phase 02: Update Node.js, Package Manager, and Engine Requirements

| Field | Value |
|---|---|
| **ID** | phase-02 |
| **Complexity** | Low |
| **Dependencies** | phase-01 |
| **Parallel Group** | B |

**Description:**
Upgrade the minimum Node.js version to 18.x (LTS) or 20.x (LTS), update the package manager, and set engine requirements in package.json. React 19 requires Node.js 18+.

**Tasks:**
- Add `"engines"` field to `package.json`: `{ "node": ">=18.0.0" }`
- Update `.circleci/config.yml` to use Node 20 Docker image
- Update `.github/workflows/pr-health.yml` and `.github/workflows/size-limit.yml` to use Node 20
- Evaluate migration from Yarn 1 (Classic) to Yarn 4 (Berry) or pnpm; if staying with Yarn Classic, pin version
- Update `yarn.lock` after all dependency changes
- Remove `"satisfied"` dev dependency if no longer needed, or update it
- Update `husky` from v4 to v9 (v4 uses `package.json` hooks config, v9 uses `.husky/` directory)
- Update `lint-staged` to latest

**Files affected:**
- `package.json` (engines, devDependencies, husky config)
- `yarn.lock`
- `.circleci/config.yml`
- `.github/workflows/pr-health.yml`
- `.github/workflows/size-limit.yml`
- `.husky/` (new directory if upgrading husky)

---

### Phase 03: Update React and ReactDOM to 19.2

| Field | Value |
|---|---|
| **ID** | phase-03 |
| **Complexity** | Medium |
| **Dependencies** | phase-02 |
| **Parallel Group** | B |

**Description:**
Update React, ReactDOM, and react-is peer and dev dependencies to version 19.2. Update react-test-renderer (note: deprecated in React 19, will be removed in Phase 9). Update the `resolutions` block.

**Tasks:**
- Update `peerDependencies`: `"react": "^18.0.0 || ^19.0.0"`, `"react-dom": "^18.0.0 || ^19.0.0"` (drop 16 and 17 support)
- Update `devDependencies`: `"react": "^19.2.0"`, `"react-dom": "^19.2.0"`
- Update `react-is` dependency: `"react-is": "^19.0.0"` (or evaluate removal since React 19 changes isValidElementType)
- Remove `react-test-renderer` from devDependencies (deprecated in React 19)
- Update `resolutions` block to pin React 19.2 versions
- Remove `react-hot-loader` from devDependencies (incompatible with React 19; React Fast Refresh is built-in with modern bundlers)
- Update `@fluentui/react-component-event-listener` or replace it if incompatible with React 19
- Update `react-popper` to a version compatible with React 19, or evaluate replacement with Floating UI
- Update `karma.conf.babel.js` to reference correct React UMD paths for React 19 (the `files` array loads UMD bundles directly)
- Run the test suite and catalog all failures for triage across later phases

**Files affected:**
- `package.json` (peerDependencies, dependencies, devDependencies, resolutions)
- `yarn.lock`
- `karma.conf.babel.js` (UMD file paths)

---

### Phase 04: Update @types/react and @types/react-dom

| Field | Value |
|---|---|
| **ID** | phase-04 |
| **Complexity** | Low |
| **Dependencies** | phase-03 |
| **Parallel Group** | C |

**Description:**
Update TypeScript type definitions for React 19. React 19 types include significant changes: `ref` is a regular prop, `ReactNode` includes `Promise`, `useRef` requires an argument, and many deprecated types are removed.

**Tasks:**
- Update `@types/react` from `18.0.5` to `^19.0.0` in devDependencies
- Add `@types/react-dom` `^19.0.0` to devDependencies (if not already present)
- Audit all 213 `.d.ts` files for compatibility with new React 19 types
- Update `ref` prop types: in React 19 types, `ref` is a regular prop on component types, not a special attribute. Remove `React.Ref<T>` patterns that are no longer needed
- Update `ReactNode` usage if any `.d.ts` files rely on `ReactNode` not including `Promise`
- Update `tsconfig.json`: change `"jsx": "react"` to `"jsx": "react-jsx"` to match the new JSX transform
- Add `"skipLibCheck": true` temporarily if needed to unblock migration
- Run `tsc --noEmit` and fix all type errors
- Run `yarn tsd:test` and fix all failures

**Files affected:**
- `package.json` (devDependencies)
- `tsconfig.json`
- All 213 `src/**/*.d.ts` files (audit and update)
- `index.d.ts` (root type entry point)
- `test/typings.tsx`

---

### Phase 05: Update Babel Configuration for New JSX Transform

| Field | Value |
|---|---|
| **ID** | phase-05 |
| **Complexity** | Medium |
| **Dependencies** | phase-03 |
| **Parallel Group** | C |

**Description:**
Migrate from the classic React JSX transform (`React.createElement`) to the new automatic JSX runtime (`react/jsx-runtime`). This eliminates the need to import React in every file that uses JSX and reduces bundle size.

**Tasks:**
- Update `.babel-preset.js`: change `@babel/preset-react` configuration to use `{ "runtime": "automatic" }` instead of the default classic runtime
- Remove `react-hot-loader/babel` plugin from the development environment config (already being removed in Phase 03)
- Remove `import React from 'react'` or `import * as React from 'react'` from all source files that only use JSX and do not reference `React` directly (e.g., `React.forwardRef`, `React.Component`, `React.createRef`). Files that reference React APIs directly will still need the import until those APIs are removed in later phases
- Update `babel-plugin-transform-react-remove-prop-types` -- evaluate if this still works with the automatic JSX runtime, or if it should be removed (PropTypes will be fully removed in Phase 13)
- Update `babel-plugin-transform-react-handled-props` -- evaluate compatibility with automatic runtime
- Update the `browsers` target list in `.babel-preset.js`: remove IE11 from targets (`'not ie < 11'` and `'not ie_mob <= 11'`), modernize to `'defaults, not dead'`
- Remove `@babel/plugin-proposal-export-default-from` if converting to TypeScript (Phase 14), or update if keeping Babel
- Verify all three build outputs still work: CommonJS (`dist/commonjs/`), ES modules (`dist/es/`), UMD (`dist/umd/`)

**Files affected:**
- `.babel-preset.js`
- `.babelrc`
- All 257 `src/**/*.js` files (remove unnecessary `import React` statements)
- `webpack.karma.config.js`
- `webpack.umd.config.js`

---

### Phase 06: Migrate from Webpack 4 to Modern Bundler

| Field | Value |
|---|---|
| **ID** | phase-06 |
| **Complexity** | High |
| **Dependencies** | phase-05 |
| **Parallel Group** | D |

**Description:**
Replace Webpack 4 with a modern bundler. The recommended path is Vite (for development and docs) plus tsup or unbuild (for library distribution builds). Webpack 4 does not support the new JSX transform natively and has significant performance limitations. The Gulp-based build pipeline will also be modernized.

**Tasks:**
- Evaluate bundler options: Vite 6 + Rollup (for docs dev server and library build), Rspack (Webpack-compatible drop-in), or tsup (for library builds only). Recommended: Vite for docs, tsup for library distribution
- Create `vite.config.ts` for the documentation site development server
- Create `tsup.config.ts` for library builds producing CommonJS, ESM, and UMD outputs
- Migrate `webpack.karma.config.js` functionality -- this will be replaced entirely when Karma is removed in Phase 10
- Migrate `webpack.umd.config.js` UMD build to the new bundler
- Remove `webpack`, `webpack-cli`, `webpack-dev-middleware`, `webpack-bundle-analyzer`, `terser-webpack-plugin`, `terser-webpack-plugin-legacy`, `babel-loader`, `raw-loader`, `imports-loader` from devDependencies
- Evaluate Gulp 4 task replacement: `gulp/tasks/dist.mjs` and `gulp/tasks/docs.mjs` can potentially be replaced with npm scripts calling tsup and vite directly. If Gulp adds no value beyond orchestration, remove `gulp`, `gulp-load-plugins`, `gulp-util` from devDependencies and replace `gulpfile.mjs` with npm scripts
- Update `package.json` scripts: `build`, `build:dist`, `build:docs`, `start`, `build:size`
- Update `@size-limit/file` configuration if applicable
- Preserve `sideEffects: false` for tree-shaking in the new bundler config
- Verify the three output formats: `dist/commonjs/index.js`, `dist/es/index.js`, `dist/umd/semantic-ui-react.min.js`
- Ensure source maps work correctly in all outputs

**Files affected:**
- `package.json` (scripts, devDependencies)
- `vite.config.ts` (new)
- `tsup.config.ts` (new)
- `webpack.karma.config.js` (remove after Phase 10)
- `webpack.umd.config.js` (remove)
- `gulpfile.mjs` (rewrite or remove)
- `gulp/tasks/dist.mjs` (rewrite or remove)
- `gulp/tasks/docs.mjs` (rewrite or remove)
- `config.js` (rewrite or inline into new config)
- `static.webpack.js` (remove -- react-static specific)

---

### Phase 07: Update ESLint to Flat Config and eslint-plugin-react-hooks v6

| Field | Value |
|---|---|
| **ID** | phase-07 |
| **Complexity** | Medium |
| **Dependencies** | phase-05 |
| **Parallel Group** | D |

**Description:**
Migrate ESLint from v7 with `.eslintrc` JSON config to ESLint v9 with the flat config format (`eslint.config.js`). Update eslint-plugin-react-hooks to v6 which enforces the Rules of Hooks for React 19 patterns including the React Compiler.

**Tasks:**
- Update `eslint` from `^7.5.0` to `^9.0.0`
- Replace `babel-eslint` parser with `@babel/eslint-parser` (or `@typescript-eslint/parser` if source is TypeScript by this point)
- Update `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` from `^3.7.1` to `^8.0.0`
- Update `eslint-plugin-react` from `^7.20.4` to latest v7
- Update `eslint-plugin-react-hooks` from `^4.0.8` to `^6.0.0`
- Replace `eslint-config-airbnb` with equivalent flat config rules or migrate to `@eslint/js` recommended + custom rules
- Update `eslint-config-prettier` to latest compatible version
- Remove `eslint-plugin-mocha` (Mocha will be removed in Phase 10)
- Remove `eslint-plugin-cypress` or update if keeping Cypress
- Convert `.eslintrc` (root) to `eslint.config.js` (flat config format)
- Remove `cypress/.eslintrc`, `docs/.eslintrc`, `docs/src/examples/.eslintrc`, `test/.eslintrc` and consolidate into the single flat config with appropriate file-pattern overrides
- Update `package.json` lint scripts
- Run `eslint .` and fix all new violations

**Files affected:**
- `package.json` (devDependencies, scripts)
- `.eslintrc` (remove)
- `cypress/.eslintrc` (remove)
- `docs/.eslintrc` (remove)
- `docs/src/examples/.eslintrc` (remove)
- `test/.eslintrc` (remove)
- `eslint.config.js` (new, flat config)

---

### Phase 08: Update TypeScript Configuration

| Field | Value |
|---|---|
| **ID** | phase-08 |
| **Complexity** | Low |
| **Dependencies** | phase-04 |
| **Parallel Group** | C |

**Description:**
Update `tsconfig.json` to support React 19 types and prepare for the JavaScript-to-TypeScript source conversion in Phase 14.

**Tasks:**
- Update `tsconfig.json` compiler options:
  - `"jsx": "react-jsx"` (was `"react"`)
  - `"lib": ["dom", "dom.iterable", "es2020"]` (was `["dom", "es2015"]`)
  - `"target": "es2020"` (add explicit target)
  - `"moduleResolution": "bundler"` (was `"node"`, modern resolution for new bundler)
  - Add `"resolveJsonModule": true`
  - Add `"isolatedModules": true` (required for most modern bundlers)
  - Add `"esModuleInterop": true`
  - Keep `"strict": true`
- Create `tsconfig.build.json` extending base config for library builds with appropriate `include`/`exclude`
- Create `tsconfig.test.json` extending base config for test files
- Update `include` to cover both `.d.ts` and future `.ts`/`.tsx` source files
- Verify `yarn tsd:test` passes with updated config
- Update TypeScript from `^4.5.5` to `^5.6.0`

**Files affected:**
- `tsconfig.json`
- `tsconfig.build.json` (new)
- `tsconfig.test.json` (new)
- `package.json` (devDependencies -- TypeScript version)

---

## Stage 2: Testing Infrastructure

### Phase 09: Replace Enzyme with React Testing Library

| Field | Value |
|---|---|
| **ID** | phase-09 |
| **Complexity** | High |
| **Dependencies** | phase-03 |
| **Parallel Group** | E |

**Description:**
Replace Enzyme with React Testing Library (RTL). Enzyme does not support React 18+ and has no React 19 adapter. This is the single largest effort in the testing migration. The project has 203 test spec files plus 14 common test helpers that use Enzyme's `shallow()`, `mount()`, and component-internal APIs extensively.

**Tasks:**
- Add `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` to devDependencies
- Remove `enzyme`, `@wojtekmaj/enzyme-adapter-react-17`, `chai-enzyme` from devDependencies
- Rewrite `test/setup.js` to remove Enzyme configuration and add RTL setup (configure cleanup, custom render wrapper)
- Migrate all 14 common test helpers in `test/specs/commonTests/`:
  - `isConformant.js` -- the most critical; tests component conformance (className, props pass-through, event handlers, ref forwarding). Rewrite to use RTL render + screen queries
  - `forwardsRef.js` -- rewrite using RTL `render()` with `React.createRef()` (later simplified when forwardRef is removed)
  - `hasSubcomponents.js` -- static property tests, no rendering needed
  - `hasUIClassName.js` -- rewrite to use RTL `container` queries
  - `hasValidTypings.js` -- no rendering, TypeScript-only checks
  - `implementsClassNameProps.js` -- rewrite to use RTL `container.firstChild`
  - `implementsCommonProps.js` -- rewrite to use RTL render
  - `implementsCreateMethod.js` -- static method tests, minimal rendering
  - `implementsShorthandProp.js` -- rewrite shorthand rendering tests
  - `rendersChildren.js` -- rewrite to use RTL `screen.getByText`
  - `classNameHelpers.js`, `commonHelpers.js`, `tsHelpers.js` -- update utilities
- Migrate test utilities in `test/utils/`:
  - `sandbox.js` -- replace `sinon.sandbox` patterns with `vi.fn()` / `jest.fn()` (deferred to Phase 10 if using Vitest)
  - `syntheticEvent.js` -- replace with `@testing-library/user-event` or `fireEvent`
  - `domEvent.js` -- replace `simulant` with RTL `fireEvent`
  - `consoleUtil.js` -- update console spy patterns
  - `nestedShallow.js` -- remove entirely (shallow rendering concept does not exist in RTL)
  - `assertNodeContains.js`, `assertWithTimeout.js`, `wait.js` -- evaluate and rewrite
- Begin migrating component test specs (203 files across `test/specs/addons/`, `collections/`, `elements/`, `lib/`, `modules/`, `views/`). This work runs concurrently with component migration phases 19-39; each component phase should include its test migration
- Remove `simulant` from devDependencies
- Remove `dirty-chai` from devDependencies (Chai-specific)

**Files affected:**
- `package.json` (devDependencies)
- `test/setup.js`
- `test/tests.bundle.js`
- All 14 files in `test/specs/commonTests/`
- All 11 files in `test/utils/`
- All 203 files in `test/specs/` (migrated incrementally with component phases)

---

### Phase 10: Migrate from Karma/Mocha to Vitest

| Field | Value |
|---|---|
| **ID** | phase-10 |
| **Complexity** | High |
| **Dependencies** | phase-06, phase-09 |
| **Parallel Group** | E |

**Description:**
Replace Karma + Mocha test runner with Vitest. Vitest is Vite-native, supports ESM, provides built-in coverage, and has a Jest-compatible API. This eliminates the Karma browser-based test execution model.

**Tasks:**
- Add `vitest`, `@vitest/coverage-v8`, `jsdom` (or `happy-dom`) to devDependencies
- Create `vitest.config.ts` with:
  - `test.environment: 'jsdom'`
  - `test.globals: true` (for `describe`, `it`, `expect` without imports)
  - `test.setupFiles: ['./test/setup.ts']`
  - `test.include: ['test/specs/**/*.{test,spec}.{js,ts,tsx}']`
  - CSS handling (mock or passthrough)
  - Path aliases matching the bundler config
- Remove Karma-related devDependencies: `karma`, `karma-chrome-launcher`, `karma-cli`, `karma-coverage`, `karma-mocha`, `karma-mocha-reporter`, `karma-webpack`
- Remove Mocha-related devDependencies: `mocha`
- Remove Chai-related devDependencies: `chai`, `chai-enzyme`, `dirty-chai`
- Remove Sinon-related devDependencies: `sinon`, `sinon-chai` (replace with `vi.fn()`, `vi.spyOn()`)
- Remove `puppeteer` from devDependencies (was used for Karma headless Chrome)
- Remove `karma.conf.babel.js`
- Remove `webpack.karma.config.js`
- Remove `test/tests.bundle.js` (Karma webpack entry point)
- Update `test/setup.js` -> `test/setup.ts`:
  - Remove Enzyme adapter setup
  - Add `@testing-library/jest-dom` matchers via `expect.extend` or setupFiles
  - Configure JSDOM globals
- Convert Mocha/Chai assertion patterns to Vitest/Jest patterns across all test files:
  - `expect(x).to.equal(y)` -> `expect(x).toBe(y)`
  - `expect(x).to.have.been.calledOnce` -> `expect(x).toHaveBeenCalledOnce()`
  - `expect(x).to.contain(y)` -> `expect(x).toContain(y)`
  - `expect(x).to.be.true` -> `expect(x).toBe(true)`
  - `sandbox.spy()` -> `vi.fn()`
- Update `package.json` scripts:
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`
  - `"test:coverage": "vitest run --coverage"`
- Update CI configs to use new test commands

**Files affected:**
- `package.json` (scripts, devDependencies)
- `vitest.config.ts` (new)
- `karma.conf.babel.js` (remove)
- `webpack.karma.config.js` (remove)
- `test/tests.bundle.js` (remove)
- `test/setup.js` -> `test/setup.ts`
- All 203 test spec files (assertion pattern conversion)

---

### Phase 11: Update Test Utilities and Helpers

| Field | Value |
|---|---|
| **ID** | phase-11 |
| **Complexity** | Medium |
| **Dependencies** | phase-09, phase-10 |
| **Parallel Group** | F |

**Description:**
Finalize the rewrite of shared test utilities and common test helpers to use React Testing Library + Vitest idioms. Ensure all common test patterns are working before component-specific test migration.

**Tasks:**
- Rewrite `test/utils/index.js` to export the new utility set
- Create `test/utils/render.ts`: custom RTL `render()` wrapper that provides any needed context providers
- Create `test/utils/userEvent.ts`: pre-configured `@testing-library/user-event` setup
- Rewrite `test/utils/domEvent.js` -> `test/utils/domEvent.ts`: use `fireEvent` from RTL for DOM events
- Rewrite `test/utils/consoleUtil.js` -> `test/utils/consoleUtil.ts`: use `vi.spyOn(console, 'error')` etc.
- Remove `test/utils/sandbox.js` (Sinon sandbox replaced by Vitest mocking)
- Remove `test/utils/nestedShallow.js` (shallow rendering removed)
- Remove `test/utils/syntheticEvent.js` (replaced by userEvent/fireEvent)
- Rewrite `test/utils/assertNodeContains.js` -> use RTL `within()` queries
- Rewrite `test/utils/assertWithTimeout.js` -> use RTL `waitFor()`
- Rewrite `test/utils/wait.js` -> use RTL `waitFor()` or `vi.advanceTimersByTime()`
- Finalize all common test rewrites from Phase 09 and verify they pass
- Create a test verification script that runs just the common tests to validate the infrastructure

**Files affected:**
- `test/utils/index.js` -> `test/utils/index.ts`
- `test/utils/render.ts` (new)
- `test/utils/userEvent.ts` (new)
- `test/utils/domEvent.js` (rewrite)
- `test/utils/consoleUtil.js` (rewrite)
- `test/utils/sandbox.js` (remove)
- `test/utils/nestedShallow.js` (remove)
- `test/utils/syntheticEvent.js` (remove)
- `test/utils/assertNodeContains.js` (rewrite)
- `test/utils/assertWithTimeout.js` (rewrite)
- `test/utils/wait.js` (rewrite)
- `test/utils/getComponentName.js` (update)
- `test/utils/getComponentProps.js` (update)

---

### Phase 12: Fix act() Imports

| Field | Value |
|---|---|
| **ID** | phase-12 |
| **Complexity** | Low |
| **Dependencies** | phase-10 |
| **Parallel Group** | F |

**Description:**
In React 19, `act()` is exported from `react` instead of `react-dom/test-utils`. The `react-dom/test-utils` module is removed entirely. Update all imports across test files.

**Tasks:**
- Search all test files for `import { act } from 'react-dom/test-utils'` and replace with `import { act } from 'react'`
- Search for `import * as ReactTestUtils from 'react-dom/test-utils'` and replace individual usage
- Search for `ReactDOM.act` patterns and replace
- If using RTL, note that RTL wraps most operations in `act()` automatically -- remove manual `act()` calls that are no longer necessary
- Search for `react-dom/test-utils` in `test/setup.js` (or `.ts`) and remove
- Verify no remaining references to `react-dom/test-utils` exist in the codebase

**Files affected:**
- Any test files importing from `react-dom/test-utils`
- `test/setup.js` (or `test/setup.ts`)

---

## Stage 3: Core Library Modernization

### Phase 13: Remove PropTypes - Migrate to TypeScript Runtime Validation

| Field | Value |
|---|---|
| **ID** | phase-13 |
| **Complexity** | High |
| **Dependencies** | phase-08 |
| **Parallel Group** | G |

**Description:**
Remove all PropTypes from the library. React 19 no longer checks PropTypes at runtime. The library currently has ~1,541 PropTypes occurrences across 162 files. The existing `.d.ts` type definitions already provide TypeScript consumers with type safety. For JavaScript consumers, PropTypes will simply be absent (matching the direction of the React ecosystem).

**Tasks:**
- Remove `prop-types` from `dependencies` in `package.json`
- Remove `babel-plugin-transform-react-remove-prop-types` from devDependencies and `.babel-preset.js` (no longer needed since PropTypes are gone entirely)
- Remove `babel-plugin-transform-react-handled-props` from devDependencies and `.babel-preset.js`
- Remove all `import PropTypes from 'prop-types'` statements (162 files)
- Remove all `ComponentName.propTypes = { ... }` blocks (162 files)
- Remove `src/lib/customPropTypes.js` (custom PropTypes validators: `as`, `contentShorthand`, `demand`, `disallow`, `every`, `givenProps`, `suggest`, etc.)
- Remove `customPropTypes` export from `src/lib/index.js`
- Remove the PropTypes validation in `ModernAutoControlledComponent.js` constructor (lines 78-142 that validate autoControlledProps against propTypes)
- Update `src/lib/SUI.js` if it exports PropTypes-related constants
- Keep the `.d.ts` type definitions as the single source of type information
- Remove any PropTypes-related common tests in `test/specs/commonTests/isConformant.js` (PropTypes conformance checks)
- Update documentation examples that reference PropTypes

**Files affected:**
- `package.json` (dependencies, devDependencies)
- `.babel-preset.js`
- `src/lib/customPropTypes.js` (remove)
- `src/lib/index.js` (remove customPropTypes export)
- `src/lib/ModernAutoControlledComponent.js` (remove PropTypes validation logic)
- All 162 files with PropTypes across `src/addons/`, `src/collections/`, `src/elements/`, `src/modules/`, `src/views/`
- `test/specs/commonTests/isConformant.js` (update)

---

### Phase 14: Convert Source from JavaScript to TypeScript

| Field | Value |
|---|---|
| **ID** | phase-14 |
| **Complexity** | High |
| **Dependencies** | phase-13, phase-08 |
| **Parallel Group** | G |

**Description:**
Convert the 257 JavaScript source files to TypeScript. The existing 213 `.d.ts` declaration files provide the type contracts; this phase merges the declarations into the source. After conversion, the separate `.d.ts` files are generated from the TypeScript source rather than maintained manually.

**Tasks:**
- Rename all `src/**/*.js` files to `src/**/*.ts` or `src/**/*.tsx` (`.tsx` for files containing JSX)
- Merge type information from each corresponding `.d.ts` file into the source file as proper TypeScript interfaces and type annotations
- Add explicit types for all component props interfaces (e.g., `interface ButtonProps extends StrictButtonProps { [key: string]: any }`)
- Type all custom hooks in `src/lib/hooks/`:
  - `useAutoControlledValue.ts` -- generic `<T>` for value type
  - `useMergedRefs.ts` -- generic ref types
  - `useEventCallback.ts` -- generic callback signature
  - `useIsomorphicLayoutEffect.ts` -- no generics needed
  - `useForceUpdate.ts` -- no generics needed
  - `useClassNamesOnNode.ts` -- DOM element types
  - `usePrevious.ts` -- generic `<T>`
- Type all utility functions in `src/lib/`:
  - `factories.ts` -- `createShorthand()`, `createShorthandFactory()` with generics
  - `classNameBuilders.ts` -- simple string operations
  - `childrenUtils.ts`
  - `getComponentType.ts`
  - `getUnhandledProps.ts`
  - `htmlPropsUtils.ts`
  - `doesNodeContainClick.ts`
  - `isBrowser.ts`
  - `isRefObject.ts`
  - `leven.ts`
  - `numberToWord.ts`
  - `normalizeTransitionDuration.ts`
  - `objectDiff.ts`
  - `makeDebugger.ts`
  - `SUI.ts`
  - `eventStack/` directory
  - `createPaginationItems/` directory
- Update `tsconfig.build.json` to emit declarations from source: `"declaration": true`, `"declarationDir": "./dist/types"`
- Update the build pipeline to generate `.d.ts` from TypeScript source instead of shipping handwritten declarations
- Update `package.json`: `"types"` field to point to generated declarations
- Remove the manually maintained `.d.ts` files after verifying generated declarations match
- Remove `src/generic.d.ts` (merge into a shared types module)
- Update `index.d.ts` at root to re-export from generated types or remove if `"types"` field handles it
- Replace lodash imports with native TypeScript equivalents where simple (e.g., `_.isNil` -> `x == null`, `_.isUndefined` -> `x === undefined`, `_.isString` -> `typeof x === 'string'`). Full lodash removal can be incremental

**Files affected:**
- All 257 `src/**/*.js` files -> `.ts`/`.tsx`
- All 213 `src/**/*.d.ts` files (merge into source, then remove)
- `src/generic.d.ts` (merge and remove)
- `index.d.ts` (update or remove)
- `tsconfig.json`, `tsconfig.build.json`
- `package.json` (types field, build scripts)
- `.babel-preset.js` or `tsup.config.ts` (TypeScript compilation)

---

### Phase 15: Remove forwardRef Wrappers

| Field | Value |
|---|---|
| **ID** | phase-15 |
| **Complexity** | High |
| **Dependencies** | phase-14, phase-04 |
| **Parallel Group** | H |

**Description:**
In React 19, `ref` is passed as a regular prop to function components. `React.forwardRef` is no longer necessary and is deprecated. Remove all 158 `forwardRef` wrappers and accept `ref` as a destructured prop instead.

**Tasks:**
- For each of the 158 `React.forwardRef` components, transform from:
  ```tsx
  const Button = React.forwardRef(function (props, ref) {
    const { className, children, ...rest } = props
    return <button ref={ref} className={className} {...rest}>{children}</button>
  })
  ```
  to:
  ```tsx
  function Button({ className, children, ref, ...rest }: ButtonProps) {
    return <button ref={ref} className={className} {...rest}>{children}</button>
  }
  ```
- Update all `.d.ts` types (or generated types) to include `ref` in the props interface rather than as a separate `React.Ref<T>` argument
- Update `src/lib/hooks/useMergedRefs.ts`: the `setRef` utility function is still needed for combining refs, but the hook itself may need updates for the new ref-as-prop pattern
- Update `test/specs/commonTests/forwardsRef.js`: rewrite to test that `ref` works as a regular prop
- Update the `isConformant` common test if it tests forwardRef behavior
- Verify all components that use `useMergedRefs` still work correctly (components that combine an internal ref with the forwarded ref)
- Search for any consumer code that uses `React.forwardRef` wrapping of SUIR components and document the migration path for users

**Files affected:**
- All 158 files using `React.forwardRef` across `src/addons/`, `src/collections/`, `src/elements/`, `src/modules/`, `src/views/`
- `src/lib/hooks/useMergedRefs.ts`
- `test/specs/commonTests/forwardsRef.js`
- `test/specs/commonTests/isConformant.js`
- All component `.d.ts` or generated type definitions

---

### Phase 16: Convert Remaining Class Components to Function Components

| Field | Value |
|---|---|
| **ID** | phase-16 |
| **Complexity** | High |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | H |

**Description:**
Convert the 5 remaining class components to function components with hooks. This eliminates the `ModernAutoControlledComponent` base class entirely, as its auto-controlled state pattern is already available via the `useAutoControlledValue` hook.

**Components to convert:**

1. **`src/modules/Dropdown/Dropdown.js`** (most complex)
   - Extends `ModernAutoControlledComponent`
   - Auto-controlled props: `open`, `searchQuery`, `selectedLabel`, `value`
   - Uses `createRef`, `EventStack`, `cloneElement`, extensive keyboard handling
   - 1000+ lines, the most complex component in the library
   - Convert to function component using `useAutoControlledValue` for each auto-controlled prop
   - Replace `this.state` with individual `useState`/`useAutoControlledValue` calls
   - Replace `createRef` with `useRef`
   - Replace `EventStack` with `useEffect`-based event listeners
   - Replace all `this.method` references with local functions or `useEventCallback`
   - Replace `getAutoControlledStateFromProps` with `useMemo` or derived state

2. **`src/modules/Search/Search.js`**
   - Extends `ModernAutoControlledComponent`
   - Auto-controlled props: `open`, `value`
   - Uses `eventStack`, keyboard handling
   - Convert similarly to Dropdown

3. **`src/modules/Transition/Transition.js`**
   - Plain `React.Component` (does not extend ModernAutoControlledComponent)
   - Complex lifecycle: uses `getDerivedStateFromProps` for animation state machine
   - Convert `getDerivedStateFromProps` to `useMemo` or `useEffect` with the existing `computeStatuses` utility
   - The animation state machine (INITIAL -> ENTERING -> ENTERED, EXITING -> EXITED -> UNMOUNTED) must be preserved exactly

4. **`src/modules/Accordion/AccordionPanel.js`**
   - Plain `React.Component`
   - Simple: just renders `AccordionTitle` and `AccordionContent` with click handling
   - Uses `this.handleTitleOverrides` as an instance method -- convert to `useEventCallback` or inline
   - Straightforward conversion

5. **`src/lib/ModernAutoControlledComponent.js`**
   - The base class itself
   - After all consumers (Dropdown, Search) are converted to use `useAutoControlledValue` hook, this file can be deleted entirely
   - Remove from `src/lib/index.js` exports

**Tasks:**
- Convert each class component following the order: AccordionPanel (simplest) -> Transition -> Search -> Dropdown (most complex)
- Delete `src/lib/ModernAutoControlledComponent.js` after all consumers are migrated
- Remove `ModernAutoControlledComponent` export from `src/lib/index.js`
- Update all corresponding test files
- Remove lodash dependency on `_.invoke(this, ...)` patterns used by ModernAutoControlledComponent

**Files affected:**
- `src/modules/Dropdown/Dropdown.js` (rewrite)
- `src/modules/Search/Search.js` (rewrite)
- `src/modules/Transition/Transition.js` (rewrite)
- `src/modules/Accordion/AccordionPanel.js` (rewrite)
- `src/lib/ModernAutoControlledComponent.js` (remove)
- `src/lib/index.js` (remove export)
- Corresponding test files for each component

---

### Phase 17: Modernize Custom Hooks for React 19

| Field | Value |
|---|---|
| **ID** | phase-17 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-16 |
| **Parallel Group** | I |

**Description:**
Update the 7 custom hooks for React 19 compatibility and best practices. Some hooks may benefit from React 19's new features; others may need adjustment for the React Compiler.

**Hooks to update:**

1. **`useAutoControlledValue.js`** -- Core hook for controlled/uncontrolled prop pattern
   - Verify compatibility with React 19's stricter state batching
   - Ensure the hook works correctly with React Compiler (no mutable refs used as dependencies)
   - Add TypeScript generics

2. **`useMergedRefs.js`** -- Combines multiple refs into one
   - Update for ref-as-prop pattern (React 19)
   - The `setRef` export is used by components to set callback or object refs; verify it handles React 19's ref cleanup function feature (refs now support returning a cleanup function)
   - Add TypeScript overloads

3. **`useEventCallback.js`** -- Stable callback reference
   - Verify React Compiler compatibility (this pattern uses a mutable ref internally)
   - Consider if `useEffectEvent` (if available in React 19.2) is a better replacement
   - Add TypeScript generics for callback signature

4. **`useIsomorphicLayoutEffect.js`** -- SSR-safe useLayoutEffect
   - Minimal changes expected; verify React 19 SSR compatibility
   - Add TypeScript types

5. **`useForceUpdate.js`** -- Returns a function to force re-render
   - Verify React 19 compatibility (uses `useReducer` internally)
   - Consider if this hook is still needed after class component conversion
   - Add TypeScript types

6. **`useClassNamesOnNode.js`** -- Applies className strings to a DOM node imperatively
   - Used by Modal, Dimmer for body class manipulation
   - Verify cleanup behavior with React 19's stricter effect cleanup
   - Add TypeScript types

7. **`usePrevious.js`** -- Tracks previous value of a variable
   - Verify React 19 compatibility (uses useRef + useEffect)
   - Add TypeScript generics

**Tasks:**
- Update each hook file with TypeScript types (if Phase 14 is complete)
- Add React Compiler compatibility annotations if needed (`'use no memo'` directive for hooks that intentionally use mutable patterns)
- Write or update unit tests for each hook using RTL + Vitest
- Verify all hooks work in React 19's StrictMode (double-invocation of effects)

**Files affected:**
- `src/lib/hooks/useAutoControlledValue.js`
- `src/lib/hooks/useMergedRefs.js`
- `src/lib/hooks/useEventCallback.js`
- `src/lib/hooks/useIsomorphicLayoutEffect.js`
- `src/lib/hooks/useForceUpdate.js`
- `src/lib/hooks/useClassNamesOnNode.js`
- `src/lib/hooks/usePrevious.js`
- `test/specs/lib/hooks/` (new or updated test files)

---

### Phase 18: Replace React.cloneElement Patterns

| Field | Value |
|---|---|
| **ID** | phase-18 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-16 |
| **Parallel Group** | I |

**Description:**
Replace all 12 files using `React.cloneElement` with safer alternatives. `cloneElement` is deprecated in favor of render props, composition, or Context. The library uses cloneElement primarily in the shorthand factory system (`src/lib/factories.js`) and in components that inject props into children.

**Files using cloneElement:**
- `src/lib/factories.js` -- `createShorthand()` uses cloneElement when `val` is a ReactElement
- `src/modules/Dropdown/Dropdown.js` -- clones DropdownItem children with event handlers
- `src/modules/Transition/TransitionGroup.js` -- clones children with transition state
- `src/modules/Transition/utils/wrapChild.js` -- wraps children with Transition
- `src/addons/Portal/Portal.js` -- clones trigger with event handlers
- `src/addons/Portal/utils/useTrigger.js` -- clones trigger element
- `src/addons/TransitionablePortal/TransitionablePortal.js` -- clones trigger
- `src/modules/Popup/Popup.js` -- clones trigger with ref
- `src/collections/Menu/Menu.js` -- may clone MenuItems
- `src/modules/Accordion/AccordionAccordion.js` -- clones panels
- `src/modules/Tab/Tab.js` -- may clone tab panes
- `src/addons/Pagination/Pagination.js` -- clones pagination items

**Replacement strategies:**
1. **Factory system (`createShorthand`)**: When the value is a ReactElement, instead of cloning to merge props, use a wrapper component or the render-prop pattern. For shorthand values that are plain objects or primitives, continue creating elements normally
2. **Portal/Popup trigger cloning**: Use the `ref` callback composition pattern or a wrapper `<span>` element
3. **TransitionGroup child cloning**: Use Context to pass transition state to children instead of cloning
4. **Dropdown/Menu item cloning**: Use Context or render props to inject handlers

**Tasks:**
- Refactor `createShorthand()` in `src/lib/factories.js` to avoid cloneElement for ReactElement values
- Refactor each component's cloneElement usage with the appropriate pattern
- Update tests for all affected components
- Document the migration pattern for consumers who use cloneElement with SUIR components

**Files affected:**
- `src/lib/factories.js` (major refactor)
- All 12 files listed above
- Corresponding test files

---

## Stage 4: Component Migration - Elements

> **Note:** Each component phase includes updating the component source, its TypeScript types, and its test specs. The component migration assumes Phases 13-18 are substantially complete or in progress. Components should be migrated in dependency order (components with no subcomponents first).

### Phase 19: Migrate Button, ButtonContent, ButtonGroup, ButtonOr

| Field | Value |
|---|---|
| **ID** | phase-19 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | J |

**Description:**
Migrate the Button family of components. These are simple presentational components with no internal state.

**Components:**
- `src/elements/Button/Button.js` -- Main button, uses forwardRef, Icon/Label shorthand
- `src/elements/Button/ButtonContent.js` -- Visible/hidden content for animated buttons
- `src/elements/Button/ButtonGroup.js` -- Button group wrapper
- `src/elements/Button/ButtonOr.js` -- "Or" divider between buttons

**Tasks:**
- Remove forwardRef wrappers (Phase 15 may already complete this)
- Remove PropTypes (Phase 13 may already complete this)
- Convert to TypeScript with proper props interfaces
- Update Button's shorthand creation for Icon and Label (uses `createShorthand`)
- Migrate test specs:
  - `test/specs/elements/Button/Button-test.js`
  - `test/specs/elements/Button/ButtonContent-test.js`
  - `test/specs/elements/Button/ButtonGroup-test.js`
  - `test/specs/elements/Button/ButtonOr-test.js`
- Verify className generation with `clsx` and classNameBuilders works correctly

**Files affected:**
- `src/elements/Button/Button.js` -> `.tsx`
- `src/elements/Button/ButtonContent.js` -> `.tsx`
- `src/elements/Button/ButtonGroup.js` -> `.tsx`
- `src/elements/Button/ButtonOr.js` -> `.tsx`
- `src/elements/Button/index.js` -> `.ts`
- `src/elements/Button/Button.d.ts` (merge and remove)
- `src/elements/Button/ButtonContent.d.ts` (merge and remove)
- `src/elements/Button/ButtonGroup.d.ts` (merge and remove)
- `src/elements/Button/ButtonOr.d.ts` (merge and remove)
- `src/elements/Button/index.d.ts` (merge and remove)
- 4 test files in `test/specs/elements/Button/`

---

### Phase 20: Migrate Container, Divider, Flag, Header

| Field | Value |
|---|---|
| **ID** | phase-20 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | J |

**Description:**
Migrate four simple element components with no internal state and minimal subcomponents.

**Components:**
- `src/elements/Container/Container.js` -- Responsive container
- `src/elements/Divider/Divider.js` -- Content divider
- `src/elements/Flag/Flag.js` -- Country flag icon (uses shorthand factory)
- `src/elements/Header/Header.js` -- Section header with Icon/Image shorthand
- `src/elements/Header/HeaderContent.js` -- Header content wrapper
- `src/elements/Header/HeaderSubheader.js` -- Subheader text

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Migrate 6 test spec files
- Verify Flag's `createShorthandFactory` pattern works after factory refactor (Phase 18)

**Files affected:**
- 6 component files in `src/elements/Container/`, `Divider/`, `Flag/`, `Header/` -> `.tsx`
- 6 corresponding `.d.ts` files (merge and remove)
- 3 `index.js` files -> `.ts`
- 6 test files in `test/specs/elements/`

---

### Phase 21: Migrate Icon, Image, Input, Label

| Field | Value |
|---|---|
| **ID** | phase-21 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | J |

**Description:**
Migrate four element components. Input is moderately complex with controlled/uncontrolled patterns and HTML input prop partitioning.

**Components:**
- `src/elements/Icon/Icon.js` -- Icon element (used extensively as shorthand across the library)
- `src/elements/Icon/IconGroup.js` -- Icon group wrapper
- `src/elements/Image/Image.js` -- Image element with shorthand
- `src/elements/Image/ImageGroup.js` -- Image group wrapper
- `src/elements/Input/Input.js` -- Text input with Icon/Label shorthand, uses `htmlInputAttrs`, `partitionHTMLProps`
- `src/elements/Label/Label.js` -- Label with Icon/Image/Detail shorthand
- `src/elements/Label/LabelDetail.js` -- Label detail text
- `src/elements/Label/LabelGroup.js` -- Label group wrapper

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Input: verify `partitionHTMLProps` correctly types HTML input attributes
- Input: verify controlled/uncontrolled input behavior with React 19
- Icon: verify shorthand factory pattern since Icon is used as shorthand in many other components
- Label: verify its own shorthand factories and as shorthand in Input
- Migrate 8 test spec files

**Files affected:**
- 8 component files -> `.tsx`
- 8 `.d.ts` files (merge and remove)
- 4 `index.js` files -> `.ts`
- 8 test files in `test/specs/elements/`

---

### Phase 22: Migrate List and All List Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-22 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-13, phase-21 |
| **Parallel Group** | K |

**Description:**
Migrate the List component family. List has 7 subcomponents and uses Icon and Image as shorthand internally, so it depends on Phase 21.

**Components:**
- `src/elements/List/List.js` -- Main list component
- `src/elements/List/ListContent.js` -- List item content
- `src/elements/List/ListDescription.js` -- List item description
- `src/elements/List/ListHeader.js` -- List item header
- `src/elements/List/ListIcon.js` -- List item icon (wraps Icon)
- `src/elements/List/ListItem.js` -- List item with shorthand support
- `src/elements/List/ListList.js` -- Nested list

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript with proper props interfaces
- Verify shorthand composition (ListItem creates ListContent, ListDescription, ListHeader, ListIcon)
- Migrate 7 test spec files

**Files affected:**
- 7 component files in `src/elements/List/` -> `.tsx`
- 7 `.d.ts` files (merge and remove)
- `src/elements/List/index.js` -> `.ts`
- 7 test files in `test/specs/elements/List/`

---

### Phase 23: Migrate Loader, Placeholder and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-23 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | J |

**Description:**
Migrate the Loader and Placeholder component families. Both are simple presentational components.

**Components:**
- `src/elements/Loader/Loader.js` -- Loading indicator
- `src/elements/Placeholder/Placeholder.js` -- Placeholder container
- `src/elements/Placeholder/PlaceholderHeader.js` -- Placeholder header
- `src/elements/Placeholder/PlaceholderImage.js` -- Placeholder image
- `src/elements/Placeholder/PlaceholderLine.js` -- Placeholder text line
- `src/elements/Placeholder/PlaceholderParagraph.js` -- Placeholder paragraph

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Migrate 6 test spec files

**Files affected:**
- 6 component files -> `.tsx`
- 6 `.d.ts` files (merge and remove)
- 2 `index.js` files -> `.ts`
- 6 test files in `test/specs/elements/`

---

### Phase 24: Migrate Rail, Reveal, Segment, Step and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-24 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13, phase-21 |
| **Parallel Group** | K |

**Description:**
Migrate the remaining element components. Step uses Icon shorthand (depends on Phase 21).

**Components:**
- `src/elements/Rail/Rail.js` -- Side rail content
- `src/elements/Reveal/Reveal.js` -- Reveal animation container
- `src/elements/Reveal/RevealContent.js` -- Reveal visible/hidden content
- `src/elements/Segment/Segment.js` -- Content segment
- `src/elements/Segment/SegmentGroup.js` -- Segment group
- `src/elements/Segment/SegmentInline.js` -- Inline segment
- `src/elements/Step/Step.js` -- Step indicator (uses Icon shorthand)
- `src/elements/Step/StepContent.js` -- Step content
- `src/elements/Step/StepDescription.js` -- Step description
- `src/elements/Step/StepGroup.js` -- Step group container
- `src/elements/Step/StepTitle.js` -- Step title

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Verify Step's Icon shorthand integration
- Migrate 11 test spec files

**Files affected:**
- 11 component files -> `.tsx`
- 11 `.d.ts` files (merge and remove)
- 4 `index.js` files -> `.ts`
- 11 test files in `test/specs/elements/`

---

## Stage 5: Component Migration - Collections

### Phase 25: Migrate Breadcrumb and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-25 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | J |

**Description:**
Migrate the Breadcrumb component family. Simple presentational components.

**Components:**
- `src/collections/Breadcrumb/Breadcrumb.js` -- Breadcrumb container
- `src/collections/Breadcrumb/BreadcrumbDivider.js` -- Divider between sections (uses Icon shorthand)
- `src/collections/Breadcrumb/BreadcrumbSection.js` -- Individual breadcrumb section

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Migrate 3 test spec files

**Files affected:**
- 3 component files in `src/collections/Breadcrumb/` -> `.tsx`
- 3 `.d.ts` files (merge and remove)
- `src/collections/Breadcrumb/index.js` -> `.ts`
- 3 test files in `test/specs/collections/Breadcrumb/`

---

### Phase 26: Migrate Form and All Form Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-26 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-13, phase-21 |
| **Parallel Group** | K |

**Description:**
Migrate the Form component family. Form has 9 subcomponents that wrap other SUIR components (Button, Checkbox, Dropdown, Input, Radio, Select, TextArea). Depends on Phase 21 for Input types.

**Components:**
- `src/collections/Form/Form.js` -- Form container
- `src/collections/Form/FormButton.js` -- Wraps Button
- `src/collections/Form/FormCheckbox.js` -- Wraps Checkbox
- `src/collections/Form/FormDropdown.js` -- Wraps Dropdown
- `src/collections/Form/FormField.js` -- Form field wrapper
- `src/collections/Form/FormGroup.js` -- Field group
- `src/collections/Form/FormInput.js` -- Wraps Input
- `src/collections/Form/FormRadio.js` -- Wraps Radio
- `src/collections/Form/FormSelect.js` -- Wraps Select
- `src/collections/Form/FormTextArea.js` -- Wraps TextArea

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Type the cross-component composition properly (FormDropdown extending Dropdown props, etc.)
- Migrate 10 test spec files

**Files affected:**
- 10 component files in `src/collections/Form/` -> `.tsx`
- 10 `.d.ts` files (merge and remove)
- `src/collections/Form/index.js` -> `.ts`
- 10 test files in `test/specs/collections/Form/`

---

### Phase 27: Migrate Grid, GridColumn, GridRow

| Field | Value |
|---|---|
| **ID** | phase-27 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | J |

**Description:**
Migrate the Grid component family. Uses the `getWidthProp`, `getMultipleProp`, `getTextAlignProp`, `getVerticalAlignProp` classNameBuilders heavily.

**Components:**
- `src/collections/Grid/Grid.js` -- Grid container
- `src/collections/Grid/GridColumn.js` -- Grid column
- `src/collections/Grid/GridRow.js` -- Grid row

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Ensure classNameBuilder functions are properly typed (from Phase 14)
- Verify `getWidthProp` with `numberToWord` works correctly with TypeScript
- Migrate 3 test spec files

**Files affected:**
- 3 component files in `src/collections/Grid/` -> `.tsx`
- 3 `.d.ts` files (merge and remove)
- `src/collections/Grid/index.js` -> `.ts`
- 3 test files in `test/specs/collections/Grid/`

---

### Phase 28: Migrate Menu, Message, Table and All Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-28 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-13, phase-21 |
| **Parallel Group** | K |

**Description:**
Migrate three collection component families with multiple subcomponents. Menu uses cloneElement (addressed in Phase 18).

**Components:**
- `src/collections/Menu/Menu.js` -- Menu container (may use cloneElement for items)
- `src/collections/Menu/MenuHeader.js` -- Menu section header
- `src/collections/Menu/MenuItem.js` -- Menu item (uses Icon shorthand)
- `src/collections/Menu/MenuMenu.js` -- Sub-menu container
- `src/collections/Message/Message.js` -- Message box (uses Icon shorthand)
- `src/collections/Message/MessageContent.js` -- Message content
- `src/collections/Message/MessageHeader.js` -- Message header
- `src/collections/Message/MessageItem.js` -- Message list item
- `src/collections/Message/MessageList.js` -- Message list
- `src/collections/Table/Table.js` -- Table container
- `src/collections/Table/TableBody.js` -- Table body
- `src/collections/Table/TableCell.js` -- Table cell (uses Icon shorthand)
- `src/collections/Table/TableFooter.js` -- Table footer (extends TableHeader)
- `src/collections/Table/TableHeader.js` -- Table header section
- `src/collections/Table/TableHeaderCell.js` -- Table header cell (uses Icon shorthand)
- `src/collections/Table/TableRow.js` -- Table row

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Menu: verify cloneElement replacement from Phase 18 works correctly
- MenuItem: verify Icon shorthand integration
- TableHeaderCell: verify sorting icon behavior
- Migrate 16 test spec files

**Files affected:**
- 16 component files -> `.tsx`
- 16 `.d.ts` files (merge and remove)
- 3 `index.js` files -> `.ts`
- 16 test files in `test/specs/collections/`

---

## Stage 6: Component Migration - Modules

### Phase 29: Migrate Accordion and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-29 |
| **Complexity** | Medium |
| **Dependencies** | phase-16, phase-18 |
| **Parallel Group** | L |

**Description:**
Migrate the Accordion family. AccordionPanel is a class component (converted in Phase 16). AccordionAccordion uses cloneElement (refactored in Phase 18).

**Components:**
- `src/modules/Accordion/Accordion.js` -- Top-level accordion (composes AccordionAccordion with Menu styling)
- `src/modules/Accordion/AccordionAccordion.js` -- Core accordion logic, renders panels, uses cloneElement
- `src/modules/Accordion/AccordionContent.js` -- Accordion content panel
- `src/modules/Accordion/AccordionPanel.js` -- Panel component (class component, converted in Phase 16)
- `src/modules/Accordion/AccordionTitle.js` -- Clickable accordion title

**Tasks:**
- Verify AccordionPanel class-to-function conversion from Phase 16 is stable
- Verify AccordionAccordion cloneElement replacement from Phase 18 works
- Remove remaining forwardRef wrappers
- Remove PropTypes
- Convert all files to TypeScript
- Migrate 5 test spec files

**Files affected:**
- 5 component files in `src/modules/Accordion/` -> `.tsx`
- `src/modules/Accordion/index.js` -> `.ts`
- 5 test files in `test/specs/modules/Accordion/`

---

### Phase 30: Migrate Checkbox, Dimmer, Embed

| Field | Value |
|---|---|
| **ID** | phase-30 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-13, phase-17 |
| **Parallel Group** | L |

**Description:**
Migrate three module components. Checkbox has controlled/uncontrolled patterns. Dimmer uses `useClassNamesOnNode` for body class manipulation.

**Components:**
- `src/modules/Checkbox/Checkbox.js` -- Checkbox input with controlled/uncontrolled value
- `src/modules/Dimmer/Dimmer.js` -- Page/element dimmer, uses `useClassNamesOnNode`
- `src/modules/Dimmer/DimmerDimmable.js` -- Dimmable content wrapper
- `src/modules/Dimmer/DimmerInner.js` -- Inner dimmer element
- `src/modules/Embed/Embed.js` -- Embedded content (iframe for YouTube/Vimeo)

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Checkbox: verify `useAutoControlledValue` for `checked` prop with React 19 input behavior
- Dimmer: verify `useClassNamesOnNode` correctly manages body classes with React 19 effect cleanup
- Embed: verify iframe rendering and `useAutoControlledValue` for `active` state
- Migrate 5 test spec files

**Files affected:**
- 5 component files -> `.tsx`
- Corresponding `.d.ts` files (merge and remove)
- 3 `index.js` files -> `.ts`
- 5 test files in `test/specs/modules/`

---

### Phase 31: Migrate Dropdown and All Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-31 |
| **Complexity** | High |
| **Dependencies** | phase-16, phase-18, phase-17 |
| **Parallel Group** | M |

**Description:**
Complete the Dropdown migration. This is the most complex component in the library (1000+ lines). The class-to-function conversion happens in Phase 16; this phase handles final TypeScript conversion, test migration, and verification of the complete Dropdown family.

**Components:**
- `src/modules/Dropdown/Dropdown.js` -- Main dropdown (class component converted in Phase 16)
- `src/modules/Dropdown/DropdownDivider.js` -- Dropdown menu divider
- `src/modules/Dropdown/DropdownHeader.js` -- Dropdown menu header
- `src/modules/Dropdown/DropdownItem.js` -- Individual dropdown option
- `src/modules/Dropdown/DropdownMenu.js` -- Dropdown menu container
- `src/modules/Dropdown/DropdownSearchInput.js` -- Search input within dropdown
- `src/modules/Dropdown/DropdownText.js` -- Selected text display
- `src/modules/Dropdown/utils/getMenuOptions.js` -- Option filtering/creation utility
- `src/modules/Dropdown/utils/getSelectedIndex.js` -- Selection state utility

**Tasks:**
- Finalize TypeScript conversion for all Dropdown files
- Type the complex event handlers (keyboard navigation, search filtering, multi-select)
- Type the `options` prop (array of `{ key, text, value, content, ... }` objects)
- Verify all Dropdown variants work: basic, search, multiple, allowAdditions, clearable, scrolling, inline, pointing
- Verify keyboard navigation (arrow keys, enter, escape, tab, type-ahead search)
- Verify `@semantic-ui-react/event-stack` integration (or its replacement from Phase 16)
- Verify cloneElement replacement from Phase 18 for item rendering
- Migrate all Dropdown test specs (likely the largest test file in the suite)
- Verify accessibility attributes (ARIA roles, `aria-expanded`, `aria-selected`)

**Files affected:**
- 10 files in `src/modules/Dropdown/` -> `.ts`/`.tsx`
- Corresponding `.d.ts` files (merge and remove)
- Test files in `test/specs/modules/Dropdown/`

---

### Phase 32: Migrate Modal and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-32 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-13, phase-17 |
| **Parallel Group** | L |

**Description:**
Migrate Modal and remove IE11 legacy code. Modal is already a function component (uses forwardRef) but has IE11-specific style calculations in `src/modules/Modal/utils/index.js`.

**Components:**
- `src/modules/Modal/Modal.js` -- Main modal, uses Portal, `useAutoControlledValue`, `useMergedRefs`, `useClassNamesOnNode`, `eventStack`
- `src/modules/Modal/ModalActions.js` -- Modal action buttons
- `src/modules/Modal/ModalContent.js` -- Modal content area
- `src/modules/Modal/ModalDescription.js` -- Modal description text
- `src/modules/Modal/ModalDimmer.js` -- Modal dimmer overlay
- `src/modules/Modal/ModalHeader.js` -- Modal header
- `src/modules/Modal/utils/index.js` -- Contains `canFit()`, `getLegacyStyles()`, `isLegacy()`

**Tasks:**
- Remove forwardRef wrapper from Modal and all subcomponents
- Remove PropTypes
- Convert to TypeScript
- **Remove IE11 legacy code:**
  - Delete `isLegacy()` function from `src/modules/Modal/utils/index.js` (checks `window.ActiveXObject`)
  - Delete `getLegacyStyles()` function (calculates manual margins for IE11)
  - Remove all references to `isLegacy` and `getLegacyStyles` from `Modal.js`
  - Simplify the `canFit()` function if IE11-specific workarounds remain
- Verify Modal's interaction with Portal (event handling, focus trap)
- Verify `useClassNamesOnNode` for body scroll lock (`dimmed dimmable` class on body)
- Verify `useAutoControlledValue` for `open` state
- Migrate 6 test spec files

**Files affected:**
- 7 files in `src/modules/Modal/` -> `.tsx`/`.ts`
- `src/modules/Modal/utils/index.js` -> `.ts` (remove IE11 code)
- Corresponding `.d.ts` files (merge and remove)
- 6 test files in `test/specs/modules/Modal/`

---

### Phase 33: Migrate Popup and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-33 |
| **Complexity** | Medium |
| **Dependencies** | phase-15, phase-13, phase-18 |
| **Parallel Group** | L |

**Description:**
Migrate Popup. Uses `react-popper` for positioning and cloneElement for trigger handling (addressed in Phase 18). Evaluate migrating from `react-popper` (Popper.js v2) to Floating UI (the successor).

**Components:**
- `src/modules/Popup/Popup.js` -- Main popup, uses `react-popper` Manager/Reference/Popper, Portal, cloneElement for trigger
- `src/modules/Popup/PopupContent.js` -- Popup content
- `src/modules/Popup/PopupHeader.js` -- Popup header

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Evaluate `react-popper` v2 -> `@floating-ui/react` migration:
  - `react-popper` wraps Popper.js v2 which is in maintenance mode
  - `@floating-ui/react` is the official successor
  - If migrating, replace `<Manager>`, `<Reference>`, `<Popper>` pattern with `useFloating()` hook
  - If not migrating now, verify `react-popper` works with React 19
- Verify cloneElement replacement from Phase 18 for trigger element
- Verify positioning works correctly with the new bundler
- Migrate 3 test spec files

**Files affected:**
- 3 component files in `src/modules/Popup/` -> `.tsx`
- Corresponding `.d.ts` files (merge and remove)
- `src/modules/Popup/index.js` -> `.ts`
- `package.json` (if replacing react-popper with @floating-ui/react)
- 3 test files in `test/specs/modules/Popup/`

---

### Phase 34: Migrate Progress, Rating, Search

| Field | Value |
|---|---|
| **ID** | phase-34 |
| **Complexity** | High |
| **Dependencies** | phase-16, phase-17 |
| **Parallel Group** | M |

**Description:**
Migrate Progress, Rating, and Search. Search is a class component (converted in Phase 16). Rating uses `useAutoControlledValue`. Progress uses percentage calculations.

**Components:**
- `src/modules/Progress/Progress.js` -- Progress bar with percentage calculations
- `src/modules/Rating/Rating.js` -- Star/heart rating with `useAutoControlledValue`
- `src/modules/Rating/RatingIcon.js` -- Individual rating icon
- `src/modules/Search/Search.js` -- Search input with results dropdown (class component, converted in Phase 16)
- `src/modules/Search/SearchCategory.js` -- Categorized search results
- `src/modules/Search/SearchCategoryLayout.js` -- Search category layout
- `src/modules/Search/SearchResult.js` -- Individual search result
- `src/modules/Search/SearchResults.js` -- Search results container

**Tasks:**
- Finalize Search class-to-function conversion from Phase 16
- Remove forwardRef wrappers from all functional components
- Remove PropTypes
- Convert to TypeScript
- Progress: type percentage calculation utilities
- Rating: verify `useAutoControlledValue` for rating value
- Search: verify keyboard navigation, result filtering, category rendering
- Search: verify `eventStack` / event listener cleanup with React 19
- Migrate 8 test spec files

**Files affected:**
- 8 component files -> `.tsx`
- Corresponding `.d.ts` files (merge and remove)
- 3 `index.js` files -> `.ts`
- 8 test files in `test/specs/modules/`

---

### Phase 35: Migrate Sidebar, Sticky, Tab, Transition

| Field | Value |
|---|---|
| **ID** | phase-35 |
| **Complexity** | High |
| **Dependencies** | phase-16, phase-17 |
| **Parallel Group** | M |

**Description:**
Migrate the remaining module components. Transition is a class component (converted in Phase 16). Sidebar and Sticky use event listeners and DOM measurements. Tab composes Menu and subcomponents.

**Components:**
- `src/modules/Sidebar/Sidebar.js` -- Sliding sidebar panel
- `src/modules/Sidebar/SidebarPushable.js` -- Pushable content wrapper
- `src/modules/Sidebar/SidebarPusher.js` -- Content that gets pushed
- `src/modules/Sticky/Sticky.js` -- Sticky positioning component (uses scroll/resize event listeners, DOM measurements)
- `src/modules/Tab/Tab.js` -- Tab component (composes Menu + Tab panes)
- `src/modules/Tab/TabPane.js` -- Individual tab content pane
- `src/modules/Transition/Transition.js` -- Animation transition (class component, converted in Phase 16)
- `src/modules/Transition/TransitionGroup.js` -- Group transition manager (uses cloneElement, refactored in Phase 18)
- `src/modules/Transition/utils/childMapping.js` -- Child key management for TransitionGroup
- `src/modules/Transition/utils/computeStatuses.js` -- Animation state machine
- `src/modules/Transition/utils/wrapChild.js` -- Child wrapping utility

**Tasks:**
- Finalize Transition class-to-function conversion from Phase 16
- Remove forwardRef wrappers
- Remove PropTypes
- Convert all files to TypeScript
- Sidebar: verify animation classes and `useClassNamesOnNode` for body class management
- Sticky: verify scroll/resize event listener cleanup with React 19, type DOM measurement utilities
- Tab: verify Menu and TabPane composition, type the `panes` prop shape
- Transition: verify animation state machine (computeStatuses) works correctly as a function component
- TransitionGroup: verify cloneElement replacement from Phase 18
- Migrate 8+ test spec files

**Files affected:**
- 11 files across `src/modules/Sidebar/`, `Sticky/`, `Tab/`, `Transition/` -> `.tsx`/`.ts`
- Corresponding `.d.ts` files (merge and remove)
- 4 `index.js` files -> `.ts`
- 8+ test files in `test/specs/modules/`

---

## Stage 7: Component Migration - Views and Addons

### Phase 36: Migrate Advertisement, Card and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-36 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13, phase-21 |
| **Parallel Group** | K |

**Description:**
Migrate the Advertisement and Card view components. Card uses Image and Icon shorthand.

**Components:**
- `src/views/Advertisement/Advertisement.js` -- Ad placement wrapper
- `src/views/Card/Card.js` -- Content card
- `src/views/Card/CardContent.js` -- Card content section
- `src/views/Card/CardDescription.js` -- Card description
- `src/views/Card/CardGroup.js` -- Card group container
- `src/views/Card/CardHeader.js` -- Card header
- `src/views/Card/CardMeta.js` -- Card metadata

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Verify Card's Image shorthand integration
- Migrate 7 test spec files

**Files affected:**
- 7 component files -> `.tsx`
- Corresponding `.d.ts` files (merge and remove)
- 2 `index.js` files -> `.ts`
- 7 test files in `test/specs/views/`

---

### Phase 37: Migrate Comment, Feed and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-37 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13 |
| **Parallel Group** | J |

**Description:**
Migrate Comment and Feed view components. Both are primarily presentational with multiple subcomponents.

**Components:**
- `src/views/Comment/Comment.js` -- Comment thread
- `src/views/Comment/CommentAction.js` -- Comment action link
- `src/views/Comment/CommentActions.js` -- Comment actions container
- `src/views/Comment/CommentAuthor.js` -- Comment author
- `src/views/Comment/CommentAvatar.js` -- Comment avatar
- `src/views/Comment/CommentContent.js` -- Comment content
- `src/views/Comment/CommentGroup.js` -- Comment group
- `src/views/Comment/CommentMetadata.js` -- Comment metadata
- `src/views/Comment/CommentText.js` -- Comment text
- `src/views/Feed/Feed.js` -- Activity feed
- `src/views/Feed/FeedContent.js` -- Feed event content
- `src/views/Feed/FeedDate.js` -- Feed event date
- `src/views/Feed/FeedEvent.js` -- Feed event item
- `src/views/Feed/FeedExtra.js` -- Feed extra content
- `src/views/Feed/FeedLabel.js` -- Feed event label
- `src/views/Feed/FeedLike.js` -- Feed like action
- `src/views/Feed/FeedMeta.js` -- Feed event metadata
- `src/views/Feed/FeedSummary.js` -- Feed event summary
- `src/views/Feed/FeedUser.js` -- Feed user reference

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Migrate 19 test spec files

**Files affected:**
- 19 component files -> `.tsx`
- Corresponding `.d.ts` files (merge and remove)
- 2 `index.js` files -> `.ts`
- 19 test files in `test/specs/views/`

---

### Phase 38: Migrate Item, Statistic and Subcomponents

| Field | Value |
|---|---|
| **ID** | phase-38 |
| **Complexity** | Low |
| **Dependencies** | phase-15, phase-13, phase-21 |
| **Parallel Group** | K |

**Description:**
Migrate Item and Statistic view components. Item uses Image shorthand.

**Components:**
- `src/views/Item/Item.js` -- Item view
- `src/views/Item/ItemContent.js` -- Item content
- `src/views/Item/ItemDescription.js` -- Item description
- `src/views/Item/ItemExtra.js` -- Item extra content
- `src/views/Item/ItemGroup.js` -- Item group container
- `src/views/Item/ItemHeader.js` -- Item header
- `src/views/Item/ItemImage.js` -- Item image (wraps Image)
- `src/views/Item/ItemMeta.js` -- Item metadata
- `src/views/Statistic/Statistic.js` -- Statistic display
- `src/views/Statistic/StatisticGroup.js` -- Statistic group
- `src/views/Statistic/StatisticLabel.js` -- Statistic label
- `src/views/Statistic/StatisticValue.js` -- Statistic value

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Verify Item's Image shorthand integration
- Migrate 12 test spec files

**Files affected:**
- 12 component files -> `.tsx`
- Corresponding `.d.ts` files (merge and remove)
- 2 `index.js` files -> `.ts`
- 12 test files in `test/specs/views/`

---

### Phase 39: Migrate Addons

| Field | Value |
|---|---|
| **ID** | phase-39 |
| **Complexity** | Medium |
| **Dependencies** | phase-16, phase-17, phase-18, phase-31, phase-32 |
| **Parallel Group** | N |

**Description:**
Migrate all addon components. These depend on several module components (Confirm uses Modal, Select wraps Dropdown, Radio wraps Checkbox). Portal and TransitionablePortal are core infrastructure used by Modal, Popup, and Dropdown.

**Components:**
- `src/addons/Confirm/Confirm.js` -- Confirmation dialog (wraps Modal)
- `src/addons/Pagination/Pagination.js` -- Pagination control with `useAutoControlledValue`
- `src/addons/Pagination/PaginationItem.js` -- Individual page button
- `src/addons/Portal/Portal.js` -- Portal for rendering outside DOM hierarchy, uses cloneElement for trigger
- `src/addons/Portal/PortalInner.js` -- Portal inner content renderer
- `src/addons/Portal/usePortalElement.js` -- Hook for portal DOM element management
- `src/addons/Portal/utils/useTrigger.js` -- Trigger element management (uses cloneElement)
- `src/addons/Portal/utils/validateTrigger.js` -- Trigger validation
- `src/addons/Radio/Radio.js` -- Radio button (wraps Checkbox)
- `src/addons/Select/Select.js` -- Select dropdown (wraps Dropdown)
- `src/addons/TextArea/TextArea.js` -- Textarea input
- `src/addons/TransitionablePortal/TransitionablePortal.js` -- Portal with transition animation

**Tasks:**
- Remove forwardRef wrappers
- Remove PropTypes
- Convert to TypeScript
- Portal: finalize cloneElement replacement from Phase 18, verify trigger rendering pattern
- Confirm: verify Modal integration after Modal migration
- Select: verify Dropdown integration after Dropdown migration
- Radio: verify Checkbox integration
- Pagination: verify `useAutoControlledValue` for `activePage`, type the `createPaginationItems` utility in `src/lib/createPaginationItems/`
- TransitionablePortal: verify Portal + Transition composition
- Migrate 9+ test spec files

**Files affected:**
- 12 files across `src/addons/` -> `.tsx`/`.ts`
- Corresponding `.d.ts` files (merge and remove)
- 7 `index.js` files -> `.ts`
- `src/lib/createPaginationItems/` (convert to TypeScript)
- 9+ test files in `test/specs/addons/`

---

## Stage 8: CSS and Styling Modernization

### Phase 40: Replace semantic-ui-css Dependency with Modern CSS Approach

| Field | Value |
|---|---|
| **ID** | phase-40 |
| **Complexity** | High |
| **Dependencies** | phase-35 (all component migrations complete) |
| **Parallel Group** | O |

**Description:**
Decouple the library from the `semantic-ui-css` package as a required external dependency. Currently, SUIR components generate className strings that correspond to classes defined in `semantic-ui-css`. The library itself does not bundle CSS; consumers must install `semantic-ui-css` separately.

This phase evaluates and implements a modern CSS strategy:

**Option A: Bundle component CSS (recommended)**
- Ship minimal CSS with each component, importable via `import 'semantic-ui-react/components/Button/Button.css'`
- Use the existing Semantic UI CSS as a starting point, extract per-component styles
- Support tree-shaking of CSS

**Option B: Keep external CSS, provide modern alternatives**
- Continue supporting `semantic-ui-css` as an external stylesheet
- Add support for Fomantic-UI CSS (community fork of Semantic UI with active maintenance)
- Provide a CSS-in-JS adapter layer for styled-components/emotion users

**Option C: Headless/unstyled mode**
- Allow components to function without any CSS, producing only semantic HTML with data attributes
- Users bring their own styles via Tailwind, CSS Modules, or any framework

**Tasks:**
- Audit which Semantic UI CSS classes each component generates (using `clsx` and classNameBuilders)
- Create a mapping document: component -> CSS classes required
- Implement the chosen CSS strategy
- Update the `semantic-ui-css` from devDependency to optional peer dependency
- Document CSS setup for consumers

**Files affected:**
- `package.json` (dependencies, peerDependencies)
- New CSS files per component (if Option A)
- Build configuration for CSS extraction
- Documentation

---

### Phase 41: Implement CSS Custom Properties Theming System

| Field | Value |
|---|---|
| **ID** | phase-41 |
| **Complexity** | High |
| **Dependencies** | phase-40 |
| **Parallel Group** | O |

**Description:**
Add a CSS custom properties (CSS variables) based theming system. Semantic UI's current theming is LESS-based and compile-time. CSS custom properties enable runtime theming.

**Tasks:**
- Define a comprehensive set of CSS custom properties for the design system:
  - Colors: `--sui-primary`, `--sui-secondary`, `--sui-success`, `--sui-error`, `--sui-warning`, `--sui-info`
  - Typography: `--sui-font-family`, `--sui-font-size-*`, `--sui-line-height-*`, `--sui-font-weight-*`
  - Spacing: `--sui-spacing-*` scale
  - Border radius: `--sui-border-radius-*`
  - Shadows: `--sui-shadow-*`
  - Transitions: `--sui-transition-duration`, `--sui-transition-timing`
  - Z-index: `--sui-z-index-modal`, `--sui-z-index-popup`, `--sui-z-index-dimmer`
- Create a `ThemeProvider` component or a simple CSS file with `:root` custom property definitions
- Create preset themes: `default`, `dark`, `compact`
- Update component CSS to reference custom properties instead of hardcoded values
- Provide a `createTheme()` utility for generating custom property overrides
- Document the theming system

**Files affected:**
- New `src/themes/` directory
- `src/themes/default.css` (new)
- `src/themes/dark.css` (new)
- All component CSS files (if they exist from Phase 40)
- New `ThemeProvider` component or utility

---

### Phase 42: Remove Vendor Prefixes and Legacy CSS Patterns, Add CSS Layers

| Field | Value |
|---|---|
| **ID** | phase-42 |
| **Complexity** | Medium |
| **Dependencies** | phase-40 |
| **Parallel Group** | O |

**Description:**
Remove legacy CSS patterns. Add CSS cascade layers for better specificity management. Modern browsers no longer need vendor prefixes for flexbox, transforms, transitions, and animations.

**Tasks:**
- Remove `-webkit-`, `-moz-`, `-ms-`, `-o-` vendor prefixes from any shipped CSS
- Configure the build pipeline to use Autoprefixer with `browserslist: 'defaults, not dead'` for any prefixes that are still needed
- Remove any IE11-specific CSS hacks (if present in shipped CSS):
  - `-ms-flexbox` hacks
  - `display: -ms-grid` fallbacks
  - `-ms-high-contrast-adjust` rules
- Add CSS `@layer` declarations for specificity management:
  ```css
  @layer sui-reset, sui-base, sui-components, sui-utilities;
  ```
- Add `@layer` to all component CSS rules so consumers can easily override styles
- Set up `postcss.config.js` with relevant plugins: `autoprefixer`, `postcss-preset-env` (for modern CSS features with fallbacks)
- Ensure CSS bundle size is reduced compared to the full `semantic-ui-css` package
- Add browserslist config to `package.json`

**Files affected:**
- All CSS files (from Phase 40)
- `postcss.config.js` (new)
- `package.json` (browserslist)
- Build configuration

---

## Stage 9: New React 19 Features

### Phase 43: Implement React Compiler Support

| Field | Value |
|---|---|
| **ID** | phase-43 |
| **Complexity** | High |
| **Dependencies** | phase-17, phase-35 (all hooks and components modernized) |
| **Parallel Group** | P |

**Description:**
Enable the React Compiler (formerly React Forget) for the library. The React Compiler automatically memoizes components and hooks, eliminating the need for manual `React.memo`, `useMemo`, and `useCallback` in most cases.

**Tasks:**
- Install `babel-plugin-react-compiler` or `react-compiler-webpack` (depending on bundler)
- Add the React Compiler Babel plugin to the build configuration
- Install `eslint-plugin-react-compiler` and add to ESLint config for compile-time validation
- Audit all 7 custom hooks for React Compiler compatibility:
  - Hooks that use mutable refs in ways the compiler cannot track may need `'use no memo'` directives
  - `useEventCallback` -- uses mutable ref pattern, likely needs `'use no memo'` annotation
  - `useForceUpdate` -- uses `useReducer`, should be compatible
  - `usePrevious` -- uses ref + effect, should be compatible
  - `useMergedRefs` -- verify callback ref creation is compatible
- Remove any manual `React.memo()` wrappers from components (the compiler handles memoization)
- Remove any manual `useMemo()` / `useCallback()` calls that are purely for performance (keep those that are semantically important, such as preventing unnecessary effect re-runs)
- Run the React Compiler health check across the codebase and fix any violations
- Add `"use memo"` or `"use no memo"` directives where needed
- Measure bundle size impact of the compiler output
- Add a `reactCompiler: true` option in the build config that can be toggled

**Files affected:**
- Build configuration (`.babel-preset.js` or `tsup.config.ts`)
- `eslint.config.js`
- `package.json` (devDependencies)
- All 7 hook files in `src/lib/hooks/`
- Any component files with manual `React.memo`, `useMemo`, `useCallback`

---

### Phase 44: Add Context as Provider Pattern

| Field | Value |
|---|---|
| **ID** | phase-44 |
| **Complexity** | Low |
| **Dependencies** | phase-35 (all components migrated) |
| **Parallel Group** | P |

**Description:**
React 19 allows rendering `<Context>` directly as a provider instead of `<Context.Provider>`. Update any Context usage in the library.

**Tasks:**
- Search for all `React.createContext()` usage in the codebase
- Search for all `<XxxContext.Provider value={...}>` patterns
- Replace `<XxxContext.Provider>` with `<XxxContext>` (the Context object itself is the provider in React 19)
- Identify and update any Context patterns in:
  - The theming system (if implemented in Phase 41)
  - Any component composition contexts (Accordion, Form, Menu, etc.)
  - The documentation site
- Update TypeScript types to reflect the new Provider pattern

**Files affected:**
- Any files using `React.createContext` and `Context.Provider`
- These are likely minimal in the component library itself (most state is prop-driven)

---

### Phase 45: Implement React 19 Form Features

| Field | Value |
|---|---|
| **ID** | phase-45 |
| **Complexity** | Medium |
| **Dependencies** | phase-26 (Form component migrated) |
| **Parallel Group** | P |

**Description:**
Add support for React 19's built-in form handling features: `useActionState`, `useFormStatus`, and the `action` prop on `<form>`. These enable server-side form processing and optimistic updates without third-party form libraries.

**Tasks:**
- Update `Form` component to support the `action` prop (function that receives FormData)
- Add `useFormStatus()` integration to `FormButton` and `FormField`:
  - `FormButton` can automatically show loading state via `useFormStatus().pending`
  - `FormField` can automatically disable inputs during submission
- Export a `useFormStatus` re-export from `semantic-ui-react` for consumer convenience
- Create a new `FormAction` subcomponent or update `Form` to support the Actions pattern
- Add `useActionState` example in documentation showing form state management
- Update `Form.d.ts` types to include `action` prop
- Add `useOptimistic` integration examples for optimistic UI updates
- Write test specs for new form features
- Ensure backwards compatibility: forms without `action` prop continue to work with `onSubmit`

**Files affected:**
- `src/collections/Form/Form.tsx`
- `src/collections/Form/FormButton.tsx`
- `src/collections/Form/FormField.tsx`
- Corresponding type definitions
- New test specs
- Documentation examples

---

### Phase 46: Add Document Metadata and Asset Preloading Support

| Field | Value |
|---|---|
| **ID** | phase-46 |
| **Complexity** | Low |
| **Dependencies** | phase-35 (all components migrated) |
| **Parallel Group** | P |

**Description:**
React 19 supports rendering `<title>`, `<meta>`, and `<link>` elements directly in component render output, automatically hoisting them to the document `<head>`. Additionally, new resource preloading APIs (`preload`, `preinit`, `prefetchDNS`, `preconnect`) are available.

**Tasks:**
- Update the `Modal` component to optionally set a document title when open (useful for accessibility and SEO)
- Add `preload()` / `preinit()` calls for CSS stylesheets when using the bundled CSS approach (Phase 40):
  - Components can call `preinit('/path/to/component.css', { as: 'style' })` to preload their CSS
- Add `prefetchDNS()` call in `Embed` component for YouTube/Vimeo domains when the component mounts but before the user clicks to load
- Export utility functions for consumers:
  - `preloadSemanticCSS()` -- preloads the Semantic UI CSS stylesheet
  - `preloadComponentCSS(componentName)` -- preloads CSS for a specific component
- Document the new metadata capabilities
- Add TypeScript types for the new utilities

**Files affected:**
- `src/modules/Modal/Modal.tsx` (optional title support)
- `src/modules/Embed/Embed.tsx` (prefetchDNS for video providers)
- `src/lib/preload.ts` (new utility)
- Corresponding type definitions
- Documentation

---

## Stage 10: Documentation, Build, and Release

### Phase 47: Migrate Documentation from react-static to Modern Framework

| Field | Value |
|---|---|
| **ID** | phase-47 |
| **Complexity** | High |
| **Dependencies** | phase-06 (bundler migration) |
| **Parallel Group** | Q |

**Description:**
Replace `react-static` v5 with a modern documentation framework. react-static is no longer maintained and does not support React 19. The documentation site includes interactive component examples, live code editing, API documentation generated from docgen, and search.

**Recommended options:**
1. **Astro + Starlight** -- Static site with island architecture, supports React components
2. **Nextra (Next.js)** -- MDX-based docs with React component playground
3. **Storybook 8** -- Component-driven development environment with docs addon

**Tasks:**
- Choose documentation framework
- Create new documentation project structure
- Migrate all component documentation pages from `docs/src/pages/`
- Migrate interactive examples from `docs/src/examples/`
- Migrate component API documentation (currently generated by `react-docgen`)
- Set up live code editing with `@codesandbox/sandpack-react` or equivalent
- Migrate the custom layout components from `docs/src/layouts/`
- Migrate the component explorer from `docs/src/components/`
- Set up search functionality
- Configure deployment (Vercel, per existing `vercel.json`)
- Remove react-static dependencies: `react-static`, `react-static-routes`, `react-universal-component`, `babel-plugin-universal-import`
- Remove `static.config.js`, `static.routes.js`, `static.webpack.js`
- Remove `react-router` and `react-router-dom` v5 from devDependencies (unless the new framework needs them)
- Remove `react-hot-loader` (already removed in Phase 03)
- Remove `@mdx-js/loader` v0 (outdated)
- Update `docs/` directory structure

**Files affected:**
- `docs/` directory (major restructure)
- `static.config.js` (remove)
- `static.routes.js` (remove)
- `static.webpack.js` (remove)
- `vercel.json` (update)
- `package.json` (devDependencies, scripts)

---

### Phase 48: Update CI/CD Pipelines

| Field | Value |
|---|---|
| **ID** | phase-48 |
| **Complexity** | Medium |
| **Dependencies** | phase-10, phase-47 |
| **Parallel Group** | Q |

**Description:**
Update all CI/CD pipelines for the new tooling, test runner, and documentation framework.

**Tasks:**
- Update `.circleci/config.yml`:
  - Update Docker image to Node 20
  - Replace test command from Karma to Vitest
  - Update build commands for new bundler
  - Update docs build commands for new documentation framework
  - Add TypeScript type-check step
  - Update coverage reporting (Vitest coverage -> Codecov)
  - Remove Puppeteer-based test setup
- Update `.github/workflows/pr-health.yml`:
  - Update Node version
  - Update lint, test, and build commands
  - Add React Compiler health check step
- Update `.github/workflows/size-limit.yml`:
  - Update Node version
  - Update size-limit commands for new build output paths
  - Update `@size-limit/file` configuration or replace with `size-limit/preset-small-lib`
- Update `codecov.yml` coverage thresholds
- Add a new GitHub Actions workflow for visual regression testing (Chromatic or Percy)
- Update or create `.github/workflows/docs-deploy.yml` for documentation deployment
- Remove Cypress CI configuration if Cypress is being removed (evaluate if Cypress is still needed alongside Vitest + RTL)
- Remove `@percy/cli` and `@percy/cypress` if switching to a different visual testing tool
- Add automated npm publish workflow for releases

**Files affected:**
- `.circleci/config.yml`
- `.github/workflows/pr-health.yml`
- `.github/workflows/size-limit.yml`
- `.github/workflows/docs-deploy.yml` (new)
- `codecov.yml`
- `cypress.json` (evaluate removal)
- `cypress/` directory (evaluate removal)

---

### Phase 49: Final Integration Testing and Performance Benchmarking

| Field | Value |
|---|---|
| **ID** | phase-49 |
| **Complexity** | Medium |
| **Dependencies** | phase-39, phase-42, phase-43, phase-48 |
| **Parallel Group** | R |

**Description:**
Comprehensive integration testing across the entire migrated library. Performance benchmarking to validate that the migration has not regressed performance and ideally improves it.

**Tasks:**
- Run the complete test suite (all 203+ specs) and achieve 100% pass rate
- Run TypeScript type-check (`tsc --noEmit`) with zero errors
- Run ESLint with zero errors
- Run the React Compiler health check with zero unresolvable violations
- **Integration tests:**
  - Test all component shorthand patterns work correctly
  - Test all compound components (Form with all subcomponents, Table with all subcomponents, etc.)
  - Test all auto-controlled components (Dropdown, Search, Checkbox, Rating, Pagination, Modal, Sidebar, Accordion)
  - Test Portal rendering in all contexts (Modal, Popup, Dropdown with `portalling`)
  - Test Transition animations in all components that use them
  - Test keyboard navigation in all interactive components
  - Test SSR rendering (all components render without errors in Node.js)
- **Performance benchmarks:**
  - Bundle size comparison: before vs. after migration
  - Render performance: measure initial render and re-render times for complex components (Dropdown with 1000 options, Table with 1000 rows)
  - Tree-shaking verification: import a single component and verify only that component's code is in the bundle
  - Memory usage comparison
- **Compatibility testing:**
  - Test with React 18 (peer dep compatibility) -- verify that the library still works with React 18 if the peer dep range allows it
  - Test with React 19.2 specifically
  - Test in all target browsers (Chrome, Firefox, Safari, Edge)
- **UMD build verification:**
  - Test the UMD build loads correctly via `<script>` tag
  - Verify global `SemanticUIReact` namespace
- Document all benchmark results in `docs/react19/BENCHMARKS.md`

**Files affected:**
- New integration test files
- `docs/react19/BENCHMARKS.md` (new)
- `bundle-size/bundle.js` (update for new build output)

---

### Phase 50: Release Preparation and Changelog

| Field | Value |
|---|---|
| **ID** | phase-50 |
| **Complexity** | Medium |
| **Dependencies** | phase-49 |
| **Parallel Group** | R (final) |

**Description:**
Prepare for the v3.0.0 stable release with React 19 support. Generate changelog, update documentation, create migration guide for consumers, and publish.

**Tasks:**
- **Version bump:** Update `package.json` version to `3.0.0`
- **Peer dependencies finalize:** Set final peer dep range: `"react": "^18.0.0 || ^19.0.0"` or `"react": "^19.0.0"` (decide on React 18 support)
- **Changelog:** Generate comprehensive CHANGELOG.md entries covering all breaking changes:
  - Dropped React 16 and 17 support
  - Dropped IE11 support
  - Removed PropTypes (use TypeScript for type safety)
  - Removed `React.forwardRef` wrappers (`ref` is now a regular prop)
  - Converted all class components to function components
  - Replaced `cloneElement` patterns (some shorthand behavior may change)
  - CSS dependency changes
  - New minimum Node.js version
  - Removed deprecated APIs
- **Migration guide:** Create `MIGRATION-v3.md` documenting:
  - How to update from v2.x to v3.0
  - Breaking changes with before/after code examples
  - CSS setup changes
  - TypeScript changes (if prop types changed)
  - Theming migration
- **Update README.md:** Update badges, installation instructions, browser support, React version support
- **Update `index.d.ts`** or generated types: final review of all public API types
- **NPM publish preparation:**
  - Verify `"files"` field in `package.json` includes all necessary files
  - Verify `"main"`, `"module"`, `"types"`, `"exports"` fields are correct
  - Add `"exports"` field for proper ESM/CJS resolution:
    ```json
    "exports": {
      ".": {
        "import": "./dist/es/index.js",
        "require": "./dist/commonjs/index.js",
        "types": "./dist/types/index.d.ts"
      },
      "./dist/*": "./dist/*"
    }
    ```
  - Run `npm pack` and inspect the tarball contents
  - Publish a release candidate: `npm publish --tag next` as `3.0.0-rc.1`
- **Release-it configuration:** Update `release-it` config for the new release process
- **GitHub release:** Create a GitHub release with the changelog and migration guide
- **Documentation deployment:** Deploy the updated documentation site
- **Post-release:**
  - Monitor npm downloads and GitHub issues for regressions
  - Prepare a v3.0.1 patch release plan for any immediate issues

**Files affected:**
- `package.json` (version, exports, peerDependencies)
- `CHANGELOG.md`
- `README.md`
- `MIGRATION-v3.md` (new)
- `index.d.ts` (or generated types)
- `.release-it.json` or `release-it` config in `package.json`

---

## Dependency Graph

The following shows the ordering constraints between phases. Phases without arrows between them can run in parallel.

```
Phase 01 (Scaffolding)
  |
  v
Phase 02 (Node/Package Manager)
  |
  v
Phase 03 (React 19.2)
  |
  +---> Phase 04 (Types) ---> Phase 08 (TSConfig) --+
  |                                                   |
  +---> Phase 05 (Babel JSX) ---> Phase 06 (Bundler) -+---> Phase 10 (Vitest)
  |                          |                        |
  |                          +---> Phase 07 (ESLint)  |
  |                                                   |
  +---> Phase 09 (Enzyme -> RTL) --------+            |
                                          |           |
                                          v           v
                                    Phase 11 (Test Utils) <-- Phase 10
                                          |
                                          v
                                    Phase 12 (act imports)

Phase 08 (TSConfig) ---> Phase 13 (Remove PropTypes)
                    |
                    +--> Phase 14 (JS -> TS) <--- Phase 13
                              |
                              v
                         Phase 15 (Remove forwardRef) <--- Phase 04
                              |
                              +---> Phase 16 (Class -> Function) <--- Phase 13
                              |         |
                              |         v
                              +---> Phase 17 (Modernize Hooks)
                              |         |
                              +---> Phase 18 (Replace cloneElement)
                              |
    +-------------------------+----------------------------+
    |           |          |         |         |           |
    v           v          v         v         v           v
 Ph 19-24   Ph 25-28   Ph 29-30  Ph 31     Ph 32-33    Ph 34-35
 Elements   Collections Modules  Dropdown   Modal+Popup  Search+
    |           |          |         |         |        Transition
    +-----+-----+----+----+---------+---------+           |
          |          |                                    |
          v          v                                    |
       Ph 36-38   Ph 39 (Addons) <--- Phase 31,32 ------+
       Views         |
          |          |
          +----+-----+
               |
               v
          Phase 40 (CSS Approach)
               |
               +---> Phase 41 (CSS Custom Props)
               |
               +---> Phase 42 (Remove Vendor Prefixes)

Phase 35 (All Components) ---> Phase 43 (React Compiler)
                           |
                           +---> Phase 44 (Context Provider)
                           |
Phase 26 (Form) -----------+---> Phase 45 (Form Features)
                           |
                           +---> Phase 46 (Metadata/Preload)

Phase 06 (Bundler) ---> Phase 47 (Docs Framework)

Phase 10, 47 ---> Phase 48 (CI/CD)

Phase 39, 42, 43, 48 ---> Phase 49 (Integration Testing)
                                |
                                v
                           Phase 50 (Release)
```

---

## Parallel Execution Map

Phases are organized into parallel groups. All phases within a group can execute concurrently, assuming their dependencies are met.

| Group | Phases | Description |
|---|---|---|
| A | 01 | Project scaffolding (sequential start) |
| B | 02, 03 | Node update and React 19 update (sequential) |
| C | 04, 05, 08 | Types, Babel, TSConfig (parallel after Phase 03) |
| D | 06, 07 | Bundler and ESLint (parallel after Phase 05) |
| E | 09, 10 | Testing infrastructure (parallel start, 10 depends on 06 and 09) |
| F | 11, 12 | Test utilities finalization (parallel after Phase 10) |
| G | 13, 14 | PropTypes removal and TypeScript conversion (13 first, then 14) |
| H | 15, 16 | forwardRef removal and class component conversion (parallel after Phase 14) |
| I | 17, 18 | Hook modernization and cloneElement replacement (parallel after Phase 15/16) |
| J | 19, 20, 23, 25, 27, 37 | Simple components with no cross-dependencies (parallel) |
| K | 22, 24, 26, 28, 36, 38 | Components depending on Icon/Image/Input (Phase 21) |
| L | 29, 30, 32, 33 | Module components depending on hooks (Phase 17) |
| M | 31, 34, 35 | Complex module components depending on class conversion (Phase 16) |
| N | 39 | Addons (depends on Modules being done) |
| O | 40, 41, 42 | CSS modernization (40 first, then 41 and 42 in parallel) |
| P | 43, 44, 45, 46 | React 19 features (parallel, each has own deps) |
| Q | 47, 48 | Docs and CI (parallel) |
| R | 49, 50 | Final testing and release (sequential) |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Enzyme replacement takes longer than expected | High | High | Start Phase 09 early; write new tests in RTL for any new code immediately |
| react-popper incompatible with React 19 | Medium | Medium | Have @floating-ui/react migration plan ready as fallback (Phase 33) |
| React Compiler produces unexpected behavior with custom hooks | Medium | Medium | Test thoroughly; use `'use no memo'` directives where needed (Phase 43) |
| Dropdown class-to-function conversion introduces regressions | High | Medium | Extensive test coverage before conversion; staged rollout (Phase 16, 31) |
| Transition animation state machine breaks during conversion | High | Medium | Preserve exact state machine logic; test all animation states (Phase 16, 35) |
| semantic-ui-css removal/replacement impacts consumers | High | Low | Maintain backwards compatibility; provide CSS import path (Phase 40) |
| Documentation framework migration delays release | Medium | Medium | Docs migration (Phase 47) can be done post-release if needed |
| Bundle size increases due to TypeScript runtime overhead | Low | Low | Monitor with size-limit CI check; TypeScript adds zero runtime overhead |
| React 18 backwards compatibility breaks | Medium | Medium | Test matrix includes React 18; conditional feature detection where needed |
| @semantic-ui-react/event-stack incompatible with React 19 | Medium | High | Plan to replace with native useEffect-based event listeners (Phase 16) |
| lodash increases bundle size in ESM builds | Medium | Low | babel-plugin-lodash handles this; incrementally replace with native code in Phase 14 |

---

## Summary Statistics

| Metric | Count |
|---|---|
| Total phases | 50 |
| Low complexity phases | 16 |
| Medium complexity phases | 19 |
| High complexity phases | 15 |
| Estimated total files affected | 700+ |
| Critical path length | 15 phases (01 -> 02 -> 03 -> 05 -> 06 -> 10 -> 11 -> ... -> 49 -> 50) |
| Maximum parallelism | 6 phases (Group J) |

---

## Appendix A: Files Per Component Category

### Elements (16 component directories)
Button (4), Container (1), Divider (1), Flag (1), Header (3), Icon (2), Image (2), Input (1), Label (3), List (7), Loader (1), Placeholder (5), Rail (1), Reveal (2), Segment (3), Step (5) = **42 component files**

### Collections (6 component directories)
Breadcrumb (3), Form (10), Grid (3), Menu (4), Message (5), Table (7) = **32 component files**

### Modules (14 component directories)
Accordion (5), Checkbox (1), Dimmer (3), Dropdown (8+2 utils), Embed (1), Modal (6+1 utils), Popup (3), Progress (1), Rating (2), Search (5), Sidebar (3), Sticky (1), Tab (2), Transition (3+3 utils) = **50+ component files**

### Views (6 component directories)
Advertisement (1), Card (6), Comment (9), Feed (9), Item (8), Statistic (4) = **37 component files**

### Addons (7 component directories)
Confirm (1), Pagination (2), Portal (4+1 util), Radio (1), Select (1), TextArea (1), TransitionablePortal (1) = **12 component files**

### Library utilities (src/lib/)
21 utility files + 7 hook files + index = **29 files**

**Grand total source files: ~202 component files + 29 lib files + index/entry files = ~257**

---

## Appendix B: Dependencies to Add

| Package | Purpose | Phase |
|---|---|---|
| `@testing-library/react` | Component testing | 09 |
| `@testing-library/jest-dom` | DOM matchers | 09 |
| `@testing-library/user-event` | User interaction simulation | 09 |
| `vitest` | Test runner | 10 |
| `@vitest/coverage-v8` | Coverage reporting | 10 |
| `jsdom` | DOM environment for tests | 10 |
| `typescript` ^5.6 | TypeScript compiler | 08 |
| `@types/react` ^19 | React 19 types | 04 |
| `@types/react-dom` ^19 | ReactDOM 19 types | 04 |
| `tsup` | Library bundler | 06 |
| `vite` | Dev server and docs build | 06 |
| `@floating-ui/react` | Popup positioning (if replacing react-popper) | 33 |
| `babel-plugin-react-compiler` | React Compiler | 43 |
| `eslint-plugin-react-compiler` | React Compiler lint rules | 43 |
| `postcss` | CSS processing | 42 |
| `autoprefixer` | CSS vendor prefixes | 42 |

## Appendix C: Dependencies to Remove

| Package | Reason | Phase |
|---|---|---|
| `prop-types` | React 19 drops PropTypes checking | 13 |
| `enzyme` | No React 19 support | 09 |
| `@wojtekmaj/enzyme-adapter-react-17` | Enzyme removal | 09 |
| `chai-enzyme` | Enzyme removal | 09 |
| `karma` + all karma-* packages | Replaced by Vitest | 10 |
| `mocha` | Replaced by Vitest | 10 |
| `chai`, `dirty-chai` | Replaced by Vitest expect | 10 |
| `sinon`, `sinon-chai` | Replaced by vi.fn/vi.spyOn | 10 |
| `simulant` | Replaced by RTL fireEvent | 09 |
| `puppeteer` | Karma headless Chrome | 10 |
| `webpack` + webpack-* packages | Replaced by Vite/tsup | 06 |
| `babel-loader`, `raw-loader`, `imports-loader` | Webpack loaders | 06 |
| `terser-webpack-plugin`, `terser-webpack-plugin-legacy` | Webpack plugins | 06 |
| `react-hot-loader` | Incompatible with React 19 | 03 |
| `react-test-renderer` | Deprecated in React 19 | 03 |
| `react-static`, `react-static-routes` | Unmaintained, no React 19 | 47 |
| `react-universal-component` | react-static dependency | 47 |
| `babel-plugin-universal-import` | react-static dependency | 47 |
| `babel-eslint` | Replaced by @babel/eslint-parser | 07 |
| `eslint-plugin-mocha` | Mocha removal | 07 |
| `babel-plugin-transform-react-remove-prop-types` | PropTypes removal | 13 |
| `babel-plugin-transform-react-handled-props` | PropTypes removal | 13 |
| `react-popper` | Replaced by @floating-ui/react (if migrating) | 33 |
| `@popperjs/core` | Replaced by @floating-ui/react (if migrating) | 33 |
| `@fluentui/react-component-event-listener` | Evaluate React 19 compat | 03 |
| `@semantic-ui-react/event-stack` | Replace with useEffect | 16 |
| `shallowequal` | Replace with native or React.memo | 14 |
| `react-is` | Evaluate if still needed with React 19 | 03 |

---

## Strict TypeScript & Perfectionist Addendum

> **This addendum applies to ALL 50 phases.** Every phase must comply with the strict TypeScript and perfectionist requirements defined in the addendum document.

See **[ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md](./ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md)** for the complete specification, including:

- **Zero `any` tolerance** — no `any` type annotations anywhere in source code; `@typescript-eslint/no-explicit-any` set to `error`
- **Zero `unknown` tolerance** — `unknown` is only permitted in catch clauses with immediate type narrowing; all other uses must use specific types
- **Strictest TypeScript compiler options** — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noPropertyAccessFromIndexSignature`, all enabled
- **eslint-plugin-perfectionist** — all sorting rules (`sort-imports`, `sort-exports`, `sort-interfaces`, `sort-object-types`, `sort-union-types`, `sort-jsx-props`, `sort-switch-case`, etc.) set to `error`
- **Elimination of `[key: string]: any` prop escape hatch** — replaced with discriminated unions, specific prop interfaces, or `Record<string, T>` with concrete `T`
- **Phase-specific integration points** — Phase 07 (ESLint config), Phase 08 (TypeScript config), Phase 14 (type conversion) contain detailed implementation sections from this addendum

---

*End of Master Plan*
