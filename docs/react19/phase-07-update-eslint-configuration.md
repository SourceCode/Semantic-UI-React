# Phase 07: Update ESLint to Flat Config with eslint-plugin-react-hooks v6

| Field         | Value                                          |
|---------------|------------------------------------------------|
| **Phase ID**  | PHASE-07                                       |
| **Title**     | Update ESLint to Flat Config with eslint-plugin-react-hooks v6 |
| **Stage**     | 1 -- Foundation & Tooling                      |
| **Dependencies** | Phase 05 (Dependency Upgrades)              |
| **Complexity** | Medium                                        |
| **Scope**     | Linting configuration, parser, plugins, all .eslintrc files |

---

## Objective

Upgrade ESLint from v7 to v9+, migrate from the legacy `.eslintrc` JSON configuration format to the new flat config format (`eslint.config.js`), replace the deprecated `babel-eslint` parser with `@babel/eslint-parser`, upgrade `eslint-plugin-react-hooks` to v6 (which includes React Compiler lint rules), and consolidate all five scattered `.eslintrc` files into a single `eslint.config.js` with targeted overrides.

---

## Background

The current ESLint setup consists of five configuration files forming an inheritance chain:

### Root Configuration
**File:** `J:\code\semantic\Semantic-UI-React\.eslintrc`
- Parser: `babel-eslint` (deprecated, last release 2020)
- Extends: `airbnb`, `prettier`, `plugin:react-hooks/recommended`
- Environment: `browser: true`
- 30+ custom rule overrides disabling many airbnb defaults
- TypeScript override block using `@typescript-eslint/parser` (v3.7.1) for `.ts`/`.tsx` files
- Extends `eslint:recommended`, `plugin:@typescript-eslint/eslint-recommended`, `plugin:@typescript-eslint/recommended` in TS override

### Test Configuration
**File:** `J:\code\semantic\Semantic-UI-React\test\.eslintrc`
- Inherits from root
- Environment: `browser`, `node`, `mocha`
- Globals: `enzyme`, `expect`, `mount`, `shallow`, `render` (all read-only)
- Plugin: `eslint-plugin-mocha`
- Disables several jsx-a11y and react rules for test flexibility

### Docs Configuration
**File:** `J:\code\semantic\Semantic-UI-React\docs\.eslintrc`
- Inherits from root
- Globals: `__DEV__`, `__TEST__`, `__PATH_SEP__`, `__PROD__` (all read-only)
- Disables jsx-a11y and react rules for documentation examples

### Docs Examples Configuration
**File:** `J:\code\semantic\Semantic-UI-React\docs\src\examples\.eslintrc`
- Inherits from docs config
- Restricts imports: no relative imports (`../*`, `./*`) in examples
- Override: `index.js` files exempt from import restriction
- Override: `**/*Example*.js` files exempt from `react/prop-types`

### Cypress Configuration
**File:** `J:\code\semantic\Semantic-UI-React\cypress\.eslintrc`
- Inherits from root
- Plugin: `eslint-plugin-cypress`
- Environment: `cypress/globals: true`
- Five cypress-specific rules configured

### Current devDependencies (ESLint ecosystem)
```
"babel-eslint": "^10.1.0"
"eslint": "^7.5.0"
"eslint-config-airbnb": "^18.2.0"
"eslint-config-prettier": "^6.11.0"
"eslint-plugin-cypress": "^2.11.2"
"eslint-plugin-import": "^2.22.0"
"eslint-plugin-jsx-a11y": "^6.3.1"
"eslint-plugin-mocha": "^7.0.1"
"eslint-plugin-react": "^7.20.4"
"eslint-plugin-react-hooks": "^4.0.8"
"@typescript-eslint/eslint-plugin": "^3.7.1"
"@typescript-eslint/parser": "^3.7.1"
```

### Key Migration Challenges

1. **`babel-eslint` is dead.** It was deprecated in favor of `@babel/eslint-parser` in 2020. The current version (10.1.0) does not support ESLint v9.

2. **`eslint-config-airbnb` does not support flat config.** The airbnb config must be replaced with either `eslint-config-airbnb-base` wrapped in a flat config compatibility layer, or the rules must be manually extracted. As of 2025, `@vercel/style-guide` or the community `eslint-config-flat-airbnb` are alternatives.

3. **Flat config eliminates cascading `.eslintrc` files.** All five `.eslintrc` files must be consolidated into a single `eslint.config.js` using the `files` array in each config object to scope rules to specific directories.

4. **`eslint-plugin-react-hooks` v6** introduces React Compiler lint rules (`react-compiler/react-compiler`) and may change the severity or behavior of existing hooks rules. The `exhaustive-deps` rule may have updated heuristics.

5. **The test globals (`enzyme`, `mount`, `shallow`, `render`, `expect`)** will change when Enzyme is replaced (Phase 09) and Mocha/Chai are replaced (Phase 10). The ESLint config should anticipate this by using comments or separate config blocks that are easy to update.

---

## Detailed Tasks

### 1. Upgrade ESLint to v9+

Update `J:\code\semantic\Semantic-UI-React\package.json`:
- `"eslint": "^7.5.0"` --> `"eslint": "^9.0.0"`

ESLint v9 requires flat config by default. The `ESLINT_USE_FLAT_CONFIG=false` env var can temporarily enable legacy mode, but the goal is full flat config migration.

### 2. Replace babel-eslint with @babel/eslint-parser

Remove from devDependencies:
- `"babel-eslint": "^10.1.0"`

Add to devDependencies:
- `"@babel/eslint-parser": "^7.23.0"`

The `@babel/eslint-parser` requires `@babel/core` (already present at ^7.23.7) and works with ESLint v9 flat config. It is configured per config object rather than as a top-level `parser` string:

```js
import babelParser from '@babel/eslint-parser'

export default [
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
      },
    },
  },
]
```

### 3. Upgrade all eslint-plugin-* packages

Update the following in `J:\code\semantic\Semantic-UI-React\package.json`:

| Package | Current | Target |
|---------|---------|--------|
| `eslint-plugin-react-hooks` | ^4.0.8 | ^6.0.0 |
| `eslint-plugin-react` | ^7.20.4 | ^7.37.0+ |
| `eslint-plugin-import` | ^2.22.0 | ^2.31.0+ or `eslint-plugin-import-x` |
| `eslint-plugin-jsx-a11y` | ^6.3.1 | ^6.10.0+ |
| `eslint-plugin-cypress` | ^2.11.2 | ^4.1.0+ (supports flat config) |
| `@typescript-eslint/eslint-plugin` | ^3.7.1 | ^8.0.0+ |
| `@typescript-eslint/parser` | ^3.7.1 | ^8.0.0+ |
| `eslint-config-prettier` | ^6.11.0 | ^9.1.0+ |

Remove:
- `eslint-plugin-mocha` (^7.0.1) -- will be replaced when migrating to Vitest (Phase 10); can be removed now if mocha-specific rules are minimal
- `eslint-config-airbnb` (^18.2.0) -- does not support flat config

### 4. Handle the airbnb config replacement

`eslint-config-airbnb` v18 extends `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react-hooks`. It does not support ESLint v9 flat config.

Options (choose one):
- **Option A (recommended):** Extract the specific airbnb rules currently active (after accounting for the 30+ overrides in the root `.eslintrc` that disable most of them) into the flat config directly. Most airbnb rules the project actually uses are the defaults from `eslint:recommended` plus a handful of style rules.
- **Option B:** Use `@eslint/eslintrc` compatibility utility (`FlatCompat`) to wrap the legacy airbnb config. This is a transitional approach.
- **Option C:** Use `eslint-config-flat-airbnb` community package if available and stable.

Audit the active rules by running `eslint --print-config src/elements/Button/Button.js` with the current config to see which airbnb rules are actually enforced after all overrides.

### 5. Create eslint.config.js (flat config)

Create `J:\code\semantic\Semantic-UI-React\eslint.config.js` that consolidates all five `.eslintrc` files:

```js
// eslint.config.js
import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import prettierConfig from 'eslint-config-prettier'
import cypressPlugin from 'eslint-plugin-cypress'

export default [
  // 1. Base config for all JS files
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: { requireConfigFile: true },
      globals: { /* browser globals */ },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
    },
    rules: {
      // Port all rules from current root .eslintrc
      // Include react-hooks/recommended rules
      // Add react-compiler rules from v6
    },
  },

  // 2. TypeScript override
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },

  // 3. Test files override (replaces test/.eslintrc)
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        enzyme: 'readonly',  // Remove after Phase 09
        expect: 'readonly',  // Changes to Vitest global in Phase 10
        mount: 'readonly',   // Remove after Phase 09
        shallow: 'readonly', // Remove after Phase 09
        render: 'readonly',  // Remove after Phase 09
        mocha: 'readonly',   // Remove after Phase 10
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        before: 'readonly',
        after: 'readonly',
      },
    },
    rules: {
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'jsx-a11y/tabindex-no-positive': 'off',
      'react/forbid-foreign-prop-types': 'off',
      'react/prop-types': 'off',
    },
  },

  // 4. Docs override (replaces docs/.eslintrc)
  {
    files: ['docs/**/*.js'],
    languageOptions: {
      globals: {
        __DEV__: 'readonly',
        __TEST__: 'readonly',
        __PATH_SEP__: 'readonly',
        __PROD__: 'readonly',
      },
    },
    rules: {
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/href-no-hash': 'off',
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'react/no-array-index-key': 'off',
      'react/no-render-return-value': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  // 5. Docs examples override (replaces docs/src/examples/.eslintrc)
  {
    files: ['docs/src/examples/**/*.js'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: ['../*', './*', 'docs/src/examples/*'],
      }],
    },
  },
  {
    files: ['docs/src/examples/**/index.js'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['docs/src/examples/**/*Example*.js'],
    rules: {
      'react/prop-types': 'off',
    },
  },

  // 6. Cypress override (replaces cypress/.eslintrc)
  {
    files: ['cypress/**/*.js'],
    plugins: {
      cypress: cypressPlugin,
    },
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
      },
    },
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-force': 'warn',
      'cypress/no-async-tests': 'error',
    },
  },

  // 7. Prettier must be last to override formatting rules
  prettierConfig,
]
```

### 6. Add React Compiler ESLint rules

`eslint-plugin-react-hooks` v6 includes or works alongside the React Compiler ESLint plugin. Add the compiler rules:

Add to devDependencies:
- `eslint-plugin-react-compiler` (if separate from react-hooks v6)

Add to the base config rules:
```js
'react-compiler/react-compiler': 'warn',
```

Start with `warn` severity to identify violations without blocking the build. Promote to `error` once all violations are resolved.

### 7. Delete all legacy .eslintrc files

Delete the following five files:
- `J:\code\semantic\Semantic-UI-React\.eslintrc`
- `J:\code\semantic\Semantic-UI-React\test\.eslintrc`
- `J:\code\semantic\Semantic-UI-React\docs\.eslintrc`
- `J:\code\semantic\Semantic-UI-React\docs\src\examples\.eslintrc`
- `J:\code\semantic\Semantic-UI-React\cypress\.eslintrc`

### 8. Update the lint npm script

Update `J:\code\semantic\Semantic-UI-React\package.json`:

Current:
```json
"lint": "cross-env NODE_ENV=production eslint . --ext .js,.ts,.tsx"
```

New:
```json
"lint": "eslint ."
```

ESLint v9 flat config does not use `--ext`. File extensions are controlled by the `files` arrays in each config object. The `cross-env NODE_ENV=production` may no longer be needed (verify if any ESLint rules or configs read `NODE_ENV`).

### 9. Update lint-staged configuration

Current in `J:\code\semantic\Semantic-UI-React\package.json`:
```json
"lint-staged": {
  "**/*.{js,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix"
  ]
}
```

This should continue to work with ESLint v9. Verify that `eslint --fix` respects the flat config when run on individual staged files. If lint-staged passes file paths as arguments, flat config's `files` patterns must match those paths.

### 10. Update husky configuration

Current in `J:\code\semantic\Semantic-UI-React\package.json`:
```json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged",
    "post-commit": "git update-index --again"
  }
}
```

Husky v4 is configured inline in `package.json`. If upgrading husky to v9+ (recommended for modern Node.js), the configuration moves to `.husky/` directory. This is optional for this phase but recommended.

### 11. Run the linter and fix all new violations

After the migration:
1. Run `npm run lint` and capture all errors
2. Categorize violations:
   - Rules that changed severity between plugin versions (auto-fix where possible)
   - New rules introduced by upgraded plugins (decide: enable, disable, or configure)
   - React Compiler violations (address or suppress with comments)
3. Fix violations or add rule overrides
4. Ensure zero lint errors before committing

### 12. Verify TypeScript linting still works

The TypeScript override in the current `.eslintrc` uses `@typescript-eslint/parser` v3 and `@typescript-eslint/eslint-plugin` v3. After upgrading to v8+:
- Verify `J:\code\semantic\Semantic-UI-React\test\typings.tsx` lints cleanly
- Verify `J:\code\semantic\Semantic-UI-React\src/**/*.d.ts` files are handled correctly
- Ensure the `tsconfig.json` is found by the TypeScript ESLint parser (it may need `project: true` in `parserOptions`)

---

## Files Affected

| File | Action |
|------|--------|
| `.eslintrc` | DELETE |
| `test/.eslintrc` | DELETE |
| `docs/.eslintrc` | DELETE |
| `docs/src/examples/.eslintrc` | DELETE |
| `cypress/.eslintrc` | DELETE |
| `eslint.config.js` | CREATE |
| `package.json` | MODIFY (devDependencies, scripts, lint-staged) |

**Total: 5 files deleted, 1 file created, 1 file modified**

---

## Acceptance Criteria

- [ ] `npm run lint` passes with zero errors using ESLint v9+ and flat config
- [ ] `eslint.config.js` exists at project root and is the sole ESLint configuration
- [ ] No `.eslintrc`, `.eslintrc.js`, or `.eslintrc.json` files exist anywhere in the repository
- [ ] `babel-eslint` is removed from devDependencies
- [ ] `@babel/eslint-parser` is installed and configured as the parser for `.js`/`.jsx` files
- [ ] `eslint-plugin-react-hooks` is at v6+ and `react-hooks/recommended` rules are active
- [ ] React Compiler lint rules are configured (at minimum `warn` severity)
- [ ] `eslint-config-airbnb` is removed from devDependencies
- [ ] All five directory-specific ESLint scopes (root, test, docs, examples, cypress) are preserved as `files`-based overrides in flat config
- [ ] TypeScript files (`.ts`, `.tsx`) lint correctly with `@typescript-eslint/*` v8+
- [ ] `lint-staged` pre-commit hook works correctly with the new ESLint configuration
- [ ] The `eslint --fix` auto-fix functionality works in both CLI and editor integrations
- [ ] No ESLint deprecation warnings appear in the lint output

---

## Rollback Strategy

1. ESLint configuration is purely declarative. Rollback is trivial.
2. To rollback: `git checkout HEAD -- .eslintrc test/.eslintrc docs/.eslintrc docs/src/examples/.eslintrc cypress/.eslintrc package.json`
3. Delete `eslint.config.js`.
4. Run `yarn install` to restore old dependency versions.
5. Verify with `yarn lint`.

---

## Notes for AI Agents

1. **The biggest risk is `eslint-config-airbnb` removal.** Before deleting it, run `npx eslint --print-config src/elements/Button/Button.js > /tmp/current-rules.json` to capture the fully resolved rule set. Then after creating the flat config, run the same command and diff the outputs to ensure no unintended rule changes.

2. **`eslint-plugin-react-hooks` v6 is a significant upgrade.** The `exhaustive-deps` rule may flag new violations, particularly around `useCallback` and `useEffect` dependencies. This is intentional -- these are real bugs that the older version missed. Do not suppress them blindly.

3. **The test globals (`enzyme`, `mount`, `shallow`, `render`) are temporary.** Add a code comment in `eslint.config.js` marking them for removal in Phase 09. This makes it easy for future agents to find and clean up:
   ```js
   // TODO(Phase-09): Remove Enzyme globals after RTL migration
   enzyme: 'readonly',
   mount: 'readonly',
   shallow: 'readonly',
   render: 'readonly',
   ```

4. **`eslint-plugin-mocha` can be removed now** if the only mocha-specific rules are `mocha/no-exclusive-tests` and `mocha/no-skipped-tests`. These can be replaced with a simple `no-restricted-syntax` rule targeting `describe.only` and `it.only` calls, or deferred to Phase 10 when Mocha is fully removed.

5. **The `import/no-unresolved: off` rule in the current config** is set because the project uses Webpack aliases (`semantic-ui-react` -> `src/index.js`) that `eslint-plugin-import` cannot resolve. When migrating to flat config, consider adding `eslint-import-resolver-typescript` or `eslint-import-resolver-vite` to properly resolve these aliases instead of disabling the rule entirely.

6. **Do not change the `prettier` integration.** The `eslint-config-prettier` must remain as the last config in the flat config array to disable all formatting rules. Do not add `eslint-plugin-prettier` -- the project uses Prettier as a separate tool via `lint-staged`.

7. **The `jsx-a11y/href-no-hash` rule** in `docs/.eslintrc` is already removed in newer versions of `eslint-plugin-jsx-a11y` (replaced by `jsx-a11y/anchor-is-valid`). When migrating, simply drop this rule.

8. **Flat config does not support `env`** (e.g., `"env": { "browser": true }`). Browser globals must be explicitly provided via `languageOptions.globals` using the `globals` npm package:
   ```js
   import globals from 'globals'
   // ...
   languageOptions: {
     globals: {
       ...globals.browser,
     },
   },
   ```
   Add `globals` to devDependencies.

9. **The `--ext` flag is ignored in ESLint v9.** The lint script must be updated to not pass `--ext .js,.ts,.tsx`. File matching is handled entirely by the `files` arrays in flat config.

10. **Test the editor integration.** After migration, verify that VS Code with the ESLint extension detects `eslint.config.js` and provides inline linting. The ESLint extension v3+ supports flat config natively.

---

## Perfectionist Plugin Integration

> **Cross-reference:** This section implements requirements from `ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md`, which applies to ALL 50 phases.

### Installation

Add `eslint-plugin-perfectionist` to devDependencies:

```bash
npm install --save-dev eslint-plugin-perfectionist
```

Current version (as of 2026): `^4.x`. This plugin is ESLint v9 flat config native and requires no compatibility wrappers.

### Full Configuration in Flat Config Format

Add the following config object to `eslint.config.js`. It must appear AFTER the TypeScript config objects but BEFORE the Prettier config (which must remain last):

```javascript
// eslint.config.js
import perfectionistPlugin from 'eslint-plugin-perfectionist'

export default [
  // ... js.configs.recommended, tseslint configs, react configs ...

  // Perfectionist: deterministic code ordering for all TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      perfectionist: perfectionistPlugin,
    },
    rules: {
      // Sort import statements by group, then alphabetically within groups
      'perfectionist/sort-imports': ['error', {
        type: 'natural',
        groups: [
          'type',           // import type { ... } from '...'
          'builtin',        // import fs from 'fs'
          'external',       // import React from 'react'
          'internal',       // import { lib } from 'src/lib'
          'parent',         // import { x } from '../x'
          'sibling',        // import { y } from './y'
          'index',          // import { z } from '.'
          'side-effect',    // import './polyfill'
          'style',          // import './styles.css'
        ],
        newlinesBetween: 'always',
      }],

      // Sort named imports within a single import statement
      'perfectionist/sort-named-imports': ['error', {
        type: 'natural',
      }],

      // Sort export statements
      'perfectionist/sort-exports': ['error', {
        type: 'natural',
      }],

      // Sort interface members alphabetically
      'perfectionist/sort-interfaces': ['error', {
        type: 'natural',
      }],

      // Sort type object keys alphabetically
      'perfectionist/sort-object-types': ['error', {
        type: 'natural',
      }],

      // Sort object literal keys (enforced in type definitions at minimum)
      'perfectionist/sort-objects': ['error', {
        type: 'natural',
      }],

      // Sort union type members alphabetically
      'perfectionist/sort-union-types': ['error', {
        type: 'natural',
      }],

      // Sort intersection type members alphabetically
      'perfectionist/sort-intersection-types': ['error', {
        type: 'natural',
      }],

      // Sort enum members alphabetically
      'perfectionist/sort-enums': ['error', {
        type: 'natural',
      }],

      // Sort JSX props alphabetically
      'perfectionist/sort-jsx-props': ['error', {
        type: 'natural',
      }],

      // Sort array.includes() arguments
      'perfectionist/sort-array-includes': ['error', {
        type: 'natural',
      }],

      // Sort switch case values
      'perfectionist/sort-switch-case': ['error', {
        type: 'natural',
      }],
    },
  },

  // ... prettierConfig MUST be last ...
]
```

### Sorting Examples

#### Import Sorting

```typescript
// CORRECT -- sorted by group with blank lines between groups:
import type { ButtonProps } from './Button'
import type { SemanticCOLOR, SemanticSIZE } from '../../generic'

import { forwardRef, useCallback, useRef } from 'react'

import clsx from 'clsx'

import { getUnhandledProps, useEventCallback } from '../../lib'

import ButtonContent from './ButtonContent'
import ButtonGroup from './ButtonGroup'
import ButtonOr from './ButtonOr'
```

#### Interface Member Sorting

```typescript
// CORRECT -- members sorted alphabetically:
interface DropdownProps {
  additionLabel?: React.ReactNode | object
  additionPosition?: 'bottom' | 'top'
  allowAdditions?: boolean
  as?: React.ElementType
  basic?: boolean
  button?: boolean
  children?: React.ReactNode
  className?: string
  clearable?: boolean
  closeOnBlur?: boolean
  closeOnChange?: boolean
  closeOnEscape?: boolean
  compact?: boolean
  defaultOpen?: boolean
  defaultSearchQuery?: string
  defaultSelectedLabel?: number | string
  defaultUpward?: boolean
  defaultValue?: DropdownValue
  deburr?: boolean
  direction?: 'left' | 'right'
  disabled?: boolean
}
```

#### JSX Prop Sorting

```typescript
// CORRECT -- props sorted alphabetically:
<Dropdown
  allowAdditions
  className="search-dropdown"
  clearable
  fluid
  multiple
  onChange={handleChange}
  options={options}
  placeholder="Select..."
  search
  selection
  value={selectedValues}
/>
```

#### Union Type Sorting

```typescript
// CORRECT:
type SemanticSIZE =
  | 'huge'
  | 'large'
  | 'massive'
  | 'medium'
  | 'mini'
  | 'small'
  | 'tiny'
```

### Integration with Existing Airbnb/Prettier Rules

The perfectionist plugin does not conflict with Prettier or with the airbnb-derived rules:

| Concern | Owner |
|---------|-------|
| Formatting (whitespace, quotes, semicolons, line length) | Prettier |
| Code quality (unused vars, no-console, etc.) | ESLint core + airbnb rules |
| Import ordering | `perfectionist/sort-imports` (replaces `import/order` from eslint-plugin-import) |
| All other ordering (interfaces, props, types, etc.) | Perfectionist |

**Important:** If `eslint-plugin-import` has an `import/order` rule enabled (from the airbnb config), it must be disabled when perfectionist is active, as both rules govern import ordering and will conflict:

```javascript
{
  files: ['**/*.{ts,tsx}'],
  rules: {
    'import/order': 'off',  // Replaced by perfectionist/sort-imports
  },
}
```

### TypeScript Strict Type-Checked Rules

In addition to perfectionist, the TypeScript override must use the `strict-type-checked` config from `typescript-eslint`:

```javascript
import tseslint from 'typescript-eslint'

export default [
  // Use strict-type-checked instead of just recommended
  ...tseslint.configs.strictTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // These MUST be "error", never "warn" or "off"
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Additional strict rules
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      '@typescript-eslint/consistent-type-exports': ['error', {
        fixMixedExportsWithInlineTypeSpecifier: true,
      }],
    },
  },

  // Override for test files (slightly relaxed but still no any)
  {
    files: ['test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'warn',  // Occasionally useful in tests
      // All no-unsafe-* and no-explicit-any rules remain at "error" in tests
    },
  },
]
```

> **IMPORTANT (Phase 07 revision):** The original Phase 07 config included `'@typescript-eslint/no-explicit-any': 'off'` in the TypeScript override. That line MUST be removed. Per `ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md`, `no-explicit-any` must always be `"error"`.

### Complete Revised eslint.config.js

The full flat config integrating all of the above (replacing the config in Task 5 of this phase):

```javascript
// eslint.config.js
import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import prettierConfig from 'eslint-config-prettier'
import cypressPlugin from 'eslint-plugin-cypress'
import globals from 'globals'

export default [
  // 1. Base recommended rules
  js.configs.recommended,

  // 2. TypeScript strict type-checked rules
  ...tseslint.configs.strictTypeChecked,

  // 3. JavaScript files (Babel parser)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: { requireConfigFile: true },
      globals: { ...globals.browser },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
    },
    rules: {
      // Ported from current root .eslintrc
      // react-hooks/recommended rules
      // react-compiler rules from v6
      'react-compiler/react-compiler': 'warn',
    },
  },

  // 4. TypeScript files -- strict no-any + perfectionist
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      perfectionist: perfectionistPlugin,
    },
    rules: {
      // Zero any tolerance
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      '@typescript-eslint/consistent-type-exports': ['error', {
        fixMixedExportsWithInlineTypeSpecifier: true,
      }],

      // Perfectionist sorting rules (all at error severity)
      'perfectionist/sort-imports': ['error', {
        type: 'natural',
        groups: ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'side-effect', 'style'],
        newlinesBetween: 'always',
      }],
      'perfectionist/sort-named-imports': ['error', { type: 'natural' }],
      'perfectionist/sort-exports': ['error', { type: 'natural' }],
      'perfectionist/sort-interfaces': ['error', { type: 'natural' }],
      'perfectionist/sort-object-types': ['error', { type: 'natural' }],
      'perfectionist/sort-objects': ['error', { type: 'natural' }],
      'perfectionist/sort-union-types': ['error', { type: 'natural' }],
      'perfectionist/sort-intersection-types': ['error', { type: 'natural' }],
      'perfectionist/sort-enums': ['error', { type: 'natural' }],
      'perfectionist/sort-jsx-props': ['error', { type: 'natural' }],
      'perfectionist/sort-array-includes': ['error', { type: 'natural' }],
      'perfectionist/sort-switch-case': ['error', { type: 'natural' }],

      // Disable import/order -- replaced by perfectionist/sort-imports
      'import/order': 'off',
    },
  },

  // 5. Test files override
  {
    files: ['test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'jsx-a11y/tabindex-no-positive': 'off',
      'react/prop-types': 'off',
      // no-explicit-any REMAINS "error" in tests -- no exceptions
    },
  },

  // 6. Docs, examples, cypress overrides (unchanged from main config)

  // 7. Prettier MUST be last
  prettierConfig,
]
```

### Updated devDependencies

Add to `package.json` devDependencies:

```json
{
  "eslint-plugin-perfectionist": "^4.0.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "typescript-eslint": "^8.0.0"
}
```

### Updated Acceptance Criteria (Addendum)

In addition to the existing acceptance criteria for Phase 07, the following must also pass:

- [ ] `eslint-plugin-perfectionist` is installed and all 12 sorting rules are active at `"error"` severity
- [ ] `@typescript-eslint/no-explicit-any` is set to `"error"` (NOT `"off"` as in the original Phase 07 config)
- [ ] All `@typescript-eslint/no-unsafe-*` rules are set to `"error"`
- [ ] `tseslint.configs.strictTypeChecked` is used instead of `tseslint.configs.recommended`
- [ ] `import/order` is disabled in favor of `perfectionist/sort-imports`
- [ ] Running `eslint --fix` on a file with unsorted imports auto-sorts them correctly
- [ ] No ESLint disable comments exist for `no-explicit-any` or `no-unsafe-*` rules in source files
