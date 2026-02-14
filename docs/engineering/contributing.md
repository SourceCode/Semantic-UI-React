# Contributing

> This is a summary of the engineering workflow. See the full [CONTRIBUTING.md](../../.github/CONTRIBUTING.md) for complete details.

## Branching Model

| Branch           | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `master`         | Release branch (releases only)             |
| `react19`        | Active development branch                  |
| Feature branches | Created from `react19`, merged back via PR |

## Commit Conventions

Follow [Angular Git Commit Guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines):

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

| Type       | Description                      |
| ---------- | -------------------------------- |
| `feat`     | New feature                      |
| `fix`      | Bug fix                          |
| `docs`     | Documentation only               |
| `style`    | Formatting (no logic change)     |
| `refactor` | Code change (not fix or feature) |
| `perf`     | Performance improvement          |
| `test`     | Adding/updating tests            |
| `chore`    | Build, CI, tooling changes       |

### Example

```
feat(Modal): add closeOnEscape prop

Adds a new `closeOnEscape` prop to Modal that controls whether pressing
Escape closes the modal. Defaults to `true` for backwards compatibility.

Closes #1234
```

## PR Checklist

- [ ] Branch created from `react19`
- [ ] Commit messages follow Angular convention
- [ ] `yarn lint` passes
- [ ] `yarn typecheck` passes
- [ ] `yarn test -- --run` passes
- [ ] New component has `isConformant()` test
- [ ] New props have TypeScript interface entries
- [ ] PR has exactly one label: `Breaking Change`, `New Feature`, `Bug Fix`, `Docs`, or `Internal`

## Code Style

### Formatting (Prettier)

| Setting         | Value    |
| --------------- | -------- |
| Single quotes   | Yes      |
| Semicolons      | No       |
| Print width     | 100      |
| Trailing commas | `all`    |
| Arrow parens    | `always` |

### Linting (ESLint 9)

Key enforced rules:

- React Hooks rules of hooks
- React Compiler compatibility
- No `Context.Provider` (use `<Context value={}>`)
- JSX accessibility rules (jsx-a11y)
- No unused variables
- Consistent returns

### Component Requirements

1. **Function components only** — no class components
2. **`displayName` required** — static property on every component
3. **TypeScript interfaces** — `StrictXProps` and `XProps` for every component
4. **Sub-components as statics** — `Parent.Child` pattern
5. **className built with helpers** — use `clsx` + `src/lib/classNameBuilders.js`
6. **Unhandled props spread** — use `getUnhandledProps()`
7. **`as` prop support** — use `getComponentType()`

## Review Expectations

- PRs reviewed within 48 hours
- At least one maintainer approval required
- CI must pass (lint, typecheck, test, build)
- Bundle size check must not show unexpected increases
- Breaking changes require `Breaking Change` label and MIGRATION.md update
