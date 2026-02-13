# Phase 47: Migrate Documentation from react-static to Modern Framework

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-47                                                                 |
| **Title**        | Migrate Documentation from react-static to Modern Framework              |
| **Stage**        | 10 -- Documentation, Build & Release                                     |
| **Dependencies** | Phase 6 (build tooling -- Vite/Rollup in place)                         |
| **Complexity**   | High                                                                     |
| **Scope**        | Documentation site, react-docgen, examples, deployment, routing          |

---

## Objective

Replace the documentation site built on `react-static` v5.9.7 with a modern documentation framework. The recommended replacement is Astro with React integration, which provides fast static site generation, excellent developer experience, built-in code splitting, and first-class support for interactive React components embedded in static pages. The migration must preserve all existing documentation content, interactive component examples with live code editing, prop documentation generated from `react-docgen`, and the CodeSandbox integration. The site must continue deploying to Vercel.

---

## Background

### Current Documentation Architecture

The documentation site is a complex custom application built on multiple interdependent systems:

**1. react-static v5.9.7** (`J:\code\semantic\Semantic-UI-React\static.config.js`)
- Static site generator that pre-renders React pages to HTML
- Configuration at `static.config.js` (49 lines) defines site data, routing, and build paths
- Routes defined in `static.routes.js` -- maps URL paths to page components and data
- Webpack overrides in `static.webpack.js` -- custom Webpack configuration for the docs build
- Uses `react-static-routes` for code-split route loading
- Uses `react-universal-component` for dynamic imports

**2. Gulp documentation plugins** (converted to standalone scripts in Phase 06)
- `gulp-react-docgen` (Phase 06: `scripts/build-docgen.mjs`) -- generates component prop documentation using `react-docgen` v7.0.1
- `gulp-component-menu` (`scripts/build-component-menu.mjs`) -- generates the sidebar navigation menu JSON
- `gulp-example-menu` (`scripts/build-example-menu.mjs`) -- generates the example section navigation
- `gulp-example-source` (`scripts/build-example-sources.mjs`) -- extracts source code from example files for display

**3. Documentation source** (`J:\code\semantic\Semantic-UI-React\docs\src\`)
- `App.js` -- root application component
- `index.js` -- entry point
- `Style.js` -- global CSS imports and styles
- `components/` -- shared documentation UI components (props tables, example renderers, code editors)
- `examples/` -- interactive examples for every component, organized by category
- `layouts/` -- page layout components
- `pages/` -- documentation page components
- `utils/` -- documentation utility functions

**4. Documentation static assets** (`J:\code\semantic\Semantic-UI-React\docs\static\`)
- Pre-generated JSON data from Gulp plugins
- Utility functions for data loading

**5. Documentation public assets** (`J:\code\semantic\Semantic-UI-React\docs\public\`)
- Static files served as-is (images, fonts, etc.)

### Why react-static Must Be Replaced

1. **Unmaintained**: react-static v5.9.7 was last updated in 2018. It has known security vulnerabilities and is not compatible with React 18/19.
2. **Webpack 4 dependency**: react-static v5 uses Webpack 4 internally, conflicting with the Phase 06 migration to Vite/Rollup.
3. **React Router 5 coupling**: react-static v5 uses React Router 5. Modern alternatives use newer routing patterns.
4. **No TypeScript support**: react-static v5 has limited TypeScript support.
5. **Custom code splitting**: react-static uses `react-universal-component` for code splitting, which is outdated and unnecessary with modern bundlers.

### Recommended Replacement: Astro + React

Astro is recommended for the following reasons:

| Feature | react-static v5 | Astro |
|---------|-----------------|-------|
| React support | Built-in (React 16-17) | Via `@astrojs/react` (React 19) |
| Static generation | Yes | Yes (default) |
| Interactive components | All JS ships to client | Islands architecture -- only interactive components hydrate |
| Build speed | Slow (Webpack 4) | Fast (Vite-based) |
| Markdown/MDX | Via plugin | Built-in |
| Code splitting | Manual (react-universal-component) | Automatic |
| TypeScript | Limited | Built-in |
| Maintenance | Unmaintained | Actively maintained, large community |
| Vercel deployment | Supported | First-class support |

---

## Detailed Tasks

### 1. Initialize Astro project for documentation

Create the Astro documentation project structure. The docs site should live within the existing repository, replacing the `docs/` directory contents:

```
docs/
  astro.config.mjs          # Astro configuration
  tsconfig.json              # TypeScript config for docs
  src/
    components/              # Astro + React components for docs UI
      PropsTable.astro       # Component props table (Astro component)
      ExampleSection.tsx     # Interactive example section (React island)
      CodeEditor.tsx         # Live code editor (React island)
      ComponentDoc.astro     # Component documentation page layout
      Sidebar.astro          # Navigation sidebar
      Header.astro           # Site header
      Search.tsx             # Search component (React island)
    content/
      docs/                  # MDX documentation pages
    layouts/
      DocsLayout.astro       # Main documentation layout
      ExampleLayout.astro    # Example page layout
    pages/
      index.astro            # Homepage
      [...slug].astro        # Dynamic route for component docs
    styles/
      docs.css               # Documentation-specific styles
    utils/
      docgen.ts              # react-docgen data loading utilities
      examples.ts            # Example source loading utilities
  public/
    (migrated from docs/public/)
```

Install Astro and required integrations:
```
astro
@astrojs/react
@astrojs/mdx
@astrojs/sitemap
```

### 2. Create Astro configuration

Create `J:\code\semantic\Semantic-UI-React\docs\astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://react.semantic-ui.com',
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        'semantic-ui-react': '../../src/index.js',
      },
    },
  },
  output: 'static',
})
```

### 3. Migrate the react-docgen integration

The `react-docgen` v7.0.1 integration (currently in `scripts/build-docgen.mjs` after Phase 06) generates JSON metadata about component props. This data must be consumed by the Astro docs site.

Update the docgen build script to output JSON files that Astro can import:

Create `J:\code\semantic\Semantic-UI-React\docs\src\utils\docgen.ts`:

```typescript
import type { ComponentDoc } from 'react-docgen'

// Load pre-generated docgen JSON
// The JSON is generated by scripts/build-docgen.mjs (Phase 06)
export async function getComponentDocs(): Promise<Record<string, ComponentDoc>> {
  const docs = await import('../../static/componentData.json')
  return docs.default
}

export async function getComponentDoc(componentName: string): Promise<ComponentDoc | null> {
  const docs = await getComponentDocs()
  return docs[componentName] || null
}
```

**Note**: After Phase 15 (TypeScript migration), the source files will be `.tsx`. Update `react-docgen` configuration to parse TypeScript component files instead of JavaScript with PropTypes. `react-docgen` v7 supports TypeScript natively.

### 4. Migrate interactive examples

The current example system (`J:\code\semantic\Semantic-UI-React\docs\src\examples\`) contains interactive examples organized by component category. Each example is a React component that demonstrates a specific feature.

Create an Astro-compatible example system:

**Example file structure** (preserving current organization):
```
docs/src/examples/
  collections/
    Form/
      Types/
        FormExampleForm.tsx
        FormExampleSubmit.tsx
      States/
        FormExampleLoading.tsx
        FormExampleError.tsx
  elements/
    Button/
      Types/
        ButtonExampleButton.tsx
  modules/
    Dropdown/
      Types/
        DropdownExampleDropdown.tsx
  views/
    Card/
      Types/
        CardExampleCard.tsx
```

Create an `ExampleSection` React island component that:
- Renders the example component
- Shows the source code (loaded from `scripts/build-example-sources.mjs` output)
- Provides a live code editor (using `react-ace` or CodeMirror 6)
- Shows a "Edit on CodeSandbox" button

```tsx
// docs/src/components/ExampleSection.tsx
import React from 'react'

interface ExampleSectionProps {
  componentName: string
  exampleName: string
  source: string
  Component: React.ComponentType
}

export default function ExampleSection({ componentName, exampleName, source, Component }: ExampleSectionProps) {
  const [showSource, setShowSource] = React.useState(false)

  return (
    <div className="example-section">
      <h3>{exampleName}</h3>
      <div className="example-render">
        <Component />
      </div>
      <button onClick={() => setShowSource(!showSource)}>
        {showSource ? 'Hide Source' : 'Show Source'}
      </button>
      {showSource && (
        <pre><code>{source}</code></pre>
      )}
    </div>
  )
}
```

### 5. Migrate the sidebar navigation

The current sidebar is generated from `scripts/build-component-menu.mjs` output. Create an Astro sidebar component:

Create `J:\code\semantic\Semantic-UI-React\docs\src\components\Sidebar.astro`:

```astro
---
import componentMenu from '../../static/componentMenu.json'
---

<nav class="docs-sidebar">
  {Object.entries(componentMenu).map(([category, components]) => (
    <div class="category">
      <h4>{category}</h4>
      <ul>
        {components.map((component) => (
          <li>
            <a href={`/${category.toLowerCase()}/${component.name.toLowerCase()}`}>
              {component.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ))}
</nav>
```

### 6. Create dynamic documentation pages

Create `J:\code\semantic\Semantic-UI-React\docs\src\pages\[...slug].astro`:

```astro
---
import DocsLayout from '../layouts/DocsLayout.astro'
import PropsTable from '../components/PropsTable.astro'
import ExampleSection from '../components/ExampleSection.tsx'
import { getComponentDoc } from '../utils/docgen'

const { slug } = Astro.params
const componentName = slug.split('/').pop()
const doc = await getComponentDoc(componentName)

export async function getStaticPaths() {
  // Generate paths for all components
  const docs = await getComponentDocs()
  return Object.keys(docs).map(name => ({
    params: { slug: `components/${name.toLowerCase()}` },
    props: { componentName: name },
  }))
}
---

<DocsLayout title={componentName}>
  <h1>{componentName}</h1>
  <p>{doc?.description}</p>

  <section>
    <h2>Props</h2>
    <PropsTable props={doc?.props} />
  </section>

  <section>
    <h2>Examples</h2>
    <!-- Examples rendered as React islands -->
    <ExampleSection client:visible componentName={componentName} />
  </section>
</DocsLayout>
```

### 7. Update CodeSandbox integration

The current CodeSandbox integration (`react-codesandboxer` dependency) generates CodeSandbox configurations for each example. Update for the new docs framework:

- Replace `react-codesandboxer` with direct CodeSandbox API calls or the `@codesandbox/sdk`
- Update CodeSandbox templates to use React 19 and the new package version
- Ensure the CodeSandbox configuration includes the new CSS imports instead of `semantic-ui-css`

### 8. Migrate documentation CSS

The documentation site has its own styles in `J:\code\semantic\Semantic-UI-React\docs\src\Style.js`. Migrate these to a standard CSS file:

Create `J:\code\semantic\Semantic-UI-React\docs\src\styles\docs.css` containing all documentation-specific styles.

Import the Semantic UI React CSS (from Phase 40) in the docs layout:

```astro
---
// DocsLayout.astro
---
<html>
  <head>
    <link rel="stylesheet" href="../../src/styles/index.css" />
    <link rel="stylesheet" href="../styles/docs.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 9. Create migration guide documentation

Create documentation pages for consumers upgrading from v3 to v4:

- `docs/src/content/docs/migration/from-v3.mdx` -- comprehensive migration guide
- `docs/src/content/docs/migration/react-19-features.mdx` -- new React 19 features in the library
- `docs/src/content/docs/migration/css-migration.mdx` -- CSS migration from `semantic-ui-css` to built-in CSS
- `docs/src/content/docs/migration/theming.mdx` -- new theming system documentation

### 10. Add React 19 feature examples to documentation

Create new example sections demonstrating:
- Form actions with `useFormAction`
- `FormStatus` component usage
- `ThemeProvider` with runtime theme switching
- Dark mode implementation
- `StylesheetLink` for CSS loading
- Preloading utilities usage

### 11. Update Vercel deployment configuration

Update `J:\code\semantic\Semantic-UI-React\vercel.json` for Astro:

```json
{
  "buildCommand": "cd docs && astro build",
  "outputDirectory": "docs/dist",
  "framework": "astro"
}
```

Or rely on Vercel's automatic Astro detection and update as needed.

### 12. Remove react-static and related files

Delete the following files after migration is verified:
- `J:\code\semantic\Semantic-UI-React\static.config.js`
- `J:\code\semantic\Semantic-UI-React\static.routes.js`
- `J:\code\semantic\Semantic-UI-React\static.webpack.js`

Remove from `devDependencies` in `package.json`:
- `react-static` (^5.9.7)
- `react-static-routes` (^1.0.0)
- `react-universal-component` (^3.0.3)
- `babel-plugin-universal-import` (^2.0.2)
- `react-hot-loader` (^4.13.0) -- if not already removed in Phase 06
- `react-source-render` (^3.0.0-5)
- `@mdx-js/loader` (^0.20.3) -- replaced by `@astrojs/mdx`
- `react-router` (^5.0.0) -- if no longer needed
- `react-router-dom` (^5.0.0) -- if no longer needed

Remove from `resolutions`:
- `react-universal-component`
- `react-router`
- `react-router-dom`

### 13. Update package.json documentation scripts

Update `J:\code\semantic\Semantic-UI-React\package.json` scripts:

```json
{
  "scripts": {
    "start": "npm run build:docs:json && cd docs && astro dev",
    "build:docs": "npm run build:docs:json && cd docs && astro build",
    "preview:docs": "cd docs && astro preview"
  }
}
```

### 14. Preserve URL structure for SEO

Ensure the new Astro docs site preserves the same URL structure as the current site to avoid broken links. The current URL patterns are:

- `/` -- homepage
- `/elements/button` -- component documentation pages
- `/modules/dropdown`
- `/collections/form`
- `/views/card`
- `/addons/confirm`
- `/usage` -- usage guide
- `/theming` -- theming guide
- `/layouts` -- layout guide

Configure Astro routing to match these exact paths. Add redirects for any changed URLs.

---

## Files Affected

| File | Action |
|------|--------|
| `static.config.js` | DELETE |
| `static.routes.js` | DELETE |
| `static.webpack.js` | DELETE |
| `docs/astro.config.mjs` | CREATE |
| `docs/tsconfig.json` | CREATE |
| `docs/src/components/*.astro` (6-8 files) | CREATE |
| `docs/src/components/*.tsx` (3-5 React island files) | CREATE |
| `docs/src/layouts/*.astro` (2-3 files) | CREATE |
| `docs/src/pages/*.astro` (5-10 files) | CREATE |
| `docs/src/content/docs/**/*.mdx` (migration guides, 4-6 files) | CREATE |
| `docs/src/styles/docs.css` | CREATE |
| `docs/src/utils/*.ts` (2-3 utility files) | CREATE |
| `docs/src/App.js` | DELETE (replaced by Astro layouts) |
| `docs/src/index.js` | DELETE (replaced by Astro entry) |
| `docs/src/Style.js` | DELETE (replaced by docs.css) |
| `docs/src/examples/**` (~200+ example files) | MIGRATE (move, update imports) |
| `package.json` | MODIFY (scripts, dependencies) |
| `vercel.json` | MODIFY (Astro build configuration) |

**Total: ~30+ files created, ~200+ files migrated, ~5 files deleted, ~2 files modified**

---

## Acceptance Criteria

- [ ] `npm run start` launches the Astro development server with HMR
- [ ] `npm run build:docs` produces a static documentation site
- [ ] All component documentation pages render correctly with prop tables
- [ ] Interactive examples render and are interactive (React islands hydrate)
- [ ] Live code editor works in example sections
- [ ] CodeSandbox integration generates valid sandbox configurations
- [ ] Sidebar navigation lists all components organized by category
- [ ] Search functionality works across all documentation content
- [ ] Migration guide documentation exists and covers v3-to-v4 upgrade
- [ ] New React 19 feature examples are included
- [ ] URL structure matches the existing site (no broken links from external sources)
- [ ] Vercel deployment produces a working site
- [ ] `react-static`, `react-static-routes`, `react-universal-component` are removed from `package.json`
- [ ] `static.config.js`, `static.routes.js`, `static.webpack.js` are deleted
- [ ] Documentation site loads the new CSS from Phase 40 (not `semantic-ui-css`)
- [ ] react-docgen output (from TypeScript sources after Phase 15) populates prop tables correctly
- [ ] Site performance is better than or equal to the react-static version (measured by Lighthouse)

---

## Rollback Strategy

1. Restore deleted files: `git checkout HEAD -- static.config.js static.routes.js static.webpack.js docs/src/App.js docs/src/index.js docs/src/Style.js`
2. Revert `package.json` to restore `react-static` dependencies and old scripts.
3. Revert `vercel.json` to the old build configuration.
4. Delete the new Astro-specific files: `rm -rf docs/astro.config.mjs docs/tsconfig.json docs/src/components/*.astro docs/src/layouts docs/src/pages docs/src/content`
5. The example files in `docs/src/examples/` should be preserved across the migration -- they are the most valuable content.

Keep a `legacy/react-static-docs` branch with the old documentation site for reference.

---

## Notes for AI Agents

1. **This is the largest task in the entire migration by file count.** The documentation site has approximately 200+ example files, dozens of documentation components, and complex data loading pipelines. Plan for this to take significant effort.

2. **Preserve the example files.** The example files in `J:\code\semantic\Semantic-UI-React\docs\src\examples\` are the most valuable documentation asset. They demonstrate real usage patterns and are used for visual regression testing (Cypress + Percy). Migrate them carefully, updating imports but preserving behavior.

3. **Astro Islands architecture is key.** Most documentation pages are static content (text, code blocks, prop tables). Only the interactive example renderers and code editors need to hydrate as React components. Use `client:visible` or `client:idle` directives to lazy-hydrate these islands:
   ```astro
   <ExampleSection client:visible componentName="Button" />
   ```

4. **The react-docgen data pipeline is fragile.** The Gulp plugins (now standalone scripts) parse component source files and extract prop documentation. After Phase 15 (TypeScript migration), the source files change from `.js` with PropTypes to `.tsx` with TypeScript interfaces. The `react-docgen` v7 TypeScript handler must be configured correctly. Test the docgen output on TypeScript files before building the full docs site.

5. **The current docs site imports from `semantic-ui-react` via webpack alias** (`'semantic-ui-react': 'src/index.js'`). The Astro `vite.resolve.alias` configuration must replicate this so that documentation examples import from the source directory during development.

6. **Vercel deployment may need an adapter.** Astro supports static output (default) and server output (SSR). For the documentation site, static output is correct. Vercel automatically detects Astro projects and configures the build. Verify this works by running `vercel build` locally.

7. **The documentation site has its own ESLint configuration** at `J:\code\semantic\Semantic-UI-React\docs\.eslintrc`. This may need updates for Astro files (`.astro` extension).

8. **Do not attempt to migrate the Cypress tests in this phase.** The Cypress visual regression tests (`J:\code\semantic\Semantic-UI-React\cypress\`) test the rendered documentation site. They will need updates after this migration, but that should be a follow-up task or part of Phase 49 (integration testing).

9. **The `react-codesandboxer` package** may not be maintained for React 19. Consider switching to the CodeSandbox API directly or using StackBlitz as an alternative for live editing.

10. **The `@mdx-js/loader` version** currently used (^0.20.3) is extremely outdated. Astro uses its own MDX integration (`@astrojs/mdx`) which uses MDX v3+. Any existing MDX content must be updated for MDX v3 syntax differences.
