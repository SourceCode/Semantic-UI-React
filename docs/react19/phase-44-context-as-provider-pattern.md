# Phase 44: Add Context as Provider Pattern

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-44                                                                 |
| **Title**        | Add Context as Provider Pattern (React 19)                               |
| **Stage**        | 9 -- New React 19 Features                                               |
| **Dependencies** | Phase 35 (Transition/Context migration), Phase 41 (ThemeProvider)        |
| **Complexity**   | Low                                                                      |
| **Scope**        | Context usage across all components, TypeScript types                    |

---

## Objective

Migrate all React Context usage from the `<Context.Provider value={}>` pattern to the new React 19 `<Context value={}>` pattern, where the Context object itself is used as the JSX element (the Provider). This is a small but important modernization that aligns with React 19's simplified Context API and removes the deprecated `.Provider` property usage.

---

## Background

### React 19 Context Change

In React 19, Context objects can be rendered directly as JSX providers:

```jsx
// React 18 (old pattern)
const MyContext = React.createContext(defaultValue)
<MyContext.Provider value={someValue}>
  {children}
</MyContext.Provider>

// React 19 (new pattern)
const MyContext = React.createContext(defaultValue)
<MyContext value={someValue}>
  {children}
</MyContext>
```

React 19 still supports `<Context.Provider>` for backward compatibility, but it is deprecated and will be removed in a future React version. The new pattern is simpler and treats the Context object itself as the provider component.

### Current Context Usage in the Codebase

As of v3.0.0-beta.2, the Semantic-UI-React codebase has minimal direct Context usage. A grep for `createContext` and `Context.Provider` reveals:

1. **No `createContext` calls in `src/`**: The current codebase does not use React Context directly in the component source. Context may be introduced by:
   - Phase 35 (Transition refactoring may introduce a TransitionContext)
   - Phase 41 (ThemeProvider creates a ThemeContext)

2. **External packages that use Context**: The `@fluentui/react-component-event-listener` and `@semantic-ui-react/event-stack` packages may use Context internally, but those are external dependencies and not subject to this migration.

3. **Documentation site**: The docs site at `J:\code\semantic\Semantic-UI-React\docs\src\` may use React Context for app-level state (theme, sidebar state, etc.). These should also be migrated.

### Post-Phase 35 and Phase 41 Context Usage

After Phase 35 and Phase 41 complete, the following Context instances will exist:

1. **ThemeContext** (from Phase 41): Created in `J:\code\semantic\Semantic-UI-React\src\addons\ThemeProvider\ThemeProvider.js`. If Phase 41 is executed with awareness of this phase, it should already use the new pattern. If not, it must be migrated here.

2. **TransitionContext** (potential, from Phase 35): If the Transition component refactoring introduces a context for parent-child communication between `TransitionGroup` and `Transition`, it must use the new pattern.

3. **Any future Contexts**: This phase establishes the pattern and lint rule to ensure all future Context usage follows the React 19 pattern.

---

## Detailed Tasks

### 1. Inventory all Context usage in the codebase

Search the entire codebase for Context patterns:

```bash
# Search for createContext
grep -rn "createContext" src/ docs/src/

# Search for Context.Provider
grep -rn "\.Provider" src/ docs/src/

# Search for useContext
grep -rn "useContext" src/ docs/src/
```

Document every Context instance found, noting:
- Where it is created (`createContext` call)
- Where it is provided (`<Context.Provider>` or `<Context>`)
- Where it is consumed (`useContext` call)
- Which component tree it scopes

### 2. Migrate ThemeContext in ThemeProvider

If the ThemeProvider created in Phase 41 uses the old pattern, update `J:\code\semantic\Semantic-UI-React\src\addons\ThemeProvider\ThemeProvider.js`:

**Before (old pattern):**
```jsx
return (
  <ThemeContext.Provider value={contextValue}>
    <ElementType {...rest} ref={ref} data-sui-theme={currentTheme} style={style}>
      {children}
    </ElementType>
  </ThemeContext.Provider>
)
```

**After (React 19 pattern):**
```jsx
return (
  <ThemeContext value={contextValue}>
    <ElementType {...rest} ref={ref} data-sui-theme={currentTheme} style={style}>
      {children}
    </ElementType>
  </ThemeContext>
)
```

### 3. Migrate TransitionContext (if created in Phase 35)

If Phase 35 creates a TransitionContext for communication between `TransitionGroup` and its children, update the provider usage in `J:\code\semantic\Semantic-UI-React\src\modules\Transition\TransitionGroup.js` (post-Phase 35 migration):

**Before:**
```jsx
<TransitionContext.Provider value={{ animation, duration, directional }}>
  {wrappedChildren}
</TransitionContext.Provider>
```

**After:**
```jsx
<TransitionContext value={{ animation, duration, directional }}>
  {wrappedChildren}
</TransitionContext>
```

### 4. Migrate any documentation site Context usage

Audit the documentation site at `J:\code\semantic\Semantic-UI-React\docs\src\` for Context usage. Common patterns to look for:

- `J:\code\semantic\Semantic-UI-React\docs\src\App.js` -- may use Context for sidebar state
- `J:\code\semantic\Semantic-UI-React\docs\src\components\` -- component documentation viewers may use Context
- `J:\code\semantic\Semantic-UI-React\docs\src\layouts\` -- layout components may provide Context

Migrate all instances from `<Context.Provider>` to `<Context>`.

### 5. Update TypeScript types for Context usage

React 19's TypeScript types update the `Context` type to include JSX intrinsic element behavior. Verify that the TypeScript declarations reflect this:

In `J:\code\semantic\Semantic-UI-React\src\addons\ThemeProvider\ThemeProvider.d.ts`:

```typescript
import * as React from 'react'

export interface ThemeContextValue {
  theme: string
  setTheme: (theme: string) => void
}

export const ThemeContext: React.Context<ThemeContextValue>
```

With React 19's types (`@types/react` 19.x), `React.Context<T>` is automatically usable as a JSX element that accepts a `value` prop. No special typing is needed beyond the standard `React.Context<T>` type.

### 6. Add ESLint rule to prevent old Context.Provider pattern

Configure an ESLint rule (custom or from `eslint-plugin-react`) to warn or error on usage of `.Provider`:

Option A -- Use `eslint-plugin-react` if it provides a rule for this in its React 19 support.

Option B -- Add a custom ESLint rule or `no-restricted-syntax` configuration:

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "MemberExpression[property.name='Provider']",
        "message": "Use <Context value={}> instead of <Context.Provider value={}>. See React 19 migration guide."
      }
    ]
  }
}
```

This is an aggressive rule -- it catches ALL `.Provider` access, which may have false positives for non-Context usage of the word "Provider". Scope it to JSX elements if possible:

```json
{
  "selector": "JSXMemberExpression[property.name='Provider']",
  "message": "Use <Context value={}> instead of <Context.Provider value={}>. React 19 deprecates Context.Provider."
}
```

### 7. Document the Context pattern for contributors

Add a note to the contributing guide or coding conventions documentation explaining:

- All Context providers must use `<Context value={}>`, not `<Context.Provider value={}>`
- The `Context.Consumer` render-prop pattern is also deprecated; use `useContext` instead
- Example of correct Context usage in the library

---

## Files Affected

| File | Action |
|------|--------|
| `src/addons/ThemeProvider/ThemeProvider.js` | MODIFY (if using old pattern from Phase 41) |
| `src/modules/Transition/TransitionGroup.js` | MODIFY (if Phase 35 creates TransitionContext) |
| `docs/src/**/*.js` (documentation site) | AUDIT and MODIFY (any Context.Provider usage) |
| `.eslintrc` (or `eslint.config.js`) | MODIFY (add no-restricted-syntax rule for .Provider) |
| `src/addons/ThemeProvider/ThemeProvider.d.ts` | AUDIT (verify types work with React 19) |

**Total: 2-5 files modified**

---

## Acceptance Criteria

- [ ] Zero instances of `<Context.Provider>` exist in `src/` directory
- [ ] Zero instances of `<Context.Provider>` exist in `docs/src/` directory
- [ ] All Context providers use the `<Context value={}>` pattern
- [ ] ESLint rule prevents new usage of `Context.Provider` in JSX
- [ ] TypeScript types compile correctly with the new Context pattern
- [ ] `useContext` consumers continue to receive correct values from the new provider pattern
- [ ] All tests pass with the new Context provider pattern
- [ ] No `Context.Consumer` render-prop usage exists (use `useContext` hook instead)

---

## Rollback Strategy

1. Replace `<Context value={}>` with `<Context.Provider value={}>` in all modified files.
2. Remove the ESLint `no-restricted-syntax` rule for `.Provider`.
3. React 19 still supports the old pattern, so rollback is purely cosmetic and does not affect functionality.

This is a very low-risk change. React 19 maintains full backward compatibility with `Context.Provider`. The migration is forward-looking -- preventing usage of a pattern that will be removed in React 20+.

---

## Notes for AI Agents

1. **This is one of the simplest phases.** The total number of Context instances in the library is very small (likely 1-3 after Phase 35 and 41). The main value of this phase is establishing the pattern and lint rule for the future.

2. **The order of Phase 41 and Phase 44 matters.** If Phase 41 (ThemeProvider) is executed first, the ThemeProvider will be created with whichever pattern the developer uses. Phase 44 then corrects it. If Phase 44 guidance is available when Phase 41 is executed, Phase 41 should create the ThemeProvider with the new pattern from the start, making Phase 44's ThemeProvider task a no-op.

3. **The `<Context value={}>` pattern requires React 19.** If the library needs to support React 18 during a transition period, this change breaks backward compatibility. Verify that the `peerDependencies` in `package.json` has been updated to `"react": "^19.0.0"` (from Phase 50) before or concurrently with this phase.

4. **`Context.Consumer` is also deprecated in React 19.** If any code uses the render-prop consumer pattern (`<MyContext.Consumer>{value => ...}</MyContext.Consumer>`), replace it with the `useContext` hook. This pattern is unlikely in the main library (which uses hooks) but may exist in the documentation site examples.

5. **The ESLint rule using `JSXMemberExpression[property.name='Provider']`** will catch patterns like `<Foo.Provider>` where `Foo` is not a Context. If this causes false positives, restrict the rule to specific Context variable names or use a more targeted approach.

6. **When searching for Context usage**, also check for indirect patterns:
   - A variable aliased from `createContext`: `const Ctx = React.createContext(null)` then `<Ctx.Provider>`
   - Re-exported contexts: A context created in one file and the `.Provider` used in another file
   - Third-party libraries that accept a `Provider` component as a prop

7. **This phase has zero impact on the CSS architecture.** It is purely a React API modernization. No CSS files are affected.
