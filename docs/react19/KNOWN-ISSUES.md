# Known Issues - React 19 Migration

**Project:** Semantic-UI-React v3.0.0
**Last Updated:** 2026-02-13

---

## Issue Log

Issues discovered during migration that cannot be resolved within the current phase are tracked here.

| Issue ID | Phase Discovered | Description | Severity | Workaround | Resolution Phase | Status |
|----------|-----------------|-------------|----------|------------|-----------------|--------|
| KI-001 | 03 | `@wojtekmaj/enzyme-adapter-react-18` does not exist on npm. Using `@cfaester/enzyme-adapter-react-18` instead; may not fully support React 19. | Medium | `@cfaester/enzyme-adapter-react-18@^0.8.0` | 09 (Replace Enzyme with RTL) | Resolved (Phase 09/10): Enzyme removed entirely, replaced with RTL + Vitest |
| KI-002 | 03 | React 19 no longer ships UMD bundles. Karma config updated to remove UMD script includes. Tests may need webpack externals strategy update. | Medium | Removed UMD file references from `karma.conf.babel.js` | 10 (Migrate to Vitest) | Resolved (Phase 06/10): Karma removed, Vitest uses jsdom, Rollup produces browser ESM instead of UMD |
| KI-003 | 03 | `@babel/plugin-syntax-dynamic-import` not found after Yarn 4 migration. | Low | Resolved: removed from `.babel-preset.js` in Phase 5 | 05 | Resolved |
| KI-004 | 05 | UMD webpack build fails: webpack 4 parser can't handle `??` in Babel output. | Medium | CommonJS and ES builds work fine. | 06 | Resolved (Phase 06): Webpack removed, Rollup produces browser ESM bundle |
| KI-005 | 05 | `babel-loader` kept at v8 because v9 requires webpack 5. | Low | Use babel-loader ^8.4.0 | 06 | Resolved (Phase 06): webpack + babel-loader removed, Rollup uses @rollup/plugin-babel |
| KI-006 | 05 | `babel-plugin-lodash` emits deprecation warning: `isModuleDeclaration` has been deprecated. | Low | Cosmetic only; builds complete successfully. | N/A | Open |
| KI-007 | 05 | ESLint 7.x crashes on Node.js 20+ due to `v8-compile-cache` ESM compatibility issue. | Medium | ESLint must be upgraded to v8+ | 07 | Resolved (Phase 07): ESLint 9.x with flat config |
| KI-008 | 04 | `yarn tsd:test` fails because gulp CLI cannot load `gulpfile.mjs` on Node 20+. | Medium | Run `tsc` directly | 06/07 | Resolved (Phase 06): Gulp removed, tsd:test runs tsc directly |
| KI-009 | 09/10 | 188 of 189 test files still use Chai/Sinon assertion API and need manual rewriting to Vitest expect + vi.fn() | Medium | Vitest infrastructure works; individual test files are pending conversion | 19+ (per-component phases) | Open |
| KI-010 | 13 | `babel-plugin-transform-react-handled-props` and `babel-plugin-transform-react-remove-prop-types` removed. Components now use static `handledProps` arrays instead of build-time extraction from propTypes. | Low | N/A - this is the intended React 19 approach | N/A | Resolved |
| KI-011 | 15 | `ForwardRefComponent<P,T>` type alias in `generic.d.ts` changed from `React.ForwardRefExoticComponent` to `React.FunctionComponent`. All 157 `.d.ts` files keep using the alias. | Low | Type alias provides backward compatibility for any consumer code | N/A | Resolved |
| KI-012 | 13 | ESLint shows 1 pre-existing error in Breadcrumb.js (`no-constant-binary-expression`) and 8 warnings (alt-text, react-hooks/exhaustive-deps). These predate the migration. | Low | Not blocking; fix during component migration phases | 19+ | Open |

---

## Severity Levels

- **Blocker** - Prevents the current phase from completing; must be resolved immediately
- **High** - Significant impact on functionality or developer experience; resolve within the current stage
- **Medium** - Noticeable impact but has a viable workaround; can be deferred to a later phase
- **Low** - Minor inconvenience; resolve when convenient
