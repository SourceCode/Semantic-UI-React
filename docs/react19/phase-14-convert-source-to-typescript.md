# Phase 14: Convert Source from JavaScript to TypeScript

| Field            | Value                                      |
|------------------|--------------------------------------------|
| **Phase ID**     | PHASE-14                                   |
| **Title**        | Convert Source from JavaScript to TypeScript |
| **Stage**        | 3 - Core Library Modernization             |
| **Dependencies** | Phase 13 (Remove PropTypes)                |
| **Complexity**   | High                                       |
| **Scope**        | 257 `.js` source files renamed to `.ts`/`.tsx`, 213 `.d.ts` files merged into source, build pipeline reconfigured |

---

## Objective

Convert the entire Semantic UI React source codebase from JavaScript to TypeScript. This involves renaming all `.js` files to `.ts` or `.tsx`, merging the existing 213 `.d.ts` type definition files directly into the source files as inline type annotations, configuring the TypeScript compiler for source compilation, and updating the build pipeline to emit both CommonJS and ES module outputs from TypeScript source. After this phase, the library has a single source of truth for both implementation and types.

---

## Background

### Current State

The codebase currently maintains types in two separate layers:

1. **Source files** (`src/**/*.js`, 257 files): JavaScript with no type annotations. Prop validation was handled by PropTypes (removed in Phase 13).
2. **Type definitions** (`src/**/*.d.ts`, 213 files): Manually maintained TypeScript declaration files that define the public API types. These are consumed by TypeScript users via the `"types"` field in `package.json` pointing to `index.d.ts`.

This dual-maintenance model has known issues:
- Types can drift from implementation
- No compile-time type checking of the implementation
- JSDoc comments may exist in one place but not the other
- Refactoring requires changes in two places

### Target State

After this phase:
- All source files are `.ts` or `.tsx`
- Types are inline with the implementation
- A single `tsc` compilation produces both JavaScript output and `.d.ts` declarations
- The build pipeline emits CommonJS (`dist/commonjs/`), ES modules (`dist/es/`), and UMD (`dist/umd/`) from TypeScript source
- Separate `.d.ts` files no longer exist in `src/`

### File Type Decision

| Current Extension | Contains JSX? | New Extension |
|-------------------|---------------|---------------|
| `.js` with JSX (React components) | Yes | `.tsx` |
| `.js` without JSX (utilities, hooks, constants) | No | `.ts` |
| `.d.ts` (type definitions) | N/A | Merged into `.ts`/`.tsx` |
| `index.js` (barrel exports) | No | `index.ts` |

### Current `tsconfig.json`

```json
{
  "compilerOptions": {
    "jsx": "react",
    "lib": ["dom", "es2015"],
    "module": "esnext",
    "strict": true
  },
  "include": ["src/**/*.d.ts"],
  "files": ["test/typings.tsx"]
}
```

This config only type-checks the `.d.ts` files and the typings test file. It must be expanded to compile source.

---

## Detailed Tasks

### Task 1: Update `tsconfig.json` for source compilation

**File:** `tsconfig.json`

1.1. Update the TypeScript configuration to compile `.ts` and `.tsx` source files:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["dom", "dom.iterable", "es2020"],
    "module": "esnext",
    "moduleResolution": "node",
    "target": "es2018",
    "strict": true,
    "declaration": true,
    "declarationDir": "dist/types",
    "outDir": "dist/es",
    "sourceMap": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "test"]
}
```

1.2. Key changes from the current config:
- `jsx`: `"react"` -> `"react-jsx"` (React 17+ JSX transform, works with React 19)
- `include`: `"src/**/*.d.ts"` -> `"src/**/*.ts", "src/**/*.tsx"` (compile source, not just declarations)
- `declaration: true`: Auto-generate `.d.ts` from source
- `lib`: Add `"dom.iterable"` and update to `"es2020"`
- `target`: Set to `"es2018"` for modern output

1.3. Create `tsconfig.build.json` for production builds if different settings are needed:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "dist/types",
    "sourceMap": false
  },
  "exclude": ["**/*.test.*", "**/*.spec.*", "test/"]
}
```

---

### Task 2: Rename all source files from `.js` to `.ts`/`.tsx`

2.1. Rename component files (containing JSX) to `.tsx`:

```bash
# All React component files in src/ that contain JSX should be .tsx
# Utility files without JSX should be .ts
find src/ -name "*.js" -exec sh -c '
  if grep -q "React\." "$1" || grep -q "jsx" "$1" || grep -q "<[A-Z]" "$1"; then
    mv "$1" "${1%.js}.tsx"
  else
    mv "$1" "${1%.js}.ts"
  fi
' _ {} \;
```

2.2. Key file categorizations:

**Files to rename to `.tsx`** (contain JSX -- approximately 200+ component files):
- All files in `src/addons/*/` that are components
- All files in `src/collections/*/` that are components
- All files in `src/elements/*/` that are components
- All files in `src/modules/*/` that are components
- All files in `src/views/*/` that are components

**Files to rename to `.ts`** (no JSX -- utility/library files):
- `src/lib/childrenUtils.js` -> `src/lib/childrenUtils.ts`
- `src/lib/classNameBuilders.js` -> `src/lib/classNameBuilders.ts`
- `src/lib/doesNodeContainClick.js` -> `src/lib/doesNodeContainClick.ts`
- `src/lib/factories.js` -> `src/lib/factories.tsx` (contains `React.createElement`/`React.cloneElement`)
- `src/lib/getComponentType.js` -> `src/lib/getComponentType.ts`
- `src/lib/getUnhandledProps.js` -> `src/lib/getUnhandledProps.ts`
- `src/lib/htmlPropsUtils.js` -> `src/lib/htmlPropsUtils.ts`
- `src/lib/isBrowser.js` -> `src/lib/isBrowser.ts`
- `src/lib/isRefObject.js` -> `src/lib/isRefObject.ts`
- `src/lib/leven.js` -> `src/lib/leven.ts`
- `src/lib/makeDebugger.js` -> `src/lib/makeDebugger.ts`
- `src/lib/ModernAutoControlledComponent.js` -> `src/lib/ModernAutoControlledComponent.tsx` (before Phase 16 converts it)
- `src/lib/normalizeTransitionDuration.js` -> `src/lib/normalizeTransitionDuration.ts`
- `src/lib/numberToWord.js` -> `src/lib/numberToWord.ts`
- `src/lib/objectDiff.js` -> `src/lib/objectDiff.ts`
- `src/lib/SUI.js` -> `src/lib/SUI.ts`
- `src/lib/hooks/useAutoControlledValue.js` -> `src/lib/hooks/useAutoControlledValue.ts`
- `src/lib/hooks/useClassNamesOnNode.js` -> `src/lib/hooks/useClassNamesOnNode.ts`
- `src/lib/hooks/useEventCallback.js` -> `src/lib/hooks/useEventCallback.ts`
- `src/lib/hooks/useForceUpdate.js` -> `src/lib/hooks/useForceUpdate.ts`
- `src/lib/hooks/useIsomorphicLayoutEffect.js` -> `src/lib/hooks/useIsomorphicLayoutEffect.ts`
- `src/lib/hooks/useMergedRefs.js` -> `src/lib/hooks/useMergedRefs.ts`
- `src/lib/hooks/usePrevious.js` -> `src/lib/hooks/usePrevious.ts`
- All `index.js` files -> `index.ts`

---

### Task 3: Merge `.d.ts` type definitions into source files

For each component, merge the TypeScript interface from the `.d.ts` file into the `.tsx` source file.

3.1. Example transformation for a simple component:

```typescript
// BEFORE: src/addons/Radio/Radio.d.ts
import { ForwardRefComponent } from '../../generic'
import { CheckboxProps } from '../../modules/Checkbox'

export interface RadioProps extends CheckboxProps {
  slider?: boolean
  toggle?: boolean
  type?: 'checkbox' | 'radio'
}

declare const Radio: ForwardRefComponent<RadioProps, HTMLInputElement>
export default Radio

// BEFORE: src/addons/Radio/Radio.js
import * as React from 'react'
import { getUnhandledProps } from '../../lib'
import Checkbox from '../../modules/Checkbox'

const Radio = React.forwardRef(function (props, ref) {
  const { slider, toggle, type } = props
  const rest = getUnhandledProps(Radio, props)
  return <Checkbox {...rest} type={type} ref={ref} radio slider={slider} toggle={toggle} />
})

Radio.displayName = 'Radio'
Radio.handledProps = ['slider', 'toggle', 'type']
export default Radio

// AFTER: src/addons/Radio/Radio.tsx (merged)
import * as React from 'react'
import { getUnhandledProps } from '../../lib'
import Checkbox, { CheckboxProps } from '../../modules/Checkbox'

export interface RadioProps extends CheckboxProps {
  /** Format to emphasize the current selection state. */
  slider?: boolean
  /** Format to show an on or off choice. */
  toggle?: boolean
  /** HTML input type, either checkbox or radio. */
  type?: 'checkbox' | 'radio'
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function (props, ref) {
  const { slider, toggle, type } = props
  const rest = getUnhandledProps(Radio, props)
  return <Checkbox {...rest} type={type} ref={ref} radio slider={slider} toggle={toggle} />
})

Radio.displayName = 'Radio'
;(Radio as any).handledProps = ['slider', 'toggle', 'type']
export default Radio
```

3.2. For each merge, ensure:
- All JSDoc comments from the `.d.ts` file are preserved in the interface
- The interface is exported (so consumers can import the props type)
- The `forwardRef` call is properly typed with generic parameters
- Event handler types use proper React event types

3.3. Process all 213 `.d.ts` files. Many are simple `index.d.ts` re-exports:

```typescript
// BEFORE: src/addons/Radio/index.d.ts
export { default, RadioProps } from './Radio'

// AFTER: src/addons/Radio/index.ts
export { default } from './Radio'
export type { RadioProps } from './Radio'
```

---

### Task 4: Add TypeScript interfaces for all component props

4.1. For each component, ensure the props interface includes all props that were previously in `propTypes`. Cross-reference with the `handledProps` array to ensure completeness.

4.2. Add proper generic types for the `as` prop pattern used throughout the library:

```typescript
interface StrictComponentProps {
  /** An element type to render as (string or component). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional CSS classes. */
  className?: string
}

interface ComponentProps extends StrictComponentProps {
  [key: string]: any
}
```

4.3. Ensure all event handler props have proper signatures:

```typescript
interface ButtonProps {
  /** Called on click. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
}
```

---

### Task 5: Type the utility library files

**Directory:** `src/lib/`

5.1. `src/lib/getUnhandledProps.ts`:

```typescript
const getUnhandledProps = (
  Component: { handledProps?: string[] },
  props: Record<string, any>
): Record<string, any> => {
  const { handledProps = [] } = Component
  return Object.keys(props).reduce<Record<string, any>>((acc, prop) => {
    if (prop === 'childKey') return acc
    if (handledProps.indexOf(prop) === -1) acc[prop] = props[prop]
    return acc
  }, {})
}

export default getUnhandledProps
```

5.2. `src/lib/factories.tsx` -- add generic types to `createShorthand` and `createShorthandFactory`.

5.3. `src/lib/htmlPropsUtils.ts` -- add proper typing to `partitionHTMLProps`.

5.4. `src/lib/classNameBuilders.ts` -- add parameter and return types.

5.5. `src/lib/childrenUtils.ts` -- add proper typing.

---

### Task 6: Type the custom hooks

**Directory:** `src/lib/hooks/`

6.1. `useAutoControlledValue.ts`:

```typescript
interface UseAutoControlledValueOptions<T> {
  defaultState?: T
  state?: T
  initialState: T
}

function useAutoControlledValue<T>(options: UseAutoControlledValueOptions<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
  // ...implementation
}
```

6.2. `useMergedRefs.ts`:

```typescript
function useMergedRefs<T>(
  refA: React.Ref<T> | null | undefined,
  refB: React.Ref<T> | null | undefined
): React.RefCallback<T> & { current: T | null } {
  // ...implementation
}
```

6.3. `useEventCallback.ts`:

```typescript
function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  // ...implementation
}
```

6.4. Apply similar typing to `useClassNamesOnNode.ts`, `useForceUpdate.ts`, `useIsomorphicLayoutEffect.ts`, `usePrevious.ts`.

---

### Task 7: Update barrel exports (`index.ts` files)

7.1. Rename all `index.js` files to `index.ts`.

7.2. Update the root `src/index.ts` to use proper TypeScript re-exports:

```typescript
// Component exports
export { default as Confirm } from './addons/Confirm'
export type { ConfirmProps } from './addons/Confirm'

export { default as Pagination } from './addons/Pagination'
export type { PaginationProps } from './addons/Pagination'

// ... all components
```

7.3. Update each component directory's `index.ts` to re-export types:

```typescript
export { default } from './Button'
export type { ButtonProps } from './Button'
export { default as ButtonContent } from './ButtonContent'
export type { ButtonContentProps } from './ButtonContent'
// ...
```

---

### Task 8: Delete all standalone `.d.ts` files

8.1. After merging types into source files, delete all 213 `.d.ts` files from `src/`.

8.2. Delete `src/generic.d.ts` and move its contents to `src/generic.ts`:

```bash
mv src/generic.d.ts src/generic.ts
```

8.3. Update the root `index.d.ts` file. After this phase, TypeScript declarations are auto-generated by `tsc` from the source. The root `index.d.ts` should either be removed or point to the generated declarations:

```json
// package.json
{
  "types": "dist/types/index.d.ts"
}
```

---

### Task 9: Configure the build pipeline for TypeScript

9.1. Update the Gulp build pipeline (`gulp/` or build scripts) to compile TypeScript instead of running Babel on JavaScript.

9.2. For CommonJS output:

```json
// tsconfig.commonjs.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "dist/commonjs",
    "declaration": false
  }
}
```

9.3. For ES module output:

```json
// tsconfig.esm.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "esnext",
    "outDir": "dist/es",
    "declaration": true,
    "declarationDir": "dist/types"
  }
}
```

9.4. For UMD output, continue using Webpack/Rollup with a TypeScript loader.

9.5. Update `package.json` entry points:

```json
{
  "main": "dist/commonjs/index.js",
  "module": "dist/es/index.js",
  "types": "dist/types/index.d.ts",
  "jsnext:main": "dist/es/index.js"
}
```

---

### Task 10: Update import paths throughout the codebase

10.1. TypeScript module resolution handles `.ts`/`.tsx` extensions automatically, so internal imports like `import Checkbox from '../../modules/Checkbox'` will continue to work if the `index.ts` barrel exists.

10.2. Verify all relative imports resolve correctly after renaming.

10.3. If any imports use explicit `.js` extensions, remove them or update to `.ts`/`.tsx` (though this is uncommon in this codebase).

---

### Task 11: Update `package.json` scripts

11.1. Update the `tsd:test` script since `.d.ts` files no longer exist separately:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build:types": "tsc -p tsconfig.build.json --emitDeclarationOnly"
  }
}
```

11.2. Update `"files"` array to include compiled output instead of `src/`:

```json
{
  "files": [
    "dist",
    "src"
  ]
}
```

---

## Files Affected

| Category | Count | Change |
|----------|-------|--------|
| Component source files | ~200 | `.js` -> `.tsx`, merge `.d.ts` types inline |
| Utility source files | ~30 | `.js` -> `.ts`, add type annotations |
| Hook files | 7 | `.js` -> `.ts`, add generic types |
| Barrel index files | ~50 | `index.js` -> `index.ts`, update re-exports |
| Type definition files | 213 | Delete (merged into source) |
| `src/generic.d.ts` | 1 | Rename to `src/generic.ts` |
| `tsconfig.json` | 1 | Major update for source compilation |
| `package.json` | 1 | Update `types`, `scripts`, `files` |
| Build pipeline (Gulp/Webpack) | ~3-5 | Configure TypeScript compilation |
| Root `index.d.ts` | 1 | Remove or redirect to `dist/types/` |

**Total files affected: ~470+ files**

---

## Acceptance Criteria

- [ ] All 257 `.js` files in `src/` are renamed to `.ts` or `.tsx` (zero `.js` files remain in `src/`)
- [ ] All 213 `.d.ts` files in `src/` are deleted (types merged into source)
- [ ] `src/generic.d.ts` is renamed to `src/generic.ts`
- [ ] `tsc --noEmit` passes with zero errors on the full source
- [ ] Every exported component has a typed props interface (e.g., `ButtonProps`, `DropdownProps`)
- [ ] Every props interface is exported from its module and from the root `index.ts`
- [ ] The build pipeline produces `dist/commonjs/`, `dist/es/`, and `dist/umd/` from TypeScript source
- [ ] Auto-generated `.d.ts` declarations in `dist/types/` are equivalent to or better than the old manually-maintained `.d.ts` files
- [ ] `yarn build` succeeds and produces all output formats
- [ ] The library can be consumed by a TypeScript project with full type inference
- [ ] The library can be consumed by a JavaScript project without changes
- [ ] All 7 hooks in `src/lib/hooks/` have proper generic type signatures
- [ ] `getUnhandledProps`, `factories`, `classNameBuilders`, and other utilities are fully typed
- [ ] No `any` types are used where a more specific type is available (pragmatic -- some `any` is acceptable during migration)

---

## Rollback Strategy

1. This phase creates a massive diff (470+ files). The rollback strategy is to revert to the pre-Phase-14 git tag/branch.
2. **Before starting this phase, create a git tag:** `git tag pre-typescript-conversion`
3. If the conversion fails partway through, `git reset --hard pre-typescript-conversion` restores the full JavaScript codebase.
4. The `.d.ts` files being deleted are critical -- ensure they are committed and tagged before deletion.
5. If partial rollback is needed (e.g., some files converted successfully, others not), individual files can be restored: `git checkout pre-typescript-conversion -- src/path/to/file.js src/path/to/file.d.ts`

---

## Notes for AI Agents

- **This is the largest phase by total file count (470+).** It should be executed methodically, one directory at a time. Suggested order: `src/lib/` first (utilities and hooks), then `src/addons/`, `src/elements/`, `src/collections/`, `src/modules/`, `src/views/`.
- **Do not attempt to convert everything in one pass.** Convert utilities and hooks first to establish patterns, then apply to components.
- **When merging `.d.ts` into `.tsx`, the interface should be placed ABOVE the component definition** in the file, following the convention of types-before-implementation.
- **The `as` prop pattern** is used by almost every component and allows polymorphic rendering. The TypeScript typing for this is complex. Consider using a utility type:
  ```typescript
  type PolymorphicComponentProps<C extends React.ElementType, Props = {}> =
    Props & Omit<React.ComponentPropsWithRef<C>, keyof Props> & { as?: C }
  ```
- **`lodash` imports** will cause TypeScript to require `@types/lodash`. Add this to `devDependencies` if not already present.
- **The `handledProps` static property** does not fit neatly on a typed `React.ForwardRefExoticComponent`. Use a type assertion: `(Component as any).handledProps = [...]` or extend the component type.
- **The `[key: string]: any` index signature** on many prop interfaces (e.g., `interface ButtonProps extends StrictButtonProps { [key: string]: any }`) is intentional for `getUnhandledProps` to work. Keep these during migration.
- **`react-is` types.** Ensure `@types/react-is` or the built-in types from `react-is` are available. The `ReactIs.isValidElementType` call in `factories.tsx` needs typing.
- **Run `tsc --noEmit` frequently** during the conversion to catch errors early. Do not wait until all files are converted to type-check.
- **The `generic.d.ts` -> `generic.ts` rename** is critical because many components import types from it. Do this early in the conversion.
- After conversion, the `files` array in `package.json` should continue to include `src/` so that source maps work correctly for consumers.

---

## Strict Type Conversion Requirements

> **Cross-reference:** This section implements requirements from `ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md`, which applies to ALL 50 phases and supersedes any conflicting guidance in this phase document. Specifically, the original Note for AI Agents stating "some `any` is acceptable during migration" and the original `[key: string]: any` guidance are hereby **overridden**. Zero `any` is the requirement.

### Rule: Every File Must Pass `--strict` with Zero Errors

Every converted `.ts` or `.tsx` file must compile cleanly under the strictest possible TypeScript configuration. The command:

```bash
npx tsc --noEmit --strict
```

must produce zero errors at every step of the conversion. Do not batch errors to fix later. Do not convert all files first and then fix types. Each file must be correct before moving to the next.

### Rule: No `any`, No `unknown` (Except Narrowed Catches)

This is the most significant departure from the original Phase 14 guidance. The original document said: "No `any` types are used where a more specific type is available (pragmatic -- some `any` is acceptable during migration)." **That guidance is revoked.** The new rule is:

- Zero `any` in source files, test files, and type definitions.
- Zero `unknown` in props, parameters, return types, or variables. `unknown` is permitted only in `catch` blocks where it is immediately narrowed with `instanceof` or a type guard.

### Rule: No `@ts-ignore`, No `@ts-expect-error`

These comments are band-aids that hide real type errors. If a line does not type-check, the type must be fixed, not suppressed. There are zero exceptions.

### Rule: No `as any` Assertions

Type assertions to `any` are the most dangerous pattern because they silently disable type checking for the entire expression chain. Every `as any` must be replaced with either:

1. A correct type annotation that makes the assertion unnecessary.
2. A type guard that narrows the type safely.
3. A generic parameter that preserves type information.

### Rule: The `[key: string]: any` Prop Escape Hatch Must Be Completely Eliminated

The original Phase 14 Note for AI Agents said: "The `[key: string]: any` index signature on many prop interfaces is intentional for `getUnhandledProps` to work. Keep these during migration." **That guidance is revoked.** The index signature must be eliminated during this phase.

### Pattern Library: Correct Types for Every Common Pattern

The following patterns cover every common scenario encountered when converting Semantic UI React source files from JavaScript to TypeScript.

#### Pattern 1: Standard Component Props (Replacing `[key: string]: any`)

```typescript
// BEFORE (BANNED):
interface StrictButtonProps {
  active?: boolean
  children?: React.ReactNode
  className?: string
  color?: SemanticCOLOR
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
}
interface ButtonProps extends StrictButtonProps {
  [key: string]: any  // ELIMINATED
}

// AFTER (REQUIRED):
interface ButtonProps extends
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  active?: boolean
  animated?: boolean | 'fade' | 'vertical'
  as?: React.ElementType
  attached?: boolean | 'bottom' | 'left' | 'right' | 'top'
  basic?: boolean
  children?: React.ReactNode
  circular?: boolean
  className?: string
  color?: SemanticCOLOR
  compact?: boolean
  content?: React.ReactNode
  disabled?: boolean
  floated?: SemanticFLOATS
  fluid?: boolean
  icon?: boolean | SemanticShorthandItem<IconProps>
  inverted?: boolean
  label?: SemanticShorthandItem<LabelProps>
  labelPosition?: 'left' | 'right'
  loading?: boolean
  negative?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
  positive?: boolean
  primary?: boolean
  role?: string
  secondary?: boolean
  size?: SemanticSIZE
  tabIndex?: number | string
  toggle?: boolean
  type?: 'button' | 'reset' | 'submit'
}
```

Key points:
- Extend `React.ButtonHTMLAttributes<HTMLButtonElement>` (or the appropriate HTML attributes interface) to allow standard HTML attributes like `aria-label`, `data-testid`, `id`, etc.
- Use `Omit<>` to exclude HTML attributes that the component redefines with a different type (e.g., `color` is `SemanticCOLOR`, not `string`).
- All interface members are sorted alphabetically (enforced by `perfectionist/sort-interfaces`).

#### Pattern 2: Polymorphic Component Props (Components with `as` Prop)

```typescript
// Utility type for polymorphic components
type PolymorphicComponentProps<
  E extends React.ElementType,
  P = object,
> = P &
  Omit<React.ComponentPropsWithRef<E>, keyof P> & {
    as?: E
  }

// Usage in a component:
interface StrictContainerProps {
  children?: React.ReactNode
  className?: string
  content?: React.ReactNode
  fluid?: boolean
  text?: boolean
  textAlign?: SemanticTEXTALIGNMENTS
}

type ContainerProps<E extends React.ElementType = 'div'> =
  PolymorphicComponentProps<E, StrictContainerProps>
```

#### Pattern 3: forwardRef with Typed Component

```typescript
// Define handledProps as a const array (not a static property)
const BUTTON_HANDLED_PROPS = [
  'active',
  'animated',
  'as',
  'attached',
  'basic',
  'children',
  'circular',
  'className',
  'color',
  'compact',
  'content',
  'disabled',
  'floated',
  'fluid',
  'icon',
  'inverted',
  'label',
  'labelPosition',
  'loading',
  'negative',
  'onClick',
  'positive',
  'primary',
  'role',
  'secondary',
  'size',
  'tabIndex',
  'toggle',
  'type',
] as const

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      active,
      animated,
      as: ElementType = 'button',
      children,
      className,
      color,
      content,
      disabled,
      // ...rest of destructured props
    } = props

    const rest = getUnhandledProps(BUTTON_HANDLED_PROPS, props)

    return (
      <ElementType
        {...rest}
        className={classes}
        disabled={disabled}
        ref={ref}
        role={role}
      />
    )
  },
)

Button.displayName = 'Button'
```

#### Pattern 4: Event Handler Types

```typescript
// Standard click handler
interface ButtonProps {
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
    data: ButtonProps,
  ) => void
}

// Input change handler
interface InputProps {
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    data: { value: string },
  ) => void
}

// Dropdown with multiple event sources
interface DropdownProps {
  onChange?: (
    event: React.SyntheticEvent<HTMLElement>,
    data: { value: DropdownValue },
  ) => void
  onSearchChange?: (
    event: React.SyntheticEvent<HTMLElement>,
    data: { searchQuery: string },
  ) => void
}

type DropdownValue = boolean | number | string | Array<boolean | number | string>
```

#### Pattern 5: Shorthand Props (Replacing `any` in Shorthand System)

```typescript
// Shorthand value types
type ShorthandValue = React.ReactNode

type ShorthandRenderFunction<TProps> = (
  Component: React.ElementType,
  props: TProps,
) => React.ReactNode

type SemanticShorthandItem<TProps> =
  | ShorthandRenderFunction<TProps>
  | TProps
  | ShorthandValue

// In component props:
interface ButtonProps {
  icon?: boolean | SemanticShorthandItem<IconProps>
  label?: SemanticShorthandItem<LabelProps>
}

// The createShorthand factory:
function createShorthand<TProps extends { children?: React.ReactNode }>(
  Component: React.ComponentType<TProps>,
  mapValueToProps: (value: ShorthandValue) => Partial<TProps>,
  value: SemanticShorthandItem<TProps> | undefined,
  options?: CreateShorthandOptions,
): React.ReactElement | null {
  if (value === undefined || value === null || typeof value === 'boolean') {
    return null
  }

  if (typeof value === 'function') {
    // Render function
    return value(Component, {} as TProps) as React.ReactElement
  }

  if (React.isValidElement(value)) {
    return value
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return <Component {...(value as TProps)} />
  }

  // Primitive value -- map to props
  const mappedProps = mapValueToProps(value)
  return <Component {...(mappedProps as TProps)} />
}

interface CreateShorthandOptions {
  autoGenerateKey?: boolean
  defaultProps?: Record<string, unknown>
  overrideProps?: Record<string, unknown>
}
```

#### Pattern 6: getUnhandledProps (Zero-Any Version)

```typescript
function getUnhandledProps<TProps extends Record<string, unknown>>(
  handledProps: readonly string[],
  props: TProps,
): Omit<TProps, (typeof handledProps)[number]> {
  const handledSet = new Set<string>(handledProps)

  const unhandled: Partial<TProps> = {}

  for (const key of Object.keys(props)) {
    if (key !== 'childKey' && !handledSet.has(key)) {
      (unhandled as Record<string, unknown>)[key] = props[key as keyof TProps]
    }
  }

  return unhandled as Omit<TProps, (typeof handledProps)[number]>
}
```

#### Pattern 7: classNameBuilders (Typed Utility Functions)

```typescript
function useKeyOnly(val: boolean | undefined, key: string): string | undefined {
  return val ? key : undefined
}

function useKeyOrValueAndKey(
  val: boolean | string | undefined,
  key: string,
): string | undefined {
  if (val === undefined || val === false) return undefined
  if (val === true) return key
  return `${val} ${key}`
}

function useValueAndKey(
  val: string | undefined,
  key: string,
): string | undefined {
  if (val === undefined) return undefined
  return `${val} ${key}`
}

function useTextAlignProp(
  val: SemanticTEXTALIGNMENTS | undefined,
): string | undefined {
  if (val === undefined) return undefined
  return `${val} aligned`
}

function useVerticalAlignProp(
  val: SemanticVERTICALALIGNMENTS | undefined,
): string | undefined {
  if (val === undefined) return undefined
  return `${val} aligned`
}

function useWidthProp(
  val: SemanticWIDTHS | undefined,
  canEqual?: boolean,
): string | undefined {
  if (val === undefined) return undefined
  if (typeof val === 'number') {
    return `${numberToWord(val)} wide`
  }
  if (val === 'equal' && canEqual) {
    return 'equal width'
  }
  return `${val} wide`
}
```

#### Pattern 8: Ref Forwarding (React 19 Compatible)

```typescript
// useRef -- always specify the exact HTML element type
const buttonRef = useRef<HTMLButtonElement>(null)
const inputRef = useRef<HTMLInputElement>(null)
const divRef = useRef<HTMLDivElement>(null)
const textAreaRef = useRef<HTMLTextAreaElement>(null)

// forwardRef -- type both the element and props
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    // ref is React.ForwardedRef<HTMLInputElement>
    return <input ref={ref} {...rest} />
  },
)

// Ref callback (React 19 -- can return cleanup function)
const refCallback = (node: HTMLDivElement | null): (() => void) | undefined => {
  if (node !== null) {
    // setup
    return () => {
      // cleanup
    }
  }
  return undefined
}
```

#### Pattern 9: Context Types

```typescript
// Typed context
interface AccordionContextValue {
  activeIndex: number | number[]
  exclusive: boolean
  onTitleClick: (event: React.MouseEvent<HTMLDivElement>, index: number) => void
}

const AccordionContext = React.createContext<AccordionContextValue>({
  activeIndex: -1,
  exclusive: true,
  onTitleClick: () => undefined,
})
```

#### Pattern 10: Dynamic Property Access with `noUncheckedIndexedAccess`

```typescript
const sizeMap: Record<SemanticSIZE, string> = {
  huge: 'h1',
  large: 'h2',
  massive: 'h1',
  medium: 'h3',
  mini: 'h6',
  small: 'h4',
  tiny: 'h5',
}

function getHeaderElement(size: SemanticSIZE): string {
  // With noUncheckedIndexedAccess, this returns string | undefined from a Record.
  // But since SemanticSIZE is a union of all keys, we can assert this is safe:
  // Option A: Use a typed map where the key is the exact union
  return sizeMap[size]  // This is safe because SemanticSIZE covers all keys
}

// For truly dynamic access where the key might not exist:
function getConfigValue(config: Record<string, string>, key: string): string {
  const value = config[key]  // type is string | undefined
  if (value === undefined) {
    throw new Error(`Missing config key: ${key}`)
  }
  return value  // narrowed to string
}
```

#### Pattern 11: Semantic Type Unions (Sorted Alphabetically)

```typescript
// All semantic type unions must be sorted alphabetically (enforced by perfectionist)
type SemanticCOLOR =
  | 'black'
  | 'blue'
  | 'brown'
  | 'green'
  | 'grey'
  | 'olive'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'violet'
  | 'white'
  | 'yellow'

type SemanticSIZE =
  | 'huge'
  | 'large'
  | 'massive'
  | 'medium'
  | 'mini'
  | 'small'
  | 'tiny'

type SemanticFLOATS = 'left' | 'right'

type SemanticTEXTALIGNMENTS = 'center' | 'justified' | 'left' | 'right'

type SemanticVERTICALALIGNMENTS = 'bottom' | 'middle' | 'top'

type SemanticWIDTHS =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16
  | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
  | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16'
  | 'equal'
  | 'eight'
  | 'eleven'
  | 'fifteen'
  | 'five'
  | 'four'
  | 'fourteen'
  | 'nine'
  | 'one'
  | 'seven'
  | 'six'
  | 'sixteen'
  | 'ten'
  | 'thirteen'
  | 'three'
  | 'twelve'
  | 'two'
```

### Conversion Checklist Per File

For every `.js` file converted to `.ts`/`.tsx`, verify all of the following before moving to the next file:

- [ ] File renamed to correct extension (`.tsx` if JSX, `.ts` if not)
- [ ] `.d.ts` file contents merged into the source file
- [ ] Separate `.d.ts` file deleted
- [ ] All imports use `import type` for type-only imports (`verbatimModuleSyntax`)
- [ ] Props interface has explicit types for every property (no `any`)
- [ ] Props interface does NOT have `[key: string]: any`
- [ ] Props interface extends appropriate `React.*HTMLAttributes` for HTML attribute forwarding
- [ ] `forwardRef` call has explicit generic parameters `<HTMLElement, Props>`
- [ ] All event handlers have specific event type parameters
- [ ] `handledProps` is a `const` array, not a static property requiring `as any`
- [ ] `tsc --noEmit --strict` passes with zero errors
- [ ] `eslint --no-error-on-unmatched-pattern` passes with zero errors for this file
- [ ] All interface members are sorted alphabetically
- [ ] All imports are sorted by group and alphabetically
- [ ] All JSX props are sorted alphabetically

### Updated Acceptance Criteria (Addendum)

The following criteria replace the original acceptance criteria item about `any`:

**Original (REVOKED):** "No `any` types are used where a more specific type is available (pragmatic -- some `any` is acceptable during migration)"

**Replacement (MANDATORY):**
- [ ] `grep -rn ': any' src/ --include='*.ts' --include='*.tsx'` returns zero matches outside of comments
- [ ] `grep -rn 'as any' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] `grep -rn '\[key: string\]: any' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] `grep -rn '@ts-ignore' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] `grep -rn '@ts-expect-error' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] `grep -rn ': unknown' src/ --include='*.ts' --include='*.tsx'` returns zero matches outside of `catch` blocks
- [ ] All files pass `tsc --noEmit` with the full strict configuration from `ADDENDUM-STRICT-TYPESCRIPT-PERFECTIONIST.md`
- [ ] All files pass `eslint` with `@typescript-eslint/no-explicit-any: "error"` and all `no-unsafe-*` rules at `"error"`
- [ ] All files pass perfectionist sorting rules at `"error"` severity
