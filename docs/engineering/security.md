# Security

## Overview

Semantic UI React is a **client-side UI component library**. It has no server, no authentication system, no database, and no secrets. Security considerations focus on dependency management, build integrity, and safe coding practices.

## Dependency Management

### Runtime Dependencies (6 total)

All runtime dependencies are well-established, actively maintained packages:

| Package                  | Risk Level | Notes                             |
| ------------------------ | ---------- | --------------------------------- |
| `@babel/runtime`         | Low        | Babel project, widely used        |
| `@floating-ui/react-dom` | Low        | Actively maintained by core team  |
| `clsx`                   | Low        | Minimal footprint, widely used    |
| `lodash` / `lodash-es`   | Low        | Industry standard utility library |
| `react-is`               | Low        | Official React package            |

### Dependency Governance Rules

- **No new runtime dependencies** without explicit approval
- Dependencies must be reviewed for: maintenance status, bundle size impact, license compatibility (MIT)
- Prefer built-in browser APIs or inline utilities over new packages
- The `shallowequal` package was replaced with an inline `src/lib/shallowEqual.js` utility as a reference implementation

### Audit

```bash
# Check for known vulnerabilities
yarn npm audit

# Interactive audit resolution
yarn npm audit --fix
```

## Build Integrity

### CI Verification

All builds are verified in CI before merge:

1. **Lint**: ESLint + Prettier check (no runtime code quality issues)
2. **TypeScript**: `tsc --noEmit` (type safety)
3. **Tests**: Full Vitest suite in jsdom (behavioral correctness)
4. **React Compiler**: Validates component compatibility
5. **Build**: Rollup build completes without errors

### Bundle Size Monitoring

Pull requests are checked with `size-limit` to detect unexpected bundle size increases. Configuration is in `package.json`:

```json
{
  "size-limit": [{ "path": "dist/esm/semantic-ui-react.esm.js" }]
}
```

## Safe Coding Practices

### XSS Prevention

- Components render user content via React's JSX, which auto-escapes by default
- No `dangerouslySetInnerHTML` usage in library components
- Content props (`content`, `header`, `description`) are rendered as React nodes, not raw HTML

### `as` Prop Safety

The `as` prop allows rendering components as different elements. This is safe because:

- It only accepts `React.ElementType` (strings like `"a"` or React components)
- It does not accept raw HTML strings
- Component authors control which elements are valid via TypeScript

### No Credentials

- No API keys, tokens, or secrets anywhere in the codebase
- CI secrets (npm token, Codecov token) are in GitHub Actions secrets only
- No `.env` files are required or committed

## License

MIT License — see [LICENSE](../../LICENSE) in the repository root.
