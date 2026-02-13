# Phase 32: Migrate Modal and Subcomponents (IE11 Legacy Removal)

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-32                                                              |
| **Title**      | Migrate Modal and Subcomponents (IE11 Legacy Removal)                 |
| **Stage**      | 6 -- Component Migration - Modules                                    |
| **Dependencies** | Phase 16 (TypeScript Infrastructure), Phase 17 (Hook Utilities), Phase 39 (Portal Addon Migration) |
| **Complexity** | High                                                                  |
| **Scope**      | Modal component with 5 subcomponents, utils directory, IE11 legacy code removal, TypeScript conversion |

---

## Objective

Convert the Modal module and all its subcomponents from JavaScript to TypeScript, and critically remove all IE11 legacy detection and positioning code. The current Modal contains `isLegacy()`, `getLegacyStyles()`, and `canFit()` utility functions along with corresponding state (`legacyStyles`, `legacy`) that exist solely for IE11 compatibility. Since React 19 does not support IE11, this code is dead weight. Replace the legacy JavaScript-based positioning with pure CSS flexbox centering. Ensure Modal's dependencies on Portal, Transition, and Dimmer are properly typed and integrated.

---

## Background

The Modal component (`src/modules/Modal/Modal.js`) is a complex functional component that uses `React.forwardRef` and manages open/close state via `useAutoControlledValue`. It renders through Portal for DOM placement and wraps content in a ModalDimmer.

The critical legacy code resides in two places:

1. **`src/modules/Modal/utils/index.js`** -- Contains three exported functions:
   - `canFit(modalRect)`: Determines if the modal fits the viewport without scrolling. Uses `window.innerHeight` and modal `DOMRect` calculations with hardcoded `OFFSET = 0` and `PADDING = 50`.
   - `getLegacyStyles(isFitted, centered, modalRect)`: Computes negative `marginTop` and `marginLeft` values for absolute centering -- the pre-flexbox IE11 approach.
   - `isLegacy()`: Returns `true` when `!window.ActiveXObject && 'ActiveXObject' in window` -- an IE11-specific detection pattern.

2. **`src/modules/Modal/Modal.js`** lines 62-101:
   - `const [legacyStyles, setLegacyStyles] = React.useState({})` -- state for IE11 margins
   - `const [legacy] = React.useState(() => isBrowser() && isLegacy())` -- one-time IE11 detection
   - `setPositionAndClassNames()` -- runs on `requestAnimationFrame` loop to continuously recalculate positioning. For non-legacy browsers, it only tracks `scrolling` state. The legacy branch calls `getLegacyStyles()`.
   - Line 95 contains a bug: `!shallowEqual(computedLegacyStyles, computedLegacyStyles)` compares the same variable to itself, meaning `setLegacyStyles` is never actually called. This confirms the legacy path is both dead and broken.
   - `getKeyOnly(legacy, 'legacy')` adds a `legacy` CSS class that is not needed for modern browsers.
   - `style={{ ...legacyStyles, ...style }}` spreads empty legacy styles into the element.

The Modal also depends on:
- **Portal** (`src/addons/Portal/Portal.js`) for rendering outside the component tree
- **ModalDimmer** (`src/modules/Modal/ModalDimmer.js`) for the overlay background, which uses `useClassNamesOnNode` to add body classes
- **eventStack** for document-level mousedown/click handling on the dimmer
- **Icon** shorthand for the close icon
- **ModalActions**, **ModalContent**, **ModalDescription**, **ModalHeader** as sub-components using `createShorthandFactory`

The ModalDimmer component sets `display: flex !important` via a `useEffect` on mount (line 42). This is the actual centering mechanism for modern browsers, not the legacy marginTop/marginLeft approach.

The `setPositionAndClassNames()` function runs in a continuous `requestAnimationFrame` loop (line 100) to track whether the modal fits the viewport (`canFit`) and toggle the `scrolling` state. After IE11 removal, this RAF loop is still needed for the scrolling detection, but can be simplified significantly.

---

## Detailed Tasks

### 1. Remove IE11 legacy utilities entirely

Delete the IE11-specific exports from `J:\code\semantic\Semantic-UI-React\src\modules\Modal\utils\index.js`:

- Remove the `getLegacyStyles` function (lines 44-50)
- Remove the `isLegacy` function (lines 53-54)
- Retain `canFit` as it serves a valid purpose for scroll detection
- Rename the file to `J:\code\semantic\Semantic-UI-React\src\modules\Modal\utils\index.ts`
- Add proper TypeScript types for the `canFit` function parameter and return value

### 2. Remove legacy state and detection from Modal component

In `J:\code\semantic\Semantic-UI-React\src\modules\Modal\Modal.js` (to become `Modal.tsx`):

- Remove `import { canFit, getLegacyStyles, isLegacy } from './utils'` and replace with `import { canFit } from './utils'`
- Remove `const [legacyStyles, setLegacyStyles] = React.useState({})` (line 63)
- Remove `const [legacy] = React.useState(() => isBrowser() && isLegacy())` (line 66)
- Remove `import shallowEqual from 'shallowequal'` (line 5) -- only used for the broken legacy comparison
- Simplify `setPositionAndClassNames()` to only compute `scrolling` state via `canFit`
- Remove `getKeyOnly(legacy, 'legacy')` from the className computation (line 183)
- Replace `style={{ ...legacyStyles, ...style }}` with `style={style}` (line 205)
- Remove the `shallowequal` dependency if no other module component uses it (verify across codebase)

### 3. Simplify the requestAnimationFrame loop

The current `setPositionAndClassNames` runs in a perpetual RAF loop. After removing legacy code, simplify it:

```typescript
const setPositionAndClassNames = () => {
  if (elementRef.current) {
    const rect = elementRef.current.getBoundingClientRect()
    setScrolling(!canFit(rect))
  }
  animationRequestId.current = requestAnimationFrame(setPositionAndClassNames)
}
```

Consider whether a `ResizeObserver` + scroll event listener would be more efficient than a perpetual RAF loop. The RAF loop runs ~60fps continuously while the modal is open, which is wasteful. A `ResizeObserver` on the modal element combined with a passive scroll listener on the window would fire only when dimensions actually change.

### 4. Convert Modal.js to Modal.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Modal\Modal.js` to `Modal.tsx`:

- Import existing types from `Modal.d.ts` or define inline interface `ModalProps`
- Type the component as `React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<HTMLDivElement>>`
- Type all internal refs: `elementRef` as `React.RefObject<HTMLDivElement>`, `dimmerRef` as `React.RefObject<HTMLDivElement>`, `animationRequestId` as `React.MutableRefObject<number | undefined>`, `latestDocumentMouseDownEvent` as `React.MutableRefObject<MouseEvent | null>`
- Type event handler parameters (`e: React.MouseEvent<HTMLElement>` or `MouseEvent` for document-level handlers)
- Type the `rest` and `portalProps` objects
- Replace `_.invoke(props, 'onClose', e, ...)` with proper typed callback invocations
- Convert PropTypes to TypeScript interface, retaining PropTypes for runtime validation during the migration period

### 5. Convert ModalDimmer.js to ModalDimmer.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalDimmer.js` to `ModalDimmer.tsx`:

- Define `ModalDimmerProps` interface matching the existing `ModalDimmer.d.ts`
- Type the `useClassNamesOnNode` call
- Type the ref and `style?.setProperty` call
- Retain the `createShorthandFactory` static method with proper typing

### 6. Convert ModalActions.js to ModalActions.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalActions.js` to `ModalActions.tsx`:

- Define `ModalActionsProps` interface
- Type the `onActionClick` callback
- Type the Button shorthand factory usage

### 7. Convert ModalContent.js to ModalContent.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalContent.js` to `ModalContent.tsx`:

- Define `ModalContentProps` interface
- Simple presentational component conversion

### 8. Convert ModalDescription.js to ModalDescription.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalDescription.js` to `ModalDescription.tsx`:

- Define `ModalDescriptionProps` interface
- Simple presentational component conversion

### 9. Convert ModalHeader.js to ModalHeader.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalHeader.js` to `ModalHeader.tsx`:

- Define `ModalHeaderProps` interface
- Simple presentational component conversion

### 10. Consolidate type definitions

Merge the separate `.d.ts` files into the `.tsx` source files:

- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Modal\Modal.d.ts` after merging types into `Modal.tsx`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalActions.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalContent.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalDescription.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalDimmer.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Modal\ModalHeader.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\modules\Modal\index.d.ts`
- Update `J:\code\semantic\Semantic-UI-React\src\modules\Modal\index.js` to `index.ts`

### 11. Update Modal tests

- Update test imports if file extensions changed
- Remove any tests that specifically test IE11 legacy behavior (`isLegacy`, `getLegacyStyles`)
- Add tests verifying that the `legacy` CSS class is no longer applied
- Ensure scrolling detection tests still pass
- Verify Modal opens/closes correctly with Portal
- Verify dimmer click-to-close behavior

### 12. Replace eventStack usage with native event listeners

The Modal currently uses the `eventStack` utility for document-level event handling (mousedown and click on the dimmer). Evaluate replacing this with direct `addEventListener`/`removeEventListener` in a `useEffect`, consistent with the pattern used in the Sticky component. The `eventStack` abstraction adds complexity without clear benefit for a single component's document listeners.

---

## Files Affected

| File | Action |
|------|--------|
| `src/modules/Modal/Modal.js` | RENAME to `.tsx`, MODIFY (remove legacy code, add types) |
| `src/modules/Modal/ModalActions.js` | RENAME to `.tsx`, MODIFY (add types) |
| `src/modules/Modal/ModalContent.js` | RENAME to `.tsx`, MODIFY (add types) |
| `src/modules/Modal/ModalDescription.js` | RENAME to `.tsx`, MODIFY (add types) |
| `src/modules/Modal/ModalDimmer.js` | RENAME to `.tsx`, MODIFY (add types) |
| `src/modules/Modal/ModalHeader.js` | RENAME to `.tsx`, MODIFY (add types) |
| `src/modules/Modal/utils/index.js` | RENAME to `.ts`, MODIFY (remove `isLegacy`, `getLegacyStyles`, add types) |
| `src/modules/Modal/Modal.d.ts` | DELETE (merged into `.tsx`) |
| `src/modules/Modal/ModalActions.d.ts` | DELETE |
| `src/modules/Modal/ModalContent.d.ts` | DELETE |
| `src/modules/Modal/ModalDescription.d.ts` | DELETE |
| `src/modules/Modal/ModalDimmer.d.ts` | DELETE |
| `src/modules/Modal/ModalHeader.d.ts` | DELETE |
| `src/modules/Modal/index.d.ts` | DELETE |
| `src/modules/Modal/index.js` | RENAME to `.ts` |

**Total: 8 files renamed/modified, 7 files deleted**

---

## Acceptance Criteria

- [ ] All IE11 legacy code is removed: `isLegacy()`, `getLegacyStyles()`, `legacyStyles` state, `legacy` state
- [ ] The `legacy` CSS class is no longer added to the Modal element
- [ ] `shallowequal` import is removed from Modal (if unused elsewhere)
- [ ] The broken self-comparison `!shallowEqual(computedLegacyStyles, computedLegacyStyles)` is gone
- [ ] Modal correctly centers vertically using CSS flexbox (via ModalDimmer's `display: flex !important`)
- [ ] Scrolling detection (`canFit`) still works: tall modals add the `scrolling` class
- [ ] Modal opens and closes correctly via Portal
- [ ] Dimmer click-to-close works
- [ ] Close icon works
- [ ] ModalActions `onActionClick` fires and closes the modal
- [ ] All 6 components compile as TypeScript without errors
- [ ] All existing Modal tests pass (minus removed IE11-specific tests)
- [ ] The `utils/index.ts` exports only `canFit`
- [ ] Type definitions are exported correctly for consumers
- [ ] No runtime regressions in modal sizing, scrolling, or dimmer behavior

---

## Rollback Strategy

1. All changes are file renames and content modifications tracked in git.
2. To rollback: `git checkout HEAD -- src/modules/Modal/`
3. The IE11 legacy code was already non-functional due to the self-comparison bug, so removing it has zero behavioral impact on any browser.
4. If the TypeScript conversion introduces issues, individual files can be reverted independently since subcomponents are self-contained.

---

## Notes for AI Agents

1. **The self-comparison bug on line 95 is critical context.** `!shallowEqual(computedLegacyStyles, computedLegacyStyles)` always returns `false`, meaning `setLegacyStyles` is never called, meaning `legacyStyles` is always `{}`. This proves the legacy code path has been dead for an unknown period. Removing it cannot cause regressions.

2. **Do not remove `canFit()`.** While `isLegacy()` and `getLegacyStyles()` are pure IE11 artifacts, `canFit()` is used by non-legacy code to determine if the modal needs the `scrolling` class. It must be preserved and typed.

3. **The requestAnimationFrame loop is a performance concern** but not a correctness issue. It runs continuously while the modal is open. If you replace it with ResizeObserver + scroll listener, ensure the scroll listener is passive and the ResizeObserver is disconnected on unmount. However, this is an optional optimization -- the RAF loop works correctly and changing it risks subtle timing differences.

4. **ModalDimmer's `display: flex !important` via useEffect** is the actual centering mechanism. Do not remove this. The IE11 legacy code existed because IE11 did not support this CSS approach. With IE11 gone, the flexbox centering is the sole positioning strategy.

5. **Portal dependency (Phase 39) may not be complete** when this phase starts. Modal uses Portal extensively but does not need Portal to be TypeScript-converted first. The Portal API is stable -- you can import it as-is and type the import with the existing `.d.ts` file. However, be aware that Portal uses `React.cloneElement` for triggers, which is flagged for update in Phase 18.

6. **The `eventStack` usage** (`eventStack.sub`/`eventStack.unsub`) is a library-internal abstraction over `addEventListener`. It supports event pooling and target scoping. During migration, you may keep it as-is or replace with direct DOM event listeners. If keeping it, ensure it is properly typed. The Sticky component already uses direct `addEventListener` as a reference pattern.

7. **The `eventPool` prop** is a string namespace for the eventStack. It defaults to `'Modal'`. If replacing eventStack with direct listeners, this prop becomes unnecessary but should be retained in the API for backward compatibility and deprecated.

8. **Type the subcomponent static properties carefully.** Modal has `Modal.Actions`, `Modal.Content`, etc. In TypeScript, these need to be declared on the component type. Use an intersection type: `ForwardRefComponent<ModalProps, HTMLDivElement> & { Actions: typeof ModalActions; ... }`.

9. **Execution order within this phase:** Start with Task 1 (utils cleanup) and Task 2 (legacy removal from Modal), since these are the highest-value changes. Then proceed with TypeScript conversions of subcomponents (Tasks 5-9) in parallel, as they are independent. Task 4 (Modal.tsx) should be last since it depends on the subcomponent types being available.
