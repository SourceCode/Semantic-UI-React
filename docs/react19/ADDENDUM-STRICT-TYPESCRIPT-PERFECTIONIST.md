# ADDENDUM: Strict Zero-Any TypeScript & eslint-plugin-perfectionist

| Field            | Value                                              |
|------------------|----------------------------------------------------|
| **Document ID**  | ADDENDUM-STRICT-TS                                 |
| **Title**        | Strict Zero-Any TypeScript & Perfectionist Ruleset |
| **Applies To**   | ALL 50 Phases                                      |
| **Priority**     | MANDATORY -- overrides any conflicting guidance     |
| **Supersedes**   | Any phase document permitting `any`, `unknown`, `@ts-ignore`, or loose typing |

---

## Purpose

This addendum establishes non-negotiable TypeScript strictness and code ordering requirements that apply to every phase of the React 19 migration. No phase document may weaken these rules. Where an existing phase document conflicts with this addendum (for example, Phase 14's note that "some `any` is acceptable during migration"), **this addendum takes precedence**.

The two pillars are:

1. **Zero `any` and zero `unknown`** in all source, test, and type definition files.
2. **eslint-plugin-perfectionist** enforced at `"error"` severity for deterministic, alphabetically sorted code.

---

## Part 1: Zero `any` Tolerance

### 1.1 Rule

The string `any` must never appear as a type annotation in shipped source code, test files, or type definition files. There are zero exceptions.

Patterns that are banned:

```typescript
// BANNED: explicit any
let value: any
function process(input: any): any { ... }
const map: Record<string, any> = {}
interface Props { [key: string]: any }

// BANNED: type assertions to any
const x = something as any
const y = <any>something

// BANNED: unsafe operations that imply any
// (caught by @typescript-eslint/no-unsafe-* rules)
```

### 1.2 ESLint Rules to Enforce

Add every one of the following rules at `"error"` severity:

```javascript
// In eslint.config.js, inside the TypeScript override:
{
  files: ['**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
  },
}
```

These rules require type-aware linting, which means the ESLint config must include `parserOptions.project` pointing to `tsconfig.json`:

```javascript
{
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tseslintParser,
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
}
```

### 1.3 TypeScript Compiler Enforcement

The `tsconfig.json` `noImplicitAny` flag (included in `strict: true`) prevents the compiler from inferring `any`. But it does not prevent explicit `any` annotations. The ESLint rules above close that gap entirely.

---

## Part 2: Zero `unknown` Tolerance in Code

### 2.1 Rule

The type `unknown` must not appear in component props, function parameters, return types, or variable annotations. The only permitted use of `unknown` is in `catch` blocks, and only when the caught value is immediately narrowed:

```typescript
// PERMITTED: unknown in catch, immediately narrowed
try {
  riskyOperation()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message)
  }
  throw new TypeError('Unexpected error type')
}

// BANNED: unknown in props
interface BadProps {
  data: unknown  // NO
}

// BANNED: unknown in function signatures
function process(input: unknown): unknown { ... }  // NO

// BANNED: Record<string, unknown> as a substitute for proper typing
const config: Record<string, unknown> = {}  // NO
```

### 2.2 What to Use Instead

For every case where `unknown` might seem tempting, use a specific type:

| Instead of                      | Use                                                     |
|---------------------------------|---------------------------------------------------------|
| `unknown`                       | The actual type (a specific interface, union, or primitive) |
| `Record<string, unknown>`       | A specific interface with known keys                    |
| `Map<string, unknown>`          | `Map<string, SpecificValueType>`                        |
| `ReactElement["props"]`         | The specific props interface for that element            |
| `unknown[]`                     | `SpecificType[]` or a tuple                             |

### 2.3 The `[key: string]: any` Prop Escape Hatch -- ELIMINATED

The current codebase uses this pattern on virtually every component:

```typescript
// CURRENT (BANNED):
interface ButtonProps extends StrictButtonProps {
  [key: string]: any
}
```

This exists so that `getUnhandledProps` can forward arbitrary HTML attributes. It must be completely eliminated. The replacement strategies are detailed in Section 7 below.

---

## Part 3: Strictest TypeScript Compiler Options

### 3.1 Required `tsconfig.json` compilerOptions

Every flag below must be set exactly as shown. No flag may be weakened, commented out, or overridden in any `tsconfig.*.json` variant:

```json
{
  "compilerOptions": {
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
    "verbatimModuleSyntax": true
  }
}
```

### 3.2 Flag-by-Flag Explanation

| Flag | What It Does | Why It Matters |
|------|-------------|----------------|
| `strict` | Enables all strict family flags at once | Baseline for correctness |
| `noImplicitAny` | Error when compiler infers `any` | Prevents silent `any` leakage from untyped code |
| `strictNullChecks` | `null` and `undefined` are not assignable to other types | Prevents the most common class of runtime errors |
| `strictFunctionTypes` | Contravariant function parameter checking | Catches unsound callback assignments |
| `strictBindCallApply` | Types `bind`, `call`, `apply` correctly | Prevents misuse of function methods |
| `strictPropertyInitialization` | Class properties must be initialized or declared optional | Not heavily used (functional components), but ensures correctness |
| `noImplicitThis` | Error on `this` with implicit `any` type | Prevents bugs in event handlers and callbacks |
| `alwaysStrict` | Emits `"use strict"` in every file | Defense in depth |
| `noUncheckedIndexedAccess` | Index signatures return `T \| undefined` | Forces null checks after bracket access, preventing runtime crashes |
| `noImplicitReturns` | Every code path in a function must return | Prevents accidental `undefined` returns |
| `noFallthroughCasesInSwitch` | Requires `break` or `return` in switch cases | Prevents common bug pattern |
| `noUnusedLocals` | Error on unused local variables | Keeps code clean |
| `noUnusedParameters` | Error on unused function parameters | Keeps signatures honest; prefix with `_` if intentionally unused |
| `exactOptionalPropertyTypes` | `{ x?: string }` means `string \| undefined` at the property level, not `string \| undefined` assignable to `string` | Stricter optional prop handling |
| `noPropertyAccessFromIndexSignature` | Forces bracket notation for index signature access | Makes it clear when accessing a possibly-undefined key |
| `forceConsistentCasingInFileNames` | File imports must match disk casing | Prevents cross-platform bugs |
| `isolatedModules` | Each file must be compilable independently | Required by Vite, Rollup, esbuild |
| `verbatimModuleSyntax` | Enforces `import type` for type-only imports | Ensures tree-shaking works correctly |

### 3.3 Flags That Must NOT Be Added

| Flag | Why It Must Not Be Added |
|------|--------------------------|
| `skipLibCheck: true` | Only acceptable temporarily during initial migration; must be removed by Phase 50 |
| `suppressImplicitAnyIndexErrors` | Deprecated; directly contradicts zero-any |
| `noImplicitAny: false` | Contradicts this addendum |
| Any flag set to `false` that weakens strictness | Contradicts this addendum |

---

## Part 4: eslint-plugin-perfectionist Requirements

### 4.1 Installation

```bash
npm install --save-dev eslint-plugin-perfectionist
```

### 4.2 Configuration in Flat Config Format

```javascript
// In eslint.config.js
import perfectionistPlugin from 'eslint-plugin-perfectionist'

export default [
  // ... other configs ...

  // Perfectionist -- applies to all TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      perfectionist: perfectionistPlugin,
    },
    rules: {
      'perfectionist/sort-imports': ['error', {
        type: 'natural',
        groups: [
          'type',
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'side-effect',
          'style',
        ],
        newlinesBetween: 'always',
      }],
      'perfectionist/sort-named-imports': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-exports': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-interfaces': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-object-types': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-objects': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-union-types': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-intersection-types': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-enums': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-jsx-props': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-array-includes': ['error', {
        type: 'natural',
      }],
      'perfectionist/sort-switch-case': ['error', {
        type: 'natural',
      }],
    },
  },
]
```

### 4.3 Rule Details and Examples

#### `perfectionist/sort-imports`

Imports must be sorted by group, then alphabetically within each group.

```typescript
// CORRECT:
import type { ButtonProps } from './Button'
import type { SemanticCOLOR } from '../../generic'

import { useCallback, useRef } from 'react'

import clsx from 'clsx'

import { getUnhandledProps, useEventCallback } from '../../lib'

import ButtonContent from './ButtonContent'
import ButtonGroup from './ButtonGroup'
import ButtonOr from './ButtonOr'

// WRONG (unsorted, no group separation):
import ButtonOr from './ButtonOr'
import { useRef, useCallback } from 'react'
import type { ButtonProps } from './Button'
import clsx from 'clsx'
import ButtonContent from './ButtonContent'
```

#### `perfectionist/sort-named-imports`

Named imports within a single import statement must be sorted alphabetically.

```typescript
// CORRECT:
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// WRONG:
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
```

#### `perfectionist/sort-interfaces`

Interface members must be sorted alphabetically.

```typescript
// CORRECT:
interface ButtonProps {
  active?: boolean
  animated?: boolean | 'fade' | 'vertical'
  as?: React.ElementType
  attached?: boolean | 'left' | 'right' | 'top' | 'bottom'
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

// WRONG (unsorted):
interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
  children?: React.ReactNode
  active?: boolean
  size?: SemanticSIZE
  color?: SemanticCOLOR
}
```

#### `perfectionist/sort-object-types`

Type object members must be sorted, same as interfaces.

```typescript
// CORRECT:
type ButtonConfig = {
  animationDuration: number
  defaultSize: SemanticSIZE
  role: string
}
```

#### `perfectionist/sort-union-types`

Union type members must be sorted alphabetically.

```typescript
// CORRECT:
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

// WRONG (unsorted):
type SemanticCOLOR = 'red' | 'blue' | 'green' | 'yellow' | 'black'
```

#### `perfectionist/sort-jsx-props`

JSX props must be sorted alphabetically.

```typescript
// CORRECT:
<Button
  active={isActive}
  className="primary-button"
  color="blue"
  disabled={isDisabled}
  onClick={handleClick}
  size="large"
  type="submit"
/>

// WRONG (unsorted):
<Button
  onClick={handleClick}
  size="large"
  active={isActive}
  color="blue"
  disabled={isDisabled}
  type="submit"
  className="primary-button"
/>
```

#### `perfectionist/sort-switch-case`

Switch case values must be sorted alphabetically.

```typescript
// CORRECT:
switch (size) {
  case 'huge':
    return 'h1'
  case 'large':
    return 'h2'
  case 'medium':
    return 'h3'
  case 'small':
    return 'h4'
  case 'tiny':
    return 'h5'
  default:
    return 'h3'
}
```

### 4.4 Integration with Prettier

`eslint-plugin-perfectionist` handles code ordering, not formatting. It does not conflict with Prettier. The rule of thumb:

- **Prettier** decides whitespace, semicolons, quotes, line length.
- **Perfectionist** decides ordering of imports, props, interface members, etc.
- **eslint-config-prettier** remains last in the config array to disable any ESLint rules that overlap with Prettier formatting. Perfectionist rules are not disabled by eslint-config-prettier because they do not govern formatting.

### 4.5 Auto-Fix Support

All perfectionist rules support `eslint --fix`. When a developer or CI pipeline runs `eslint --fix`, imports, props, interface members, and other sortable constructs are automatically reordered. This means the rules impose near-zero developer friction despite being set to `"error"`.

---

## Part 5: Banned Patterns

The following patterns must never appear in the codebase. If found during any phase, they must be corrected immediately.

### 5.1 Banned Type Annotations

| Pattern | Reason | Replacement |
|---------|--------|-------------|
| `any` | Disables type safety entirely | Use the specific type |
| `[key: string]: any` | Allows any property with any type | Use explicit props + HTML attribute extension (see Section 7) |
| `as any` | Bypasses the type system | Use proper type narrowing or generic constraints |
| `Function` | Untyped callable | Use `(...args: SpecificParams) => ReturnType` |
| `Object` | Too broad | Use `Record<string, SpecificType>` or a proper interface |
| `{}` (empty object type) | Accepts anything except `null` and `undefined` | Use `Record<string, never>` for truly empty, or a proper interface |
| `object` (lowercase) | Accepts any non-primitive | Use a specific interface |

### 5.2 Banned Compiler Directives

| Pattern | Reason | Replacement |
|---------|--------|-------------|
| `@ts-ignore` | Silently hides any type error | Fix the underlying type issue |
| `@ts-expect-error` | Should only exist temporarily in tests | Fix the underlying type issue |
| `@ts-nocheck` | Disables type checking for entire file | Never acceptable |

### 5.3 Banned Assertion Patterns

| Pattern | Reason | Replacement |
|---------|--------|-------------|
| `value!` (non-null assertion) | Asserts non-null without verification | Use a proper null check: `if (value !== null) { ... }` |
| `as unknown as TargetType` | Double assertion through `unknown` | Fix the type chain so direct assignment works |

---

## Part 6: How This Affects Each Stage

### Stage 1: Foundation and Tooling (Phases 1-8)

- Phase 07 (ESLint): Configure all `@typescript-eslint/no-unsafe-*` rules and `eslint-plugin-perfectionist` from day one. Every rule at `"error"` severity.
- Phase 08 (TypeScript): Set every strict compiler flag listed in Section 3.1. No flag may be deferred.

### Stage 2: Test Infrastructure (Phases 9-12)

- Phase 09 (RTL migration): All new test files must be `.ts`/`.tsx` with strict types. Test utilities must be fully typed.
- Phase 10 (Vitest): Vitest config and test helpers must use strict types.
- Phase 11 (Test utilities): All test helpers, matchers, and fixtures must be fully typed. No `any` in mock factories.
- Phase 12 (act imports): Type-safe wrappers around async testing utilities.

### Stage 3: Core Library Modernization (Phases 13-18)

- Phase 13 (Remove PropTypes): The PropTypes-to-TypeScript conversion must produce specific types, not `any`.
- Phase 14 (Convert to TypeScript): **This is the critical phase.** Every converted file must pass `tsc --strict` with zero errors and zero `any`. The `[key: string]: any` escape hatch must not be carried forward. See Section 7 for the migration approach.
- Phase 15 (Remove forwardRef): New ref patterns must use `React.Ref<SpecificHTMLElement>`.
- Phase 16 (Convert class components): Converted hooks must be fully typed.
- Phase 17 (Modernize hooks): All hooks must have proper generic signatures.
- Phase 18 (Replace cloneElement): Replacement patterns must use typed composition.

### Stage 4-7: Component Migration (Phases 19-39)

Every component migration phase must produce:
- A strictly typed props interface (alphabetically sorted by perfectionist)
- Typed event handlers with specific event and data parameters
- Typed ref forwarding with specific HTML element types
- Typed shorthand props using discriminated unions
- Zero `any`, zero `unknown`, zero `@ts-ignore`

### Stage 8: CSS Modernization (Phases 40-42)

- CSS-in-JS types must use `React.CSSProperties` for inline styles.
- Custom CSS property types must be specific strings or template literal types, never `any`.
- Theme tokens must be typed as specific unions, not `string`.

### Stage 9: React 19 Features (Phases 43-46)

- React Compiler output types must be verified.
- Context-as-provider pattern must use typed context values.
- Form actions must use `FormData` types properly.
- Document metadata components must use typed props.

### Stage 10: Release (Phases 47-50)

- Phase 49 (Integration testing): Run `tsc --strict --noEmit` as a CI gate. Zero errors.
- Phase 50 (Release): Final verification that `grep -r "any" src/` returns zero matches outside of comments and string literals. The published `.d.ts` files must contain zero `any` and zero `unknown`.

---

## Part 7: Type Patterns to Use Instead of `any`

This section provides the specific replacement patterns for every common `any` usage in the Semantic UI React codebase.

### 7.1 Component Props -- Eliminating `[key: string]: any`

**Current pattern (BANNED):**

```typescript
interface StrictButtonProps {
  active?: boolean
  children?: React.ReactNode
  className?: string
  color?: SemanticCOLOR
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
}

interface ButtonProps extends StrictButtonProps {
  [key: string]: any  // THIS MUST GO
}
```

**Replacement Option A -- Explicit HTML attribute extension (PREFERRED for standard elements):**

```typescript
interface StrictButtonProps {
  active?: boolean
  children?: React.ReactNode
  className?: string
  color?: SemanticCOLOR
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: StrictButtonProps) => void
}

interface ButtonProps extends
  StrictButtonProps,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof StrictButtonProps> {}
```

This approach:
- Allows all valid `<button>` HTML attributes (`aria-label`, `data-testid`, `tabIndex`, etc.)
- Does NOT allow arbitrary unknown props
- Provides autocomplete for all valid attributes
- Type-checks that passed attributes are valid

**Replacement Option B -- Polymorphic component (for components with the `as` prop):**

```typescript
type ButtonProps<E extends React.ElementType = 'button'> =
  StrictButtonProps &
  Omit<React.ComponentPropsWithRef<E>, keyof StrictButtonProps> & {
    as?: E
  }
```

This allows the valid HTML attributes to change based on what element the component renders as. For example, `<Button as="a" href="/path" />` would type-check `href` as valid because `<a>` elements accept `href`.

**Replacement Option C -- Discriminated union (for components with multiple modes):**

```typescript
type ButtonProps =
  | (StrictButtonProps & { as?: 'button' } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof StrictButtonProps>)
  | (StrictButtonProps & { as: 'a' } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof StrictButtonProps>)
  | (StrictButtonProps & { as: React.ComponentType<StrictButtonProps> })
```

### 7.2 Updating `getUnhandledProps` for Zero-Any

The `getUnhandledProps` utility currently relies on `any`:

```typescript
// CURRENT (BANNED):
const getUnhandledProps = (
  Component: { handledProps?: string[] },
  props: Record<string, any>
): Record<string, any> => { ... }
```

**Replacement using generics:**

```typescript
const getUnhandledProps = <TProps extends Record<string, unknown>>(
  handledProps: readonly string[],
  props: TProps,
): Omit<TProps, (typeof handledProps)[number]> => {
  const handledSet = new Set(handledProps)

  return (Object.keys(props) as Array<keyof TProps>).reduce<
    Partial<TProps>
  >((acc, prop) => {
    if (prop === 'childKey') return acc
    if (!handledSet.has(prop as string)) {
      acc[prop] = props[prop]
    }
    return acc
  }, {}) as Omit<TProps, (typeof handledProps)[number]>
}
```

Note: This function uses `Record<string, unknown>` as a generic **constraint**, not as a concrete type. The actual input and output types are inferred from the call site via `TProps`. This is the only acceptable use of `unknown` outside of catch blocks -- as a generic bound that gets refined at call sites.

### 7.3 Event Handlers

```typescript
// CORRECT: Specific event and data types
interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>, data: ButtonProps) => void
}

// CORRECT: Dropdown with specific event union
interface DropdownProps {
  onChange?: (
    event: React.SyntheticEvent<HTMLElement>,
    data: { value: DropdownValue },
  ) => void
}

type DropdownValue = boolean | number | string | Array<boolean | number | string>
```

### 7.4 Children

```typescript
// CORRECT:
interface Props {
  children?: React.ReactNode
}

// ALSO CORRECT for render props:
interface Props {
  children?: (data: SpecificRenderData) => React.ReactNode
}

// BANNED:
interface Props {
  children?: any
}
```

### 7.5 Shorthand Props

The shorthand system (`createShorthand`) currently uses `any` heavily. Replace with discriminated unions:

```typescript
// Shorthand for a component that accepts content
type ShorthandValue = React.ReactNode
type ShorthandObject<TProps> = TProps
type ShorthandRenderFunction<TProps> = (
  Component: React.ElementType,
  props: TProps,
) => React.ReactNode

type SemanticShorthandItem<TProps> =
  | ShorthandRenderFunction<TProps>
  | ShorthandObject<TProps>
  | ShorthandValue

// Usage:
interface ButtonProps {
  icon?: SemanticShorthandItem<IconProps>
  label?: SemanticShorthandItem<LabelProps>
}
```

### 7.6 Ref Types

```typescript
// CORRECT: Specific element ref
const buttonRef = useRef<HTMLButtonElement>(null)
const inputRef = useRef<HTMLInputElement>(null)
const divRef = useRef<HTMLDivElement>(null)

// CORRECT: In component definition
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) { ... }
)

// BANNED:
const ref = useRef<any>(null)
const ref = useRef<HTMLElement>(null)  // Too vague -- use the specific element
```

### 7.7 The `as` Prop

```typescript
// CORRECT:
interface Props {
  as?: React.ElementType
}

// For fully polymorphic typing:
type PolymorphicProps<E extends React.ElementType, P = object> =
  P &
  Omit<React.ComponentPropsWithRef<E>, keyof P> & {
    as?: E
  }
```

### 7.8 Factory Functions

```typescript
// CORRECT: Generic factory with proper constraints
function createShorthandFactory<TProps extends Record<string, unknown>>(
  Component: React.ComponentType<TProps>,
  mapValueToProps: (value: ShorthandValue) => Partial<TProps>,
): (value: SemanticShorthandItem<TProps>, options?: CreateShorthandOptions) => React.ReactElement<TProps> | null {
  // ...implementation
}
```

### 7.9 HOC and Wrapper Patterns

```typescript
// CORRECT: Typed HOC
function withSomeFeature<TProps extends { className?: string }>(
  WrappedComponent: React.ComponentType<TProps>,
): React.ComponentType<TProps & { extraProp: string }> {
  return function EnhancedComponent(props) {
    // ...
  }
}
```

### 7.10 Dynamic Property Access

When accessing properties dynamically (e.g., theme values, size maps):

```typescript
// CORRECT: Use a typed map
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
  return sizeMap[size]
}

// BANNED:
function getHeaderElement(size: string): string {
  return (sizeMap as any)[size]
}
```

---

## Part 8: Migration Approach for the `handledProps` Static Property

The `handledProps` pattern is used on every component and currently requires `as any`:

```typescript
// CURRENT (BANNED):
;(Radio as any).handledProps = ['slider', 'toggle', 'type']
```

**Replacement: Typed component with static properties.**

```typescript
// Define a type that extends ForwardRefExoticComponent with handledProps
interface SemanticComponent<TProps, TElement extends HTMLElement = HTMLElement>
  extends React.ForwardRefExoticComponent<React.PropsWithoutRef<TProps> & React.RefAttributes<TElement>> {
  handledProps: readonly string[]
}

// In the component file:
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) { ... }
) as SemanticComponent<RadioProps, HTMLInputElement>

Radio.handledProps = ['slider', 'toggle', 'type'] as const
```

Alternatively, replace the `handledProps` pattern entirely with a const array defined alongside the component:

```typescript
const RADIO_HANDLED_PROPS = ['slider', 'toggle', 'type'] as const

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) {
    const rest = getUnhandledProps(RADIO_HANDLED_PROPS, props)
    // ...
  }
)
```

This second approach is preferred because it eliminates the need for the `as SemanticComponent` assertion entirely.

---

## Part 9: CI Enforcement

### 9.1 Pre-Commit Hook

The lint-staged configuration must run both TypeScript type checking and ESLint:

```json
{
  "lint-staged": {
    "**/*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix",
      "bash -c 'tsc --noEmit'"
    ]
  }
}
```

### 9.2 CI Pipeline

The CI pipeline must include:

```yaml
# In CI config (GitHub Actions, etc.)
steps:
  - name: Type Check
    run: npx tsc --noEmit --strict

  - name: Lint
    run: npx eslint . --max-warnings 0

  - name: Verify Zero Any
    run: |
      # Search for 'any' used as a type (not in comments or strings)
      # This is a belt-and-suspenders check on top of ESLint
      if grep -rn ': any' src/ --include='*.ts' --include='*.tsx' | grep -v '// ' | grep -v '^\s*//' | grep -v '^\s*\*'; then
        echo "ERROR: Found 'any' type annotation in source files"
        exit 1
      fi
```

### 9.3 No Suppression Comments in CI

The CI pipeline must also verify that no ESLint suppression comments exist for the banned rules:

```bash
# Must return zero matches
grep -rn 'eslint-disable.*no-explicit-any' src/ --include='*.ts' --include='*.tsx'
grep -rn 'eslint-disable.*no-unsafe' src/ --include='*.ts' --include='*.tsx'
grep -rn '@ts-ignore' src/ --include='*.ts' --include='*.tsx'
grep -rn '@ts-expect-error' src/ --include='*.ts' --include='*.tsx'
```

---

## Part 10: Exceptions Process

There are zero standing exceptions. If a developer believes a specific line of code genuinely cannot be typed without `any`, they must:

1. Open a GitHub issue explaining why the type system cannot express the needed type.
2. Get explicit approval from the maintainer.
3. If approved, use `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- [issue URL]` with a link to the approved issue.
4. The issue must remain open as a tracking item to remove the exception later.

This process is intentionally burdensome. It should almost never be invoked.

---

## Part 11: Summary Checklist for Every Phase

Before marking any phase as complete, verify ALL of the following:

- [ ] `tsc --noEmit --strict` passes with zero errors
- [ ] `eslint . --max-warnings 0` passes with zero errors
- [ ] `grep -rn ': any' src/ --include='*.ts' --include='*.tsx'` returns zero matches (excluding comments)
- [ ] `grep -rn 'as any' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] `grep -rn '@ts-ignore' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] `grep -rn '@ts-expect-error' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] `grep -rn '\[key: string\]: any' src/ --include='*.ts' --include='*.tsx'` returns zero matches
- [ ] All imports are sorted (perfectionist auto-fix applied)
- [ ] All interface members are sorted (perfectionist auto-fix applied)
- [ ] All JSX props are sorted (perfectionist auto-fix applied)
- [ ] All union types are sorted (perfectionist auto-fix applied)

---

## Document History

| Date | Change |
|------|--------|
| 2026-02-12 | Initial creation. Applies retroactively to all 50 phases. |
