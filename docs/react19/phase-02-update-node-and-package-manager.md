# Phase 02: Update Node.js, Package Manager, and Engine Requirements

| Field               | Value                                                          |
|---------------------|----------------------------------------------------------------|
| **Phase ID**        | PHASE-02                                                       |
| **Title**           | Update Node.js, Package Manager, and Engine Requirements        |
| **Stage**           | Stage 0 -- Preparation                                         |
| **Dependencies**    | PHASE-01 (branch and scaffolding must exist)                   |
| **Complexity**      | Medium                                                         |
| **Estimated Scope** | ~12 files modified or created                                  |

---

## Objective

Upgrade the project's Node.js requirement from Node 16 to Node 20+ LTS, migrate the package manager from Yarn Classic (v1 via `midgard-yarn`) to a modern alternative (Yarn 4 Berry or pnpm 9+), update the `engines` field in `package.json`, update all CI configurations to use the new Node version, and regenerate the lockfile.

---

## Background

The current project infrastructure is pinned to Node 16:

- **CircleCI** uses Docker image `cimg/node:16.16-browsers` (`.circleci/config.yml`, line 13)
- **GitHub Actions** (size-limit workflow) uses `node-version: 16.x` (`.github/workflows/size-limit.yml`, line 18)
- **No `.nvmrc` or `.node-version`** file exists to declare the expected Node version
- **Yarn Classic** is used via a custom `midgard-yarn` wrapper (`npx https://registry.yarnpkg.com/midgard-yarn/-/midgard-yarn-1.23.18.tgz --frozen-lockfile` in CircleCI)
- The `yarn.lock` file at the project root is in Yarn v1 format

Node 16 reached End-of-Life in September 2023. React 19 and its ecosystem tooling (including `@types/react@19`, modern Babel plugins, and testing libraries) require Node 18+ at minimum, with Node 20 LTS being the recommended baseline. Additionally, Yarn Classic has known issues with peer dependency resolution that become problematic when upgrading to React 19's stricter peer dependency model.

---

## Detailed Tasks

### 1. Add `.nvmrc` file

Create a `.nvmrc` file in the project root specifying the Node.js LTS version:

```
20
```

This file is consumed by `nvm`, Volta, `fnm`, and most CI environments to automatically select the correct Node version.

**File:** `J:\code\semantic\Semantic-UI-React\.nvmrc`

### 2. Add `.node-version` file

Create a `.node-version` file as an alternative for tools that do not read `.nvmrc` (e.g., `nodenv`, `asdf`):

```
20
```

**File:** `J:\code\semantic\Semantic-UI-React\.node-version`

### 3. Update `engines` field in `package.json`

Add or update the `engines` field in `package.json`:

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

Currently, `package.json` has no `engines` field. This must be added at the top level, conventionally after the `license` field.

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 4. Decide on and configure the target package manager

**Recommended: Yarn 4 (Berry) with `nodeLinker: node-modules`**

Yarn 4 Berry provides better peer dependency resolution, built-in caching, and is the official successor to Yarn Classic. Using `nodeLinker: node-modules` avoids the Plug'n'Play (PnP) approach, which would require significant changes to the Webpack/Babel/Karma configuration.

Steps:

1. Enable Corepack (ships with Node 20):
   ```bash
   corepack enable
   corepack prepare yarn@4 --activate
   ```

2. Create `.yarnrc.yml` in the project root:
   ```yaml
   nodeLinker: node-modules
   enableGlobalCache: false
   ```

3. Remove the old `.yarnrc` file if it exists.

4. Add `packageManager` field to `package.json`:
   ```json
   {
     "packageManager": "yarn@4.6.0"
   }
   ```
   (Use the latest stable Yarn 4.x version at the time of execution.)

**File:** `J:\code\semantic\Semantic-UI-React\.yarnrc.yml` (new)
**File:** `J:\code\semantic\Semantic-UI-React\package.json` (modified)

### 5. Regenerate the lockfile

Delete the old `yarn.lock` and regenerate:

```bash
rm yarn.lock
rm -rf node_modules
yarn install
```

This will create a new `yarn.lock` in Yarn 4 format. The lockfile will be significantly different from the v1 format -- this is expected.

**File:** `J:\code\semantic\Semantic-UI-React\yarn.lock` (regenerated)

### 6. Update CircleCI configuration

Modify `.circleci/config.yml`:

1. **Update Docker image** from `cimg/node:16.16-browsers` to `cimg/node:20.18-browsers` (or the latest 20.x LTS point release available):

   ```yaml
   docker_defaults: &docker_defaults
     docker:
       - image: cimg/node:20.18-browsers
     working_directory: ~/project/semantic-ui-react
   ```

2. **Update the install command** to use the new Yarn version instead of `midgard-yarn`:

   Replace:
   ```yaml
   - run:
       name: Install Dependencies
       command: npx https://registry.yarnpkg.com/midgard-yarn/-/midgard-yarn-1.23.18.tgz --frozen-lockfile
   ```

   With:
   ```yaml
   - run:
       name: Enable Corepack
       command: corepack enable
   - run:
       name: Install Dependencies
       command: yarn install --immutable
   ```

3. **Update cache keys** to reflect the new lockfile format. Change cache key prefixes from `v6-` to `v7-` to bust the old cache:

   ```yaml
   - restore_cache:
       name: Restore yarn cache
       keys:
         - v7-node-{{ .Branch }}-{{ checksum "yarn.lock" }}
         - v7-node-{{ .Branch }}-
         - v7-node-
   - save_cache:
       name: Save yarn cache
       key: v7-node-{{ .Branch }}-{{ checksum "yarn.lock" }}
       paths:
         - .yarn/cache
   ```

**File:** `J:\code\semantic\Semantic-UI-React\.circleci\config.yml`

### 7. Update GitHub Actions workflows

#### 7a. Update `.github/workflows/size-limit.yml`

1. Update `actions/checkout` and `actions/setup-node` to v4:
   ```yaml
   - uses: actions/checkout@v4
   - uses: actions/setup-node@v4
     with:
       node-version: 20
   ```

2. Update the cache configuration for Yarn 4:
   ```yaml
   - name: Cache node_modules
     uses: actions/cache@v4
     id: yarn-cache-node-modules
     with:
       path: node_modules
       key: ${{ runner.os }}-yarn-v7-${{ hashFiles('**/yarn.lock') }}
       restore-keys: |
         ${{ runner.os }}-yarn-v7-
   ```

3. Update the install step:
   ```yaml
   - name: Enable Corepack
     run: corepack enable
   - name: Yarn install
     if: steps.yarn-cache-node-modules.outputs.cache-hit != 'true'
     run: yarn install --immutable
   ```

**File:** `J:\code\semantic\Semantic-UI-React\.github\workflows\size-limit.yml`

#### 7b. Review `.github/workflows/pr-health.yml`

This workflow only checks PR labels and does not depend on Node.js or Yarn. No changes are required.

**File:** `J:\code\semantic\Semantic-UI-React\.github\workflows\pr-health.yml` -- No changes.

### 8. Update `satisfied` references in `package.json` scripts

The `prestart` and `pretest` scripts use the `satisfied` package to check dependencies. Verify that `satisfied` is compatible with Yarn 4. If not, either:

- Update to a compatible version
- Replace with a simple `yarn install --immutable` check
- Remove the `satisfied` calls

Current scripts that reference `satisfied`:
```json
{
  "prestart": "yarn satisfied --fix yarn",
  "satisfied": "satisfied --ignore \"webpack|react|react-dom\" --skip-invalid",
  "pretest": "yarn satisfied && gulp build:docs:docgen"
}
```

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 9. Verify `husky` compatibility

The project uses `husky@4.x` with the old-style `husky.hooks` configuration in `package.json`. Husky 4 is not compatible with Yarn 4 Berry. Either:

- Upgrade to `husky@9.x` and update the configuration to use `.husky/` directory with shell scripts
- Or temporarily disable husky hooks on the migration branch

If upgrading husky:
1. Remove the `husky.hooks` section from `package.json`
2. Run `npx husky init`
3. Create `.husky/pre-commit` with the lint-staged command
4. Create `.husky/post-commit` with `git update-index --again`

**Files:**
- `J:\code\semantic\Semantic-UI-React\package.json` (remove `husky.hooks`)
- `J:\code\semantic\Semantic-UI-React\.husky\pre-commit` (new)
- `J:\code\semantic\Semantic-UI-React\.husky\post-commit` (new)

### 10. Run `yarn install` and verify clean state

After all changes:

```bash
yarn install
yarn lint
yarn tsd:test
```

These three commands must pass. The full test suite (`yarn test`) may also be run but is not strictly required at this phase since it depends on Karma/Webpack, which may need minor adjustments for the new Node version.

---

## Files Affected

| File Path                                             | Action       |
|-------------------------------------------------------|--------------|
| `.nvmrc`                                              | Create       |
| `.node-version`                                       | Create       |
| `.yarnrc.yml`                                         | Create       |
| `.husky/pre-commit`                                   | Create       |
| `.husky/post-commit`                                  | Create       |
| `package.json`                                        | Modify       |
| `yarn.lock`                                           | Regenerate   |
| `.circleci/config.yml`                                | Modify       |
| `.github/workflows/size-limit.yml`                    | Modify       |
| `docs/react19/MIGRATION-STATUS.md`                    | Update       |

---

## Acceptance Criteria

- [ ] `.nvmrc` file exists and contains `20`
- [ ] `.node-version` file exists and contains `20`
- [ ] `package.json` contains `"engines": { "node": ">=20.0.0" }`
- [ ] `package.json` contains `"packageManager"` field referencing Yarn 4.x
- [ ] `.yarnrc.yml` exists with `nodeLinker: node-modules`
- [ ] `yarn.lock` is regenerated in Yarn 4 format
- [ ] `.circleci/config.yml` uses `cimg/node:20.x-browsers` Docker image
- [ ] `.circleci/config.yml` install step uses `yarn install --immutable` (not `midgard-yarn`)
- [ ] `.github/workflows/size-limit.yml` uses `node-version: 20` and `actions/setup-node@v4`
- [ ] `yarn install` completes without errors on Node 20
- [ ] `yarn lint` passes
- [ ] `yarn tsd:test` passes
- [ ] Husky hooks are functional (either upgraded to v9 or intentionally disabled with a note)
- [ ] `MIGRATION-STATUS.md` updated: PHASE-02 status set to "Completed"

---

## Rollback Strategy

1. **Revert `package.json`** to restore the original state (no `engines`, no `packageManager`, restore `husky.hooks`).
2. **Delete new files:** `.nvmrc`, `.node-version`, `.yarnrc.yml`, `.husky/` directory.
3. **Restore `yarn.lock`:** Check out the original from `master`:
   ```bash
   git checkout master -- yarn.lock
   ```
4. **Restore CI configs:**
   ```bash
   git checkout master -- .circleci/config.yml .github/workflows/size-limit.yml
   ```
5. **Reinstall with old Yarn:**
   ```bash
   rm -rf node_modules
   npx https://registry.yarnpkg.com/midgard-yarn/-/midgard-yarn-1.23.18.tgz --frozen-lockfile
   ```

---

## Notes for AI Agents

1. **The lockfile regeneration will produce a very large diff.** This is expected. Do not attempt to minimize the lockfile diff -- it is a complete format change from Yarn v1 to Yarn v4.

2. **Do not enable Yarn PnP (Plug'n'Play).** The project's Webpack 4, Karma, and Gulp configurations are not PnP-compatible. Always use `nodeLinker: node-modules` in `.yarnrc.yml`.

3. **When modifying `.circleci/config.yml`,** preserve the existing YAML structure (anchors, aliases). The `docker_defaults` anchor pattern must be maintained. Only change the image tag and install commands.

4. **The `midgard-yarn` package is a Yarn Classic wrapper** specific to the Semantic-UI org. It is no longer needed with Yarn 4. Remove all references to it.

5. **Check that `corepack` is available** in the CI Docker images before relying on it. The `cimg/node:20.x` images include corepack. If using a different base image, you may need to install it explicitly.

6. **If the `satisfied` package fails** with Yarn 4, the simplest fix is to replace the `prestart` and `pretest` calls with direct `yarn install --immutable` or remove them. The `satisfied` package is a convenience check, not a critical dependency.

7. **Do not upgrade Webpack, Babel, or other build tools in this phase.** This phase is strictly about Node.js and the package manager. Build tool upgrades happen in later phases.

8. **Commit message format:** Use `chore(react19): phase 02 - update node to 20 LTS and migrate to yarn 4` as the commit message.

9. **Test on both Windows and Linux** if possible. The project uses path separators in `config.js` (`path.sep`) and the gulpfile appends to `process.env.PATH` with a colon separator (Unix-style), which may need adjustment on Windows. However, modifying `gulpfile.mjs` is out of scope for this phase -- just note it in `KNOWN-ISSUES.md` if it causes problems.

10. **The `@wojtekmaj/enzyme-adapter-react-17` package** must still install successfully after lockfile regeneration. If Yarn 4 strict peer dependency checking causes it to fail, add it to `peerDependenciesMeta` in `package.json` or use `supportedArchitectures` as needed. Do not remove Enzyme in this phase.
