# Phase 08: Update TypeScript Configuration

| Field         | Value                                          |
|---------------|------------------------------------------------|
| **Phase ID**  | PHASE-08                                       |
| **Title**     | Update TypeScript Configuration                |
| **Stage**     | 1 -- Foundation & Tooling                      |
| **Dependencies** | Phase 04 (React 19 type definitions)        |
| **Complexity** | Medium                                        |
| **Scope**     | TypeScript compiler config, type definitions, JSX namespace, type testing |

---

## Objective

Upgrade TypeScript from 4.x to 5.x+, reconfigure `tsconfig.json` for React 19's new JSX transform and module resolution semantics, migrate JSX type definitions from the global `JSX` namespace to the React module-scoped namespace, enable stricter type checking to catch regressions during the migration, and prepare the TypeScript configuration for a future source migration from JavaScript to TypeScript.

---

## Background

### Current TypeScript Configuration

**File:** `J:\code\semantic\Semantic-UI-React\tsconfig.json`
```json
{
  "compilerOptions": {
    "jsx": "react",
    "lib": ["dom", "es2015"],
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "include": [
    "src/**/*.d.ts"
  ],
  "files": [
    "test/typings.tsx"
  ]
}
```

Key observations:
- `"jsx": "react"` uses the classic JSX transform (`React.createElement`). React 19 recommends `"jsx": "react-jsx"` which uses the new automatic JSX transform (`_jsx` from `react/jsx-runtime`).
- `"module": "esnext"` is correct for modern output.
- `"moduleResolution": "node"` uses the legacy Node.js resolution algorithm. TypeScript 5 introduces `"moduleResolution": "bundler"` which better matches how Vite and Rollup resolve modules.
- `"lib": ["dom", "es2015"]` targets ES2015 -- this can be broadened to `"es2020"` or `"es2021"` for modern environments.
- `"strict": true` is already enabled, which is good.
- The `include` only covers `src/**/*.d.ts` (type declaration files), not source `.js` files.
- The `files` array points to a single test file: `test/typings.tsx`.

### Current Type Testing

**File:** `J:\code\semantic\Semantic-UI-React\test\typings.tsx`

This file contains compile-time type assertions for:
- Basic component rendering (`<Button />`, `<Button content='Foo' />`)
- Ref forwarding (`React.useRef<HTMLButtonElement>` with `<Button ref={buttonRef} />`)
- Shorthand item elements (`<Dropdown additionLabel={<i>...</i>} />`)
- Shorthand item functions (children render functions)
- Shorthand item nulls and booleans

The `tsd:test` script runs:
```
gulp build:dist:commonjs:tsd && tsc -p ./ --noEmit
```
This first copies `.d.ts` files to `dist/commonjs/`, then runs `tsc` with `--noEmit` to type-check without producing output.

### Current Type Definitions

**Package:** `@types/react` v18.0.5 (in devDependencies)

The project ships its own `index.d.ts` at the root, which declares all component prop interfaces and exports. This file uses the global `JSX` namespace pattern:
```ts
// In React 18 and earlier:
declare namespace JSX {
  interface IntrinsicElements { ... }
}
```

React 19 deprecates the global `JSX` namespace. The `JSX` namespace now lives inside the `react` module:
```ts
// React 19:
import { JSX } from 'react'
```

### TypeScript Version

**Current:** `"typescript": "^4.5.5"` (devDependency)

TypeScript 4.5 was released in November 2021. TypeScript 5.x (first released March 2023) introduces:
- `"moduleResolution": "bundler"` -- ideal for Vite/Rollup projects
- `"verbatimModuleSyntax"` -- enforces consistent import/export syntax
- Decorator metadata support
- `satisfies` operator
- Faster incremental builds
- Breaking: removed some deprecated features from 4.x

---

## Detailed Tasks

### 1. Upgrade TypeScript to 5.x+

Update `J:\code\semantic\Semantic-UI-React\package.json`:
```
"typescript": "^4.5.5"  -->  "typescript": "^5.7.0"
```

Run `yarn install` and verify `npx tsc --version` reports 5.7+.

### 2. Upgrade @types/react to React 19 types

Update `J:\code\semantic\Semantic-UI-React\package.json`:
```
"@types/react": "18.0.5"  -->  "@types/react": "^19.0.0"
```

Also add `@types/react-dom` if not already present:
```
"@types/react-dom": "^19.0.0"
```

React 19 type definitions include significant changes:
- `React.FC` no longer includes implicit `children` prop
- `useRef` requires an explicit initial value or uses `useRef<T>(null)` with `RefObject<T | null>`
- The `JSX` namespace is exported from `react` module scope instead of global scope
- `ReactNode` type is broader (includes `Promise` for async components)
- Event handler types may have minor changes

### 3. Update tsconfig.json compilerOptions

Modify `J:\code\semantic\Semantic-UI-React\tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "lib": ["dom", "dom.iterable", "es2021"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "forceConsistentCasingInFileNames": true,
    "target": "es2021",
    "baseUrl": ".",
    "paths": {
      "semantic-ui-react": ["./src/index.js"],
      "src/*": ["./src/*"],
      "test/*": ["./test/*"]
    }
  },
  "include": [
    "src/**/*.d.ts",
    "index.d.ts"
  ],
  "files": [
    "test/typings.tsx"
  ]
}
```

Changes explained:
- `"jsx": "react"` --> `"jsx": "react-jsx"`: Uses the automatic JSX transform. Components no longer need `import React from 'react'` for JSX.
- Added `"jsxImportSource": "react"`: Tells TypeScript where to find the JSX runtime. Required with `"react-jsx"`.
- `"lib": ["dom", "es2015"]` --> `"lib": ["dom", "dom.iterable", "es2021"]`: Adds `dom.iterable` for `NodeList.forEach` and similar iterable DOM APIs. Broadens ES target to ES2021 for `Promise.allSettled`, `String.replaceAll`, etc.
- `"moduleResolution": "node"` --> `"moduleResolution": "bundler"`: Matches how Vite and Rollup resolve modules. Supports `"exports"` field in package.json, conditional imports, and `.js` extension resolution for `.ts` files.
- Added `"skipLibCheck": true`: Skips type checking of declaration files in `node_modules`. Significantly speeds up type checking and avoids conflicts between different `@types` package versions.
- Added `"esModuleInterop": true`: Enables interop between CommonJS and ESM imports. Required for some dependencies.
- Added `"resolveJsonModule": true`: Allows importing JSON files (used in docs).
- Added `"isolatedModules": true`: Ensures each file can be transpiled independently, which is required by Vite/Rollup/esbuild.
- Added `"noEmit": true`: TypeScript is used only for type checking, not for producing output files. Build output is handled by Rollup/Babel.
- Added `"target": "es2021"`: Sets the ECMAScript target for emit (though `noEmit` means no files are produced, some features like `using` syntax checking depend on target).
- Added `"baseUrl"` and `"paths"`: Enables path aliases used in test files (`import Button from 'src/elements/Button/Button'`).

### 4. Migrate JSX namespace from global to module scope

React 19 deprecates the global `JSX` namespace. Any type definitions in `J:\code\semantic\Semantic-UI-React\index.d.ts` or `src/**/*.d.ts` that reference the global `JSX` namespace must be updated.

Search for patterns:
- `JSX.Element` (should become `React.JSX.Element` or `import { JSX } from 'react'`)
- `JSX.IntrinsicElements`
- `React.ReactElement` (still valid, no change needed)
- `React.ReactNode` (still valid, but now includes `Promise<ReactNode>` in React 19)

In `J:\code\semantic\Semantic-UI-React\index.d.ts`, scan for:
```ts
// Old pattern (React 18):
interface SomeProps {
  children?: React.ReactNode
  icon?: JSX.Element  // Global JSX namespace
}

// New pattern (React 19):
import { JSX } from 'react'
interface SomeProps {
  children?: React.ReactNode
  icon?: JSX.Element  // Module-scoped JSX namespace
}
```

Also check for:
- `React.FC` usage (no longer includes implicit `children` -- must add `children?: React.ReactNode` explicitly if needed)
- `React.VFC` (removed in React 19 types -- replace with `React.FC`)
- `React.SFC` (already deprecated, should not be present)

### 5. Update test/typings.tsx for React 19 type changes

Modify `J:\code\semantic\Semantic-UI-React\test\typings.tsx`:

Current imports:
```tsx
import * as React from 'react'
import { Button, Dropdown, Icon } from '../index'
```

With `"jsx": "react-jsx"`, the `import * as React from 'react'` is still valid for accessing `React.useRef` and other APIs, but JSX compilation no longer requires `React` to be in scope. No change needed here unless we want to demonstrate the new pattern:

```tsx
import { useRef } from 'react'
import { Button, Dropdown, Icon } from '../index'
```

Update `RefAssert` to account for React 19's stricter `useRef` typing:
```tsx
// React 19: useRef(null) returns RefObject<T | null>, not MutableRefObject<T | null>
export const RefAssert = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const iconRef = useRef<HTMLElement>(null)

  return (
    <>
      <Button ref={buttonRef} />
      <Icon name='history' ref={iconRef} />
    </>
  )
}
```

Verify that all shorthand prop type assertions still compile. The `children` render function pattern:
```tsx
icon={{
  children: (Component, props) => (
    <div className='bar'>
      <Component name={props.name} />
    </div>
  ),
}}
```
must still type-check correctly with React 19 types.

### 6. Add additional type test cases for React 19 features

Expand `J:\code\semantic\Semantic-UI-React\test\typings.tsx` with new test cases:

```tsx
// Test: ref cleanup function (React 19 feature)
export const RefCleanupAssert = () => {
  const buttonRef = (node: HTMLButtonElement | null) => {
    if (node) {
      // setup
    }
    return () => {
      // cleanup - new in React 19
    }
  }
  return <Button ref={buttonRef} />
}

// Test: forwardRef return type compatibility
export const ForwardRefAssert = () => {
  // Components using forwardRef should accept ref prop directly in React 19
  const ref = useRef<HTMLButtonElement>(null)
  return <Button ref={ref} />
}
```

### 7. Update tsd:test script

Current in `J:\code\semantic\Semantic-UI-React\package.json`:
```json
"tsd:test": "gulp build:dist:commonjs:tsd && tsc -p ./ --noEmit"
```

The `gulp build:dist:commonjs:tsd` step copies `src/**/*.d.ts` to `dist/commonjs/`. After Phase 06 (bundler migration), this step is handled by Rollup. Update:

```json
"tsd:test": "tsc -p ./ --noEmit"
```

If Phase 06 is not yet complete, create a temporary script:
```json
"tsd:test": "npx copyfiles -u 1 'src/**/*.d.ts' dist/commonjs && tsc -p ./ --noEmit"
```

### 8. Create tsconfig for future JS-to-TS source migration

Create `J:\code\semantic\Semantic-UI-React\tsconfig.src.json` as a project reference for when source files are migrated from `.js` to `.ts`/`.tsx`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "declaration": true,
    "declarationDir": "dist/types",
    "outDir": "dist/es",
    "rootDir": "src"
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx"
  ],
  "exclude": [
    "src/**/*.d.ts"
  ]
}
```

This config:
- Extends the base `tsconfig.json`
- Enables `allowJs` so TypeScript can process the existing `.js` files alongside any new `.ts` files during gradual migration
- Sets `checkJs: false` to avoid blocking on type errors in unconverted JS files
- Configures `declarationDir` for auto-generated `.d.ts` output (future replacement for hand-written `index.d.ts`)

This file is not used by any scripts yet -- it is infrastructure for a future phase.

### 9. Audit all .d.ts files in src/ for React 19 compatibility

Scan all type declaration files in `J:\code\semantic\Semantic-UI-React\src\`:

Files to check (all `src/**/*.d.ts` files referenced by `tsconfig.json`'s `include`):
- Every component directory likely has a `.d.ts` file declaring its props interface
- The root `J:\code\semantic\Semantic-UI-React\index.d.ts` re-exports all component types

For each `.d.ts` file, verify:
1. No references to global `JSX` namespace without import
2. No use of removed React types (`React.VFC`, `React.SFC`, `React.StatelessComponent`)
3. `ref` prop types are compatible with React 19's `Ref<T | null>` (instead of `Ref<T>`)
4. `children` prop is explicitly declared where needed (not relying on `React.FC` implicit children)
5. Event handler types match React 19 definitions

### 10. Verify tsconfig path aliases work with test infrastructure

The current test files use import aliases like:
```js
import Button from 'src/elements/Button/Button'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
```

These aliases are currently resolved by Webpack (`webpack.karma.config.js` sets `resolve.modules: [paths.base(), 'node_modules']`). The `tsconfig.json` `paths` field (added in Task 3) must mirror these aliases so TypeScript understands them:

```json
"paths": {
  "src/*": ["./src/*"],
  "test/*": ["./test/*"]
}
```

This does not affect runtime resolution (which is handled by the bundler), but it enables TypeScript to find the correct type definitions when checking test files.

---

## Files Affected

| File | Action |
|------|--------|
| `tsconfig.json` | MODIFY (major changes to compilerOptions) |
| `test/typings.tsx` | MODIFY (update for React 19 types, add new test cases) |
| `index.d.ts` | MODIFY (JSX namespace migration, React 19 type updates) |
| `src/**/*.d.ts` (all declaration files) | MODIFY (audit and update for React 19) |
| `package.json` | MODIFY (upgrade typescript, @types/react) |
| `tsconfig.src.json` | CREATE (future JS-to-TS migration config) |

**Total: ~5+ files modified (exact count depends on number of .d.ts files), 1 file created**

---

## Acceptance Criteria

- [ ] TypeScript version is 5.7+ (`npx tsc --version`)
- [ ] `@types/react` is at v19.x in devDependencies
- [ ] `tsconfig.json` uses `"jsx": "react-jsx"` with `"jsxImportSource": "react"`
- [ ] `tsconfig.json` uses `"moduleResolution": "bundler"`
- [ ] `npm run tsd:test` (or equivalent) passes with zero type errors
- [ ] `test/typings.tsx` compiles successfully with all existing assertions plus new React 19 assertions
- [ ] No references to the global `JSX` namespace exist in any `.d.ts` file (all use `React.JSX` or import from `react`)
- [ ] No references to removed React types (`React.VFC`, `React.SFC`) exist in any `.d.ts` file
- [ ] All `ref` prop types in `.d.ts` files are compatible with React 19's `Ref<T | null>`
- [ ] `tsconfig.src.json` exists and validates without errors (even if not used by any script yet)
- [ ] Path aliases (`src/*`, `test/*`) are configured in `tsconfig.json` `paths`
- [ ] `"strict": true` remains enabled
- [ ] No TypeScript deprecation warnings appear during compilation

---

## Rollback Strategy

1. TypeScript configuration changes are entirely in `tsconfig.json` and `package.json`. No source code is modified except `test/typings.tsx` and `.d.ts` files.
2. To rollback: `git checkout HEAD -- tsconfig.json test/typings.tsx index.d.ts package.json`
3. Delete `tsconfig.src.json` if created.
4. Run `yarn install` to restore TypeScript 4.x.
5. Verify with `yarn tsd:test`.

---

## Notes for AI Agents

1. **The `index.d.ts` file at the project root is the primary type definition file shipped to consumers.** Changes to this file directly affect every TypeScript user of `semantic-ui-react`. Be extremely careful with type changes -- every modification must be backward compatible or clearly documented as a breaking change in v3.0.0.

2. **The `"jsx": "react-jsx"` change does NOT require modifying any `.js` source files.** The JSX transform mode is a compiler/transpiler concern. Babel (which handles the actual compilation) already supports the automatic JSX transform via `@babel/preset-react` with `{ runtime: 'automatic' }`. The `tsconfig.json` change only affects type checking, not code output.

3. **`"moduleResolution": "bundler"` may surface new type errors** that were previously hidden by `"node"` resolution. Specifically, it requires that imports include file extensions for relative imports if `"allowImportingTsExtensions"` is not set. Since the project uses `.js` source files (not `.ts`), this should not be an issue, but verify.

4. **The `@types/react` v19 package may have breaking changes** in generic type parameters. For example, `React.useRef<HTMLElement>(null)` in v19 returns `RefObject<HTMLElement | null>` instead of `MutableRefObject<HTMLElement | null>`. This affects whether `ref.current` can be assigned to. Check all `.d.ts` files that declare `ref` props.

5. **Do not enable `"verbatimModuleSyntax"` yet.** This option requires all imports to use the `import type` syntax for type-only imports, which would require modifying `test/typings.tsx` and potentially all `.d.ts` files. Defer this to a future cleanup phase.

6. **The `tsconfig.src.json` (Task 8) is purely preparatory.** Do not modify any build scripts to use it. It exists so that a future "migrate source to TypeScript" phase has a ready-made configuration. Verify it does not interfere with the main `tsconfig.json` by ensuring it is not referenced in `package.json` scripts or by any tool.

7. **The `"skipLibCheck": true` option** is added to avoid type errors in third-party declaration files in `node_modules`. Some packages may ship `.d.ts` files that conflict with `@types/react` v19. This is a standard recommendation for React 19 migrations.

8. **When auditing `.d.ts` files (Task 9)**, use the following search patterns to find problematic code:
   - `JSX.Element` without a preceding `import` of JSX from react
   - `React.FC<` (check if children are explicitly typed)
   - `React.VFC<` (must be replaced with `React.FC<`)
   - `React.SFC<` (must be replaced with `React.FC<`)
   - `Ref<HTMLElement>` (should become `Ref<HTMLElement | null>` or use `RefObject`)
   - `MutableRefObject` (review usage -- may need to change to `RefObject`)

9. **The `"lib"` upgrade from `es2015` to `es2021`** is safe because the library's published output is transpiled by Babel to the configured target. The `lib` setting only affects which built-in types TypeScript knows about during type checking, not what code is emitted.

10. **If `tsc` reports errors in `node_modules`** after the upgrade, confirm that `"skipLibCheck": true` is set. If errors persist in the project's own code, they are genuine type errors that must be fixed.

---

## Strict Zero-Any TypeScript Configuration

> **Cross-reference:** This section implements requirements from `ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md`, which applies to ALL 50 phases and supersedes any conflicting guidance in this or any other phase document.

### Complete tsconfig.json with All Strict Options

The following is the canonical `tsconfig.json` that must be established in Phase 08 and must never be weakened in any subsequent phase:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "lib": ["dom", "dom.iterable", "es2021"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2021",

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,

    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noEmit": true,

    "baseUrl": ".",
    "paths": {
      "semantic-ui-react": ["./src/index.js"],
      "src/*": ["./src/*"],
      "test/*": ["./test/*"]
    }
  },
  "include": [
    "src/**/*.d.ts",
    "index.d.ts"
  ],
  "files": [
    "test/typings.tsx"
  ]
}
```

### Flag-by-Flag Explanation

#### Strict Family (enabled by `"strict": true`, listed explicitly for visibility)

| Flag | Effect |
|------|--------|
| `noImplicitAny` | Error when the compiler would infer `any` for a variable, parameter, or return type. Without this flag, unannotated function parameters silently become `any`, defeating the purpose of TypeScript. |
| `strictNullChecks` | Makes `null` and `undefined` their own types. A variable of type `string` cannot be `null` unless the type explicitly says `string \| null`. This prevents the single most common class of runtime errors. |
| `strictFunctionTypes` | Enables contravariant checking of function parameter types. Without this, `(animal: Animal) => void` is assignable to `(dog: Dog) => void`, which is unsound. |
| `strictBindCallApply` | Types the return values of `.bind()`, `.call()`, and `.apply()` correctly instead of returning `any`. |
| `strictPropertyInitialization` | Requires class properties to be initialized in the constructor or declared as optional. Mostly relevant during Phase 16 (class component conversion), but prevents bugs in any remaining class-based code. |
| `noImplicitThis` | Errors when `this` has an implicit `any` type. Prevents bugs in event handlers and standalone functions that reference `this`. |
| `alwaysStrict` | Emits `"use strict"` in every output file. Defense in depth. |

#### Additional Strictness Flags (beyond `"strict": true`)

| Flag | Effect |
|------|--------|
| `noUncheckedIndexedAccess` | When accessing a value via index signature (e.g., `obj[key]`), TypeScript adds `\| undefined` to the result type. This forces explicit null checks after bracket access, preventing the very common "accessed property is undefined" crash. |
| `noImplicitReturns` | Every code path in a function must explicitly return a value. Prevents accidental `undefined` returns from functions that should return a value. |
| `noFallthroughCasesInSwitch` | Requires `break`, `return`, or `throw` at the end of each `switch` case. Prevents the classic fallthrough bug. |
| `noUnusedLocals` | Errors on declared but unused local variables. Keeps the codebase clean. Use `_` prefix for intentionally unused variables (e.g., `_event`). |
| `noUnusedParameters` | Errors on declared but unused function parameters. Same convention: prefix unused params with `_`. |
| `exactOptionalPropertyTypes` | With this flag, `{ x?: string }` means the property is either absent or has type `string`. Without this flag, it also allows `undefined` to be explicitly assigned. This stricter behavior catches bugs where `undefined` is passed where omission was intended. |
| `noPropertyAccessFromIndexSignature` | Forces bracket notation for properties defined via index signatures. If an interface has `[key: string]: number`, you must use `obj["foo"]` not `obj.foo`. This makes it visually clear when you are accessing a potentially undefined key. |

#### Module and Interop Flags

| Flag | Effect |
|------|--------|
| `verbatimModuleSyntax` | Enforces that `import type` is used for type-only imports and `export type` for type-only exports. This ensures bundlers can correctly tree-shake type imports. Replaces the older `importsNotUsedAsValues` and `preserveValueImports` flags. |
| `isolatedModules` | Ensures each file can be independently transpiled (required by Vite, Rollup, esbuild, and SWC). Prevents patterns that require whole-program analysis, such as `const enum` across files. |
| `forceConsistentCasingInFileNames` | Import paths must match the actual filename casing on disk. Prevents bugs that only manifest on case-sensitive file systems (Linux) but not on case-insensitive ones (macOS, Windows). |

### Banned Patterns Enforced by the Compiler

The combination of these flags makes the following patterns compiler errors (not just ESLint warnings):

```typescript
// ERROR: noImplicitAny -- parameter 'x' implicitly has 'any' type
function double(x) { return x * 2 }
//              ^ must be: function double(x: number): number

// ERROR: strictNullChecks -- 'undefined' is not assignable to 'string'
const name: string = undefined
//                   ^ must be: const name: string | null = null

// ERROR: noUncheckedIndexedAccess -- 'string | undefined' not assignable to 'string'
const map: Record<string, string> = { a: 'hello' }
const value: string = map['b']
//                    ^ must be: const value: string | undefined = map['b']

// ERROR: noImplicitReturns -- not all code paths return a value
function getName(id: number): string {
  if (id === 1) return 'Alice'
  // ^ missing return for other cases
}

// ERROR: exactOptionalPropertyTypes
interface Props { color?: 'red' | 'blue' }
const p: Props = { color: undefined }
//                 ^ ERROR: undefined is not 'red' | 'blue'
// CORRECT: const p: Props = {}  (omit the property entirely)

// ERROR: noPropertyAccessFromIndexSignature
interface Config { [key: string]: string }
const c: Config = { theme: 'dark' }
c.theme  // ERROR: must use c["theme"]

// ERROR: verbatimModuleSyntax
import { ButtonProps } from './Button'  // ERROR if ButtonProps is only used as a type
// CORRECT: import type { ButtonProps } from './Button'
```

### `noUncheckedIndexedAccess` -- Special Guidance

This flag has the highest impact on existing code patterns. When enabled, any bracket-access on a `Record`, `Map`, array, or object with index signatures returns `T | undefined` instead of `T`. This means:

```typescript
const colors: Record<string, string> = { red: '#ff0000' }

// Without noUncheckedIndexedAccess:
const hex: string = colors['red']  // OK (but crashes if key missing)

// With noUncheckedIndexedAccess:
const hex: string = colors['red']  // ERROR: string | undefined not assignable to string

// CORRECT patterns:
const hex = colors['red']  // type is string | undefined
if (hex !== undefined) {
  // hex is narrowed to string here
  console.log(hex.toUpperCase())
}

// Or use nullish coalescing:
const hex = colors['red'] ?? '#000000'  // type is string
```

Every component that does dynamic property lookups (size maps, color maps, etc.) must be updated to handle the `| undefined` case.

### `verbatimModuleSyntax` -- Import Syntax Requirements

With this flag enabled, all imports that are used only as types must use the `import type` syntax:

```typescript
// CORRECT:
import type { ButtonProps } from './Button'
import type { SemanticCOLOR } from '../../generic'
import { forwardRef, useCallback } from 'react'

// ERROR (ButtonProps is type-only but not imported as type):
import { ButtonProps } from './Button'
import { forwardRef, useCallback } from 'react'

// CORRECT (mixed import -- values and types from same module):
import { forwardRef, useCallback } from 'react'
import type { ReactNode, RefObject } from 'react'
```

This requirement aligns with the `@typescript-eslint/consistent-type-imports` ESLint rule configured in Phase 07.

### tsconfig.src.json Update

The `tsconfig.src.json` created in Task 8 of this phase must also inherit all strict flags. Update it to:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "declaration": true,
    "declarationDir": "dist/types",
    "outDir": "dist/es",
    "rootDir": "src",
    "noEmit": false
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx"
  ],
  "exclude": [
    "src/**/*.d.ts"
  ]
}
```

Because it extends `tsconfig.json`, all strict flags are inherited automatically. The `checkJs: false` is the only relaxation, and it applies only to unconverted `.js` files during the transition period. Once Phase 14 completes the JavaScript-to-TypeScript conversion, `checkJs: false` and `allowJs: true` must be removed.

### Updated Acceptance Criteria (Addendum)

In addition to the existing acceptance criteria for Phase 08, the following must also pass:

- [ ] `noUncheckedIndexedAccess` is `true` in `tsconfig.json`
- [ ] `exactOptionalPropertyTypes` is `true` in `tsconfig.json`
- [ ] `noPropertyAccessFromIndexSignature` is `true` in `tsconfig.json`
- [ ] `verbatimModuleSyntax` is `true` in `tsconfig.json`
- [ ] `noUnusedLocals` is `true` in `tsconfig.json`
- [ ] `noUnusedParameters` is `true` in `tsconfig.json`
- [ ] `tsc --noEmit` passes with all strict flags enabled and zero errors
- [ ] All type-only imports in `test/typings.tsx` use `import type` syntax
- [ ] No `@ts-ignore` or `@ts-expect-error` comments exist in any file
- [ ] The `tsconfig.src.json` inherits all strict flags from `tsconfig.json`
