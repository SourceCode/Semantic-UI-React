# Phase 04: Update @types/react and @types/react-dom

| Field               | Value                                                              |
|---------------------|--------------------------------------------------------------------|
| **Phase ID**        | PHASE-04                                                           |
| **Title**           | Update @types/react and @types/react-dom                           |
| **Stage**           | Stage 1 -- Core Dependency Upgrade                                 |
| **Dependencies**    | PHASE-03 (React 19.2 must be installed and library must compile)   |
| **Complexity**      | High                                                               |
| **Estimated Scope** | 213 `.d.ts` files, `generic.d.ts`, `index.d.ts`, `tsconfig.json`  |

---

## Objective

Install `@types/react@19` and `@types/react-dom@19`, run the official `types-react-codemod` to automatically fix known type incompatibilities, then manually resolve all remaining TypeScript errors across the 213 declaration files and the root `index.d.ts` and `generic.d.ts` files.

---

## Background

The current TypeScript configuration:

**`tsconfig.json` (`J:\code\semantic\Semantic-UI-React\tsconfig.json`):**
```json
{
  "compilerOptions": {
    "jsx": "react",
    "lib": ["dom", "es2015"],
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "include": ["src/**/*.d.ts"],
  "files": ["test/typings.tsx"]
}
```

**Current `@types/react` version** (pinned in devDependencies, `package.json` line 95):
```json
"@types/react": "18.0.5"
```

Note: `@types/react-dom` is NOT currently listed in `package.json` devDependencies, meaning it is either a transitive dependency or not explicitly declared.

**`src/generic.d.ts`** defines shared types used across all component `.d.ts` files, including:
- `ForwardRefComponent<P, T>` (line 7) -- uses `React.ForwardRefExoticComponent` and `React.RefAttributes`
- `SemanticShorthandItemFunc` (line 68) -- uses `React.ReactNodeArray` (deprecated in React 19 types)
- `ShorthandRenderFunction` (line 74) -- uses `React.ElementType` and `React.ReactNode`
- Various interfaces using `React.ReactNode` for children props

**React 19 type changes** (from `@types/react@19`):

1. **Removed types:** `ReactText`, `ReactChild`, `ReactFragment` (as a type, not the component), `ReactNodeArray` are removed. Use `React.ReactNode` or specific union types instead.
2. **`useRef` requires an argument:** `useRef()` without arguments is a type error. Must use `useRef(null)` or `useRef<T>(undefined)`.
3. **Ref callback cleanup functions:** Ref callbacks can now return a cleanup function. The return type changes from `void` to `void | (() => void)`.
4. **`ReactElement` props type:** `ReactElement<any>` changes -- the default generic parameter for props changes from `any` to `unknown`.
5. **JSX namespace:** The global `JSX` namespace is removed. Must use `React.JSX` instead, or configure `jsxImportSource` in tsconfig.
6. **`React.FC` no longer includes `children`:** `React.FC<Props>` no longer implicitly includes a `children` prop. This does not directly affect this project (which does not use `React.FC`), but may affect transitive types.
7. **`this` type in class components:** Deprecated patterns around class component typing.

---

## Detailed Tasks

### 1. Install `@types/react@19` and `@types/react-dom@19`

```bash
yarn add -D @types/react@^19.0.0 @types/react-dom@^19.0.0
```

This replaces the pinned `@types/react: "18.0.5"` in devDependencies.

**File:** `J:\code\semantic\Semantic-UI-React\package.json`

### 2. Run the official `types-react-codemod`

The React team provides an automated codemod for type migrations:

```bash
npx types-react-codemod@latest preset-19 ./src
npx types-react-codemod@latest preset-19 ./index.d.ts
npx types-react-codemod@latest preset-19 ./test
```

This codemod handles:
- Replacing `ReactNodeArray` with `ReadonlyArray<React.ReactNode>`
- Replacing `ReactText` with `string | number`
- Replacing `ReactChild` with `React.ReactElement | string | number`
- Updating `useRef()` calls to `useRef(null)`
- Updating ref callback return types

Run it against all three directories (src, root declarations, test files) and review the changes.

### 3. Fix `ReactNodeArray` usage in `generic.d.ts`

The file `src/generic.d.ts` at line 71 uses `React.ReactNodeArray`:

```typescript
// Line 68-72 (current):
export type SemanticShorthandItemFunc<TProps> = (
  component: React.ElementType<TProps>,
  props: TProps,
  children?: React.ReactNode | React.ReactNodeArray,
) => React.ReactElement<any> | null
```

`React.ReactNodeArray` is removed in `@types/react@19`. Replace with:

```typescript
export type SemanticShorthandItemFunc<TProps> = (
  component: React.ElementType<TProps>,
  props: TProps,
  children?: React.ReactNode | ReadonlyArray<React.ReactNode>,
) => React.ReactElement | null
```

Note: `React.ReactNode` already includes arrays in React 19 types, so `React.ReactNode | ReadonlyArray<React.ReactNode>` is technically redundant. However, since this type is marked `@deprecated` and will be removed in v3, the safest approach is to simply replace `ReactNodeArray` and leave the rest unchanged.

Also note the change from `React.ReactElement<any>` to `React.ReactElement` -- in React 19 types, the default generic is `unknown`, so omitting the generic parameter is preferred over `any`.

**File:** `J:\code\semantic\Semantic-UI-React\src\generic.d.ts`

### 4. Audit all `.d.ts` files for removed types

Run a grep across all 213 `.d.ts` files for types that are removed in React 19:

```bash
grep -rn "ReactText\|ReactChild\|ReactNodeArray\|ReactFragment" src/**/*.d.ts
grep -rn "ReactText\|ReactChild\|ReactNodeArray\|ReactFragment" index.d.ts
```

For each occurrence:
- `ReactText` -> `string | number`
- `ReactChild` -> `React.ReactElement | string | number`
- `ReactNodeArray` -> `ReadonlyArray<React.ReactNode>`
- `ReactFragment` (as a type) -> `Iterable<React.ReactNode>`

The codemod in Task 2 should catch most of these, but verify manually.

### 5. Fix `useRef` type changes

The project has 16 files that use `useRef`:

```
src/modules/Transition/TransitionGroup.js
src/modules/Sticky/Sticky.js
src/modules/Sidebar/Sidebar.js
src/modules/Popup/Popup.js
src/modules/Modal/Modal.js
src/modules/Modal/ModalDimmer.js
src/modules/Dimmer/DimmerInner.js
src/modules/Checkbox/Checkbox.js
src/lib/hooks/useAutoControlledValue.js
src/lib/hooks/useClassNamesOnNode.js
src/lib/hooks/useEventCallback.js
src/lib/hooks/usePrevious.js
src/elements/Button/Button.js
src/addons/TransitionablePortal/TransitionablePortal.js
src/addons/TextArea/TextArea.js
src/addons/Portal/Portal.js
```

These are `.js` files, not `.ts` files, so the TypeScript compiler does not directly check them. However, if any corresponding `.d.ts` files declare `useRef`-based types, or if the `test/typings.tsx` file tests `useRef` patterns, those must be updated.

In React 19 types:
- `useRef<T>()` (no argument) is a type error. Must be `useRef<T>(null)` or `useRef<T | null>(null)`.
- `useRef(undefined)` returns `MutableRefObject<T | undefined>`.

Search for `useRef` patterns in `.d.ts` and `.tsx` files:

```bash
grep -rn "useRef" src/**/*.d.ts test/typings.tsx
```

**Files:** Various `.d.ts` files and `test/typings.tsx`

### 6. Update ref callback return types in `.d.ts` files

React 19 allows ref callbacks to return cleanup functions. The type signature changes:

```typescript
// React 18:
ref?: React.Ref<T>  // where Ref<T> = RefCallback<T> | RefObject<T> | null

// React 19:
ref?: React.Ref<T>  // RefCallback<T> now returns void | (() => void)
```

This is a type-level change in `@types/react` itself and should not require changes in the consumer `.d.ts` files unless they explicitly type ref callbacks with `(instance: T) => void`.

Search for explicit ref callback types:

```bash
grep -rn "(instance.*) => void" src/**/*.d.ts
grep -rn "RefCallback" src/**/*.d.ts
```

### 7. Update the global JSX namespace

React 19 removes the global `JSX` namespace. If any `.d.ts` file references `JSX.Element`, `JSX.IntrinsicElements`, etc., they must be updated to `React.JSX.Element`, etc.

Search for bare `JSX` namespace usage:

```bash
grep -rn "\bJSX\." src/**/*.d.ts index.d.ts
```

If found, replace `JSX.Element` with `React.JSX.Element`.

Additionally, update `tsconfig.json` to ensure JSX types resolve correctly:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

Note: Changing `"jsx": "react"` to `"jsx": "react-jsx"` aligns with the new JSX transform. However, this also depends on Phase 05 (Babel configuration). If Phase 05 is not yet complete, keep `"jsx": "react"` and use `"jsx": "react-jsx"` only after the Babel transform is updated.

For this phase, if the codebase does not use bare `JSX.` references, the tsconfig change can be deferred.

**File:** `J:\code\semantic\Semantic-UI-React\tsconfig.json`

### 8. Fix `ReactElement` props type changes

In `@types/react@19`, `ReactElement` without a generic parameter has `props: unknown` instead of `props: any`. This means code that accesses `.props.something` on an untyped `ReactElement` will error.

Search for `ReactElement<any>` patterns:

```bash
grep -rn "ReactElement<any>" src/**/*.d.ts index.d.ts
grep -rn "ReactElement<" src/**/*.d.ts index.d.ts
```

The `generic.d.ts` file has `React.ReactElement<any>` on line 72. Replace with `React.ReactElement` (which defaults to `unknown` in React 19) or keep `React.ReactElement<any>` if the consuming code needs loose typing.

Recommendation: Since the `SemanticShorthandItemFunc` type is already deprecated, keep `React.ReactElement<any>` for backward compatibility within this deprecated type, and use `React.ReactElement` (without `any`) in all non-deprecated types.

**File:** `J:\code\semantic\Semantic-UI-React\src\generic.d.ts`

### 9. Update the `ForwardRefComponent` utility type

The `ForwardRefComponent` type in `generic.d.ts` line 7:

```typescript
export type ForwardRefComponent<P, T> = React.ForwardRefExoticComponent<P & React.RefAttributes<T>>
```

This type remains valid in React 19 (`ForwardRefExoticComponent` and `RefAttributes` still exist). However, since React 19 makes `forwardRef` optional, consider adding a note or an alternative type:

```typescript
/**
 * Type for components created with React.forwardRef.
 * Note: In React 19+, forwardRef is no longer required. Components can accept
 * ref as a regular prop. This type is retained for backward compatibility.
 */
export type ForwardRefComponent<P, T> = React.ForwardRefExoticComponent<P & React.RefAttributes<T>>
```

No functional change is needed -- only a documentation update.

**File:** `J:\code\semantic\Semantic-UI-React\src\generic.d.ts`

### 10. Run the full TypeScript check

After all changes:

```bash
yarn tsd:test
```

This runs:
1. `gulp build:dist:commonjs:tsd` -- copies `.d.ts` files to `dist/commonjs/`
2. `tsc -p ./ --noEmit` -- type-checks `src/**/*.d.ts` and `test/typings.tsx`

Fix any remaining errors iteratively. Common patterns:
- Property access on `unknown` (from `ReactElement` default change)
- Missing generic arguments
- `children` not in props type (if any type used `React.FC`)

### 11. Verify `index.d.ts` root exports

The root `index.d.ts` file (757 lines) re-exports all component types from `./dist/commonjs/`. After the `.d.ts` files are updated and copied to `dist/commonjs/`, verify that:

```bash
yarn tsd:test
```

passes without errors, which confirms all exports resolve correctly.

**File:** `J:\code\semantic\Semantic-UI-React\index.d.ts`

---

## Files Affected

| File Path                                        | Action   | Notes                               |
|--------------------------------------------------|----------|--------------------------------------|
| `package.json`                                   | Modify   | Update `@types/react`, add `@types/react-dom` |
| `yarn.lock`                                      | Regenerate | New type packages                   |
| `src/generic.d.ts`                               | Modify   | Fix `ReactNodeArray`, update `ForwardRefComponent` docs |
| `src/**/*.d.ts` (213 files)                      | Modify   | Codemod + manual fixes for removed types |
| `index.d.ts`                                     | Verify   | Likely no changes needed             |
| `tsconfig.json`                                  | Possibly modify | `jsx` mode if Phase 05 is done  |
| `test/typings.tsx`                               | Modify   | Fix type errors in test typings      |
| `docs/react19/MIGRATION-STATUS.md`               | Update   |                                      |
| `docs/react19/KNOWN-ISSUES.md`                   | Update   |                                      |

### Detailed `.d.ts` file inventory by directory

The 213 `.d.ts` files are distributed as follows:

| Directory                      | Count | Key Types Used                       |
|--------------------------------|-------|--------------------------------------|
| `src/addons/`                  | ~12   | `React.ReactNode`, `React.Ref`       |
| `src/collections/`            | ~38   | `React.ReactNode`, `ForwardRefComponent` |
| `src/elements/`               | ~50   | `React.ReactNode`, `React.ElementType` |
| `src/modules/`                | ~52   | `React.ReactNode`, `React.Ref`, `React.ElementType` |
| `src/views/`                  | ~48   | `React.ReactNode`, `SemanticShorthandItem` |
| `src/lib/`                    | ~5    | `React.ReactNode`, custom prop types |
| `src/generic.d.ts`            | 1     | Core shared types                    |

---

## Acceptance Criteria

- [ ] `@types/react@19.x.x` is installed (verify with `yarn info @types/react version`)
- [ ] `@types/react-dom@19.x.x` is installed
- [ ] `types-react-codemod preset-19` has been run against `src/`, `index.d.ts`, and `test/`
- [ ] Zero occurrences of `ReactNodeArray` remain in any `.d.ts` file
- [ ] Zero occurrences of `ReactText` remain in any `.d.ts` file
- [ ] Zero occurrences of `ReactChild` remain in any `.d.ts` file
- [ ] `ForwardRefComponent` type in `generic.d.ts` is valid with `@types/react@19`
- [ ] `yarn tsd:test` passes with zero errors
- [ ] `tsc -p ./ --noEmit` produces no errors
- [ ] No type regressions -- all previously valid consumer type patterns still compile
- [ ] `MIGRATION-STATUS.md` updated: PHASE-04 status set to "Completed"

---

## Rollback Strategy

1. **Revert `@types/react` to the pinned v18 version:**
   ```bash
   yarn add -D @types/react@18.0.5
   ```

2. **Revert all `.d.ts` file changes:**
   ```bash
   git checkout HEAD~1 -- src/**/*.d.ts src/generic.d.ts index.d.ts test/typings.tsx
   ```

3. **Revert `tsconfig.json`** if modified:
   ```bash
   git checkout HEAD~1 -- tsconfig.json
   ```

4. **Reinstall and verify:**
   ```bash
   yarn install
   yarn tsd:test
   ```

### Risk assessment

The primary risk is that the `types-react-codemod` introduces incorrect changes that pass type-checking but alter the public API surface. To mitigate:
- Review every codemod change manually before committing
- Run `yarn tsd:test` after each batch of changes, not just at the end
- Verify that the `test/typings.tsx` file (which tests consumer-facing types) still compiles correctly

---

## Notes for AI Agents

1. **Run the codemod before making manual edits.** The `types-react-codemod` is idempotent and handles the majority of mechanical changes. Running it first prevents conflicts with manual edits.

2. **The codemod may not find all issues.** It operates on AST patterns and may miss types hidden behind `type` aliases or complex generics. After the codemod, do a manual grep for all deprecated type names.

3. **Do not change the runtime behavior of any component.** This phase is purely about TypeScript declaration files (`.d.ts`). No `.js` source files should be modified unless there is a type-related comment or JSDoc annotation that needs updating.

4. **The `@types/react` version was hard-pinned to `18.0.5`** (not a range like `^18.0.5`). This was intentional by the maintainers to avoid unexpected type changes. When installing v19, use a caret range (`^19.0.0`) unless a specific pin is needed.

5. **If `ReactNodeArray` is used in places where the codemod cannot reach** (e.g., inside string templates or comments), clean those up manually.

6. **The `tsconfig.json` has `"strict": true`**, which enables `strictNullChecks`, `noImplicitAny`, and other strict flags. This means type errors are more likely to surface. Do not weaken the tsconfig to make errors go away.

7. **Watch for `React.ReactNode` changes.** In React 19 types, `ReactNode` may include `Iterable<ReactNode>` in addition to the previous union members. This broadening should not cause issues in declaration files (it is additive), but verify that no type narrowing logic breaks.

8. **Commit message format:** Use `chore(react19): phase 04 - update @types/react and @types/react-dom to v19` as the commit message.

9. **If `test/typings.tsx` has hundreds of errors,** prioritize fixing them in batches by component category (addons, collections, elements, modules, views). Do not attempt to fix all errors in a single pass.

10. **The `src/generic.d.ts` file is the most critical file in this phase.** It defines types used by every other `.d.ts` file in the project. Validate changes to `generic.d.ts` first, then proceed to the per-component `.d.ts` files. If `generic.d.ts` has errors, everything downstream will fail.
