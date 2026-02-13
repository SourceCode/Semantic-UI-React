# Phase 12: Fix act() Imports

| Field            | Value                                      |
|------------------|--------------------------------------------|
| **Phase ID**     | PHASE-12                                   |
| **Title**        | Fix act() Imports                          |
| **Stage**        | 2 - Testing Infrastructure                 |
| **Dependencies** | Phase 10 (RTL Migration)                   |
| **Complexity**   | Low                                        |
| **Scope**        | 3 test files with explicit `act()` imports + any wrapper functions |

---

## Objective

Migrate all `act()` imports from the deprecated `react-dom/test-utils` module to the new `react` top-level export, which is where `act` lives in React 19. After this phase, zero files in the codebase should import anything from `react-dom/test-utils`, as this module is completely removed in React 19.

---

## Background

### The Breaking Change

In React 18 and earlier, `act()` was exported from `react-dom/test-utils`:

```javascript
import { act } from 'react-dom/test-utils'
```

In React 19, the entire `react-dom/test-utils` module is removed. The `act()` function is now exported directly from `react`:

```javascript
import { act } from 'react'
```

This is a hard breaking change -- any file importing from `react-dom/test-utils` will fail with a module resolution error at build time under React 19.

### Current State

A search of the codebase reveals exactly **3 files** that import `act` from `react-dom/test-utils`:

| File | Line | Import Statement |
|------|------|------------------|
| `test/specs/addons/Portal/Portal-test.js` | 4 | `import { act } from 'react-dom/test-utils'` |
| `test/specs/addons/Portal/PortalInner-test.js` | 2 | `import { act } from 'react-dom/test-utils'` |
| `test/specs/lib/hooks/useClassNamesOnNode-test.js` | 2 | `import { act } from 'react-dom/test-utils'` |

There are no other imports from `react-dom/test-utils` in the codebase. There are no wrapper functions around `act()` in the test utilities.

### Codemod Available

React provides an official codemod for this exact change:

```bash
npx codemod@latest react/19/replace-act-import
```

This codemod will automatically find and replace all `react-dom/test-utils` imports with the `react` import.

---

## Detailed Tasks

### Task 1: Run the official React 19 `act()` import codemod

1.1. Execute the codemod from the repository root:

```bash
npx codemod@latest react/19/replace-act-import --target test/
```

1.2. This codemod will automatically transform:

```javascript
// BEFORE
import { act } from 'react-dom/test-utils'

// AFTER
import { act } from 'react'
```

1.3. Verify the codemod did not introduce any unintended changes by reviewing the diff.

---

### Task 2: Update `test/specs/addons/Portal/Portal-test.js`

**File:** `test/specs/addons/Portal/Portal-test.js` (line 4)

2.1. If the codemod was not used, manually change:

```javascript
// BEFORE (line 4)
import { act } from 'react-dom/test-utils'

// AFTER (line 4)
import { act } from 'react'
```

2.2. If `React` is already imported on another line, consider merging the imports:

```javascript
// If the file already has:
import React from 'react'

// Change to:
import React, { act } from 'react'

// Or keep as separate import:
import { act } from 'react'
```

2.3. Verify no other symbols are imported from `react-dom/test-utils` on the same line.

---

### Task 3: Update `test/specs/addons/Portal/PortalInner-test.js`

**File:** `test/specs/addons/Portal/PortalInner-test.js` (line 2)

3.1. Change:

```javascript
// BEFORE (line 2)
import { act } from 'react-dom/test-utils'

// AFTER (line 2)
import { act } from 'react'
```

3.2. Check if this file's `React` import can be merged with the `act` import.

---

### Task 4: Update `test/specs/lib/hooks/useClassNamesOnNode-test.js`

**File:** `test/specs/lib/hooks/useClassNamesOnNode-test.js` (line 2)

4.1. Change:

```javascript
// BEFORE (line 2)
import { act } from 'react-dom/test-utils'

// AFTER (line 2)
import { act } from 'react'
```

4.2. Check if this file's `React` import can be merged with the `act` import.

---

### Task 5: Verify no remaining `react-dom/test-utils` imports

5.1. Run a comprehensive search across the entire codebase to confirm zero remaining references:

```bash
grep -rn "react-dom/test-utils" . --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx"
```

5.2. Also search for any dynamic imports or require statements:

```bash
grep -rn "require.*react-dom/test-utils" . --include="*.js"
```

5.3. Both searches must return zero results.

---

### Task 6: Verify no wrapper functions depend on `react-dom/test-utils`

6.1. Search for any indirect usage through test utility wrappers:

```bash
grep -rn "test-utils" test/ --include="*.js"
```

6.2. Search for any re-exports from `react-dom/test-utils`:

```bash
grep -rn "from.*react-dom" test/ --include="*.js"
```

6.3. Confirm that no file in `test/utils/` imports or re-exports from `react-dom/test-utils`.

---

### Task 7: Validate `act()` behavior under React 19

7.1. Run the three affected test files individually to confirm `act()` works correctly with the new import:

```bash
# Using Vitest (after Phase 9/10 migration):
npx vitest run test/specs/addons/Portal/Portal-test.js
npx vitest run test/specs/addons/Portal/PortalInner-test.js
npx vitest run test/specs/lib/hooks/useClassNamesOnNode-test.js
```

7.2. Pay attention to any `act()` warnings. React 19 has improved `act()` warning messages and stricter enforcement. If tests produce warnings like "An update to Component inside a test was not wrapped in act(...)", those are pre-existing issues exposed by the upgrade, not regressions from this phase.

---

### Task 8: Add ESLint rule to prevent future `react-dom/test-utils` imports

8.1. Add a `no-restricted-imports` rule to the ESLint configuration to prevent any future imports from the removed module:

```javascript
// In .eslintrc or equivalent
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "react-dom/test-utils",
        "message": "react-dom/test-utils is removed in React 19. Import { act } from 'react' instead."
      }]
    }]
  }
}
```

---

## Files Affected

| File | Change |
|------|--------|
| `test/specs/addons/Portal/Portal-test.js` | Update import on line 4 |
| `test/specs/addons/Portal/PortalInner-test.js` | Update import on line 2 |
| `test/specs/lib/hooks/useClassNamesOnNode-test.js` | Update import on line 2 |
| `.eslintrc` or ESLint config file | Add `no-restricted-imports` rule |

---

## Acceptance Criteria

- [ ] `test/specs/addons/Portal/Portal-test.js` imports `act` from `'react'` instead of `'react-dom/test-utils'`
- [ ] `test/specs/addons/Portal/PortalInner-test.js` imports `act` from `'react'` instead of `'react-dom/test-utils'`
- [ ] `test/specs/lib/hooks/useClassNamesOnNode-test.js` imports `act` from `'react'` instead of `'react-dom/test-utils'`
- [ ] `grep -rn "react-dom/test-utils" . --include="*.js"` returns zero results across the entire repository
- [ ] All three affected test files pass with the updated import
- [ ] ESLint `no-restricted-imports` rule prevents future imports from `react-dom/test-utils`
- [ ] No other imports from `react-dom/test-utils` exist (including `renderIntoDocument`, `Simulate`, etc.)

---

## Rollback Strategy

1. Revert the 3 changed import lines back to `import { act } from 'react-dom/test-utils'`.
2. Remove the ESLint `no-restricted-imports` rule for `react-dom/test-utils`.
3. This is an extremely low-risk phase -- the changes are 3 single-line import path changes with no logic modifications.

---

## Notes for AI Agents

- **This is the simplest phase in the entire migration.** It consists of changing the import path in exactly 3 files. Do not overthink it.
- The official codemod (`npx codemod@latest react/19/replace-act-import`) is the fastest way to execute this. However, with only 3 files, manual changes are equally viable and perhaps more transparent.
- **Do not change any test logic.** Only the import statement path changes. The `act()` function itself has the same API in React 19 as it did in React 18.
- If merging `act` into an existing `import React from 'react'` line, be aware that named imports (`{ act }`) and default imports (`React`) can coexist: `import React, { act } from 'react'`.
- After Phase 15 removes `forwardRef`, many of the `act()` wrapping patterns in these Portal tests may become unnecessary because Portal rendering will be simpler. But that is a future concern -- this phase is only about fixing the import path.
- **Verify that `react-dom` itself is still imported where needed** (e.g., `createPortal` in Portal tests). Only the `/test-utils` sub-path is removed in React 19; `react-dom` itself is fine.
- If the Vitest migration (Phase 9) has not yet replaced Karma/Mocha, the tests may need to be validated using the existing test runner. The import path change works regardless of the test runner.
- This phase can be executed independently and in parallel with Phase 11 if needed, since it touches different files.
