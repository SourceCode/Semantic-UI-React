# Integrations

## Runtime Dependencies

| Package                  | Version | Purpose                                          |
| ------------------------ | ------- | ------------------------------------------------ |
| `@babel/runtime`         | ^7.x    | Babel helper deduplication                       |
| `@floating-ui/react-dom` | ^2.x    | Popup/tooltip positioning (replaced Popper.js)   |
| `clsx`                   | ^2.x    | className concatenation                          |
| `lodash`                 | ^4.x    | Utility functions (CJS builds)                   |
| `lodash-es`              | ^4.x    | Utility functions (ESM builds, auto-transformed) |
| `react-is`               | ^19.x   | Component type detection                         |

### Dependency Governance

- **No new runtime dependencies** without explicit approval
- The lodash→lodash-es transform is handled automatically by the Rollup build via `babel-plugin-transform-rename-import`
- `debug` is stripped in production builds via `babel-plugin-transform-remove-debug`

## Development Tooling

| Tool                      | Version | Configuration File                       |
| ------------------------- | ------- | ---------------------------------------- |
| **Rollup**                | 4.x     | `rollup.config.mjs`                      |
| **Babel**                 | 7.x     | `.babel-preset.js`                       |
| **Vitest**                | 3.x     | `vitest.config.mjs`                      |
| **ESLint**                | 9.x     | `eslint.config.mjs`                      |
| **Prettier**              | 3.x     | `.prettierrc.json`                       |
| **TypeScript**            | 5.9     | `tsconfig.json`, `tsconfig.build.json`   |
| **React Compiler**        | —       | Via ESLint plugin in `eslint.config.mjs` |
| **React Testing Library** | ^16.x   | Configured in `vitest.config.mjs`        |
| **jsdom**                 | —       | Vitest environment                       |
| **Codecov**               | —       | `codecov.yml`                            |
| **release-it**            | —       | `.release-it.json`                       |
| **size-limit**            | —       | `package.json` `size-limit` config       |

## CI / GitHub Actions

| Workflow    | File                               | Trigger                |
| ----------- | ---------------------------------- | ---------------------- |
| CI Pipeline | `.github/workflows/ci.yml`         | Push to any branch, PR |
| PR Health   | `.github/workflows/pr-health.yml`  | PR opened/labeled      |
| Size Limit  | `.github/workflows/size-limit.yml` | PR                     |

## Documentation Site (Astro)

| Item      | Detail                              |
| --------- | ----------------------------------- |
| Framework | Astro with React islands            |
| Location  | `docs/`                             |
| Examples  | `docs/src/examples/` (1,127+ files) |
| Config    | `docs/astro.config.mjs`             |
| Deploy    | Vercel (`docs/vercel.json`)         |

## Local Testing Strategy

All integrations are tested locally:

- **No external services required** — no databases, APIs, or third-party accounts
- **jsdom** simulates browser environment for unit tests
- **React Testing Library** provides DOM-based component testing
- Test mocking is done via Vitest's built-in `vi.mock()` and `vi.fn()`
