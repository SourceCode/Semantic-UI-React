# Troubleshooting

## Common Development Issues

### Build Failures

| Issue                            | Cause                                       | Resolution                                                           |
| -------------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| `Cannot find module` in build    | Missing dependency or incorrect import path | Run `yarn install`, verify import paths use `src/` not `dist/`       |
| Rollup warns about circular deps | Component imports forming a cycle           | Check barrel exports in `src/index.js`, avoid cross-category imports |
| Type definition errors           | `.d.ts` files not matching source           | Rebuild with `yarn build`, verify `tsconfig.build.json` includes     |

### Test Failures

| Issue                                  | Cause                                           | Resolution                                                                    |
| -------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `console.error should never be called` | Component emitting unexpected React warning     | Fix the warning source; do not suppress unless it's a known DOM nesting issue |
| `Cannot find module 'src/...'`         | Path alias not resolving                        | Verify `vitest.config.mjs` alias configuration matches `tsconfig.json` paths  |
| Flaky transition tests                 | Animation timing sensitivity                    | Increase timeout or mock `requestAnimationFrame`                              |
| React concurrent rendering error       | DOM nesting violation in `rendersChildren` test | Already suppressed in `test/setup.js` — if new, add to allowlist              |

### Linting Issues

| Issue                           | Cause                                          | Resolution                                                                          |
| ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `react-compiler` rule errors    | Component violates React Compiler requirements | Review component for mutable refs in render, dynamic hooks, or non-stable callbacks |
| `Context.Provider` ESLint error | Using deprecated `<Context.Provider>`          | Change to `<Context value={}>` (React 19 pattern)                                   |
| Prettier conflicts              | Formatting doesn't match `.prettierrc.json`    | Run `yarn prettier --write .` or configure editor auto-format                       |

## Debugging Tips

### Running a Single Test File

```bash
yarn test -- --run test/specs/elements/Button/Button-test.js
```

### Debugging with Console Output

Tests override `console.*` methods. To temporarily allow console output in a test:

```js
it('debug test', () => {
  const originalLog = console.log
  console.log = originalLog
  console.log('debug info')
  console.log = vi.fn()
})
```

### Inspecting Rendered DOM

```js
import { render, screen } from '@testing-library/react'

it('debug render', () => {
  render(<MyComponent />)
  screen.debug() // Prints DOM to console (must allow console.log)
})
```

### Vitest UI

```bash
yarn test -- --ui
```

Opens an interactive browser-based test runner at `http://localhost:51204`.

## Reset Procedures

```bash
# Full clean reinstall
rm -rf node_modules dist .yarn/cache
yarn install

# Rebuild from scratch
yarn build

# Reset test cache
rm -rf node_modules/.vitest
```
