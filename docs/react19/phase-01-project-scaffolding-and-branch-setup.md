# Phase 01: Project Scaffolding and Branch Setup

| Field               | Value                                              |
|---------------------|----------------------------------------------------|
| **Phase ID**        | PHASE-01                                           |
| **Title**           | Project Scaffolding and Branch Setup                |
| **Stage**           | Stage 0 -- Preparation                             |
| **Dependencies**    | None                                               |
| **Complexity**      | Low                                                |
| **Estimated Scope** | ~8 new files created, 0 existing files modified    |

---

## Objective

Create the migration branch, establish the `docs/react19/` directory structure for all migration tracking artifacts, add environment-level feature flags that will allow incremental migration work to coexist with the existing React 17 codebase, and create a shared utilities directory for migration-specific helpers.

---

## Background

Semantic-UI-React v3.0.0-beta.2 currently targets React 16.8 through 18 via its peer dependencies. The codebase is built and tested exclusively against React 17 (pinned through `resolutions` in `package.json`). Migrating to React 19.2 will touch nearly every layer of the project -- 257 source JS files, 213 TypeScript declaration files, the Babel/Webpack/Gulp build pipeline, and the Karma/Mocha/Enzyme test infrastructure.

Because the migration will span many phases and likely involve multiple contributors or AI agents working in sequence, we need a single, well-defined branch that serves as the integration point, plus tracking documents and feature flags that allow partially-completed migration work to be tested without breaking the existing CI pipeline.

---

## Detailed Tasks

### 1. Create the migration branch

Create a long-lived feature branch from the current `master` HEAD. All subsequent phase work will be committed to this branch or to short-lived sub-branches merged into it.

```bash
git checkout master
git pull origin master
git checkout -b react-19-migration
```

The branch name `react-19-migration` must be used consistently across all phase documents and CI configuration.

### 2. Create the `docs/react19/` directory structure

The following directory tree must exist after this phase:

```
docs/react19/
  phase-01-project-scaffolding-and-branch-setup.md        (this file)
  phase-02-update-node-and-package-manager.md
  phase-03-update-react-and-react-dom.md
  phase-04-update-typescript-types.md
  phase-05-update-babel-configuration.md
  MIGRATION-STATUS.md
  KNOWN-ISSUES.md
```

### 3. Create `docs/react19/MIGRATION-STATUS.md`

This file tracks the overall migration progress. It must contain a table with the following columns:

- Phase ID
- Phase Title
- Status (Not Started / In Progress / Completed / Blocked)
- Completion Date
- Notes

Initialize all phases as "Not Started." This file is updated at the start and end of each phase.

### 4. Create `docs/react19/KNOWN-ISSUES.md`

This file records any issues discovered during migration that cannot be resolved within the current phase. Each entry must include:

- Issue ID (sequential, e.g., KI-001)
- Phase where discovered
- Description
- Severity (Blocker / High / Medium / Low)
- Workaround (if any)
- Resolution phase (estimated)

Initialize the file with a header and an empty table.

### 5. Create `.env.migration` in the project root

This file contains environment variables used as feature flags during the migration. It must NOT be committed to the final production build but IS committed to the migration branch for coordination purposes.

```env
# React 19 Migration Feature Flags
# Set to "true" to enable React 19 specific code paths during development/testing.

REACT_19_MIGRATION=false
REACT_19_NEW_JSX_TRANSFORM=false
REACT_19_STRICT_MODE=false
REACT_19_USE_TESTING_LIBRARY=false
```

### 6. Create `src/lib/migration/` utilities directory

Create the directory `src/lib/migration/` with an `index.js` that exports a `isMigrationEnabled` helper:

```
src/lib/migration/
  index.js
```

The `index.js` file should export a simple function that checks `process.env.REACT_19_MIGRATION` and returns a boolean. This will be used during the transitional period when both old and new code paths may coexist.

### 7. Add `.env.migration` to `.gitignore` considerations

Verify that `.env.migration` is NOT in `.gitignore` on the migration branch (it needs to be shared). However, add a comment in the file itself noting that it should be added to `.gitignore` before the branch is merged to master, or removed entirely once migration is complete.

### 8. Validate the branch is clean and CI-green

After all scaffolding files are created, ensure:

- `git status` shows only the newly created files
- No existing files were modified
- The existing test suite (`yarn test`) still passes without changes (run locally or confirm via CI)

---

## Files Affected

All files below are **new creations** -- no existing files are modified in this phase.

| File Path                                                            | Action  |
|----------------------------------------------------------------------|---------|
| `docs/react19/phase-01-project-scaffolding-and-branch-setup.md`     | Create  |
| `docs/react19/phase-02-update-node-and-package-manager.md`          | Create  |
| `docs/react19/phase-03-update-react-and-react-dom.md`               | Create  |
| `docs/react19/phase-04-update-typescript-types.md`                   | Create  |
| `docs/react19/phase-05-update-babel-configuration.md`                | Create  |
| `docs/react19/MIGRATION-STATUS.md`                                   | Create  |
| `docs/react19/KNOWN-ISSUES.md`                                       | Create  |
| `.env.migration`                                                      | Create  |
| `src/lib/migration/index.js`                                         | Create  |

---

## Acceptance Criteria

- [ ] Branch `react-19-migration` exists and is based on current `master` HEAD
- [ ] `docs/react19/` directory contains all 5 phase documents, `MIGRATION-STATUS.md`, and `KNOWN-ISSUES.md`
- [ ] `MIGRATION-STATUS.md` contains a table listing all 5 phases with "Not Started" status
- [ ] `KNOWN-ISSUES.md` has a header and empty table structure
- [ ] `.env.migration` exists in the project root with all 4 feature flags set to `false`
- [ ] `src/lib/migration/index.js` exists and exports `isMigrationEnabled`
- [ ] No existing source files, config files, or test files were modified
- [ ] `yarn lint` passes (new files conform to project ESLint rules)
- [ ] Existing test suite (`yarn test`) passes without any changes

---

## Rollback Strategy

This phase creates only new files and a new branch. Rollback is trivial:

1. Delete the branch: `git branch -D react-19-migration`
2. Remove any local `.env.migration` file
3. Remove the `docs/react19/` directory and `src/lib/migration/` directory

No existing functionality is altered, so there is zero risk of regression.

---

## Notes for AI Agents

1. **Do not modify any existing files.** This phase is strictly additive. If your tooling suggests changes to `package.json`, `.babelrc`, or any source file, stop and flag it as incorrect.

2. **Use the exact branch name `react-19-migration`.** Other phase documents reference this branch name. Do not use variations like `feat/react-19`, `upgrade-react-19`, etc.

3. **The `src/lib/migration/index.js` file must be minimal.** It should be no more than 10 lines. Do not add polyfills, shims, or complex logic. It is a coordination flag, not a compatibility layer.

4. **When creating markdown files,** use standard GitHub-Flavored Markdown tables. Do not use HTML tables.

5. **The `.env.migration` file is intentionally committed** to the migration branch. This is deliberate -- it allows all contributors and CI to share the same flag state. Add a comment at the top of the file explaining this.

6. **Verify your work** by running `git status` and confirming that only new untracked files appear. If any existing file shows as modified, investigate and revert before committing.

7. **Commit message format:** Use `chore(react19): phase 01 - project scaffolding and branch setup` as the commit message.
