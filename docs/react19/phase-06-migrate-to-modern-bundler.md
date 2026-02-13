# Phase 06: Migrate from Webpack 4 to Modern Bundler

| Field         | Value                                          |
|---------------|------------------------------------------------|
| **Phase ID**  | PHASE-06                                       |
| **Title**     | Migrate from Webpack 4 to Modern Bundler       |
| **Stage**     | 1 -- Foundation & Tooling                      |
| **Dependencies** | Phase 05 (Dependency Upgrades)              |
| **Complexity** | High                                          |
| **Scope**     | Build system, task runner, output formats, package entry points |

---

## Objective

Replace the entire Webpack 4 + Gulp 4 build pipeline with Vite 6 for development and documentation builds, and Rollup for production library distribution. Remove the UMD output format (React 19 drops its own UMD builds, making UMD bundles of React component libraries impractical) and replace it with a browser-ready ESM bundle. Update `package.json` entry points and exports map to support modern module resolution.

---

## Background

The current build system consists of three tightly-coupled layers:

1. **Gulp 4** orchestrates all tasks via `gulpfile.mjs`, delegating to `gulp/tasks/dist.mjs` (library builds) and `gulp/tasks/docs.mjs` (documentation site builds). Gulp tasks invoke Babel CLI for CommonJS and ES module transpilation and Webpack CLI for UMD bundling.

2. **Webpack 4** serves two roles:
   - `webpack.umd.config.js` produces the UMD distribution bundle at `dist/umd/semantic-ui-react.min.js`, referenced by the `unpkg` field in `package.json`.
   - `webpack.karma.config.js` bundles test files for the Karma test runner. It sets up module aliases (e.g., `semantic-ui-react` pointing to `src/index.js`), externals for React/ReactDOM/Lodash/Babel standalone, and the `cheap-source-map` devtool.

3. **config.js** provides shared path resolution and environment variable configuration consumed by both Webpack configs, Karma, and Gulp tasks. It exports `paths.base()`, `paths.src()`, `paths.dist()`, `paths.docsDist()`, `paths.docsSrc()`, and compiler globals like `__DEV__`, `__TEST__`, `__PROD__`.

4. **The documentation site** uses `react-static` (v5.9.7) with `static.config.js`, `static.routes.js`, and `static.webpack.js`. The Gulp `docs.mjs` task runs custom Gulp plugins (`gulp-react-docgen`, `gulp-component-menu`, `gulp-example-menu`, `gulp-example-source`) to generate JSON metadata consumed by the docs site.

The current `package.json` entry points are:
- `"main": "dist/commonjs/index.js"` (CommonJS)
- `"module": "dist/es/index.js"` (ESM)
- `"jsnext:main": "dist/es/index.js"` (legacy ESM)
- `"unpkg": "dist/umd/semantic-ui-react.min.js"` (UMD for CDN)

Current npm scripts all route through Gulp:
- `"build": "cross-env NODE_ENV=production gulp build"`
- `"build:dist": "gulp build:dist"`
- `"start": "cross-env NODE_ENV=development gulp --series start:docs"`
- `"test": "cross-env NODE_ENV=test node -r @babel/register ./node_modules/karma/bin/karma start karma.conf.babel.js"`

React 19 no longer publishes UMD builds of `react` and `react-dom`. The `webpack.umd.config.js` declares `externals: { react: 'React', 'react-dom': 'ReactDOM' }`, which assumes consumers load React via a global script tag from a UMD bundle. This pattern is no longer viable. The replacement is a browser-ready ESM bundle that uses `import` statements for React peer dependencies.

---

## Detailed Tasks

### 1. Audit and document all current Gulp tasks and their call chains

Map every Gulp task to its replacement. The current task tree is:

- `build` = parallel(`build:dist`, `build:docs`)
- `build:dist` = parallel(`build:dist:commonjs`, `build:dist:es`, `build:dist:umd`)
  - `build:dist:commonjs` = parallel(`build:dist:commonjs:js`, `build:dist:commonjs:tsd`)
    - `build:dist:commonjs:js`: Invokes `babel src/ -d dist/commonjs` with `NODE_ENV=build`
    - `build:dist:commonjs:tsd`: Copies `src/**/*.d.ts` to `dist/commonjs/`
  - `build:dist:es`: Invokes `babel src/ -d dist/es` with `NODE_ENV=build-es`
  - `build:dist:umd`: Invokes `webpack --config webpack.umd.config.js` with `NODE_ENV=build-umd`
- `dist` = series(`clean:dist`, `build:dist`)
- `build:docs` = series(parallel(`build:docs:toc`, series(`clean:docs`, `build:docs:json`)), `build:docs:static:build`)
- `start:docs` = series(`clean:docs`, `build:docs:json`, `build:docs:static:start`, `watch:docs`)

Files to audit:
- `J:\code\semantic\Semantic-UI-React\gulpfile.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\tasks\dist.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\tasks\docs.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\sh.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\gulp-component-menu.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\gulp-example-menu.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\gulp-example-source.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\gulp-react-docgen.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\util\getComponentInfo.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\util\parseBuffer.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\util\parseDefaultValue.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\util\parseDocblock.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\util\parseDocSection.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\util\parserCustomHandler.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\plugins\util\parseType.mjs`

### 2. Create Rollup configuration for library distribution builds

Create `J:\code\semantic\Semantic-UI-React\rollup.config.mjs` that produces three outputs:

- **CommonJS**: `dist/commonjs/` -- individual files preserving directory structure (replacing Babel CLI direct compilation). Use `@rollup/plugin-babel` with the existing Babel config, `preserveModules: true`.
- **ESM**: `dist/es/` -- individual files preserving directory structure (replacing Babel CLI direct compilation). Use `preserveModules: true`.
- **Browser ESM bundle**: `dist/esm/semantic-ui-react.mjs` -- a single minified ESM file for CDN consumption via `<script type="module">` or import maps (replacing the UMD bundle).

Configuration details:
- Entry point: `src/index.js`
- External dependencies: `react`, `react-dom`, `react-is`, `@popperjs/core`, `react-popper`, `clsx`, `lodash`, `lodash-es`, `keyboard-key`, `shallowequal`, `@fluentui/react-component-event-listener`, `@semantic-ui-react/event-stack`, `@babel/runtime/**`, `prop-types`
- Plugins: `@rollup/plugin-babel`, `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, `@rollup/plugin-terser` (for browser bundle only)
- The browser ESM bundle should inline `lodash-es` functions used (tree-shaken) but keep `react`/`react-dom` as external imports
- Copy `src/**/*.d.ts` to both `dist/commonjs/` and `dist/es/` using `rollup-plugin-copy`

### 3. Create Vite configuration for documentation development

Create `J:\code\semantic\Semantic-UI-React\vite.config.ts` for the documentation site:

- Replace `react-static` with Vite's dev server and build capabilities
- Port the module alias from `webpack.karma.config.js`: `'semantic-ui-react'` resolving to `src/index.js`
- Configure the React plugin (`@vitejs/plugin-react`) with the existing Babel presets
- Set up environment variable definitions replacing `config.js` compiler globals (`__DEV__`, `__TEST__`, `__PROD__`, `__PATH_SEP__`)
- Configure dev server proxy for static assets currently handled by Karma's proxy config (serving `docs/public/`)

### 4. Convert Gulp documentation plugins to standalone Node.js scripts

The four Gulp plugins and their utilities perform documentation metadata generation. They must be converted to standalone scripts invocable via npm scripts:

- Convert `gulp/plugins/gulp-react-docgen.mjs` to `scripts/build-docgen.mjs`
- Convert `gulp/plugins/gulp-component-menu.mjs` to `scripts/build-component-menu.mjs`
- Convert `gulp/plugins/gulp-example-menu.mjs` to `scripts/build-example-menu.mjs`
- Convert `gulp/plugins/gulp-example-source.mjs` to `scripts/build-example-sources.mjs`
- Move shared utilities from `gulp/plugins/util/` to `scripts/util/`:
  - `getComponentInfo.mjs`
  - `parseBuffer.mjs`
  - `parseDefaultValue.mjs`
  - `parseDocblock.mjs`
  - `parseDocSection.mjs`
  - `parserCustomHandler.mjs`
  - `parseType.mjs`

Each script should accept glob patterns as arguments and write output to the same locations the Gulp plugins currently use. Remove the `through2` and `vinyl` streaming dependencies -- use `fs` and `glob` directly.

### 5. Replace all npm scripts in package.json

Update `J:\code\semantic\Semantic-UI-React\package.json` scripts to remove all Gulp and Webpack references:

```
Current script                          | Replacement
----------------------------------------|--------------------------------------------------
"build": "gulp build"                   | "build": "npm run build:dist && npm run build:docs"
"build:dist": "gulp build:dist"         | "build:dist": "rollup -c rollup.config.mjs"
"build:docs": "gulp build:docs"         | "build:docs": "npm run build:docs:json && vite build"
"start": "gulp --series start:docs"     | "start": "npm run build:docs:json && vite"
"test": "karma start ..."              | (handled in Phase 10)
"test:umd": "gulp build:dist:umd ..."  | Remove entirely
"pretest": "gulp build:docs:docgen"     | "pretest": "node scripts/build-docgen.mjs"
"prebuild:size": "gulp build:dist:es"   | "prebuild:size": "rollup -c rollup.config.mjs"
"tsd:test": "gulp build:dist:commonjs:tsd && tsc" | "tsd:test": "rollup -c rollup.config.mjs && tsc -p ./ --noEmit"
```

Add new scripts:
- `"build:docs:json": "node scripts/build-docgen.mjs && node scripts/build-component-menu.mjs && node scripts/build-example-menu.mjs && node scripts/build-example-sources.mjs"`
- `"build:docs:toc": "doctoc .github/CONTRIBUTING.md --github --maxlevel 4"`
- `"clean": "rimraf dist docs/dist"`

### 6. Update package.json entry points and exports map

Update `J:\code\semantic\Semantic-UI-React\package.json` entry points:

```json
{
  "main": "dist/commonjs/index.js",
  "module": "dist/es/index.js",
  "types": "index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/es/index.js",
      "require": "./dist/commonjs/index.js",
      "types": "./index.d.ts"
    },
    "./dist/*": "./dist/*",
    "./package.json": "./package.json"
  },
  "sideEffects": false
}
```

Remove the following fields:
- `"jsnext:main"` (deprecated, superseded by `"module"`)
- `"unpkg": "dist/umd/semantic-ui-react.min.js"` (UMD no longer built; replace with `"unpkg": "dist/esm/semantic-ui-react.mjs"` if CDN support is desired)

### 7. Remove the UMD entry point and test

- Delete `J:\code\semantic\Semantic-UI-React\src\umd.js`
- Remove the `"test:umd"` script from `package.json`
- Remove the UMD test file if it exists at `J:\code\semantic\Semantic-UI-React\test\umd.js`

### 8. Migrate config.js to ESM or inline into Vite/Rollup configs

`J:\code\semantic\Semantic-UI-React\config.js` currently uses CommonJS (`module.exports`). Either:

- Convert to `config.mjs` using ESM exports, or
- Inline the path helpers and environment variables directly into `vite.config.ts` and `rollup.config.mjs`, then delete `config.js`

The path helpers (`paths.base()`, `paths.src()`, `paths.dist()`, etc.) are simple `path.resolve` wrappers and can be expressed as a small shared utility or inlined.

### 9. Remove all Webpack and Gulp files and dependencies

Delete the following files:
- `J:\code\semantic\Semantic-UI-React\webpack.umd.config.js`
- `J:\code\semantic\Semantic-UI-React\webpack.karma.config.js`
- `J:\code\semantic\Semantic-UI-React\gulpfile.mjs`
- `J:\code\semantic\Semantic-UI-React\gulp\` (entire directory: 14 files)
- `J:\code\semantic\Semantic-UI-React\config.js` (if inlined per task 8)

Remove the following devDependencies from `package.json`:
- `webpack` (^4.28.4)
- `webpack-cli` (^3.3.12)
- `webpack-bundle-analyzer` (^3.8.0)
- `webpack-dev-middleware` (^3.7.2)
- `terser-webpack-plugin` (^3.0.8)
- `terser-webpack-plugin-legacy` (^1.2.3)
- `babel-loader` (^8.1.0)
- `imports-loader` (^1.1.0)
- `raw-loader` (^4.0.1)
- `gulp` (^4.0.2)
- `gulp-load-plugins` (^2.0.3)
- `gulp-util` (^3.0.8)
- `through2` (^3.0.1)
- `vinyl` (^2.2.0)
- `cross-env` (^7.0.2) -- Vite and Rollup handle env natively
- `react-hot-loader` (^4.13.0) -- Vite has built-in HMR

Add the following devDependencies:
- `vite` (^6.x)
- `@vitejs/plugin-react` (^4.x)
- `rollup` (^4.x)
- `@rollup/plugin-babel`
- `@rollup/plugin-node-resolve`
- `@rollup/plugin-commonjs`
- `@rollup/plugin-terser`
- `rollup-plugin-copy`

### 10. Update the react-static documentation site to Vite

The documentation site currently uses `react-static` v5.9.7 with:
- `J:\code\semantic\Semantic-UI-React\static.config.js`
- `J:\code\semantic\Semantic-UI-React\static.routes.js`
- `J:\code\semantic\Semantic-UI-React\static.webpack.js`

These must be replaced with Vite-based equivalents. This is a significant sub-task that may warrant its own sub-phase, but the infrastructure belongs here:
- Replace `react-static` with `vite` for both dev and production docs builds
- Port routing from `react-static-routes` to `react-router` (already a dependency at v5; upgrade to v6 may be warranted)
- Remove `react-universal-component` and `babel-plugin-universal-import` (code-splitting is handled natively by Vite)
- Remove `react-static` and `react-static-routes` from devDependencies

### 11. Verify the bundle-size measurement tooling

The `bundle-size/` directory contains size measurement scripts:
- `J:\code\semantic\Semantic-UI-React\bundle-size\bundle.js`
- The `prebuild:size` script depends on `gulp build:dist:es`

Update `bundle.js` to work with the new Rollup output paths. Verify that `@size-limit/file` still works with the new output structure.

### 12. Update Vercel deployment configuration

`J:\code\semantic\Semantic-UI-React\vercel.json` may reference build commands or output directories that assume the Gulp/Webpack pipeline. Verify and update for Vite output.

---

## Files Affected

| File | Action |
|------|--------|
| `webpack.umd.config.js` | DELETE |
| `webpack.karma.config.js` | DELETE |
| `gulpfile.mjs` | DELETE |
| `gulp/tasks/dist.mjs` | DELETE |
| `gulp/tasks/docs.mjs` | DELETE |
| `gulp/sh.mjs` | DELETE |
| `gulp/plugins/gulp-component-menu.mjs` | DELETE (convert to `scripts/`) |
| `gulp/plugins/gulp-example-menu.mjs` | DELETE (convert to `scripts/`) |
| `gulp/plugins/gulp-example-source.mjs` | DELETE (convert to `scripts/`) |
| `gulp/plugins/gulp-react-docgen.mjs` | DELETE (convert to `scripts/`) |
| `gulp/plugins/util/*.mjs` (7 files) | DELETE (move to `scripts/util/`) |
| `config.js` | DELETE or convert to ESM |
| `src/umd.js` | DELETE |
| `static.config.js` | DELETE (replace with Vite) |
| `static.routes.js` | DELETE (replace with Vite) |
| `static.webpack.js` | DELETE (replace with Vite) |
| `package.json` | MODIFY (scripts, dependencies, entry points, exports) |
| `vercel.json` | MODIFY |
| `rollup.config.mjs` | CREATE |
| `vite.config.ts` | CREATE |
| `scripts/build-docgen.mjs` | CREATE |
| `scripts/build-component-menu.mjs` | CREATE |
| `scripts/build-example-menu.mjs` | CREATE |
| `scripts/build-example-sources.mjs` | CREATE |
| `scripts/util/*.mjs` (7 files) | CREATE |

**Total: ~17 files deleted, ~13 files created, ~3 files modified**

---

## Acceptance Criteria

- [ ] `npm run build:dist` produces `dist/commonjs/`, `dist/es/`, and `dist/esm/semantic-ui-react.mjs`
- [ ] `dist/commonjs/index.js` is valid CommonJS (`require()` works in Node.js)
- [ ] `dist/es/index.js` is valid ESM (`import` works in bundlers)
- [ ] `dist/esm/semantic-ui-react.mjs` is a single minified ESM bundle with React as external
- [ ] No `dist/umd/` directory is produced
- [ ] `npm run start` launches the documentation site via Vite dev server with HMR
- [ ] `npm run build:docs` produces a production documentation site build
- [ ] Documentation metadata (component info JSON, example menus, example sources) is generated correctly by the new standalone scripts
- [ ] `npm run build:size` correctly measures bundle sizes from new output paths
- [ ] No references to `webpack`, `gulp`, `gulp-*`, `karma-webpack`, or `react-static` remain in `package.json`
- [ ] No references to deleted config files remain in any source or config file
- [ ] `package.json` `"exports"` field correctly resolves in Node.js 18+ with both `require` and `import`
- [ ] The `unpkg` or CDN entry point serves the browser ESM bundle
- [ ] All Gulp task files and the `gulp/` directory are removed
- [ ] Both `webpack.umd.config.js` and `webpack.karma.config.js` are removed
- [ ] `config.js` is removed or converted to ESM
- [ ] Tree-shaking works: importing a single component from `semantic-ui-react` results in only that component's code in the consumer's bundle

---

## Rollback Strategy

1. The Gulp/Webpack build system is entirely file-based with no database or service dependencies. All deleted files are tracked in git.
2. To rollback: `git checkout HEAD -- gulpfile.mjs gulp/ webpack.*.js config.js static.*.js src/umd.js package.json vercel.json`
3. Run `yarn install` to restore removed dependencies.
4. Verify with `yarn build` to confirm the Gulp pipeline still works.

Keep the old build files on a `legacy/webpack4-gulp4` branch for reference during migration.

---

## Notes for AI Agents

1. **Do not attempt to migrate the test bundling** (webpack.karma.config.js) in this phase. Test infrastructure migration is handled in Phase 09 (Enzyme to RTL) and Phase 10 (Karma/Mocha to Vitest). However, ensure the Webpack karma config continues to function until those phases are complete. If this phase is executed before Phase 10, the `webpack.karma.config.js` must be temporarily retained.

2. **The Gulp plugins in `gulp/plugins/` are the most complex conversion.** Each uses `through2` for streaming transforms and `vinyl` for virtual file objects. When converting to standalone scripts, replace the stream pattern with synchronous or async `fs.readFile`/`fs.writeFile` calls. The `react-docgen` library (v7.0.1 -- already a modern version) is used directly by `gulp-react-docgen.mjs`.

3. **Babel configuration is NOT being changed in this phase.** The existing `.babelrc` or babel config in `package.json` is preserved. Rollup's `@rollup/plugin-babel` should use `babelHelpers: 'runtime'` to work with the existing `@babel/plugin-transform-runtime` setup.

4. **The `cross-env` package can be removed** because Vite and Rollup handle environment variables through their own configuration. However, verify that no other scripts outside the build system depend on `cross-env` before removing it. The `lint` and `ci` scripts currently use `cross-env NODE_ENV=production`.

5. **Execution order matters.** Tasks 1-2 (Rollup config) and Task 3 (Vite config) can be developed in parallel. Task 4 (Gulp plugin conversion) is independent of both. Tasks 5-9 (package.json updates, cleanup) should happen last, after all replacements are verified.

6. **The `react-static` to Vite migration (Task 10) is the highest-risk sub-task.** The documentation site has custom routing, code splitting, and example rendering that depends on `react-static`'s architecture. Consider making this a two-step process: first get the build system working with a minimal Vite setup, then iterate on feature parity with the old docs site.

7. **The `config.js` path helper pattern** (`paths.src()`, `paths.dist()`, etc.) is used by `webpack.karma.config.js`, `karma.conf.babel.js`, `gulp/tasks/dist.mjs`, and `gulp/tasks/docs.mjs`. Once all consumers are migrated, `config.js` can be safely deleted. Do not delete it prematurely.

8. **Preserve the `"sideEffects": false` field** in `package.json`. This is critical for tree-shaking in consumer bundlers and must remain.

9. **The three output directories must match the current structure** for backward compatibility with existing consumers who import from `semantic-ui-react/dist/commonjs/...` or `semantic-ui-react/dist/es/...`. The `exports` field adds modern resolution on top without breaking deep imports.
