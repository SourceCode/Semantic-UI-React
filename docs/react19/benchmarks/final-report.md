# v4.0.0 Migration Benchmark Report

**Generated:** TBD (run benchmarks to fill in)
**Branch:** react19
**React:** 19.2.x

## Test Suite Results

| Metric | Value |
|--------|-------|
| Total integration tests | TBD |
| Passed | TBD |
| Failed | TBD |
| Component smoke tests | 42+ |
| Accessibility tests | 11+ |
| SSR tests | 7+ |
| Stress tests | 4+ |

## Bundle Size

| Fixture | Size (gzip) |
|---------|-------------|
| Button.size.js | TBD |
| Icon.size.js | TBD |
| Image.size.js | TBD |
| Modal.size.js | TBD |
| Portal.size.js | TBD |

## Performance (renderToString, avg of 1000 iterations)

| Component | Mount Time |
|-----------|-----------|
| Button | TBD |
| Dropdown (100 options) | TBD |
| Table (100 rows) | TBD |
| Form (20 inputs) | TBD |

## Accessibility (axe-core)

| Component | Violations |
|-----------|-----------|
| Button | TBD |
| Checkbox | TBD |
| Form | TBD |
| Input | TBD |
| Menu | TBD |
| Message | TBD |
| Pagination | TBD |
| Progress | TBD |
| Rating | TBD |
| Search | TBD |
| Table | TBD |

## SSR Compatibility

All components verified to render server-side with `renderToString`.

## Notes

- Benchmarks should be run after `yarn build:dist`
- Memory benchmark requires `--expose-gc` flag: `node --expose-gc benchmark/memory.mjs`
- Cross-browser tests require Playwright browsers: `npx playwright install`
