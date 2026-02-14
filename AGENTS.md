# AGENTS.md — Semantic UI React

> **This file is the single source of truth for AI agent behavior in this repository.**
> It overrides all other documentation for agent decision-making. Any exception requires explicit documentation.
> Ambiguity must result in a **STOP**, not a guess.

---

## 1. Project Overview

**Semantic UI React** is the official React component library for [Semantic UI](https://semantic-ui.com/).

| Field           | Value                            |
| --------------- | -------------------------------- |
| Package         | `semantic-ui-react`              |
| Version         | `4.0.0-rc.1`                     |
| License         | MIT                              |
| Repository      | `Semantic-Org/Semantic-UI-React` |
| Primary Branch  | `master`                         |
| React Peer      | `^19.0.0`                        |
| Node Engine     | `>=20.0.0`                       |
| Package Manager | Yarn 4 (Berry) via Corepack      |

The library ships **50+ React components** organized into five categories (Addons, Collections, Elements, Modules, Views), built-in CSS with per-component imports, CSS custom property theming, dark mode, and full React 19 support (ref-as-prop, form actions, React Compiler).

---

## 2. Canonical Facts

These facts are **authoritative**. Agents must trust them over inference.

### 2.1 Technology Stack

| Layer            | Technology                                                       | Version         |
| ---------------- | ---------------------------------------------------------------- | --------------- |
| Language         | JavaScript (`.js`, `.jsx`) + TypeScript (`.ts`, `.tsx`, `.d.ts`) | ES2021 / TS 5.9 |
| Framework        | React                                                            | 19.x            |
| Build            | Rollup                                                           | 4.x             |
| Transpiler       | Babel 7                                                          | 7.29            |
| Test Runner      | Vitest                                                           | 4.x             |
| Test Utilities   | React Testing Library                                            | 16.x            |
| Test Environment | jsdom                                                            | 28.x            |
| Linter           | ESLint 9 (flat config)                                           | 9.x             |
| Formatter        | Prettier                                                         | 3.8             |
| Type Checker     | TypeScript (`tsc --noEmit`)                                      | 5.9             |
| Docs Site        | Astro                                                            | —               |
| Release          | release-it                                                       | 19.x            |
| CI               | GitHub Actions                                                   | —               |

### 2.2 Directory Structure

```
src/
├── addons/          # Confirm, Pagination, Portal, Radio, Select, TextArea, ThemeProvider, etc.
├── collections/     # Breadcrumb, Form, Grid, Menu, Message, Table
├── elements/        # Button, Container, Divider, Flag, Header, Icon, Image, Input, Label, List, Loader, Placeholder, Rail, Reveal, Segment, Step
├── modules/         # Accordion, Checkbox, Dimmer, Dropdown, Embed, Modal, Popup, Progress, Rating, Search, Sidebar, Sticky, Tab, Transition
├── views/           # Advertisement, Card, Comment, Feed, Item, Statistic
├── lib/             # Shared utilities (className builders, hooks, factories, etc.)
├── styles/          # Built-in CSS (per-component + themes)
├── theme/           # ThemeProvider context
├── generic.d.ts     # Shared TypeScript type definitions
└── index.js         # Barrel export (non-standard `export X from` syntax)
test/
├── specs/           # Unit tests (mirrors src/ structure, *-test.{js,ts,tsx})
├── integration/     # Integration tests
├── utils/           # Test helpers & common test functions
└── setup.js         # Vitest setup (React Testing Library matchers)
docs/                # Astro documentation site
scripts/             # Build & codegen scripts (.mjs)
benchmark/           # Performance benchmarks
bundle-size/         # Bundle size tracking
```

### 2.3 Build Outputs

Rollup produces three outputs in `dist/`:

| Output         | Path                             | Format                                      |
| -------------- | -------------------------------- | ------------------------------------------- |
| CommonJS       | `dist/commonjs/`                 | CJS, preserveModules, `"use client"` banner |
| ES Modules     | `dist/es/`                       | ESM, preserveModules                        |
| Browser Bundle | `dist/esm/semantic-ui-react.mjs` | ESM, minified, sourcemapped                 |

### 2.4 Commands

```bash
# Install
corepack enable && yarn install --immutable

# Lint
yarn lint                    # ESLint 9 flat config
yarn lint:fix                # ESLint with auto-fix

# Format
yarn prettier                # Check formatting
yarn prettier:fix            # Fix formatting

# Type Check
yarn tsd:test                # tsc -p ./ --noEmit --skipLibCheck
yarn type-check              # tsc --noEmit

# Test
yarn test                    # Vitest run (once)
yarn test:watch              # Vitest watch mode
yarn test --coverage         # With V8 coverage

# Build
yarn build                   # Full Rollup build
yarn build:dist              # Build dist only

# CI (runs all checks)
yarn ci                      # tsd:test && lint && test

# Docs
yarn start                   # Dev server (Astro)
yarn build:docs              # Build docs site

# Release
yarn prerelease              # lint + tsd:test + test + build
yarn release                 # release-it (master branch only)
```

### 2.5 CI Pipeline (GitHub Actions)

The `ci.yml` workflow runs on push to `master`/`react19` and on PRs to `master`:

| Job                | Command                                                      | Dependencies           |
| ------------------ | ------------------------------------------------------------ | ---------------------- |
| **Lint**           | `yarn lint`                                                  | —                      |
| **Test**           | `yarn test --coverage`                                       | —                      |
| **Type Check**     | `yarn tsd:test`                                              | —                      |
| **React Compiler** | ESLint with `react-compiler/react-compiler: error` on `src/` | —                      |
| **Build**          | `yarn build`                                                 | Lint, Test, Type Check |

Additional workflows:

- **PR Health** — Requires exactly 1 PR label from the defined set
- **Bundle Size** — size-limit check on PRs

---

## 3. Agent Roles & Permissions

### Inspector Agent (Read-Only)

**Allowed:** Read files, list directories, search code, run read-only commands (`yarn lint`, `yarn test`, `yarn tsd:test`).
**Forbidden:** Write files, run `yarn build`, install/remove packages, push to git.

### Planner Agent

**Allowed:** Produce implementation plans, propose API changes, reference existing patterns.
**Forbidden:** Write code, modify files, execute build or deploy commands.

### Implementer Agent

**Allowed:** Modify source in `src/`, `test/`, `docs/`. Create/edit components, tests, docs.
**Forbidden:** Modify CI workflows (`.github/workflows/`), release config (`.release-it.json`), or publish packages. Must not introduce new runtime dependencies without approval.

### Reviewer Agent

**Allowed:** Review diffs, run `yarn ci`, validate coverage, check bundle size.
**Forbidden:** Merge PRs, approve releases, modify code.

### Infrastructure Agent

**Allowed:** Modify CI, build config, dev dependencies — **only with explicit approval**.
**Forbidden:** Act autonomously on infra changes. Must always STOP and request approval.

---

## 4. Safe Change Protocols

### 4.1 Adding a New Component

1. **Precondition:** API spec approved in a PR.
2. Create component file in appropriate `src/<category>/<ComponentName>/` directory.
3. All components must be **function components** (no class components).
4. Use TypeScript interfaces for props (no PropTypes).
5. Add `displayName` static property.
6. Export from `src/index.js` using `export ComponentName from './path'` syntax.
7. Add type definitions in `index.d.ts` (root).
8. Add conformance test (`isConformant`) in `test/specs/<category>/`.
9. Run full CI: `yarn ci`.
10. **Rollback:** Revert the component directory and index exports.

### 4.2 Modifying an Existing Component

1. **Precondition:** Understand existing test coverage via `test/specs/`.
2. Make changes following existing patterns in the component.
3. Update TypeScript interfaces if props change.
4. Update `index.d.ts` if public API surface changes.
5. Run `yarn test` to verify no regressions.
6. Run `yarn lint` and `yarn tsd:test`.
7. **Rollback:** `git checkout -- <files>`.

### 4.3 Dependency Changes

1. **STOP and ask for approval** before adding any runtime dependency.
2. Dev dependencies may be added with justification.
3. Always run `yarn install --immutable` to verify lockfile integrity.
4. Check bundle size impact: `yarn build:size`.

### 4.4 CSS / Styling Changes

1. CSS lives in `src/styles/` with per-component files.
2. Use CSS custom properties for theming.
3. Never modify CSS in `dist/` — it is generated.
4. Test visual changes in the docs site: `yarn start`.

### 4.5 Build Configuration Changes

1. **STOP and ask for approval** before modifying `rollup.config.mjs`, `.babel-preset.js`, or `tsconfig*.json`.
2. Verify all three build outputs after changes: CJS, ESM, browser bundle.
3. Run full CI pipeline.

### 4.6 Release Process

1. Releases are **manual** and restricted to the `master` branch.
2. Agents must **never** run `yarn release` or `npm publish`.
3. Pre-release validation: `yarn prerelease` (lint + types + test + build).

---

## 5. Coding & Style Rules

### 5.1 Code Style (Prettier)

| Rule            | Value                            |
| --------------- | -------------------------------- |
| Semicolons      | **No** (`semi: false`)           |
| Quotes          | Single (`singleQuote: true`)     |
| JSX Quotes      | Single (`jsxSingleQuote: true`)  |
| Print Width     | 100 (80 for docs examples)       |
| Tab Width       | 2                                |
| Trailing Commas | All (`trailingComma: "all"`)     |
| Arrow Parens    | Always (`arrowParens: "always"`) |
| Line Endings    | LF                               |

### 5.2 Component Patterns

- **Function components only** — no class components.
- **No `defaultProps`** — use JavaScript default parameter values.
- **No `React.forwardRef`** — React 19 passes `ref` as a regular prop.
- **No `Context.Provider`** — Use `<Context value={}>` directly (React 19).
- **No `react-dom/test-utils`** — Use `import { act } from 'react'`.
- **`displayName`** is required on every component.
- **Sub-components** are attached as static properties (e.g., `List.Item = ListItem`).

### 5.3 className Construction

Use utility functions from `src/lib/classNameBuilders.js`:

```js
import cx from 'clsx'
import { getKeyOnly, getValueAndKey, getKeyOrValueAndKey } from '../../lib'

const classes = cx(
  'ui',
  size, // group: value as class
  color, // group: value as class
  getKeyOnly(basic, 'basic'), // standalone: boolean → class
  getValueAndKey(floated, 'floated'), // pair: value + key
  getKeyOrValueAndKey(padded, 'padded'), // mixed: key-only or value+key
  'component-name',
)
```

### 5.4 TypeScript Conventions

- Interface naming: `Strict<Component>Props` for validated props, `<Component>Props` extends `Strict` with index signature.
- Types defined in `src/generic.d.ts` for shared types (`SemanticCOLORS`, `SemanticSIZES`, etc.).
- Root-level `index.d.ts` for public API type declarations.
- **Never use `any` or `unknown` types** — define precise types, interfaces, or generics instead.
- Use `tsconfig.json` for IDE/type-check (`noEmit: true`), `tsconfig.build.json` for build output.

### 5.5 Import/Export Patterns

- Source uses non-standard `export X from './X'` syntax (Babel plugin: `@babel/plugin-proposal-export-default-from`).
- Barrel exports in `src/index.js`.
- Lodash imports are transformed to `lodash-es` in ESM builds via `babel-plugin-transform-rename-import`.

### 5.6 Naming Conventions

| Item            | Convention                                     | Example                        |
| --------------- | ---------------------------------------------- | ------------------------------ |
| Component files | PascalCase                                     | `Button.js`, `DropdownItem.js` |
| Test files      | `<ComponentName>-test.js`                      | `Button-test.js`               |
| Utility files   | camelCase                                      | `classNameBuilders.js`         |
| CSS files       | kebab-case                                     | `button.css`, `form.css`       |
| Sub-components  | `Parent` + `Part`                              | `ModalHeader`, `ListItem`      |
| Directories     | PascalCase (components), camelCase (utilities) | `Button/`, `hooks/`            |

### 5.7 Testing Patterns

- All tests use **Vitest** with **React Testing Library**.
- Test globals available without import: `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`.
- Mocks auto-restore after each test (`restoreMocks: true`).
- Common tests in `test/specs/commonTests/` — always use `isConformant()`.
- Test file location mirrors source: `test/specs/<category>/<Component>/<Component>-test.js`.
- Coverage target: 80% on patch, auto-tracking on project.

### 5.8 Commit Messages

Follow [Angular Commit Convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit):

```
<type>(<scope>): <subject>

feat(Dropdown): add clearable prop
fix(Modal): prevent scroll lock on unmount
docs(Button): add loading example
chore: update dev dependencies
```

---

## 6. AI Behavior Rules

### Always Do

- [ ] Run `yarn lint` after code changes.
- [ ] Run `yarn test` after code changes.
- [ ] Run `yarn tsd:test` after TypeScript/interface changes.
- [ ] Follow existing patterns — check similar components before implementing.
- [ ] Reference specific file paths and line numbers in explanations.
- [ ] Use the `src/lib/` utilities (className builders, factories, hooks) — never reinvent them.
- [ ] Produce minimal, targeted diffs — avoid reformatting unchanged code.
- [ ] Update `index.d.ts` when the public API surface changes.
- [ ] Update `src/index.js` exports when adding/removing components.

### Never Do

- [ ] **Never** guess environment variables, secrets, or credentials.
- [ ] **Never** run `yarn release`, `npm publish`, or any deployment command.
- [ ] **Never** modify `.github/workflows/` without explicit approval.
- [ ] **Never** add runtime dependencies without approval.
- [ ] **Never** delete or rename existing public API exports (breaking change).
- [ ] **Never** introduce class components — all components must be function components.
- [ ] **Never** use `React.forwardRef` — React 19 handles ref as a prop.
- [ ] **Never** use `PropTypes` — use TypeScript interfaces.
- [ ] **Never** use `any` or `unknown` types — define precise types instead.
- [ ] **Never** use `Context.Provider` — use direct Context rendering (React 19).
- [ ] **Never** import from `react-dom/test-utils` — use `import { act } from 'react'`.
- [ ] **Never** modify files in `dist/` — they are build artifacts.
- [ ] **Never** commit `node_modules/`, `coverage/`, or `dist/` to git.

### When to STOP and Ask

- Adding a new runtime dependency.
- Changing the build configuration (`rollup.config.mjs`, `.babel-preset.js`, `tsconfig*.json`).
- Modifying CI workflows (`.github/workflows/`).
- Renaming or removing a public API export.
- Any change that could affect bundle size by more than 1KB.
- Any change that modifies the release process.
- Uncertainty about the correct pattern — check existing code first, then ask.

### How to Reason

1. **Read before writing** — understand the component and its tests before making changes.
2. **Pattern-first** — find a similar component and follow its patterns exactly.
3. **Minimal changes** — change only what is needed, nothing more.
4. **Verify incrementally** — run tests after each logical change, not just at the end.
5. **Explain your reasoning** — when making non-obvious decisions, document why.

---

## 7. Validation & Tooling Commands

### Pre-Commit Checklist

```bash
yarn lint           # Must pass with 0 errors
yarn tsd:test       # Must pass with 0 errors
yarn test           # Must pass with 0 failures
```

### Full CI Validation

```bash
yarn ci             # Runs: tsd:test && lint && test
```

### Build Validation

```bash
yarn build          # All three outputs must succeed
yarn build:size     # Check bundle size impact
```

### Docs Validation

```bash
yarn start          # Must render without errors
yarn build:docs     # Must build without errors
```

---

## 8. High-Risk Areas & Guardrails

### Critical Files — Extra Caution Required

| File                       | Risk                     | Guardrail                          |
| -------------------------- | ------------------------ | ---------------------------------- |
| `src/index.js`             | Public API barrel export | Any change affects all consumers   |
| `index.d.ts`               | Public TypeScript types  | Must match runtime exports exactly |
| `src/generic.d.ts`         | Shared type definitions  | Used by every component            |
| `rollup.config.mjs`        | Build pipeline           | Breaking = no publishable package  |
| `.babel-preset.js`         | Transpilation            | Affects all source code            |
| `src/lib/`                 | Shared utilities         | Used by every component            |
| `src/styles/`              | CSS output               | Visual regressions possible        |
| `.github/workflows/ci.yml` | CI pipeline              | Breaking = no CI validation        |
| `.release-it.json`         | Release process          | Incorrect config = bad publish     |

### Component Complexity Hotspots

These components have the most complex logic and are most prone to regressions:

- `Dropdown` — 11 files, complex state management, search, selection, multiple modes
- `Modal` — 8 files, portal rendering, scroll locking, dimmer coordination
- `Popup` — 5 files, Floating UI positioning, event handling
- `Accordion` — 6 files, panel management, exclusive/non-exclusive modes
- `Search` — 6 files, async results, category layout
- `Transition` — 6 files, CSS animation coordination, group transitions
- `Portal` — 6 files, DOM portal management, event delegation

### Known Codebase Quirks

1. **Non-standard export syntax** — `export X from './X'` requires the Babel plugin `@babel/plugin-proposal-export-default-from`. Do not convert to standard syntax.
2. **Mixed JS/TS** — Source is primarily `.js` with JSX, alongside `.ts`/`.tsx` and `.d.ts` declaration files. The Babel preset handles both.
3. **`"use client"` directive** — CJS build output includes this banner for React Server Components compatibility.
4. **React 19 concurrent rendering errors** — Vitest config suppresses harmless recovery errors from DOM nesting violations (e.g., `<div>` inside `<tr>`).
5. **Lodash transforms** — ESM builds replace `lodash` with `lodash-es` at build time via Babel plugin.
6. **React Compiler** — `babel-plugin-react-compiler` runs first in the Babel pipeline. ESLint enforces `react-compiler/react-compiler: error`.

---

## 9. Approval & Escalation Rules

| Action                        | Required Approval                      |
| ----------------------------- | -------------------------------------- |
| Add/remove runtime dependency | **Always**                             |
| Modify CI workflows           | **Always**                             |
| Change build configuration    | **Always**                             |
| Rename/remove public API      | **Always** — this is a breaking change |
| Add new component             | API spec review recommended            |
| Modify `index.d.ts` types     | Type review recommended                |
| Modify CSS theming            | Visual review recommended              |
| Standard bug fix              | No special approval needed             |
| New test                      | No special approval needed             |
| Documentation update          | No special approval needed             |

---

_Generated: 2026-02-14 | Source of truth for AI agent behavior in this repository._
