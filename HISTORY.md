# HISTORY.md — Semantic UI React

## v4.1.30 (2026-02-14)

### Summary

Major modernization release building on v4.0.0-rc.1. This release completes the React 19 migration, adds comprehensive AI agent documentation, and includes infrastructure, documentation, and test improvements.

### Changes

#### :boom: Breaking Changes

- **React 19 required**: Minimum peer dependency is `react@^19.0.0` and `react-dom@^19.0.0`.
- **CSS dependency replaced**: External `semantic-ui-css` package is no longer required; library ships its own CSS.
- **UMD bundle removed**: Replaced with browser ESM bundle.
- **IE11 support dropped**: Modern browsers only (Chrome 92+, Firefox 90+, Safari 15.4+, Edge 92+).
- **All components converted to function components** with inline default values (no `defaultProps`).
- **PropTypes removed**: Use TypeScript interfaces for type checking.
- **`innerRef` removed**: Use standard `ref` prop (React 19 ref-as-prop).
- **`forwardRef` wrappers removed**: Components accept `ref` directly.
- **Popup**: `popperModifiers` now accepts Floating UI middleware instead of Popper.js modifiers.
- **`keyboard-key` removed**: Native `KeyboardEvent.key` API used instead.

#### :rocket: New Features

- **CSS Custom Properties theming** with runtime theme switching.
- **ThemeProvider component** for scoped theming via CSS custom properties and React Context.
- **Built-in dark theme** at `semantic-ui-react/styles/themes/dark.css`.
- **useTheme hook** to access and control current theme.
- **React 19 Form Features**: `Form` accepts async `action` prop, `Form.Status`, `useFormAction`, `useFormStatus`, `useOptimistic`.
- **React Compiler support**: All components compatible with `babel-plugin-react-compiler`.
- **Asset preloading**: `preloadStyles`, `preinitStyles`, `preloadIconFont`.
- **StylesheetLink component** for declarative CSS loading with React 19 `precedence`.
- **CSS Cascade Layers** (`@layer`) for predictable cascade ordering.
- **Modern CSS**: `:is()`, `:where()`, `:has()`, `color-mix()`, container queries, `:focus-visible`.
- **Per-component CSS imports** for tree-shaken stylesheets.

#### :house: Internal

- **Build**: Webpack 4 + Gulp 4 replaced with Rollup 4.x (CJS, ESM, browser ESM outputs).
- **Tests**: Karma + Mocha + Enzyme replaced with Vitest + React Testing Library.
- **ESLint 9**: Flat config with React Compiler compatibility checking.
- **Node.js 20+**: Required for CI and development.
- **Yarn 4**: Package manager updated to Yarn 4 via Corepack.
- **TypeScript 5.9**: Full TypeScript source compilation.
- **Docs**: react-static replaced with Astro + React islands.
- **Popup positioning**: `react-popper` / `@popperjs/core` replaced with `@floating-ui/react-dom`.
- **Keyboard handling**: `keyboard-key` replaced with native `KeyboardEvent.key` API.
- **Shallow comparison**: `shallowequal` replaced with inline utility.
- **Removed deprecated deps**: `@semantic-ui-react/event-stack`, `@fluentui/react-component-event-listener`.
- **Runtime dependencies reduced to 6**: `@babel/runtime`, `@floating-ui/react-dom`, `clsx`, `lodash`, `lodash-es`, `react-is`.

#### :memo: Documentation

- Added comprehensive `AGENTS.md` for AI agent behavior guidelines.
- Updated `README.md` with React 19 features, built-in CSS, theming, and updated requirements.
- Updated `CONTRIBUTING.md` with Vitest, Yarn 4, function component patterns, and TypeScript conventions.
- Added `MIGRATION.md` with detailed v3 → v4 upgrade instructions.
- Updated `CHANGELOG.md` with v4.0.0 entry.

#### :wrench: Test Improvements

- Updated test utilities for React 19 compatibility.
- Fixed Advertisement and FeedUser test specs.
- Vitest configuration with concurrent rendering error suppression.

---

## v4.0.0-rc.1 (2026-02-13)

Initial release candidate for the v4.0.0 major version. See CHANGELOG.md for full details.

---

## v3.0.0-beta.2 (2023-12-30)

See CHANGELOG.md for historical entries.
