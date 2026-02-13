# Phase 05: Update Babel Configuration for New JSX Transform

| Field               | Value                                                              |
|---------------------|--------------------------------------------------------------------|
| **Phase ID**        | PHASE-05                                                           |
| **Title**           | Update Babel Configuration for New JSX Transform                    |
| **Stage**           | Stage 1 -- Core Dependency Upgrade                                 |
| **Dependencies**    | PHASE-03 (React 19.2 must be installed)                            |
| **Complexity**      | Medium                                                             |
| **Estimated Scope** | ~265 files (257 `.js` source files + 8 config files)              |

---

## Objective

Switch the Babel JSX transform from the "classic" runtime (`React.createElement`) to the "automatic" runtime (`jsx`/`jsxs` from `react/jsx-runtime`), update all `@babel/*` packages to their latest compatible versions, remove the now-unnecessary `import * as React from 'react'` statements from source files that only use JSX (not React APIs), remove deprecated or incompatible Babel plugins, and verify all three build outputs (CommonJS, ES modules, UMD).

---

## Background

The current Babel configuration consists of two files:

**`.babelrc` (`J:\code\semantic\Semantic-UI-React\.babelrc`):**
```json
{
  "presets": ["./.babel-preset.js"]
}
```

**`.babel-preset.js` (`J:\code\semantic\Semantic-UI-React\.babel-preset.js`):**
The preset configures Babel with:
- `@babel/preset-env` (with `loose: true` and browser targets)
- `@babel/preset-react` (using the **classic** transform -- no `runtime` option specified, which defaults to `"classic"`)
- Multiple plugins for optimization and transformation

Key aspects of the current configuration:

1. **`@babel/preset-react`** (line 82) uses the classic transform, meaning every JSX file must have `React` in scope (either via `import React` or `import * as React`).

2. **314 files** contain `import * as React from 'react'` -- this includes all 257 `.js` source files (some also have `.d.ts` counterparts with the same import).

3. **Only 5 files** use `import React from 'react'` (the default import style), and those are in special locations like `FormField.js`, `AccordionPanel.js`, `Dropdown.js`, `ListItem.js`, and `usePortalElement.js`.

4. **`src/lib/factories.js`** uses `React.createElement` directly (2 occurrences). This file needs the React import regardless of the JSX transform.

5. **`react-hot-loader/babel`** plugin (line 87 of `.babel-preset.js`) is enabled for development mode. This is incompatible with React 19 and must be removed.

6. **`babel-plugin-transform-react-handled-props`** (line 51) and **`babel-plugin-transform-react-remove-prop-types`** (line 52-57) are used for production builds. These need to be verified for compatibility with the automatic JSX transform.

7. **The `@babel/plugin-proposal-export-default-from`** (line 19) is deprecated in favor of `@babel/plugin-transform-export-default-from` in newer Babel versions.

8. **`@babel/plugin-syntax-dynamic-import`** (line 20) is now included in `@babel/preset-env` by default and can be removed.

**Current `@babel/*` versions** (from `package.json`):
```
@babel/cli: ^7.23.4
@babel/core: ^7.23.7
@babel/plugin-proposal-export-default-from: ^7.23.3
@babel/plugin-transform-runtime: ^7.23.7
@babel/preset-env: ^7.23.7
@babel/preset-react: ^7.23.3
@babel/register: ^7.23.7
@babel/runtime: ^7.23.7
@babel/standalone: ^7.23.7
```

---

## Detailed Tasks

### 1. Update all `@babel/*` packages to latest

Update every Babel package to the latest stable version:

```bash
yarn add -D @babel/cli@latest @babel/core@latest @babel/preset-env@latest @babel/preset-react@latest @babel/register@latest @babel/standalone@latest @babel/plugin-transform-runtime@latest
yarn add @babel/runtime@latest
```

Also update the community Babel plugins:

```bash
yarn add -D babel-loader@latest babel-plugin-lodash@latest babel-plugin-istanbul@latest
```

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 2. Replace deprecated `@babel/plugin-proposal-export-default-from`

The `proposal` variant is deprecated. Replace with the `transform` variant:

```bash
yarn remove @babel/plugin-proposal-export-default-from
yarn add -D @babel/plugin-transform-export-default-from
```

Update `.babel-preset.js` line 19:

```js
// Before:
'@babel/plugin-proposal-export-default-from',

// After:
'@babel/plugin-transform-export-default-from',
```

**File:** `J:\code\semantic\Semantic-UI-React\.babel-preset.js`

### 3. Remove `@babel/plugin-syntax-dynamic-import`

This plugin is included in `@babel/preset-env` since Babel 7.x and is no longer needed as a standalone plugin.

Remove from `.babel-preset.js` line 20:

```js
// Remove this line:
'@babel/plugin-syntax-dynamic-import',
```

**File:** `J:\code\semantic\Semantic-UI-React\.babel-preset.js`

### 4. Configure `@babel/preset-react` for automatic runtime

Update `.babel-preset.js` to use the automatic JSX transform:

```js
// Before (line 82):
'@babel/react',

// After:
['@babel/react', { runtime: 'automatic' }],
```

The full presets array becomes:

```js
presets: [
  [
    '@babel/env',
    {
      modules: isESBuild || isUMDBuild ? false : 'commonjs',
      loose: true,
      targets: { browsers },
    },
  ],
  ['@babel/react', { runtime: 'automatic' }],
],
```

With `runtime: 'automatic'`:
- Babel will automatically insert `import { jsx as _jsx } from 'react/jsx-runtime'` into transpiled files
- Files no longer need `React` in scope just for JSX
- `React.createElement` is no longer used by the transpiler (but can still be called manually)

**File:** `J:\code\semantic\Semantic-UI-React\.babel-preset.js`

### 5. Remove `react-hot-loader/babel` plugin

The `react-hot-loader` ecosystem is abandoned and incompatible with React 19. React Fast Refresh (via `react-refresh/babel`) is the modern replacement, but integrating it is a docs-site concern, not a library build concern.

Remove from `.babel-preset.js` lines 86-88:

```js
// Remove this entire env.development block:
env: {
  development: {
    plugins: ['react-hot-loader/babel'],
  },
  // ...
}

// Replace with:
env: {
  // development: no special plugins needed
  test: {
    plugins: [['istanbul', { include: ['src'] }]],
  },
},
```

Also remove `react-hot-loader` from devDependencies:

```bash
yarn remove react-hot-loader
```

**Files:**
- `J:\code\semantic\Semantic-UI-React\.babel-preset.js`
- `J:\code\semantic\Semantic-UI-React\package.json`

### 6. Verify `babel-plugin-transform-react-handled-props` compatibility

This plugin (`babel-plugin-transform-react-handled-props@^2.1.0`) inspects components to identify which props are explicitly handled. It works by analyzing `PropTypes` declarations and `React.forwardRef` calls.

Test compatibility:
```bash
echo "import * as React from 'react'; const C = React.forwardRef((props, ref) => <div ref={ref} />); export default C;" > /tmp/test.js
npx babel /tmp/test.js --presets ./.babel-preset.js --plugins babel-plugin-transform-react-handled-props
```

If the plugin fails with the automatic JSX transform, check for an updated version or remove it. The `handledProps` static property it generates is used by `getUnhandledProps.js` in the library's runtime.

**File:** `J:\code\semantic\Semantic-UI-React\.babel-preset.js` (possibly modify)

### 7. Verify `babel-plugin-transform-react-remove-prop-types` compatibility

This plugin (`babel-plugin-transform-react-remove-prop-types@^0.4.24`) strips PropTypes in production builds. It needs to work with the automatic JSX transform.

Test:
```bash
NODE_ENV=build-umd npx babel src/elements/Button/Button.js --out-file /tmp/button-test.js
```

Verify the output does not contain PropTypes definitions (in UMD mode) and that no errors are thrown.

**File:** `J:\code\semantic\Semantic-UI-React\.babel-preset.js` (verify)

### 8. Verify `babel-plugin-transform-next-use-client` compatibility

This plugin (`babel-plugin-transform-next-use-client@^1.1.1`, line 37-41) adds `"use client"` directives. It should be unaffected by the JSX transform change. Verify it still works:

```bash
NODE_ENV=build npx babel src/lib/hooks/useAutoControlledValue.js
```

The output should contain `"use client";` at the top.

**File:** `J:\code\semantic\Semantic-UI-React\.babel-preset.js` (verify)

### 9. Remove unnecessary React imports from source files

With the automatic JSX transform, files that only use JSX (and no React APIs like `useRef`, `useState`, `forwardRef`, `createElement`, etc.) no longer need to import React.

However, in this project, **every component file uses `React.forwardRef`**, meaning the React import IS still needed in those files. The import is also needed in files that use:
- `React.forwardRef` (158 files)
- `React.createElement` (1 file: `src/lib/factories.js`)
- `React.isValidElement` (used in several files via `react-is`)
- `React.cloneElement` (used in some files)
- `React.Children` (used in some files)
- Custom hooks from React (`useRef`, `useState`, `useCallback`, etc.)

**Strategy:** Do NOT blindly remove all React imports. Instead:

1. Identify files that import React **only for JSX** (no API usage):
   ```bash
   # Files with React import but no React.* usage besides JSX
   ```

   In practice, very few files in this codebase fall into this category because nearly all components use `React.forwardRef`. The files that may qualify are:
   - Some `.d.ts` files (but those use `React.*` types)
   - Some test utility files
   - The `AccordionPanel.js` file (uses `React` default import for `React.isValidElement`)

2. For files that DO use React APIs, change the import style from:
   ```js
   import * as React from 'react'
   ```
   to named imports where practical:
   ```js
   import { forwardRef, useRef } from 'react'
   ```

   **However, this is a massive refactor (158+ files) and is risky.** The safer approach for this phase is to **keep all existing React imports** and simply enable the automatic transform. The imports are not harmful -- they are just unnecessary for JSX. The automatic transform will still be used, and the unused `React` import can be removed in a follow-up cleanup phase.

**Recommendation for this phase:** Keep all `import * as React from 'react'` statements. The automatic JSX transform works regardless of whether React is imported. The import removal is a cosmetic cleanup that can happen later with a lint rule (`react/jsx-uses-react: off`, `react/react-in-jsx-scope: off`).

### 10. Update ESLint configuration for new JSX transform

After enabling the automatic transform, ESLint will report unused React imports. Update the ESLint config to disable the rules that require React to be in scope:

Find the ESLint config file (`.eslintrc.js`, `.eslintrc.json`, or `eslintConfig` in `package.json`) and add:

```json
{
  "rules": {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

This tells ESLint that React does not need to be in scope for JSX (since the automatic transform handles it).

**File:** ESLint configuration file (identify location first)

### 11. Update the `loose` option in `@babel/preset-env`

The `loose: true` option on `@babel/preset-env` (line 79 of `.babel-preset.js`) is deprecated in newer Babel versions. Babel now recommends using `assumptions` at the top level instead:

```js
module.exports = () => ({
  compact: false,
  assumptions: {
    setPublicClassFields: true,
    privateFieldsAsProperties: true,
  },
  presets: [
    [
      '@babel/env',
      {
        modules: isESBuild || isUMDBuild ? false : 'commonjs',
        targets: { browsers },
        // Remove 'loose: true'
      },
    ],
    ['@babel/react', { runtime: 'automatic' }],
  ],
  // ...
})
```

**Note:** This may change the output code slightly. Test all three build outputs after this change.

**File:** `J:\code\semantic\Semantic-UI-React\.babel-preset.js`

### 12. Test all three build outputs

After all Babel changes, run each build target and verify:

#### 12a. CommonJS build
```bash
yarn cross-env NODE_ENV=build babel src -d dist/commonjs
```

Verify:
- Output files exist in `dist/commonjs/`
- A sample output file (e.g., `dist/commonjs/elements/Button/Button.js`) contains `require("react/jsx-runtime")` (automatic transform) instead of `React.createElement`
- `require("react")` is present only if the source file uses React APIs (like `React.forwardRef`)

#### 12b. ES modules build
```bash
yarn cross-env NODE_ENV=build-es babel src -d dist/es
```

Verify:
- Output files exist in `dist/es/`
- A sample output file uses `import { jsx as _jsx } from "react/jsx-runtime"` instead of `React.createElement`
- ES module syntax (`import`/`export`) is preserved (no `require` calls)

#### 12c. UMD build
```bash
yarn cross-env NODE_ENV=build-umd webpack --config webpack.umd.config.js
```

Verify:
- `dist/umd/semantic-ui-react.min.js` is generated
- The file size is within 20% of the previous build size (the automatic transform may slightly change size)
- The UMD bundle correctly externalizes React (`externals: { react: 'React' }`)

### 13. Run the UMD test

```bash
yarn test:umd
```

This runs `test/umd.js` which verifies the UMD bundle can be loaded and exports all expected components.

**File:** `J:\code\semantic\Semantic-UI-React\test\umd.js` (verify, likely no changes needed)

### 14. Update `@babel/standalone` reference in Karma

The Karma config loads `@babel/standalone` for in-browser Babel transformation (line 59 of `karma.conf.babel.js`):

```js
files: [
  './node_modules/@babel/standalone/babel.js',
  // ...
]
```

After updating `@babel/standalone` to the latest version, verify this file still exists at the expected path and is loadable by Karma.

**File:** `J:\code\semantic\Semantic-UI-React\karma.conf.babel.js` (verify)

---

## Files Affected

| File Path                                        | Action   | Notes                               |
|--------------------------------------------------|----------|--------------------------------------|
| `.babel-preset.js`                               | Modify   | Core changes: runtime, plugins       |
| `.babelrc`                                       | Verify   | No changes expected                  |
| `package.json`                                   | Modify   | Update `@babel/*` versions, remove `react-hot-loader` |
| `yarn.lock`                                      | Regenerate | New Babel packages                  |
| ESLint config                                    | Modify   | Disable `react-in-jsx-scope` rule    |
| `karma.conf.babel.js`                            | Verify   | `@babel/standalone` path check       |
| `webpack.umd.config.js`                          | Verify   | Externals still correct              |
| `webpack.karma.config.js`                        | Verify   | Babel-loader still works             |
| `test/umd.js`                                    | Verify   | UMD export test                      |
| `docs/react19/MIGRATION-STATUS.md`               | Update   |                                      |
| `src/**/*.js` (257 files)                        | **Not modified in this phase** | React imports kept; removal is future cleanup |

---

## Acceptance Criteria

- [ ] `.babel-preset.js` uses `['@babel/react', { runtime: 'automatic' }]`
- [ ] `@babel/plugin-proposal-export-default-from` replaced with `@babel/plugin-transform-export-default-from`
- [ ] `@babel/plugin-syntax-dynamic-import` removed from plugin list
- [ ] `react-hot-loader` removed from devDependencies and from `.babel-preset.js`
- [ ] All `@babel/*` packages updated to latest stable versions
- [ ] CommonJS build succeeds: `yarn cross-env NODE_ENV=build babel src -d dist/commonjs`
- [ ] ES build succeeds: `yarn cross-env NODE_ENV=build-es babel src -d dist/es`
- [ ] UMD build succeeds: `yarn cross-env NODE_ENV=build-umd webpack --config webpack.umd.config.js`
- [ ] Sample CommonJS output file contains `require("react/jsx-runtime")`
- [ ] Sample ES output file contains `import { jsx } from "react/jsx-runtime"` (or `_jsx`)
- [ ] `yarn test:umd` passes
- [ ] `yarn lint` passes (after ESLint rule updates)
- [ ] `babel-plugin-transform-react-handled-props` works with automatic transform
- [ ] `babel-plugin-transform-react-remove-prop-types` works with automatic transform
- [ ] `babel-plugin-transform-next-use-client` works with automatic transform
- [ ] `MIGRATION-STATUS.md` updated: PHASE-05 status set to "Completed"

---

## Rollback Strategy

1. **Revert `.babel-preset.js`:**
   ```bash
   git checkout HEAD~1 -- .babel-preset.js
   ```

2. **Revert `package.json`** and **`yarn.lock`:**
   ```bash
   git checkout HEAD~1 -- package.json yarn.lock
   yarn install
   ```

3. **Revert ESLint config:**
   ```bash
   git checkout HEAD~1 -- <eslint-config-file>
   ```

4. **Verify rollback:**
   ```bash
   yarn cross-env NODE_ENV=build babel src -d dist/commonjs
   yarn test:umd
   ```

The Babel configuration is self-contained in `.babel-preset.js` and `.babelrc`, so rollback is straightforward.

---

## Notes for AI Agents

1. **The most critical change is Task 4** -- setting `runtime: 'automatic'` on `@babel/preset-react`. Everything else in this phase is cleanup and verification. If you encounter issues with other tasks, prioritize getting Task 4 working first.

2. **Do NOT remove `import * as React from 'react'` from source files in this phase.** This is explicitly deferred to a future cleanup phase. The automatic transform works with the existing imports -- they just become partially unused. Removing them is a 257-file change that should be its own atomic commit.

3. **The `loose: true` deprecation (Task 11) is optional in this phase.** If converting to `assumptions` causes unexpected output changes, revert Task 11 and keep `loose: true`. It still works; it just produces a console warning.

4. **When verifying build outputs,** check at least 3 sample files from different directories:
   - `dist/commonjs/elements/Button/Button.js` (a complex component)
   - `dist/es/modules/Dropdown/Dropdown.js` (the most complex component, 92 PropTypes occurrences)
   - `dist/commonjs/lib/factories.js` (uses `React.createElement` directly -- should still use it, not the automatic transform, since it is a runtime call, not JSX)

5. **The `babel-plugin-transform-react-handled-props` plugin is critical** to this project's architecture. The `getUnhandledProps` utility (`src/lib/getUnhandledProps.js`) relies on the `handledProps` static property that this plugin generates. If this plugin breaks with the automatic transform, it is a blocker. Investigate whether the plugin has been updated, or consider inlining its logic.

6. **The `babel-plugin-filter-imports` plugin** (lines 61-68 of `.babel-preset.js`) removes `makeDebugger` in library builds. This should be unaffected by the JSX transform change. Verify but do not change.

7. **The `babel-plugin-lodash` plugin** (line 35) rewrites lodash imports for tree-shaking. This is unrelated to JSX and should work fine. Verify but do not change.

8. **The `babel-plugin-transform-rename-import` plugin** (lines 44-49) renames `lodash` to `lodash-es` in ES/UMD builds. This is unrelated to JSX. Verify but do not change.

9. **The `@babel/standalone` package** is used only in the Karma test runner for in-browser Babel compilation. If the updated version has issues, it is a test infrastructure problem, not a library build problem. Document in KNOWN-ISSUES.md and move on.

10. **Commit message format:** Use `chore(react19): phase 05 - switch to automatic jsx transform and update babel` as the commit message.

11. **The `universal-import` overrides block** (lines 93-103 of `.babel-preset.js`) is for the docs site's code-splitting configuration. It should not interact with the JSX transform change. Leave it unchanged unless it causes errors.

12. **After this phase completes, the library is buildable with React 19.2** and the modern JSX transform. The remaining migration work (test infrastructure, Enzyme removal, forwardRef cleanup, docs site) is in subsequent phases not covered by this document.
