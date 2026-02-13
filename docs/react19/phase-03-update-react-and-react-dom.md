# Phase 03: Update React and ReactDOM to 19.2

| Field               | Value                                                              |
|---------------------|--------------------------------------------------------------------|
| **Phase ID**        | PHASE-03                                                           |
| **Title**           | Update React and ReactDOM to 19.2                                   |
| **Stage**           | Stage 1 -- Core Dependency Upgrade                                 |
| **Dependencies**    | PHASE-01 (branch exists), PHASE-02 (Node 20 + Yarn 4 operational) |
| **Complexity**      | High                                                               |
| **Estimated Scope** | ~20 files modified, 257+ source files indirectly affected          |

---

## Objective

Update the React and ReactDOM peer dependencies, dev dependencies, and all React-adjacent packages to versions compatible with React 19.2. Remove Yarn resolutions that pin React to v17. Run an initial smoke test to catalog all immediate breakages, then address the critical ones to achieve a compiling (but not necessarily fully passing) state.

---

## Background

The current dependency landscape is:

**`package.json` peer dependencies (line 183-186):**
```json
"peerDependencies": {
  "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
  "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0"
}
```

**`package.json` dev dependencies (lines 150-154, 162):**
```json
"react": "^17.0.0",
"react-dom": "^17.0.0",
"react-test-renderer": "^17.0.0"
```

**`package.json` resolutions (lines 187-196):**
```json
"resolutions": {
  "babel-plugin-universal-import": "^2.0.2",
  "react": "^17.0.0",
  "react-dom": "^17.0.0",
  "react-is": "^17.0.0",
  "react-router": "^5.0.0",
  "react-router-dom": "^5.0.0",
  "react-test-renderer": "^17.0.0",
  "react-universal-component": "^3.0.3"
}
```

**`package.json` direct dependency (line 77):**
```json
"react-is": "^16.8.6 || ^17.0.0 || ^18.0.0"
```

**`package.json` direct dependency (line 78):**
```json
"react-popper": "^2.3.0"
```

**Enzyme adapter (line 98):**
```json
"@wojtekmaj/enzyme-adapter-react-17": "^0.1.1"
```

**Karma config (`karma.conf.babel.js`, lines 62-64)** loads React UMD bundles directly:
```js
'./node_modules/react/umd/react.development.js',
'./node_modules/react-dom/umd/react-dom.development.js',
'./node_modules/react-dom/umd/react-dom-server.browser.development.js',
```

**Test setup (`test/setup.js`, line 5):**
```js
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
```

React 19 introduces several breaking changes:
- `react-dom/server` no longer ships `react-dom-server.browser.development.js` as a UMD bundle
- `react-test-renderer` is deprecated and moved to a separate package
- `react-is` has a new major version aligned with React 19
- The legacy context API, string refs, and `defaultProps` on function components emit warnings
- `forwardRef` is no longer required (refs are passed as regular props), though the existing `forwardRef` usage still works

---

## Detailed Tasks

### 1. Update peer dependencies in `package.json`

Change the `peerDependencies` to accept React 19:

```json
"peerDependencies": {
  "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
  "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
}
```

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 2. Update React dev dependencies

Update the React packages used for development and testing:

```json
"devDependencies": {
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-test-renderer": "^19.2.0"
}
```

Note: `react-test-renderer` is deprecated in React 19 but still available as a compatibility package. It is needed until the test infrastructure is migrated away from Enzyme (a later phase).

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 3. Update `react-is` dependency

The `react-is` package must be updated to include React 19 support:

```json
"dependencies": {
  "react-is": "^16.8.6 || ^17.0.0 || ^18.0.0 || ^19.0.0"
}
```

Install the React 19 compatible version for development:

```bash
yarn add react-is@^19.0.0
```

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 4. Remove or update Yarn resolutions

The `resolutions` block currently pins everything to React 17. This must be updated:

```json
"resolutions": {
  "babel-plugin-universal-import": "^2.0.2",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-is": "^19.0.0",
  "react-router": "^5.0.0",
  "react-router-dom": "^5.0.0",
  "react-test-renderer": "^19.2.0",
  "react-universal-component": "^3.0.3"
}
```

Alternatively, if the resolution overrides are no longer needed (because the direct dependencies already resolve correctly), remove the React-related resolutions entirely and keep only the non-React ones:

```json
"resolutions": {
  "babel-plugin-universal-import": "^2.0.2",
  "react-router": "^5.0.0",
  "react-router-dom": "^5.0.0",
  "react-universal-component": "^3.0.3"
}
```

Prefer the second approach (removing React resolutions) unless specific sub-dependencies require pinning.

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 5. Update `react-popper` to a React 19 compatible version

`react-popper@^2.3.0` uses `React.forwardRef` and may have peer dependency issues with React 19. Check for a newer release:

```bash
yarn info react-popper versions
```

If `react-popper` v2.x does not support React 19, investigate alternatives:
- `@floating-ui/react` (the successor to react-popper)
- Pin to the latest 2.x and suppress peer dependency warnings

For now, attempt to install the latest 2.x release. If it fails peer dependency checks, add it to `peerDependenciesMeta` or use a resolution override.

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 6. Update the Enzyme adapter

The `@wojtekmaj/enzyme-adapter-react-17` does not support React 19. There is no official Enzyme adapter for React 19 (Enzyme is effectively unmaintained for React 18+).

For this phase, the strategy is:

1. Check if `@wojtekmaj/enzyme-adapter-react-18` exists and if it works with React 19 (it may, since React 19's rendering model is similar to 18).
2. If no adapter works, install a community fork or shim.
3. As a last resort, temporarily disable the Enzyme-based test suite and document it in `KNOWN-ISSUES.md`. The full test migration to React Testing Library is a separate, later phase.

Update `test/setup.js` if the adapter changes:

```js
// Before:
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

// After (if using react-18 adapter):
import Adapter from '@wojtekmaj/enzyme-adapter-react-18'
```

**Files:**
- `J:\code\semantic\Semantic-UI-React\package.json`
- `J:\code\semantic\Semantic-UI-React\test\setup.js`

### 7. Update Karma config for React 19 UMD bundles

React 19 changes the UMD bundle paths. The Karma config at `karma.conf.babel.js` (lines 58-64) loads specific UMD files:

```js
files: [
  './node_modules/@babel/standalone/babel.js',
  './node_modules/lodash/lodash.js',
  './node_modules/react/umd/react.development.js',
  './node_modules/react-dom/umd/react-dom.development.js',
  './node_modules/react-dom/umd/react-dom-server.browser.development.js',
  // ...
]
```

In React 19:
- `react/umd/react.development.js` may still exist or may have moved to `react/umd/react.development.mjs`
- `react-dom/umd/react-dom.development.js` similarly
- `react-dom/umd/react-dom-server.browser.development.js` may not exist -- server rendering is now in `react-dom/server`

After installing React 19, check which UMD files actually exist:

```bash
ls node_modules/react/umd/
ls node_modules/react-dom/umd/
```

Update the file paths accordingly. If UMD bundles are no longer available, the Karma externals configuration in `webpack.karma.config.js` must also be updated to bundle React instead of treating it as an external.

**Files:**
- `J:\code\semantic\Semantic-UI-React\karma.conf.babel.js`
- `J:\code\semantic\Semantic-UI-React\webpack.karma.config.js`

### 8. Update the Webpack UMD config externals

The `webpack.umd.config.js` at lines 15-18 declares React as external:

```js
externals: {
  react: 'React',
  'react-dom': 'ReactDOM',
},
```

This should continue to work with React 19 since the UMD global names remain `React` and `ReactDOM`. Verify this is still correct after installation.

**File:** `J:\code\semantic\Semantic-UI-React\webpack.umd.config.js` (verify, likely no changes)

### 9. Address `@fluentui/react-component-event-listener` compatibility

The `@fluentui/react-component-event-listener@~0.63.0` package (line 69) has a peer dependency on React 16/17. Check if it works with React 19:

```bash
yarn info @fluentui/react-component-event-listener peerDependencies
```

If it does not support React 19, find the latest version that does or replace it with an equivalent (`addEventListener` wrapper).

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 10. Address `@semantic-ui-react/event-stack` compatibility

The `@semantic-ui-react/event-stack@^3.1.3` package (line 71) is an internal package for this project. Check its peer dependencies and update if necessary.

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 11. Run initial smoke test and catalog breakages

After all dependency updates, run:

```bash
# Compile check -- does Babel transpilation succeed?
yarn cross-env NODE_ENV=build babel src --out-dir /tmp/react19-smoke-test

# TypeScript check
yarn tsd:test

# Test suite (expect failures)
yarn test 2>&1 | tee docs/react19/phase-03-smoke-test-output.txt
```

Catalog all errors into `docs/react19/KNOWN-ISSUES.md` with severity ratings. Common expected issues:

- `ReactDOM.render` is removed (docs site uses it, not the library itself)
- `react-dom/server` import path changes
- Enzyme adapter failures
- Console warnings about deprecated APIs (`defaultProps` on function components, legacy context)
- `react-is` API changes (`isValidElementType` behavior)

### 12. Address critical compilation blockers

Fix only the issues that prevent the library source code from compiling. Do NOT fix test failures or docs-site failures in this phase. The goal is:

1. `yarn cross-env NODE_ENV=build babel src -d dist/commonjs` succeeds
2. `yarn cross-env NODE_ENV=build-es babel src -d dist/es` succeeds
3. `yarn cross-env NODE_ENV=build-umd webpack --config webpack.umd.config.js` succeeds

---

## Files Affected

| File Path                                                  | Action   |
|------------------------------------------------------------|----------|
| `package.json`                                             | Modify   |
| `yarn.lock`                                                | Regenerate |
| `karma.conf.babel.js`                                      | Modify   |
| `webpack.karma.config.js`                                  | Possibly modify |
| `webpack.umd.config.js`                                    | Verify   |
| `test/setup.js`                                            | Modify   |
| `docs/react19/KNOWN-ISSUES.md`                             | Update   |
| `docs/react19/MIGRATION-STATUS.md`                         | Update   |
| `docs/react19/phase-03-smoke-test-output.txt`              | Create   |
| `src/lib/factories.js` (uses `React.createElement`)        | Possibly modify |
| `src/lib/isRefObject.js`                                   | Verify   |

---

## Acceptance Criteria

- [ ] `package.json` peer dependencies include `^19.0.0` for react and react-dom
- [ ] `package.json` dev dependencies specify `react@^19.2.0` and `react-dom@^19.2.0`
- [ ] React 17 resolutions are removed from the `resolutions` block
- [ ] `react-is` dependency includes `^19.0.0` in its range
- [ ] `yarn install` completes without errors
- [ ] `node -e "console.log(require('react').version)"` outputs `19.2.x`
- [ ] `yarn cross-env NODE_ENV=build babel src -d dist/commonjs` succeeds (library compiles)
- [ ] `yarn cross-env NODE_ENV=build-es babel src -d dist/es` succeeds
- [ ] UMD build either succeeds or has a documented blocker in KNOWN-ISSUES.md
- [ ] All known breakages are cataloged in `KNOWN-ISSUES.md` with severity ratings
- [ ] `MIGRATION-STATUS.md` updated: PHASE-03 status set to "Completed"
- [ ] Smoke test output is saved to `docs/react19/phase-03-smoke-test-output.txt`

---

## Rollback Strategy

1. **Revert `package.json`** to the PHASE-02 state:
   ```bash
   git checkout HEAD~1 -- package.json
   ```

2. **Restore the lockfile:**
   ```bash
   rm -rf node_modules
   git checkout HEAD~1 -- yarn.lock
   yarn install
   ```

3. **Restore test setup:**
   ```bash
   git checkout HEAD~1 -- test/setup.js karma.conf.babel.js
   ```

4. **Verify rollback:** Run `yarn test` and confirm all tests pass against React 17.

Since this phase makes significant changes, it is strongly recommended to create a git tag before starting:

```bash
git tag pre-phase-03
```

---

## Notes for AI Agents

1. **This is the highest-risk phase.** It touches the core dependency that the entire library is built around. Expect cascading failures. The goal is NOT to fix everything -- it is to get the library to compile and to catalog what is broken.

2. **Do not attempt to fix all test failures.** There are 203 test spec files using Enzyme. The Enzyme migration is a separate effort. In this phase, if the test suite cannot run at all (adapter crash), document it and move on.

3. **The `src/lib/factories.js` file** uses `React.createElement` directly (2 occurrences). This is fine for React 19 -- `React.createElement` still works. Do not change it in this phase; it will be addressed when the new JSX transform is configured in Phase 05.

4. **React 19 removes `react-dom/test-utils`.** If any test helpers import from `react-dom/test-utils`, they will break. The `act()` function is now exported directly from `react`. Note this in KNOWN-ISSUES.md.

5. **The 158 `forwardRef` usages across source files** do not need to be changed in this phase. React 19 still supports `forwardRef` -- it is just no longer necessary. Removing `forwardRef` is a future optimization phase, not a requirement for React 19 compatibility.

6. **When checking UMD bundle paths** for React 19, use `ls` or `dir` on the actual `node_modules/react/umd/` directory after installation. Do not rely on documentation alone -- the file structure varies between React 19 release candidates and the stable release.

7. **The `react-hot-loader/babel` plugin** in `.babel-preset.js` (line 87) is React 16/17 era and is incompatible with React 19. For this phase, conditionally disable it or remove it from the development plugins. React Fast Refresh (built into modern bundlers) is the replacement, but that is a build-system concern for a later phase.

8. **Do not change the `@babel/preset-react` configuration** in this phase. The JSX transform mode (`classic` vs `automatic`) is addressed in Phase 05.

9. **Commit message format:** Use `feat(react19): phase 03 - update react and react-dom to 19.2` as the commit message.

10. **If `react-popper@2.x` is completely incompatible** with React 19 and no version works, document this in KNOWN-ISSUES.md as a Blocker. The Popup component depends on it, and an alternative (like `@floating-ui/react`) would need to be evaluated.
