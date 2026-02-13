# Phase 46: Add Document Metadata and Asset Preloading Support

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-46                                                                 |
| **Title**        | Add Document Metadata and Asset Preloading Support                       |
| **Stage**        | 9 -- New React 19 Features                                               |
| **Dependencies** | Phase 40 (CSS modernization -- component CSS files must exist)           |
| **Complexity**   | Low                                                                      |
| **Scope**        | Utility functions, CSS preloading, documentation, TypeScript types       |

---

## Objective

Create utility functions and components that leverage React 19's built-in support for document metadata (`<title>`, `<meta>`, `<link>`) hoisting and resource preloading APIs (`preload`, `preinit`, `prefetchDNS`, `preconnect`). These utilities help consumers preload Semantic UI React's CSS assets (created in Phase 40) and provide guidance on using React 19's metadata features within Semantic UI components. This phase is primarily about documentation, utility creation, and integration guidance -- it does not change component rendering behavior.

---

## Background

### React 19 Document Metadata

React 19 natively hoists `<title>`, `<meta>`, and `<link>` elements rendered anywhere in the component tree to the document `<head>`. Previously, this required third-party libraries like `react-helmet`. Now, rendering these elements inside any component works automatically:

```jsx
function MyPage() {
  return (
    <div>
      <title>My Page Title</title>
      <meta name="description" content="Page description" />
      <link rel="stylesheet" href="/styles.css" precedence="default" />
      <p>Page content</p>
    </div>
  )
}
```

### React 19 Resource Preloading APIs

React 19 provides imperative APIs for resource preloading:

- `ReactDOM.preload(href, options)` -- preload a resource (CSS, font, image, script)
- `ReactDOM.preinit(href, options)` -- eagerly load and evaluate a resource
- `ReactDOM.prefetchDNS(href)` -- prefetch DNS for a domain
- `ReactDOM.preconnect(href, options)` -- establish an early connection to a domain

### React 19 Stylesheet Precedence

The `<link rel="stylesheet">` element now accepts a `precedence` prop that controls stylesheet ordering in the document head:

```jsx
<link rel="stylesheet" href="/base.css" precedence="default" />
<link rel="stylesheet" href="/theme.css" precedence="high" />
```

React 19 ensures stylesheets are loaded before rendering content that depends on them, preventing FOUC (Flash of Unstyled Content).

### Relevance to Semantic UI React

After Phase 40, Semantic UI React ships its own CSS in `dist/styles/`. Consumers need to load this CSS, and React 19's preloading APIs provide an optimal way to do so. Additionally, components that use icon fonts (Font Awesome 5 Free, loaded via CSS `@font-face`) benefit from font preloading.

The library currently has no utilities for CSS or asset loading. Consumers manually import CSS files or add `<link>` tags. This phase provides helpers that make CSS loading declarative and optimized.

---

## Detailed Tasks

### 1. Create CSS preloading utility functions

Create `J:\code\semantic\Semantic-UI-React\src\lib\preload.js`:

```js
import ReactDOM from 'react-dom'

/**
 * Preload the Semantic UI React CSS bundle.
 * Call this early in your application (e.g., in the root component or entry point)
 * to start loading CSS before components render.
 *
 * @param {Object} [options]
 * @param {string} [options.href] - Custom CSS URL. Defaults to the CDN URL of the full CSS bundle.
 * @param {string} [options.crossOrigin] - CORS mode for the stylesheet request.
 */
export function preloadStyles(options = {}) {
  const { href, crossOrigin } = options

  if (href) {
    ReactDOM.preload(href, { as: 'style', crossOrigin })
  }
}

/**
 * Eagerly load and apply the Semantic UI React CSS bundle.
 * Unlike preloadStyles, this immediately applies the stylesheet.
 *
 * @param {Object} [options]
 * @param {string} options.href - CSS URL to load.
 * @param {string} [options.precedence='default'] - Stylesheet precedence for ordering.
 * @param {string} [options.crossOrigin] - CORS mode for the stylesheet request.
 */
export function preinitStyles(options = {}) {
  const { href, precedence = 'default', crossOrigin } = options

  if (href) {
    ReactDOM.preinit(href, { as: 'style', precedence, crossOrigin })
  }
}

/**
 * Preload the icon font files (Font Awesome 5 Free WOFF2).
 * Call this to start loading icon fonts before Icon components render.
 *
 * @param {Object} [options]
 * @param {string} options.href - Font URL to preload.
 * @param {string} [options.crossOrigin='anonymous'] - CORS mode (fonts typically require anonymous).
 */
export function preloadIconFont(options = {}) {
  const { href, crossOrigin = 'anonymous' } = options

  if (href) {
    ReactDOM.preload(href, { as: 'font', type: 'font/woff2', crossOrigin })
  }
}

/**
 * Prefetch DNS for CDN domains used by Semantic UI assets.
 *
 * @param {string} domain - Domain to prefetch DNS for (e.g., 'https://cdn.example.com')
 */
export function prefetchAssetDNS(domain) {
  ReactDOM.prefetchDNS(domain)
}

/**
 * Preconnect to CDN domains for Semantic UI assets.
 *
 * @param {string} domain - Domain to preconnect to.
 * @param {Object} [options]
 * @param {string} [options.crossOrigin] - CORS mode.
 */
export function preconnectAssets(domain, options = {}) {
  ReactDOM.preconnect(domain, options)
}
```

### 2. Create TypeScript declarations for preload utilities

Create `J:\code\semantic\Semantic-UI-React\src\lib\preload.d.ts`:

```typescript
export interface PreloadStylesOptions {
  href?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export interface PreinitStylesOptions {
  href: string
  precedence?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export interface PreloadIconFontOptions {
  href: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export function preloadStyles(options?: PreloadStylesOptions): void
export function preinitStyles(options?: PreinitStylesOptions): void
export function preloadIconFont(options?: PreloadIconFontOptions): void
export function prefetchAssetDNS(domain: string): void
export function preconnectAssets(domain: string, options?: { crossOrigin?: string }): void
```

### 3. Create `StylesheetLink` component for declarative CSS loading

Create `J:\code\semantic\Semantic-UI-React\src\addons\StylesheetLink\StylesheetLink.js`:

```js
import * as React from 'react'
import PropTypes from 'prop-types'

/**
 * StylesheetLink renders a <link rel="stylesheet"> element that React 19 hoists to <head>.
 * It supports the precedence prop for stylesheet ordering.
 *
 * Use this component to declaratively load Semantic UI React CSS within your component tree.
 * React 19 ensures the stylesheet is loaded before rendering dependent content.
 *
 * @example
 * // Load the full CSS bundle
 * <StylesheetLink href="/node_modules/semantic-ui-react/dist/styles/semantic-ui-react.css" />
 *
 * @example
 * // Load only button CSS with high precedence
 * <StylesheetLink
 *   href="/node_modules/semantic-ui-react/dist/styles/elements/button.css"
 *   precedence="high"
 * />
 */
const StylesheetLink = React.forwardRef(function StylesheetLink(props, ref) {
  const {
    href,
    precedence = 'default',
    crossOrigin,
    media,
    ...rest
  } = props

  return (
    <link
      {...rest}
      ref={ref}
      rel="stylesheet"
      href={href}
      precedence={precedence}
      crossOrigin={crossOrigin}
      media={media}
    />
  )
})

StylesheetLink.displayName = 'StylesheetLink'

StylesheetLink.propTypes = {
  /** URL of the CSS file to load. */
  href: PropTypes.string.isRequired,

  /**
   * Stylesheet precedence for ordering in the document head.
   * React 19 uses this to determine stylesheet insertion order.
   * @default 'default'
   */
  precedence: PropTypes.string,

  /** CORS mode for the stylesheet request. */
  crossOrigin: PropTypes.oneOf(['', 'anonymous', 'use-credentials']),

  /** Media query for conditional stylesheet loading. */
  media: PropTypes.string,
}

export default StylesheetLink
```

Also create:
- `J:\code\semantic\Semantic-UI-React\src\addons\StylesheetLink\StylesheetLink.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\addons\StylesheetLink\index.js`
- `J:\code\semantic\Semantic-UI-React\src\addons\StylesheetLink\index.d.ts`

### 4. Create component-level CSS path constants

Create `J:\code\semantic\Semantic-UI-React\src\lib\stylePaths.js`:

```js
/**
 * CSS file paths for per-component stylesheet loading.
 * These paths are relative to the package root and can be used with
 * StylesheetLink or dynamic imports.
 *
 * @example
 * import { STYLE_PATHS } from 'semantic-ui-react'
 * <StylesheetLink href={STYLE_PATHS.button} />
 */
export const STYLE_PATHS = {
  // Full bundle
  all: 'semantic-ui-react/dist/styles/semantic-ui-react.css',

  // Tokens
  tokens: 'semantic-ui-react/dist/styles/tokens/index.css',

  // Collections
  breadcrumb: 'semantic-ui-react/dist/styles/collections/breadcrumb.css',
  form: 'semantic-ui-react/dist/styles/collections/form.css',
  grid: 'semantic-ui-react/dist/styles/collections/grid.css',
  menu: 'semantic-ui-react/dist/styles/collections/menu.css',
  message: 'semantic-ui-react/dist/styles/collections/message.css',
  table: 'semantic-ui-react/dist/styles/collections/table.css',

  // Elements
  button: 'semantic-ui-react/dist/styles/elements/button.css',
  container: 'semantic-ui-react/dist/styles/elements/container.css',
  divider: 'semantic-ui-react/dist/styles/elements/divider.css',
  flag: 'semantic-ui-react/dist/styles/elements/flag.css',
  header: 'semantic-ui-react/dist/styles/elements/header.css',
  icon: 'semantic-ui-react/dist/styles/elements/icon.css',
  image: 'semantic-ui-react/dist/styles/elements/image.css',
  input: 'semantic-ui-react/dist/styles/elements/input.css',
  label: 'semantic-ui-react/dist/styles/elements/label.css',
  list: 'semantic-ui-react/dist/styles/elements/list.css',
  loader: 'semantic-ui-react/dist/styles/elements/loader.css',
  placeholder: 'semantic-ui-react/dist/styles/elements/placeholder.css',
  rail: 'semantic-ui-react/dist/styles/elements/rail.css',
  reveal: 'semantic-ui-react/dist/styles/elements/reveal.css',
  segment: 'semantic-ui-react/dist/styles/elements/segment.css',
  step: 'semantic-ui-react/dist/styles/elements/step.css',

  // Modules
  accordion: 'semantic-ui-react/dist/styles/modules/accordion.css',
  checkbox: 'semantic-ui-react/dist/styles/modules/checkbox.css',
  dimmer: 'semantic-ui-react/dist/styles/modules/dimmer.css',
  dropdown: 'semantic-ui-react/dist/styles/modules/dropdown.css',
  embed: 'semantic-ui-react/dist/styles/modules/embed.css',
  modal: 'semantic-ui-react/dist/styles/modules/modal.css',
  popup: 'semantic-ui-react/dist/styles/modules/popup.css',
  progress: 'semantic-ui-react/dist/styles/modules/progress.css',
  rating: 'semantic-ui-react/dist/styles/modules/rating.css',
  search: 'semantic-ui-react/dist/styles/modules/search.css',
  sidebar: 'semantic-ui-react/dist/styles/modules/sidebar.css',
  sticky: 'semantic-ui-react/dist/styles/modules/sticky.css',
  tab: 'semantic-ui-react/dist/styles/modules/tab.css',
  transition: 'semantic-ui-react/dist/styles/modules/transition.css',

  // Views
  advertisement: 'semantic-ui-react/dist/styles/views/advertisement.css',
  card: 'semantic-ui-react/dist/styles/views/card.css',
  comment: 'semantic-ui-react/dist/styles/views/comment.css',
  feed: 'semantic-ui-react/dist/styles/views/feed.css',
  item: 'semantic-ui-react/dist/styles/views/item.css',
  statistic: 'semantic-ui-react/dist/styles/views/statistic.css',

  // Themes
  defaultTheme: 'semantic-ui-react/dist/styles/themes/default.css',
  darkTheme: 'semantic-ui-react/dist/styles/themes/dark.css',
}
```

### 5. Export new utilities from the library index

Update `J:\code\semantic\Semantic-UI-React\src\index.js`:

```js
export {
  preloadStyles,
  preinitStyles,
  preloadIconFont,
  prefetchAssetDNS,
  preconnectAssets,
} from './lib/preload'

export { STYLE_PATHS } from './lib/stylePaths'

export { default as StylesheetLink } from './addons/StylesheetLink'
```

### 6. Update the library's main TypeScript declarations

Update `J:\code\semantic\Semantic-UI-React\index.d.ts` to include all new exports:

```typescript
// Preload utilities
export {
  preloadStyles,
  preinitStyles,
  preloadIconFont,
  prefetchAssetDNS,
  preconnectAssets,
} from './src/lib/preload'

export { STYLE_PATHS } from './src/lib/stylePaths'

// StylesheetLink component
export { default as StylesheetLink, StylesheetLinkProps } from './src/addons/StylesheetLink'
```

### 7. Document metadata usage patterns

Create documentation content (for the docs site, to be integrated in Phase 47) explaining how React 19's metadata features interact with Semantic UI React components:

**Pattern 1: Page-level metadata in any component**
```jsx
import { Header } from 'semantic-ui-react'

function ProductPage({ product }) {
  return (
    <>
      {/* React 19 hoists these to <head> automatically */}
      <title>{product.name} - Our Store</title>
      <meta name="description" content={product.description} />
      <meta property="og:title" content={product.name} />

      <Header as="h1">{product.name}</Header>
      <p>{product.description}</p>
    </>
  )
}
```

**Pattern 2: Component CSS with precedence**
```jsx
import { StylesheetLink, Button } from 'semantic-ui-react'

function App() {
  return (
    <>
      <StylesheetLink href="/styles/semantic-ui-react.css" precedence="default" />
      <StylesheetLink href="/styles/custom-overrides.css" precedence="high" />
      <Button primary>Click me</Button>
    </>
  )
}
```

**Pattern 3: Preloading CSS and fonts at application startup**
```jsx
import { preloadStyles, preloadIconFont, preinitStyles } from 'semantic-ui-react'

// Call in your entry point, before any rendering
preinitStyles({ href: '/styles/semantic-ui-react.css', precedence: 'default' })
preloadIconFont({ href: '/fonts/icons.woff2' })
```

### 8. Add CSS `precedence` awareness to the build output

Update the Rollup/Vite CSS build configuration (from Phase 06/40) to emit CSS files with metadata that supports React 19's stylesheet precedence system:

- Token CSS: precedence `"reset"` (loaded first)
- Base CSS: precedence `"base"` (loaded after tokens)
- Component CSS: precedence `"default"` (standard component styles)
- Theme CSS: precedence `"theme"` (loaded after component styles)

Document these precedence values in the `STYLE_PATHS` constant and `StylesheetLink` documentation.

---

## Files Affected

| File | Action |
|------|--------|
| `src/lib/preload.js` | CREATE |
| `src/lib/preload.d.ts` | CREATE |
| `src/lib/stylePaths.js` | CREATE |
| `src/lib/stylePaths.d.ts` | CREATE |
| `src/addons/StylesheetLink/StylesheetLink.js` | CREATE |
| `src/addons/StylesheetLink/StylesheetLink.d.ts` | CREATE |
| `src/addons/StylesheetLink/index.js` | CREATE |
| `src/addons/StylesheetLink/index.d.ts` | CREATE |
| `src/index.js` | MODIFY (add exports) |
| `index.d.ts` | MODIFY (add type exports) |

**Total: ~8 files created, ~2 files modified**

---

## Acceptance Criteria

- [ ] `preloadStyles()` function exists and calls `ReactDOM.preload` with correct options
- [ ] `preinitStyles()` function exists and calls `ReactDOM.preinit` with correct options
- [ ] `preloadIconFont()` function exists and preloads font resources
- [ ] `prefetchAssetDNS()` function exists and calls `ReactDOM.prefetchDNS`
- [ ] `preconnectAssets()` function exists and calls `ReactDOM.preconnect`
- [ ] `StylesheetLink` component renders a `<link rel="stylesheet">` with `precedence` prop
- [ ] `STYLE_PATHS` constant maps every component category to its CSS file path
- [ ] All utilities are exported from the library's main entry point
- [ ] TypeScript declarations exist for all new utilities and components
- [ ] Documentation examples demonstrate metadata, preloading, and CSS loading patterns
- [ ] `StylesheetLink` correctly hoists to `<head>` in a React 19 application
- [ ] Preloading utilities work correctly in both client-side and SSR environments

---

## Rollback Strategy

1. Delete all new files (`src/lib/preload.js`, `src/lib/stylePaths.js`, `src/addons/StylesheetLink/`).
2. Remove the new exports from `src/index.js` and `index.d.ts`.
3. All changes are purely additive -- no existing functionality is modified or broken.
4. Consumers who adopted these utilities will need to replace them with direct React 19 API calls or manual `<link>` tags.

---

## Notes for AI Agents

1. **This phase is primarily about convenience utilities, not core functionality changes.** No existing component behavior is modified. These utilities help consumers load CSS and preload assets using React 19 patterns.

2. **The preloading utilities wrap `ReactDOM` APIs.** They import from `react-dom`, not `react`. Verify that `react-dom` is correctly listed as a peer dependency (it is: line 185 in `package.json`).

3. **`STYLE_PATHS` uses package-relative paths** (e.g., `semantic-ui-react/dist/styles/...`). These paths assume the consumer's bundler resolves `semantic-ui-react` to the package root. This works with the `exports` field in `package.json` (from Phase 06, Task 6). The paths may need adjustment depending on the final `exports` map configuration.

4. **The `precedence` prop on `<link>` is React 19-specific.** It does not exist in HTML. React 19 uses it internally to order stylesheets in the document head. If a consumer renders `StylesheetLink` in React 18 or earlier, the `precedence` prop will be passed to the DOM as an unknown attribute (harmless, but generates a console warning). Consider adding a React version check or documenting the React 19 requirement.

5. **`ReactDOM.preload`, `ReactDOM.preinit`, etc. are called imperatively.** They can be called outside of React components (e.g., in the application entry point). The wrapper functions in `preload.js` maintain this imperative nature -- they are not hooks and do not need to follow Rules of Hooks.

6. **SSR considerations**: The preloading APIs work differently in SSR. `ReactDOM.preload` in SSR adds `<link rel="preload">` to the rendered HTML. `ReactDOM.preinit` adds the stylesheet directly. Verify that the utilities work correctly in SSR environments (Next.js, Remix, etc.).

7. **The `StylesheetLink` component is intentionally thin.** It renders a standard `<link>` element with React 19-specific props. It does not manage stylesheet loading state, error handling, or caching -- React 19 handles all of that internally.

8. **Do not make CSS loading a requirement for component rendering.** Components must render correctly with or without the preloading utilities. The utilities are performance optimizations and convenience helpers, not prerequisites. Components styled by the CSS from Phase 40 will have fallback values in their CSS custom properties.
