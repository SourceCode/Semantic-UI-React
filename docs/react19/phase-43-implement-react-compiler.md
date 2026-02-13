# Phase 43: Implement React Compiler Support

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-43                                                                 |
| **Title**        | Implement React Compiler Support                                         |
| **Stage**        | 9 -- New React 19 Features                                               |
| **Dependencies** | Phase 7 (ESLint modernization), Phase 17 (hooks migration complete)      |
| **Complexity**   | Medium                                                                   |
| **Scope**        | Babel configuration, ESLint rules, component code compliance, performance |

---

## Objective

Integrate the React Compiler (`babel-plugin-react-compiler`) into the build pipeline so that all function components are automatically optimized for fine-grained reactivity. This eliminates the need for manual `useMemo`, `useCallback`, and `React.memo` wrappers while providing compiler-enforced guarantees about component purity and the Rules of React. The compiler must work with the existing Babel pipeline (or its Rollup/Vite replacement from Phase 06) and produce correct output for every component in the library.

---

## Background

### React Compiler Overview

The React Compiler (formerly React Forget) is a build-time tool that automatically memoizes React components and hooks. It analyzes component code at compile time and inserts fine-grained memoization -- caching individual values, JSX subtrees, and callback references -- so that components skip unnecessary re-renders without developers writing `useMemo`, `useCallback`, or `React.memo`.

The compiler works as a Babel plugin (`babel-plugin-react-compiler`) and requires:
1. React 19+ (uses internal runtime APIs for memoization)
2. Components must follow the "Rules of React" (pure render, no side effects during render, props/state treated as immutable)
3. Hooks must follow the Rules of Hooks (already enforced by `eslint-plugin-react-hooks`)

### Current Codebase State

After Phase 17 (hooks migration), all components are function components using `React.forwardRef`. The codebase currently uses:

- **`React.memo`**: Needs audit -- may exist on some components for performance optimization. The compiler renders these unnecessary.
- **`useMemo`**: Used in some components (needs audit). The compiler will handle this automatically.
- **`useCallback`**: The library provides `useEventCallback` in `J:\code\semantic\Semantic-UI-React\src\lib\hooks\` as a stable-reference callback hook. The compiler may optimize this differently.
- **No `React.memo` wrappers**: The existing codebase (v3.0.0-beta.2) does not extensively use `React.memo` because most components were class-based until the hooks migration.

The library has custom hooks in `J:\code\semantic\Semantic-UI-React\src\lib\hooks\`:
- `useAutoControlledValue`
- `useEventCallback`
- `useForceUpdate`
- `useMergedRefs`
- `useIsomorphicLayoutEffect` (potential)

These hooks must comply with the Rules of React for the compiler to optimize them correctly.

### Current ESLint Configuration

The ESLint configuration at `J:\code\semantic\Semantic-UI-React\.eslintrc` (line 4) extends `"plugin:react-hooks/recommended"`, which enforces basic Rules of Hooks. The React Compiler provides a more comprehensive ESLint plugin that checks for violations of the Rules of React (not just Rules of Hooks).

### Current Babel Configuration

`J:\code\semantic\Semantic-UI-React\.babel-preset.js` defines the Babel plugin pipeline. The React Compiler plugin must be added to this pipeline. The compiler plugin should run BEFORE `transform-react-remove-prop-types` and `filter-imports` because it needs to analyze the original component code.

---

## Detailed Tasks

### 1. Install React Compiler dependencies

Add to `devDependencies` in `J:\code\semantic\Semantic-UI-React\package.json`:

```
babel-plugin-react-compiler
eslint-plugin-react-compiler
```

The `babel-plugin-react-compiler` is the core compiler. The `eslint-plugin-react-compiler` provides lint rules that detect code patterns incompatible with the compiler.

### 2. Add the React Compiler ESLint plugin

Update `J:\code\semantic\Semantic-UI-React\.eslintrc` (or `eslint.config.js` if migrated in Phase 7):

Add to the extends array or plugins:

```json
{
  "plugins": ["react-compiler"],
  "rules": {
    "react-compiler/react-compiler": "error"
  }
}
```

This rule will flag any code patterns that violate the Rules of React and would prevent the compiler from optimizing a component.

### 3. Run the ESLint React Compiler rule against the entire codebase

Execute the linter and collect all violations:

```bash
npx eslint --rule '{"react-compiler/react-compiler": "error"}' src/ --ext .js
```

Categorize violations into:
- **Mutations during render**: Direct mutation of objects/arrays in render scope
- **Side effects during render**: DOM manipulation, timers, or subscriptions in render
- **Non-idempotent renders**: Components that produce different output for the same inputs
- **Hook rule violations**: Conditional hooks, hooks in loops
- **Ref access during render**: Reading `.current` during render (refs are mutable)

### 4. Fix all React Compiler lint violations

For each violation found in Task 3, apply the appropriate fix:

**Mutation during render** (common in components that build className strings with arrays):
```js
// BEFORE (violation: mutating array during render)
const classes = []
if (size) classes.push(size)
if (loading) classes.push('loading')
const className = classes.join(' ')

// AFTER (no mutation)
const className = cx(size, loading && 'loading')
```

Note: The existing `clsx` + `classNameBuilders` pattern is already compiler-safe because `cx()` is a pure function call and `getKeyOnly`/`getValueAndKey`/etc. are pure functions. Verify this for all components.

**Side effects during render** (check `Transition.js` class component, now function component after Phase 17):
Ensure all side effects are in `useEffect` or event handlers, not in the render body.

**Ref access during render** (check components that read `ref.current` during render):
Move ref reads to `useEffect` or event handlers.

### 5. Audit custom hooks for compiler compatibility

Review each custom hook in `J:\code\semantic\Semantic-UI-React\src\lib\hooks\`:

**`useEventCallback`**: This hook typically stores a callback in a ref and returns a stable function. The compiler cannot optimize through ref mutations. Verify the implementation is compatible:

```js
// Typical useEventCallback implementation
function useEventCallback(fn) {
  const ref = React.useRef(fn)
  useIsomorphicLayoutEffect(() => {
    ref.current = fn
  })
  return React.useCallback((...args) => ref.current(...args), [])
}
```

With the React Compiler, `useCallback` is unnecessary (the compiler handles it). However, `useEventCallback` serves a different purpose (stable identity across renders for event handlers used in effects). The compiler should correctly handle this pattern, but verify.

**`useAutoControlledValue`**: This hook manages controlled/uncontrolled component state. Verify it does not violate Rules of React (no mutation of state during render, no conditional hook calls).

**`useForceUpdate`**: This hook likely uses `useState` with a counter. Verify compatibility:

```js
function useForceUpdate() {
  const [, setState] = React.useState(0)
  return React.useCallback(() => setState(n => n + 1), [])
}
```

The `useCallback` here becomes unnecessary with the compiler but is harmless.

**`useMergedRefs`**: This hook merges multiple refs into one. Verify it handles the ref callback pattern correctly and does not read/write refs during render.

### 6. Add `babel-plugin-react-compiler` to the Babel configuration

Update `J:\code\semantic\Semantic-UI-React\.babel-preset.js`:

Add the compiler plugin at the BEGINNING of the plugins array (before other transforms):

```js
const plugins = [
  // React Compiler must run first to analyze original source
  'babel-plugin-react-compiler',
  '@babel/plugin-proposal-export-default-from',
  // ... rest of existing plugins
]
```

The compiler plugin must run before:
- `transform-react-handled-props` (which strips props)
- `transform-react-remove-prop-types` (which removes propTypes)
- `filter-imports` (which removes debug imports)
- `babel-plugin-lodash` (which transforms lodash imports)

### 7. Configure compiler options

The compiler supports configuration for opt-out and targeting:

```js
['babel-plugin-react-compiler', {
  // Target React 19 runtime
  runtimeModule: 'react/compiler-runtime',

  // Components to skip compilation (if any are incompatible)
  // compilationMode: 'infer', // default: compile everything that looks like a component

  // Environment configuration
  // enableAssumeHooksFollowRulesOfReact: true, // already validated by eslint
}]
```

### 8. Add opt-out directive for incompatible components

If any components cannot be made compiler-compatible (due to fundamental design constraints), add the `'use no memo'` directive at the top of those component files:

```js
'use no memo'

const SomeComponent = React.forwardRef(function SomeComponent(props, ref) {
  // ... component code that cannot be compiled
})
```

Document every opt-out with a comment explaining why the compiler cannot handle the component.

The likely candidates for opt-out are:
- `Transition` (if it uses timeouts/refs in complex patterns that confuse the compiler)
- `Portal` (if it uses direct DOM manipulation during render)
- Components using `@semantic-ui-react/event-stack` or `@fluentui/react-component-event-listener` (external libraries the compiler cannot analyze)

### 9. Remove manual memoization that the compiler handles

After the compiler is working, audit and remove unnecessary manual optimization:

- Remove `React.memo()` wrappers on any components (the compiler's fine-grained memoization is superior)
- Remove `useMemo()` calls that cache JSX elements or derived values (the compiler handles these)
- Remove `useCallback()` calls (the compiler handles stable references)
- **Keep** `useEventCallback()` because it serves a different purpose (stable identity for subscription callbacks, not just memoization)
- **Keep** `useMemo()` calls that perform expensive computations (sorting, filtering large arrays) -- the compiler will optimize these too, but explicit `useMemo` acts as documentation of intent

### 10. Benchmark performance before and after compiler

Create a benchmark suite or use the existing test infrastructure to measure:

- Re-render time for complex components (Dropdown with 1000 options, Table with 100 rows)
- Initial mount time for the full component set
- Memory usage during interaction (click, type, scroll)
- Bundle size change (the compiler adds a small runtime)

Record results in `J:\code\semantic\Semantic-UI-React\docs\react19\benchmarks\compiler-performance.md`.

### 11. Verify compiler output correctness

Run the full test suite (from Phase 10, Vitest) with the compiler enabled and verify:

- All tests pass with identical behavior
- No rendering differences (snapshot tests match)
- Event handler behavior is unchanged
- Controlled/uncontrolled component behavior is unchanged
- Transition animations work correctly
- Portal/Modal/Dimmer mounting/unmounting works correctly

### 12. Add CI check for compiler compatibility

Add a CI step (in Phase 48) that runs the React Compiler ESLint rule as a required check:

```yaml
- name: React Compiler Compatibility
  run: npx eslint --rule '{"react-compiler/react-compiler": "error"}' src/ --ext .js
```

This prevents future PRs from introducing compiler-incompatible code patterns.

---

## Files Affected

| File | Action |
|------|--------|
| `package.json` | MODIFY (add babel-plugin-react-compiler, eslint-plugin-react-compiler) |
| `.babel-preset.js` | MODIFY (add compiler plugin to pipeline) |
| `.eslintrc` (or `eslint.config.js`) | MODIFY (add react-compiler plugin and rule) |
| `src/lib/hooks/useEventCallback.js` | AUDIT (verify compiler compatibility) |
| `src/lib/hooks/useAutoControlledValue.js` | AUDIT (verify compiler compatibility) |
| `src/lib/hooks/useForceUpdate.js` | AUDIT (verify compiler compatibility) |
| `src/lib/hooks/useMergedRefs.js` | AUDIT (verify compiler compatibility) |
| Component files with violations | MODIFY (fix Rules of React violations) |
| Component files with `React.memo` | MODIFY (remove unnecessary wrappers) |
| Component files with `useMemo`/`useCallback` | MODIFY (remove unnecessary manual memoization) |

**Total: ~3-5 files modified for configuration, 0-20 component files modified for violations**

---

## Acceptance Criteria

- [ ] `babel-plugin-react-compiler` is installed and listed in `package.json` devDependencies
- [ ] `eslint-plugin-react-compiler` is installed and the `react-compiler/react-compiler` rule is set to `"error"`
- [ ] The React Compiler Babel plugin is in `.babel-preset.js` and runs before other transform plugins
- [ ] `npx eslint --rule '{"react-compiler/react-compiler": "error"}' src/` reports zero violations
- [ ] All components compile successfully with the React Compiler (no build errors)
- [ ] The full test suite passes with the compiler enabled
- [ ] No `React.memo()` wrappers remain on any component (unless documented as necessary)
- [ ] All custom hooks in `src/lib/hooks/` are verified compiler-compatible
- [ ] Any component with `'use no memo'` opt-out has a documented justification
- [ ] Performance benchmarks show no regression (and likely improvement) with the compiler
- [ ] Bundle size increase from the compiler runtime is documented and acceptable (typically < 5 KB gzipped)
- [ ] CI pipeline includes a React Compiler compatibility check

---

## Rollback Strategy

1. Remove `'babel-plugin-react-compiler'` from the plugins array in `.babel-preset.js`.
2. Remove `babel-plugin-react-compiler` and `eslint-plugin-react-compiler` from `package.json` devDependencies.
3. Remove the `react-compiler/react-compiler` ESLint rule.
4. Run `yarn install` to update the lockfile.
5. All component code changes made for compiler compatibility (fixing mutations, moving side effects) are improvements regardless and should NOT be reverted.

---

## Notes for AI Agents

1. **The React Compiler is a BUILD-TIME tool.** It does not add a runtime dependency to the library output. It transforms component code at compile time to include memoization instructions that React 19's runtime processes. The "compiler runtime" is part of React 19 itself, not a separate package.

2. **The compiler plugin MUST be the first Babel plugin in the pipeline.** It needs to analyze the original source code before other plugins transform it. If `transform-react-remove-prop-types` runs first, the compiler will not see the `propTypes` and may make incorrect assumptions. If `babel-plugin-lodash` runs first, the lodash imports will be transformed and the compiler may not recognize them as pure.

3. **`useEventCallback` is NOT the same as `useCallback`.** Do not remove `useEventCallback` calls. This hook provides a stable-identity callback whose implementation always reflects the latest closure. The compiler's memoization of `useCallback` achieves a different goal (skipping re-creation of the callback function). `useEventCallback` is specifically for event handlers passed to effects or child components that should not trigger re-subscriptions.

4. **The `Transition` component** (`J:\code\semantic\Semantic-UI-React\src\modules\Transition\Transition.js`) is currently a class component (line 32: `export default class Transition extends React.Component`). After Phase 17 converts it to a function component, it may have complex patterns (setTimeout, state machines, derived state from props) that the compiler struggles with. Test this component thoroughly.

5. **The `classNameBuilders` functions are pure.** `getKeyOnly`, `getValueAndKey`, `getKeyOrValueAndKey`, `getMultipleProp`, `getTextAlignProp`, `getVerticalAlignProp`, and `getWidthProp` in `J:\code\semantic\Semantic-UI-React\src\lib\classNameBuilders.js` are all pure functions (no side effects, deterministic output for given inputs). The compiler will correctly identify these as safe to memoize.

6. **`lodash` function calls may confuse the compiler.** Functions like `_.invoke(props, 'onSubmit', e, props)` (used in `J:\code\semantic\Semantic-UI-React\src\collections\Form\Form.js` line 47) involve dynamic property access and function invocation. The compiler may conservatively skip memoization for expressions involving `_.invoke`. After Phase 15 replaces `lodash` usage with native alternatives, this issue will be resolved.

7. **Do not configure `compilationMode: 'annotation'`** unless absolutely necessary. The default `'infer'` mode compiles all function components and hooks automatically. Using `'annotation'` mode would require adding `'use memo'` to every component file, which defeats the purpose.

8. **The compiler output includes `c()` calls** (cache function from `react/compiler-runtime`). These are tiny and do not significantly increase bundle size. The typical overhead is 2-5 KB gzipped for the entire library.

9. **Test with both development and production builds.** The compiler may behave differently with `NODE_ENV=development` (includes debug assertions) vs `NODE_ENV=production` (optimized output). Both must be tested.
