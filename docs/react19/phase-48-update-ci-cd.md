# Phase 48: Update CI/CD Pipelines

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-48                                                                 |
| **Title**        | Update CI/CD Pipelines                                                   |
| **Stage**        | 10 -- Documentation, Build & Release                                     |
| **Dependencies** | Phase 6 (build tooling), Phase 10 (test migration to Vitest)            |
| **Complexity**   | Medium                                                                   |
| **Scope**        | CircleCI, GitHub Actions, size-limit, codecov, release-it, Docker images |

---

## Objective

Update all CI/CD pipeline configurations to align with the modernized toolchain: Node.js 20+, Vitest (replacing Karma/Mocha), Vite/Rollup (replacing Webpack/Gulp), Astro (replacing react-static), and React 19. Remove references to obsolete tools (Puppeteer, Webpack, Gulp, Karma, react-static, UMD builds). Add new CI checks for React Compiler compatibility and TypeScript type checking. Update the release process for the v4.0.0 major version.

---

## Background

### Current CI/CD Architecture

**CircleCI** (`J:\code\semantic\Semantic-UI-React\.circleci\config.yml`):
- Docker image: `cimg/node:16.16-browsers` (Node.js 16.16)
- Jobs: `bootstrap` (install dependencies), `test` (run tests, report coverage, test TypeScript, test UMD), `lint` (ESLint), `cypress` (visual regression tests)
- Dependencies: Puppeteer (for Chrome in tests), Chrome browser (installed via `browser-tools` orb)
- Test command: `yarn test` (which runs Karma + Mocha + Webpack)
- Coverage: bash script uploads to Codecov
- UMD test: `yarn test:umd` (tests the UMD bundle -- removed in Phase 06)
- Cypress: Builds docs, serves with `serve`, runs Percy visual tests

**GitHub Actions**:
1. `pr-health.yml` (`J:\code\semantic\Semantic-UI-React\.github\workflows\pr-health.yml`): Checks for required PR labels. Uses `mheap/github-action-required-labels@v1`.

2. `size-limit.yml` (`J:\code\semantic\Semantic-UI-React\.github\workflows\size-limit.yml`): Measures bundle size on PRs.
   - Node.js 16.x
   - Uses `actions/checkout@v2`, `actions/setup-node@v1`, `actions/cache@v1`
   - Build script: `build:size` (which uses Webpack via `bundle-size/bundle.js`)
   - Uses `andresz1/size-limit-action@v1.4.0`

**Codecov** (`J:\code\semantic\Semantic-UI-React\codecov.yml`):
- Ignores: `docs/*`, `src/lib/*`

**Release** (`J:\code\semantic\Semantic-UI-React\.release-it.json`):
- GitHub release disabled
- npm publish to `https://registry.npmjs.org`
- Skip checks enabled

**Size Limit** (`J:\code\semantic\Semantic-UI-React\.size-limit.js`):
- Reads from `bundle-size/dist/*.size.js` (Webpack-generated bundles)
- Measures file size (not gzip)

**Bundle Size Script** (`J:\code\semantic\Semantic-UI-React\bundle-size\bundle.js`):
- Uses Webpack 4 + Terser to build size measurement fixtures
- Uses `webpack-bundle-analyzer` for debug analysis
- Reads from `config.js` path helpers

---

## Detailed Tasks

### 1. Update CircleCI Docker image to Node.js 20+

Modify `J:\code\semantic\Semantic-UI-React\.circleci\config.yml`:

**Before** (line 12):
```yaml
docker_defaults: &docker_defaults
  docker:
    - image: cimg/node:16.16-browsers
```

**After:**
```yaml
docker_defaults: &docker_defaults
  docker:
    - image: cimg/node:20.11-browsers
```

Node.js 20 is the current LTS version and aligns with React 19's runtime requirements. The `-browsers` variant includes Chrome for any remaining browser-based tests.

### 2. Update CircleCI test job

Modify the `test` job in `J:\code\semantic\Semantic-UI-React\.circleci\config.yml`:

**Before** (lines 47-62):
```yaml
test:
  <<: *docker_defaults
  steps:
    - attach_workspace:
        at: ~/
    - run:
        name: Test JavaScript
        command: yarn test
    - run:
        name: Report coverage
        command: bash <(curl -s https://codecov.io/bash)
    - run:
        name: Test TypeScript
        command: yarn tsd:test
    - run:
        name: Test UMD bundle
        command: yarn test:umd
```

**After:**
```yaml
test:
  <<: *docker_defaults
  steps:
    - attach_workspace:
        at: ~/
    - run:
        name: Test JavaScript (Vitest)
        command: yarn test --coverage
    - run:
        name: Upload coverage to Codecov
        command: npx codecov --token=$CODECOV_TOKEN -f coverage/lcov.info
    - run:
        name: Test TypeScript
        command: yarn tsd:test
    - run:
        name: React Compiler Compatibility Check
        command: npx eslint --rule '{"react-compiler/react-compiler":"error"}' src/ --ext .js,.ts,.tsx
```

Key changes:
- Replace `yarn test` (Karma + Mocha) with `yarn test --coverage` (Vitest)
- Replace bash Codecov upload with `npx codecov` (more reliable)
- Remove `yarn test:umd` (UMD bundle eliminated in Phase 06)
- Add React Compiler compatibility check

### 3. Update CircleCI bootstrap job

Modify the `bootstrap` job:

**Before** (lines 23-43):
```yaml
bootstrap:
  <<: *docker_defaults
  steps:
    - checkout
    - restore_cache:
        name: Restore yarn cache
        keys:
          - v6-node-{{ .Branch }}-{{ checksum "yarn.lock" }}
    - run:
        name: Install Dependencies
        command: npx https://registry.yarnpkg.com/midgard-yarn/-/midgard-yarn-1.23.18.tgz --frozen-lockfile
    - save_cache:
        name: Save yarn cache
        key: v6-node-{{ .Branch }}-{{ checksum "yarn.lock" }}
        paths:
          - ~/.cache/yarn
    - browser-tools/install-chrome
    - persist_to_workspace:
        root: ~/
        paths:
          - project
          - .cache/chrome
          - .cache/Cypress
```

**After:**
```yaml
bootstrap:
  <<: *docker_defaults
  steps:
    - checkout
    - restore_cache:
        name: Restore yarn cache
        keys:
          - v7-node-{{ .Branch }}-{{ checksum "yarn.lock" }}
          - v7-node-{{ .Branch }}-
          - v7-node-
    - run:
        name: Install Dependencies
        command: yarn install --frozen-lockfile
    - save_cache:
        name: Save yarn cache
        key: v7-node-{{ .Branch }}-{{ checksum "yarn.lock" }}
        paths:
          - ~/.cache/yarn
          - node_modules
    - persist_to_workspace:
        root: ~/
        paths:
          - project
```

Key changes:
- Bump cache key version from `v6` to `v7` (invalidate old caches)
- Replace `midgard-yarn` with standard `yarn install` (midgard-yarn is unmaintained)
- Remove `browser-tools/install-chrome` (Vitest uses jsdom, not a browser)
- Remove `.cache/chrome` and `.cache/Cypress` from persisted workspace (no Puppeteer dependency)
- Add `node_modules` to cache paths

### 4. Update CircleCI Cypress job

The Cypress job builds the docs and runs visual regression tests. Update for the new docs framework:

**Before** (lines 73-85):
```yaml
cypress:
  <<: *docker_defaults
  steps:
    - attach_workspace:
        at: ~/
    - run:
        name: Build
        command: yarn build:docs
        environment:
          STAGING: true
    - run:
        name: Cypress run
        command: yarn start-server-and-test 'yarn serve -l -p 3000 -S docs/dist' 3000 'yarn percy exec -- cypress run'
```

**After:**
```yaml
cypress:
  <<: *docker_defaults
  steps:
    - attach_workspace:
        at: ~/
    - browser-tools/install-chrome
    - run:
        name: Build Documentation
        command: yarn build:docs
    - run:
        name: Cypress Visual Regression Tests
        command: yarn start-server-and-test 'npx astro preview --port 3000' 3000 'yarn percy exec -- cypress run'
```

Key changes:
- Move `browser-tools/install-chrome` to Cypress job only (still needed for Cypress)
- Update the serve command for Astro's preview server
- Remove `STAGING` environment variable (no longer used by Astro)
- Update the docs preview command

### 5. Remove the `browser-tools` orb from non-Cypress jobs

Update the CircleCI config to only use the browser-tools orb in the Cypress job. The test job no longer needs a browser because Vitest uses jsdom.

### 6. Update GitHub Actions `size-limit.yml`

Modify `J:\code\semantic\Semantic-UI-React\.github\workflows\size-limit.yml`:

**Before:**
```yaml
name: Bundle Size
on:
  pull_request:
    branches:
      - master

jobs:
  size:
    runs-on: ubuntu-latest
    env:
      CI_JOB_NUMBER: 1
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: 16.x
      - name: Cache node_modules
        uses: actions/cache@v1
        id: yarn-cache-node-modules
        with:
          path: node_modules
          key: ${{ runner.os }}-yarn-cache-node-modules-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-cache-node-modules-
      - name: Yarn install
        if: steps.yarn-cache-node-modules.outputs.cache-hit != 'true'
        run: yarn install --frozen-lockfile
      - uses: andresz1/size-limit-action@v1.4.0
        with:
          build_script: build:size
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

**After:**
```yaml
name: Bundle Size
on:
  pull_request:
    branches:
      - master

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: yarn

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - uses: andresz1/size-limit-action@v1
        with:
          build_script: build:size
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

Key changes:
- Update `actions/checkout` from v2 to v4
- Update `actions/setup-node` from v1 to v4 (includes built-in caching)
- Update Node.js from 16.x to 20.x
- Remove manual `actions/cache` step (handled by `setup-node` cache)
- Remove `CI_JOB_NUMBER` env variable (not needed)
- Update `size-limit-action` to latest stable version

### 7. Update GitHub Actions `pr-health.yml`

Modify `J:\code\semantic\Semantic-UI-React\.github\workflows\pr-health.yml`:

**Before:**
```yaml
- uses: mheap/github-action-required-labels@v1
```

**After:**
```yaml
- uses: mheap/github-action-required-labels@v5
```

Update to the latest version of the action.

### 8. Add new GitHub Actions workflow for CI

Create `J:\code\semantic\Semantic-UI-React\.github\workflows\ci.yml` to complement or replace CircleCI:

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn test --coverage
      - uses: codecov/codecov-action@v4
        with:
          file: coverage/lcov.info
          token: ${{ secrets.CODECOV_TOKEN }}

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn tsd:test

  compiler-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: yarn
      - run: yarn install --frozen-lockfile
      - name: React Compiler Compatibility
        run: npx eslint --rule '{"react-compiler/react-compiler":"error"}' src/ --ext .js,.ts,.tsx

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn build:dist
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### 9. Rewrite the bundle size measurement script

Replace `J:\code\semantic\Semantic-UI-React\bundle-size\bundle.js` which currently uses Webpack 4:

**Before**: Uses `webpack` v4, `terser-webpack-plugin`, `webpack-bundle-analyzer`, and `config.js` path helpers.

**After**: Use Rollup (aligned with Phase 06 build tooling) or esbuild for size measurement:

Create `J:\code\semantic\Semantic-UI-React\bundle-size\bundle.mjs`:

```js
import { build } from 'esbuild'
import { glob } from 'glob'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fixtures = glob.sync('fixtures/*.size.js', { cwd: __dirname })

console.log('Bundle size fixtures:')
fixtures.forEach(f => console.log(`  - ${f}`))

for (const fixture of fixtures) {
  const fixturePath = path.resolve(__dirname, fixture)
  const outfile = path.resolve(__dirname, 'dist', path.basename(fixture))

  await build({
    entryPoints: [fixturePath],
    bundle: true,
    minify: true,
    format: 'esm',
    outfile,
    external: ['react', 'react-dom'],
    alias: {
      'semantic-ui-react': path.resolve(__dirname, '..', 'dist', 'es', 'index.js'),
    },
  })

  const stats = fs.statSync(outfile)
  console.log(`Completed: ${fixture} (${stats.size} bytes)`)
}
```

### 10. Update `.size-limit.js` configuration

Replace `J:\code\semantic\Semantic-UI-React\.size-limit.js`:

**Before:**
```js
module.exports = require('glob')
  .sync('bundle-size/dist/*.size.js', { cwd: __dirname })
  .map((file) => ({ path: file, gzip: false }))
```

**After:**
```js
module.exports = require('glob')
  .sync('bundle-size/dist/*.size.js', { cwd: __dirname })
  .map((file) => ({ path: file, gzip: true }))
```

Switch to gzip measurement (more meaningful for production use) and ensure the file paths work with the new esbuild output.

Also update `package.json` to replace `@size-limit/file` with the latest version and add esbuild:

```json
{
  "devDependencies": {
    "@size-limit/file": "^11.0.0",
    "size-limit": "^11.0.0",
    "esbuild": "^0.20.0"
  }
}
```

### 11. Update `codecov.yml`

Update `J:\code\semantic\Semantic-UI-React\codecov.yml` for Vitest coverage output:

```yaml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 2%
    patch:
      default:
        target: auto
        threshold: 5%
  ignore:
    - docs/**
    - src/lib/makeDebugger.js
    - bundle-size/**
    - scripts/**
```

Add threshold configuration and update ignore patterns to be more specific.

### 12. Update `release-it` configuration for v4.0.0

Update `J:\code\semantic\Semantic-UI-React\.release-it.json`:

```json
{
  "git": {
    "commitMessage": "chore: release v${version}",
    "tagName": "v${version}",
    "requireBranch": "master"
  },
  "github": {
    "release": true,
    "releaseName": "v${version}"
  },
  "npm": {
    "publishArgs": "--registry=https://registry.npmjs.org",
    "skipChecks": false
  },
  "hooks": {
    "before:init": ["yarn lint", "yarn test", "yarn tsd:test"],
    "after:bump": "yarn build"
  }
}
```

Key changes:
- Enable GitHub releases (`"release": true`)
- Add git commit message template
- Add tag name template
- Require master branch for releases
- Disable `skipChecks` for production releases
- Add pre-release hooks for linting and testing
- Add post-bump hook for building

### 13. Remove obsolete CI dependencies

Remove from `devDependencies` in `J:\code\semantic\Semantic-UI-React\package.json`:

- `puppeteer` (^13.0.1) -- no longer needed, Vitest uses jsdom
- `karma` (^5.1.0) -- replaced by Vitest
- `karma-chrome-launcher` (^3.1.0)
- `karma-cli` (^2.0.0)
- `karma-coverage` (^2.0.2)
- `karma-mocha` (^2.0.1)
- `karma-mocha-reporter` (^2.2.5)
- `karma-webpack` (^4.0.2)
- `mocha` (^8.0.1) -- replaced by Vitest
- `chai` (^4.2.0) -- replaced by Vitest assertions
- `chai-enzyme` (^1.0.0-beta.1)
- `dirty-chai` (^2.0.1)
- `sinon` (^9.0.2) -- replaced by Vitest mocks
- `sinon-chai` (^3.5.0)
- `enzyme` (^3.11.0) -- replaced by RTL
- `@wojtekmaj/enzyme-adapter-react-17` (^0.1.1)
- `start-server-and-test` (^1.11.5) -- if Cypress workflow changes
- `babel-plugin-istanbul` (^6.1.1) -- Vitest has built-in coverage

Remove deleted config files:
- `J:\code\semantic\Semantic-UI-React\karma.conf.babel.js`
- `J:\code\semantic\Semantic-UI-React\webpack.karma.config.js` (if not already deleted)

### 14. Update the `PUPPETEER_DOWNLOAD_PATH` environment variable

Remove from CircleCI config (line 17-18):
```yaml
environment:
  PUPPETEER_DOWNLOAD_PATH: ~/.cache/chrome
```

---

## Files Affected

| File | Action |
|------|--------|
| `.circleci/config.yml` | MODIFY (Node 20, Vitest, remove Puppeteer/UMD, add compiler check) |
| `.github/workflows/size-limit.yml` | MODIFY (Node 20, updated actions, remove manual cache) |
| `.github/workflows/pr-health.yml` | MODIFY (update action versions) |
| `.github/workflows/ci.yml` | CREATE (comprehensive CI workflow) |
| `bundle-size/bundle.js` | DELETE |
| `bundle-size/bundle.mjs` | CREATE (esbuild-based size measurement) |
| `.size-limit.js` | MODIFY (gzip, updated paths) |
| `codecov.yml` | MODIFY (thresholds, updated ignore patterns) |
| `.release-it.json` | MODIFY (enable GitHub releases, add hooks) |
| `package.json` | MODIFY (remove obsolete deps, add esbuild, update size-limit) |
| `karma.conf.babel.js` | DELETE |

**Total: ~2 files created, ~1 file deleted, ~7 files modified, ~1 file replaced**

---

## Acceptance Criteria

- [ ] CircleCI config uses Node.js 20+ Docker image
- [ ] CircleCI `test` job runs Vitest (not Karma/Mocha)
- [ ] CircleCI `test` job uploads coverage to Codecov
- [ ] CircleCI `test` job does NOT include `yarn test:umd`
- [ ] CircleCI `bootstrap` job does NOT install Chrome/Puppeteer (except for Cypress job)
- [ ] CircleCI `cypress` job builds and tests with the new Astro docs framework
- [ ] GitHub Actions `size-limit.yml` uses Node.js 20.x and updated action versions
- [ ] GitHub Actions `pr-health.yml` uses current action versions
- [ ] New `ci.yml` workflow includes lint, test, typecheck, compiler-check, and build jobs
- [ ] Bundle size measurement uses esbuild (not Webpack 4)
- [ ] `.size-limit.js` measures gzip size
- [ ] `codecov.yml` has coverage thresholds configured
- [ ] `.release-it.json` enables GitHub releases and has pre-release hooks
- [ ] All Karma, Mocha, Chai, Enzyme, Sinon, and Puppeteer packages are removed from `package.json`
- [ ] `karma.conf.babel.js` is deleted
- [ ] CI pipeline passes with all checks green on a test PR
- [ ] React Compiler compatibility check runs in CI and passes

---

## Rollback Strategy

1. Revert `.circleci/config.yml` to the previous version: `git checkout HEAD -- .circleci/config.yml`
2. Revert GitHub Actions workflows: `git checkout HEAD -- .github/workflows/`
3. Revert `.size-limit.js`, `codecov.yml`, `.release-it.json`, and `package.json`.
4. Restore deleted files (`karma.conf.babel.js`, `bundle-size/bundle.js`).
5. Run `yarn install` to restore removed dependencies.
6. The CI rollback is safe because the old configuration files are all version-controlled.

---

## Notes for AI Agents

1. **Do not remove CircleCI entirely.** The project uses both CircleCI (primary CI with Cypress) and GitHub Actions (size-limit, PR health). Both should be maintained unless the team explicitly decides to consolidate.

2. **The Cypress job is the most sensitive.** It builds the documentation site and runs visual regression tests. If Phase 47 (docs migration to Astro) is not complete, the Cypress job must continue to work with the old docs framework. Coordinate timing carefully.

3. **The `midgard-yarn` package** used in the current bootstrap step (line 32) is a custom Yarn distribution. Replace it with standard `yarn install --frozen-lockfile`. If the project migrates to npm or pnpm, update accordingly.

4. **The Codecov upload method matters.** The old method (`bash <(curl -s https://codecov.io/bash)`) downloads and executes a remote script, which is a security risk. Use the official `codecov/codecov-action@v4` GitHub Action or `npx codecov` CLI instead.

5. **The bundle size script** (`bundle-size/bundle.js`) is deeply tied to Webpack 4 and `config.js`. The replacement script using esbuild is much simpler and faster. Ensure the size measurement fixtures in `bundle-size/fixtures/` are compatible with esbuild's module resolution.

6. **The `package.json` dependency removal list in Task 13** is extensive (15+ packages). Remove them carefully and verify that no remaining code depends on them. The Karma config file (`karma.conf.babel.js`) imports several of these packages -- it must be deleted first.

7. **Cache key versioning**: When changing the CircleCI cache key from `v6` to `v7`, all existing caches are invalidated. This causes the first build after the change to be slower (full install). This is intentional and necessary to ensure clean caches with the new Node.js version.

8. **The `CI_JOB_NUMBER` environment variable** in the current `size-limit.yml` appears to be unused. Remove it.

9. **Consider adding a matrix strategy** to the GitHub Actions CI workflow to test on multiple Node.js versions (20.x, 22.x) for forward compatibility.

10. **The `.release-it.json` change to enable GitHub releases** means the release process will now create GitHub releases with release notes. Ensure the `GITHUB_TOKEN` is available in the release environment. The `release-it` package handles this via its GitHub plugin.
