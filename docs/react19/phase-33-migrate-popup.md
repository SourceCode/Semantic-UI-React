# Phase 33: Migrate Popup and Subcomponents

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-33                                                              |
| **Title**      | Migrate Popup and Subcomponents                                       |
| **Stage**      | 6 -- Component Migration - Modules                                    |
| **Dependencies** | Phase 17 (Hook Utilities), Phase 39 (Portal Addon Migration)        |
| **Complexity** | High                                                                  |
| **Scope**      | Popup component with 2 subcomponents, lib/ directory (positioning logic), react-popper dependency evaluation |

---

## Objective

Convert the Popup module and all its subcomponents from JavaScript to TypeScript. Evaluate and execute the replacement of `react-popper` (v2) and `@popperjs/core` with `@floating-ui/react`, the modern successor positioning library. Remove the `createReferenceProxy` abstraction that exists solely to work around Popper.js ref timing issues. Simplify the positioning architecture to reduce the number of refs (currently 4: `elementRef`, `positionUpdate`, `triggerRef`, `zIndexWasSynced`) and eliminate the custom `syncZIndex` Popper modifier.

---

## Background

The Popup component (`src/modules/Popup/Popup.js`) is a complex functional component using `React.forwardRef` that renders positioned content relative to a trigger element. It depends on:

1. **`react-popper`** (v2) -- Provides the `<Popper>` render-prop component used at line 306-313. This wraps `@popperjs/core` and provides `placement`, `ref`, `update`, and `style` through a render function.

2. **`@popperjs/core`** -- The underlying positioning engine. Popup uses its modifier system extensively:
   - `arrow` (disabled)
   - `eventListeners` (controlled by `eventsEnabled` prop)
   - `flip` (controlled by `pinned` prop)
   - `preventOverflow` (controlled by `offset` prop)
   - `offset` (configurable via prop)
   - `syncZIndex` -- A custom modifier (lines 262-286) that reads the computed `z-index` from the popup's inner element and applies it to the Popper wrapper div. This exists because SUIR wraps the popup content in an additional `div` for Popper positioning (line 231), and z-index needs to be synced from the inner `.ui.popup` to the outer wrapper.

3. **`createReferenceProxy`** (`src/modules/Popup/lib/createReferenceProxy.js`) -- A `ReferenceProxy` class that wraps either a ref object or a DOM node to provide the `getBoundingClientRect()`, `clientWidth`, `clientHeight`, `parentNode`, and `contextElement` interface that Popper.js expects. This exists because Popper.js v2 does not natively accept React ref objects -- it needs a "virtual element" or real DOM node. The proxy uses `_.memoize` to maintain referential stability.

4. **`src/modules/Popup/lib/positions.js`** -- Maps SUIR position strings (e.g., `'top left'`) to Popper.js placement strings (e.g., `'top-start'`) and vice versa via `positionsMapping` and `placementMapping`.

5. **Portal** (`src/addons/Portal/Portal.js`) -- Popup renders its content through Portal, which handles trigger event binding (hover, click, focus) and mounts the popup content in a portal DOM node.

The component has 4 `useRef` calls: `elementRef` (merged with forwarded ref), `positionUpdate` (stores the Popper `update()` function), `triggerRef` (ref to the trigger element), and `zIndexWasSynced` (tracks whether z-index sync has occurred).

The `usePositioningEffect` custom hook (lines 101-109) calls `positionUpdate.current()` when `popperDependencies` change (shallow comparison via `usePrevious`). This forces Popper to recalculate position when external dependencies change.

Popup also contains a wrapping `div` pattern (line 231) using `createHTMLDivision` for the Popper positioning target. This wrapper is necessary because SUI CSS defines margins on `.ui.popup` that interfere with Popper's positioning calculations. The wrapper receives `display: flex` styling (line 238) and the Popper-computed `style`.

The `TODO` comment at line 349 indicates an unimplemented `fluid` prop: `// TODO: implement the Popup fluid layout`.

---

## Detailed Tasks

### 1. Evaluate react-popper replacement with @floating-ui/react

`react-popper` (v2) wraps `@popperjs/core` which has been succeeded by `@floating-ui/dom` and `@floating-ui/react`. The Floating UI library is the official successor from the same author (Popper.js author renamed/rewrote the project).

Benefits of migrating to `@floating-ui/react`:
- Native React hook API (`useFloating`) instead of render-prop `<Popper>` component
- Built-in support for React refs -- eliminates the need for `createReferenceProxy`
- Smaller bundle size (~600B vs ~3KB for @popperjs/core)
- Active development and React 19 compatibility
- Middleware system (replacement for modifiers) is simpler and more composable

Create a proof-of-concept replacement:
- Replace `<Popper modifiers={...} placement={...} referenceElement={...}>` with `useFloating({ placement, middleware, strategy })`
- Replace the custom `syncZIndex` modifier with a Floating UI middleware or post-computation effect
- Replace `eventListeners`, `flip`, `preventOverflow`, `offset` modifiers with equivalent Floating UI middleware: `flip()`, `shift()`, `offset()`, `autoUpdate()`

If `@floating-ui/react` is adopted:
- Remove `react-popper` from dependencies
- Remove `@popperjs/core` from dependencies
- Add `@floating-ui/react` and `@floating-ui/dom` to dependencies
- Delete `src/modules/Popup/lib/createReferenceProxy.js` entirely

If `@floating-ui/react` is NOT adopted (risk too high for v3.0.0-beta):
- Keep `react-popper` and `@popperjs/core`
- Still convert to TypeScript
- Still remove `createReferenceProxy` if possible by using Popper's `referenceElement` with a direct DOM node

### 2. Delete createReferenceProxy.js

`J:\code\semantic\Semantic-UI-React\src\modules\Popup\lib\createReferenceProxy.js` contains:

- A `ReferenceProxy` class that wraps a ref to provide `getBoundingClientRect()`, `clientWidth`, `clientHeight`, `parentNode`, `contextElement`
- Uses `_.memoize` to maintain referential stability

This entire abstraction exists because Popper.js v2 does not accept React ref objects directly. With `@floating-ui/react`, refs are natively supported. Even without Floating UI, the proxy can be eliminated by reading `triggerRef.current` at the time of Popper initialization rather than wrapping it.

Delete the file and update the import in Popup.

### 3. Convert positions.js to positions.ts

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Popup\lib\positions.js` to `positions.ts`:

- Type `positionsMapping` as `Record<string, Placement>` (where `Placement` comes from either `@popperjs/core` or `@floating-ui/dom`)
- Type `positions` as `string[]`
- Type `placementMapping` as the inverse record
- Remove lodash dependency (`_.keys`, `_.invert`) -- use `Object.keys()` and a simple inversion function

### 4. Convert Popup.js to Popup.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Popup\Popup.js` to `Popup.tsx`:

- Define `PopupProps` interface from the existing `Popup.d.ts` type definitions
- Type all refs: `elementRef`, `positionUpdate`, `triggerRef`, `zIndexWasSynced`
- Type the `renderBody` parameter (Popper's render function argument or Floating UI's `floatingStyles`/`refs`)
- Type `getPortalProps` return value
- Type `partitionPortalProps` return value
- Replace `_.isArray`, `_.includes`, `_.reduce`, `_.pick`, `_.isNil`, `_.isUndefined` with native equivalents where straightforward
- Handle the `context` prop typing (can be a ref object or DOM node)

If using `@floating-ui/react`:
- Replace the `<Popper>` render prop with `useFloating()` hook
- Replace `modifiers` array with `middleware` array
- Replace `positionFixed ? 'fixed' : null` strategy with `strategy: positionFixed ? 'fixed' : 'absolute'`
- Use `autoUpdate` from `@floating-ui/dom` for the equivalent of `eventsEnabled`

### 5. Simplify the z-index synchronization

The custom `syncZIndex` Popper modifier (lines 262-286) exists because:
- SUIR wraps popup content in an outer `div` for Popper positioning
- The z-index is defined on the inner `.ui.popup` via CSS
- The outer `div` needs the same z-index for proper stacking

Options:
- With `@floating-ui/react`: Apply z-index directly to the floating element via `floatingStyles` -- no sync needed if the floating element IS the `.ui.popup`
- Without migration: Simplify by reading `getComputedStyle` once after mount instead of as a Popper modifier phase
- Consider restructuring so the Popper/Floating positioning target is the `.ui.popup` element directly, eliminating the wrapper `div` and the z-index problem entirely

### 6. Convert PopupContent.js to PopupContent.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Popup\PopupContent.js` to `PopupContent.tsx`:

- Define `PopupContentProps` interface
- Simple presentational component -- straightforward conversion
- Retains `createShorthandFactory` static

### 7. Convert PopupHeader.js to PopupHeader.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Popup\PopupHeader.js` to `PopupHeader.tsx`:

- Define `PopupHeaderProps` interface
- Simple presentational component -- straightforward conversion
- Retains `createShorthandFactory` static

### 8. Consolidate type definitions

- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Popup\Popup.d.ts` after merging types into `Popup.tsx`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Popup\PopupContent.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Popup\PopupHeader.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Popup\index.d.ts`
- Rename `J:\code\semantic\Semantic-UI-React\src\modules\Popup\index.js` to `index.ts`

### 9. Update Popup tests

- Update test imports for new file extensions
- If `@floating-ui/react` is adopted, update any tests that mock or assert on Popper.js-specific behavior
- Test all `on` modes: `'hover'`, `'click'`, `'focus'`, and combinations
- Test `pinned`, `offset`, `positionFixed`, `eventsEnabled` props
- Test `context` prop with both ref objects and DOM nodes
- Test `popperDependencies` triggering repositioning
- Test `hideOnScroll` behavior
- Verify z-index is correctly applied

### 10. Address the unimplemented `fluid` prop

The `TODO` at line 349 (`// TODO: implement the Popup fluid layout`) indicates the `fluid` prop was planned but never implemented. Either:
- Implement it (a fluid popup takes the full width of its offset container)
- Remove the TODO comment and document that `fluid` is not supported
- Add it to a backlog for post-migration implementation

---

## Files Affected

| File | Action |
|------|--------|
| `src/modules/Popup/Popup.js` | RENAME to `.tsx`, MODIFY (major refactor) |
| `src/modules/Popup/PopupContent.js` | RENAME to `.tsx`, MODIFY (add types) |
| `src/modules/Popup/PopupHeader.js` | RENAME to `.tsx`, MODIFY (add types) |
| `src/modules/Popup/lib/createReferenceProxy.js` | DELETE |
| `src/modules/Popup/lib/positions.js` | RENAME to `.ts`, MODIFY (add types, remove lodash) |
| `src/modules/Popup/Popup.d.ts` | DELETE (merged into `.tsx`) |
| `src/modules/Popup/PopupContent.d.ts` | DELETE |
| `src/modules/Popup/PopupHeader.d.ts` | DELETE |
| `src/modules/Popup/index.d.ts` | DELETE |
| `src/modules/Popup/index.js` | RENAME to `.ts` |
| `package.json` | MODIFY (swap `react-popper`/`@popperjs/core` for `@floating-ui/react` if adopted) |

**Total: 5 files renamed/modified, 5 files deleted, 1 file potentially modified**

---

## Acceptance Criteria

- [ ] Popup positions correctly in all 8 positions: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right, left-center, right-center
- [ ] `createReferenceProxy.js` is deleted
- [ ] `positions.ts` uses no lodash imports
- [ ] Hover trigger: popup opens on mouseenter, closes on mouseleave with correct delays
- [ ] Click trigger: popup toggles on click, closes on document click
- [ ] Focus trigger: popup opens on focus, closes on blur
- [ ] Combined triggers (default `['click', 'hover']`) work correctly
- [ ] `pinned` prop prevents automatic repositioning
- [ ] `offset` prop applies correct skidding/distance
- [ ] `positionFixed` uses fixed positioning strategy
- [ ] `eventsEnabled` prop controls scroll/resize repositioning
- [ ] `context` prop works with both ref objects and DOM nodes
- [ ] `popperDependencies` changes trigger repositioning
- [ ] `hideOnScroll` closes the popup on page scroll
- [ ] `hoverable` prop allows mousing from trigger to popup without closing
- [ ] z-index is correctly applied (no layering issues)
- [ ] All 3 components compile as TypeScript without errors
- [ ] All existing Popup tests pass
- [ ] No increase in bundle size (decrease expected if moving to Floating UI)

---

## Rollback Strategy

1. All changes are tracked in git. To rollback: `git checkout HEAD -- src/modules/Popup/`
2. If `@floating-ui/react` is adopted and causes issues, revert `package.json` dependency changes and restore `react-popper`/`@popperjs/core`.
3. The `createReferenceProxy.js` deletion is safe to rollback independently since it only affects Popup.
4. The positioning library swap is the highest-risk change. Test thoroughly before committing. Consider a feature branch for the Floating UI migration specifically.

---

## Notes for AI Agents

1. **The react-popper to @floating-ui/react migration is the most impactful decision in this phase.** If the migration is attempted, it changes the positioning API fundamentally. The `<Popper>` render-prop component becomes the `useFloating()` hook. The `modifiers` array becomes a `middleware` array. The `referenceElement` prop becomes a `refs.setReference` callback ref. Make this decision early and commit to one path.

2. **If keeping react-popper**, the TypeScript conversion is still valuable but less dramatic. Focus on typing the existing code and removing `createReferenceProxy` by computing the reference element at call time: `const referenceElement = context ? (isRefObject(context) ? context.current : context) : triggerRef.current`.

3. **The `syncZIndex` custom modifier** is a maintenance burden. With Floating UI, you can apply z-index via a simple `useEffect` after positioning. With Popper, consider moving it to a `useEffect` that runs after mount instead of a Popper phase callback.

4. **The positions.js mapping** between SUIR position names and Popper placement names must be preserved regardless of which positioning library is used. Floating UI uses the same placement strings as Popper (`'top-start'`, `'bottom-end'`, etc.), so the mapping works for both.

5. **Do not remove the wrapper `div`** pattern (created by `createHTMLDivision` at line 231) unless you are certain the positioning library can handle SUI CSS margins directly. The wrapper exists specifically because `.ui.popup` has CSS margins that interfere with positioning calculations. Test without the wrapper before removing it.

6. **The `eventsEnabled` prop name** maps to Popper's `eventListeners` modifier. In Floating UI, the equivalent is whether `autoUpdate` is active. If migrating, this prop's implementation changes but its API should remain the same.

7. **Performance note:** The current `usePositioningEffect` hook uses `shallowEqual` (via `usePrevious`) to determine when to call `positionUpdate.current()`. With Floating UI's `autoUpdate`, this manual effect may be unnecessary as auto-update handles resize/scroll/mutation detection natively.

8. **The commented-out `fluid` prop** (line 349) is a product gap, not a migration blocker. Do not implement it in this phase unless explicitly requested. Document it as a known TODO.

9. **Portal dependency:** Popup passes many props to Portal (`onClose`, `onMount`, `onOpen`, `onUnmount`, `trigger`, `triggerRef`, `hideOnScroll`, plus all the `openOn*`/`closeOn*` props). Ensure the Portal types from Phase 39 are available or use the existing `.d.ts` types.

10. **Lodash usage in Popup.js is heavy:** `_.isArray`, `_.includes`, `_.reduce`, `_.pick`, `_.isNil`, `_.isUndefined`, `_.invoke`, `_.without`, `_.get`. Replace with native equivalents where safe: `Array.isArray`, `array.includes`, `Object.entries().reduce()`, etc. This reduces lodash coupling and improves tree-shaking.
