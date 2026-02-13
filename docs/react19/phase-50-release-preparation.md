# Phase 50: Release Preparation and Changelog

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-50                                                                 |
| **Title**        | Release Preparation and Changelog                                        |
| **Stage**        | 10 -- Documentation, Build & Release                                     |
| **Dependencies** | Phase 49 (all tests pass, benchmarks complete)                           |
| **Complexity**   | Medium                                                                   |
| **Scope**        | Version bump, changelog, migration guide, npm publish, GitHub release    |

---

## Objective

Prepare and execute the v4.0.0 major release of Semantic-UI-React. This includes updating the version number, writing a comprehensive CHANGELOG entry, creating a consumer migration guide (MIGRATION.md), updating README.md with new requirements and features, tagging a release candidate, publishing to npm, creating a GitHub release with detailed release notes, and establishing the deprecation timeline for v3.

---

## Background

### Version History

- **v3.0.0-beta.2**: Current version. React 16.8+/17/18 support. Class and function components. Webpack 4 + Gulp 4 build. External `semantic-ui-css` dependency.
- **v4.0.0**: Target version. React 19 only. All function components. Rollup + Vite build. Self-contained CSS. CSS custom properties theming. React Compiler support. New form features.

### Why v4.0.0 (not v3.0.0)

The v3.0.0-beta.2 version was never released as a stable v3.0.0. The migration to React 19 involves so many breaking changes that it warrants a major version bump beyond v3:

1. **React peer dependency**: `^16.8.0 || ^17.0.0 || ^18.0.0` to `^19.0.0`
2. **CSS dependency**: `semantic-ui-css` external to self-contained CSS
3. **API additions**: ThemeProvider, useFormAction, useFormStatus, useOptimistic, StylesheetLink
4. **Removed features**: UMD bundle, IE11 support
5. **Build output changes**: New exports map, new CSS output paths

Skipping v3 stable and going directly to v4 avoids confusion between "v3 that was never stable" and "v3 stable."

### Current package.json State

From `J:\code\semantic\Semantic-UI-React\package.json`:
- `"version": "3.0.0-beta.2"` (line 3)
- `"peerDependencies": { "react": "^16.8.0 || ^17.0.0 || ^18.0.0", "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0" }` (lines 183-186)
- `"description": "The official Semantic-UI-React integration."` (line 4)

### Current Release Tooling

From `J:\code\semantic\Semantic-UI-React\.release-it.json` (updated in Phase 48):
- GitHub releases enabled
- npm publish to `https://registry.npmjs.org`
- Pre-release hooks for lint, test, and build

---

## Detailed Tasks

### 1. Update `package.json` version and metadata

Modify `J:\code\semantic\Semantic-UI-React\package.json`:

```json
{
  "name": "semantic-ui-react",
  "version": "4.0.0-rc.1",
  "description": "The official React component library for Semantic UI, with built-in CSS, theming, and React 19 support.",
  "keywords": [
    "react",
    "react 19",
    "semantic-ui",
    "ui components",
    "component library",
    "css custom properties",
    "theming",
    "design system",
    "form actions",
    "react compiler"
  ]
}
```

### 2. Update peerDependencies

Modify `J:\code\semantic\Semantic-UI-React\package.json`:

**Before:**
```json
{
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0"
  }
}
```

**After:**
```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

Also update the `react-is` dependency:

**Before:**
```json
{
  "dependencies": {
    "react-is": "^16.8.6 || ^17.0.0 || ^18.0.0"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "react-is": "^19.0.0"
  }
}
```

### 3. Write comprehensive CHANGELOG.md entry

Update `J:\code\semantic\Semantic-UI-React\CHANGELOG.md` with a complete entry for v4.0.0. This should be prepended to the existing changelog:

```markdown
# Changelog

## v4.0.0 (YYYY-MM-DD)

### Breaking Changes

- **React 19 required**: Minimum peer dependency is now `react@^19.0.0` and `react-dom@^19.0.0`. React 16, 17, and 18 are no longer supported.
- **CSS dependency replaced**: The external `semantic-ui-css` package is no longer required. Semantic UI React now ships its own CSS in `dist/styles/`. Import `semantic-ui-react/styles` or individual component stylesheets.
- **UMD bundle removed**: The UMD distribution (`dist/umd/semantic-ui-react.min.js`) is no longer produced. Use the ESM bundle at `dist/esm/semantic-ui-react.mjs` for CDN usage with `<script type="module">`.
- **IE11 support dropped**: Browser targets now require Chrome 92+, Firefox 90+, Safari 15.4+, Edge 92+.
- **`jsnext:main` field removed**: Use the `"module"` or `"exports"` field for ESM resolution.
- **All components are function components**: Class components have been converted to function components with React.forwardRef. Components that previously exposed instance methods no longer do so.
- **`defaultProps` removed**: Default prop values are now inline destructuring defaults in function signatures.
- **`prop-types` removed from production bundle**: PropTypes are stripped in production builds.
- **TypeScript source**: Component source is now TypeScript (.tsx). The `index.d.ts` file is generated from source.

### New Features

- **CSS Custom Properties Theming**: All design tokens (colors, sizes, spacing, typography) are CSS custom properties. Runtime theme switching is supported.
- **ThemeProvider component**: New component for scoped theming via CSS custom properties and React Context.
- **Dark theme**: Built-in dark theme CSS at `semantic-ui-react/styles/themes/dark.css`.
- **useTheme hook**: Access and control the current theme from any component.
- **React 19 Form Features**:
  - `Form` component accepts async functions as the `action` prop (React 19 form actions)
  - `Form.Status` component provides form submission pending state via `useFormStatus`
  - `FormButton` supports `formAction` prop for per-button actions
  - `useFormAction` hook wraps `React.useActionState`
  - `useFormStatus` hook re-exports `React.useFormStatus`
  - `useOptimistic` hook re-exports `React.useOptimistic`
- **React Compiler support**: All components are compatible with `babel-plugin-react-compiler` for automatic memoization.
- **Context as Provider**: All Context usage follows the React 19 `<Context value={}>` pattern.
- **Asset Preloading Utilities**: `preloadStyles`, `preinitStyles`, `preloadIconFont`, `prefetchAssetDNS`, `preconnectAssets` functions for React 19 resource preloading.
- **StylesheetLink component**: Declarative CSS loading with React 19's stylesheet `precedence` support.
- **CSS Cascade Layers**: All CSS uses `@layer` for predictable cascade ordering.
- **Modern CSS**: CSS uses `:is()`, `:where()`, `:has()`, `color-mix()`, container queries, `:focus-visible`, logical properties.
- **Per-component CSS imports**: Import only the CSS you need for tree-shaken stylesheets.

### Improvements

- **Smaller bundle size**: Removed lodash dependency (replaced with native equivalents). Removed prop-types from production.
- **Better tree-shaking**: `"sideEffects": false` with per-component ESM exports.
- **Modern build output**: Rollup-based build with CommonJS, ESM, and browser ESM bundles.
- **Vite-powered development**: Fast HMR for documentation development.
- **Vitest test suite**: Faster, more reliable tests with React Testing Library.
- **Accessibility improvements**: `:focus-visible` for keyboard focus indicators. axe-core validated.

### Internal

- **ESLint 9 with flat config**: Modern linting with React Compiler compatibility checking.
- **Node.js 20+**: CI and development require Node.js 20 or later.
- **Astro documentation site**: Replaced react-static with Astro + React islands.
- **CircleCI + GitHub Actions**: Updated CI pipelines with Node 20, Vitest, compiler checks.

### Migration Guide

See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions from v3 to v4.
```

### 4. Create MIGRATION.md

Create `J:\code\semantic\Semantic-UI-React\MIGRATION.md`:

```markdown
# Migrating from Semantic-UI-React v3 to v4

## Prerequisites

- React 19.0.0 or later
- Node.js 20 or later
- Modern browser (Chrome 92+, Firefox 90+, Safari 15.4+, Edge 92+)

## Step 1: Update Dependencies

```bash
npm install semantic-ui-react@4 react@19 react-dom@19
```

## Step 2: Replace CSS Import

### Before (v3)
```js
import 'semantic-ui-css/semantic.min.css'
```

### After (v4) -- Full CSS
```js
import 'semantic-ui-react/styles'
```

### After (v4) -- Per-component CSS (recommended)
```js
import 'semantic-ui-react/styles/elements/button.css'
import 'semantic-ui-react/styles/collections/form.css'
```

## Step 3: Remove `semantic-ui-css` Dependency

```bash
npm uninstall semantic-ui-css
```

## Step 4: Update Component Usage (if needed)

### Class Component Instance Methods
If you used `ref.someMethod()` on class component instances, replace with
the documented React 19 patterns. Most components now use `React.forwardRef`
and expose the DOM element via ref.

### defaultProps
If you relied on component `defaultProps` in your code, note that default
values are now inline. This does not affect consumer code that passes props.

### UMD Bundle
If you loaded Semantic UI React via a `<script>` tag from a CDN:

**Before:**
```html
<script src="https://unpkg.com/semantic-ui-react/dist/umd/semantic-ui-react.min.js"></script>
```

**After:**
```html
<script type="module">
  import * as SUI from 'https://unpkg.com/semantic-ui-react/dist/esm/semantic-ui-react.mjs'
</script>
```

## Step 5: Adopt New Features (Optional)

### Theming with CSS Custom Properties
```jsx
import { ThemeProvider } from 'semantic-ui-react'

<ThemeProvider theme="dark">
  <App />
</ThemeProvider>
```

### Form Actions (React 19)
```jsx
import { Form, useFormAction } from 'semantic-ui-react'

const [state, formAction, isPending] = useFormAction(myAction, initialState)

<Form action={formAction} loading={isPending}>
  <Form.Input name="email" label="Email" />
  <Form.Button type="submit">Submit</Form.Button>
</Form>
```

### CSS Preloading
```jsx
import { preinitStyles } from 'semantic-ui-react'

preinitStyles({ href: '/styles/semantic-ui-react.css', precedence: 'default' })
```

## Troubleshooting

### "Cannot find module 'semantic-ui-css'"
You need to replace the CSS import. See Step 2.

### "React 19 is required"
Update React: `npm install react@19 react-dom@19`

### Components look unstyled
Ensure you have imported the CSS. See Step 2.

### TypeScript errors
Update `@types/react` to v19: `npm install @types/react@19 @types/react-dom@19`
```

### 5. Update README.md

Update `J:\code\semantic\Semantic-UI-React\README.md` with:

- Updated badge for npm version
- Updated installation instructions (no `semantic-ui-css` required)
- Updated minimum requirements (React 19, Node 20, modern browsers)
- New features section (theming, form actions, React Compiler)
- Updated quick start example with new CSS import
- Link to migration guide
- Updated browser support table

### 6. Tag release candidate

```bash
# Ensure all changes are committed
git add -A
git commit -m "chore: prepare v4.0.0-rc.1"

# Tag the release candidate
git tag v4.0.0-rc.1

# Push tag
git push origin v4.0.0-rc.1
```

### 7. Publish release candidate to npm

```bash
npm publish --tag rc
```

This publishes to npm with the `rc` tag, so `npm install semantic-ui-react` still installs v3 while `npm install semantic-ui-react@rc` installs v4.0.0-rc.1.

### 8. Create GitHub release for RC

Use `release-it` or the GitHub CLI:

```bash
gh release create v4.0.0-rc.1 \
  --title "v4.0.0-rc.1" \
  --notes-file CHANGELOG.md \
  --prerelease
```

### 9. Collect RC feedback

Allow a feedback period (2-4 weeks) for the RC:

- Monitor GitHub issues for RC-related bug reports
- Track npm download statistics for the RC tag
- Gather feedback from maintainers and major consumers
- Fix any issues discovered during the RC period

### 10. Promote RC to stable (after feedback period)

Once the RC is validated:

```bash
# Update version to stable
npm version 4.0.0 --no-git-tag-version

# Commit version change
git add package.json
git commit -m "chore: release v4.0.0"
git tag v4.0.0

# Publish to npm as latest
npm publish

# Push tags
git push origin v4.0.0
```

### 11. Create GitHub release for stable

```bash
gh release create v4.0.0 \
  --title "v4.0.0 -- React 19 Support" \
  --notes-file CHANGELOG.md \
  --latest
```

### 12. Update documentation site

Ensure the documentation site at `react.semantic-ui.com` is updated:

- Deploy the new Astro docs site
- Verify all pages load correctly
- Update the upgrade guide to show "v4.0.0" instead of "rc"
- Add a banner or announcement about the v4 release

### 13. Announce v3 deprecation

Create a deprecation notice:

- Add a deprecation notice to the v3 branch README
- Create a GitHub discussion/issue announcing end-of-life for v3
- Set a deprecation timeline (recommended: 6 months of security patches, then EOL)
- Update npm: `npm deprecate semantic-ui-react@"<4.0.0" "This version is deprecated. Please upgrade to v4.0.0 for React 19 support."`

### 14. Create a maintenance branch for v3

```bash
git checkout v3.0.0-beta.2
git checkout -b v3-maintenance
git push origin v3-maintenance
```

This branch receives only critical security patches during the deprecation period.

### 15. Update the `package.json` on master for next development cycle

After the stable release, bump the version for the next development cycle:

```json
{
  "version": "4.1.0-alpha.0"
}
```

---

## Files Affected

| File | Action |
|------|--------|
| `package.json` | MODIFY (version, peerDependencies, description, keywords, react-is) |
| `CHANGELOG.md` | MODIFY (prepend v4.0.0 entry) |
| `MIGRATION.md` | CREATE |
| `README.md` | MODIFY (update requirements, features, installation, examples) |
| `index.d.ts` | AUDIT (verify all exports are documented) |

**Total: 1 file created, 4 files modified**

---

## Acceptance Criteria

- [ ] `package.json` version is `4.0.0-rc.1` (for RC) or `4.0.0` (for stable)
- [ ] `peerDependencies` require `react@^19.0.0` and `react-dom@^19.0.0`
- [ ] `react-is` dependency updated to `^19.0.0`
- [ ] `CHANGELOG.md` has a complete v4.0.0 entry with all breaking changes, new features, and improvements
- [ ] `MIGRATION.md` exists with step-by-step upgrade instructions
- [ ] `README.md` reflects v4.0.0 requirements, features, and installation instructions
- [ ] Release candidate is published to npm with `rc` tag
- [ ] `npm install semantic-ui-react@rc` installs v4.0.0-rc.1
- [ ] `npm install semantic-ui-react` still installs v3.x (until stable release)
- [ ] GitHub release exists for the RC with release notes
- [ ] After feedback period: stable v4.0.0 is published to npm as `latest`
- [ ] GitHub release exists for stable v4.0.0
- [ ] Documentation site is updated and deployed
- [ ] v3 deprecation notice is published
- [ ] v3 maintenance branch exists
- [ ] No secrets, tokens, or credentials are included in any committed file

---

## Rollback Strategy

### RC Rollback
If critical issues are found in the RC:
1. `npm unpublish semantic-ui-react@4.0.0-rc.1` (within 72 hours of publish) or publish `4.0.0-rc.2` with fixes
2. Delete the GitHub release
3. Delete the git tag: `git tag -d v4.0.0-rc.1 && git push origin :refs/tags/v4.0.0-rc.1`

### Stable Rollback
If critical issues are found after stable release:
1. Publish a `4.0.1` patch immediately with the fix
2. If the issue is fundamental, publish `4.0.1` that re-adds backward compatibility
3. Update the deprecation warning on v3 to say "v3 remains supported while v4 issues are resolved"

### Nuclear Rollback
If v4 must be completely abandoned:
1. `npm deprecate semantic-ui-react@">=4.0.0" "v4.0.0 has been retracted. Please use v3."`
2. Revert master to the pre-v4 state
3. Resume development on the v3 branch

---

## Notes for AI Agents

1. **Do NOT publish to npm without explicit authorization.** The `npm publish` and `release-it` commands are destructive and irreversible (after 72 hours). Only execute these commands when explicitly directed by the project maintainer.

2. **The version number `4.0.0` is a deliberate skip from `3.0.0-beta.2`.** v3 was never released as stable. The v4 major version clearly signals the React 19 requirement and avoids confusion with the v3 beta.

3. **The CHANGELOG format follows the project's existing convention** (see `J:\code\semantic\Semantic-UI-React\CHANGELOG.md` for the current format). The labels map to PR labels defined in `package.json` lines 197-208.

4. **The MIGRATION.md is a critical document.** It is the first thing consumers will look for when upgrading. Make it practical, concise, and structured as numbered steps. Include "Before/After" code examples for every breaking change.

5. **The npm `rc` tag is important.** Publishing with `--tag rc` ensures that `npm install semantic-ui-react` continues to install v3 until the stable release. This prevents accidental upgrades for existing consumers.

6. **The deprecation timeline for v3** should be communicated clearly. Recommended: 6 months of security patches (no new features), then full EOL. This gives consumers ample time to migrate.

7. **The `react-is` package version** must be updated alongside `react` and `react-dom`. The `react-is` package is used for type checking (e.g., `isValidElement`, `isForwardRef`) and its API may change between React versions.

8. **Verify the `exports` field in `package.json`** (configured in Phase 06) works correctly with the new version. Test that `import { Button } from 'semantic-ui-react'` works in Node.js 20+ ESM mode and in bundlers (Webpack 5, Rollup, Vite, esbuild).

9. **The GitHub release should be detailed.** Include the full CHANGELOG entry, a link to MIGRATION.md, performance benchmark highlights from Phase 49, and acknowledgments. Use the `gh release create` command with a `--notes-file` pointing to a temporary markdown file with the full release notes.

10. **Post-release: monitor npm downloads, GitHub issues, and community channels** (StackOverflow, Discord, etc.) for the first 2 weeks after stable release. Be prepared to publish `4.0.1` quickly if critical issues are discovered.
