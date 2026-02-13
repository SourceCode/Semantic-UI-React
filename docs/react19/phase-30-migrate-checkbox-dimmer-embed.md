# Phase 30: Migrate Checkbox, Dimmer, Embed

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Phase ID**   | 30                                           |
| **Title**      | Migrate Checkbox, Dimmer, Embed               |
| **Stage**      | 6 - Component Migration: Modules              |
| **Dependencies** | Phase 17 (Hooks: useAutoControlledValue, useIsomorphicLayoutEffect, useMergedRefs), Phase 35 (Transition -- for DimmerInner if it uses Transition) |
| **Complexity** | Medium                                       |
| **Scope**      | 6 components, 6 type definition files, 3 barrel indexes |

---

## Objective

Convert three module groups -- Checkbox (1 component), Dimmer (3 components), Embed (1 component) -- from JavaScript with PropTypes and `React.forwardRef` to native TypeScript with React 19.2 ref-as-prop semantics. These components share a common pattern of using `useAutoControlledValue` for managed state and have notable complexity in their event handling and DOM interaction. Checkbox in particular has intricate click/change/mouse event logic that must be preserved precisely.

---

## Background

### Checkbox (`src/modules/Checkbox/Checkbox.js`)

The most complex component in this phase. A single file with ~320 lines of logic. Key characteristics:

**State management**:
- Two `useAutoControlledValue` calls: one for `checked` (bool) and one for `indeterminate` (bool)
- Both support controlled (`checked`/`indeterminate` props), uncontrolled (`defaultChecked`/`defaultIndeterminate`), and initial state (`false`)

**Refs**:
- `inputRef = useMergedRefs(React.useRef(), ref)` -- merges the internal input ref with the forwarded ref
- `labelRef = React.useRef()` -- ref for the label element
- `isClickFromMouse = React.useRef()` -- tracks whether a click originated from a mouse event (vs keyboard)

**Layout effect**:
- `useIsomorphicLayoutEffect` sets `inputRef.current.indeterminate = !!indeterminate` on every render. The `indeterminate` property cannot be set via HTML attributes -- it must be set imperatively on the DOM node.

**Event handling complexity**:
- `handleChange(e)`: Guards with `canToggle()`, invokes `onChange` callback with toggled checked and false indeterminate, then sets both states
- `handleClick(e)`: Complex multi-path logic based on click origin (input vs label vs root):
  - Determines if click is on input (`inputRef.current.contains(e.target)`), label, or root
  - Skips `onClick` callback if label click will forward to input (when `id` is present)
  - Only triggers `handleChange` for non-forwarded clicks
  - Stops propagation when label click has id (prevents double-fire)
- `handleMouseDown(e)`: Calls `onMouseDown`, focuses input, calls `preventDefault` to maintain focus
- `handleMouseUp(e)`: Sets `isClickFromMouse.current = true`, calls `onMouseUp`
- `canToggle()`: Returns false if disabled, readOnly, or radio+checked

**Rendering**:
- Uses `partitionHTMLProps(unhandled, { htmlProps: htmlInputAttrs })` to split props between the hidden `<input>` and the wrapper
- Creates an empty `<label htmlFor={id} />` even when no label text (required by SUI CSS)
- Uses `React.cloneElement(labelElement, { ref: labelRef })` to attach the label ref -- **THIS IS A React.cloneElement USAGE THAT SHOULD BE EVALUATED FOR REPLACEMENT**

**React 19 consideration**: `React.cloneElement` is discouraged in React 19. The label ref attachment `React.cloneElement(labelElement, { ref: labelRef })` should be replaced with a direct ref callback or a wrapper element. However, since `createHTMLLabel` returns a React element, this requires careful handling.

### Dimmer Collection (3 components)

**Dimmer** (`src/modules/Dimmer/Dimmer.js`): Orchestrator component:
- When `page` prop is true, wraps `DimmerInner` in a `Portal` component
- Portal adds/removes `'dimmed'` and `'dimmable'` classes on `document.body`
- When not page dimmer, renders `DimmerInner` directly
- Has `createShorthandFactory` static
- Attaches `Dimmer.Dimmable = DimmerDimmable` and `Dimmer.Inner = DimmerInner`

**DimmerInner** (`src/modules/Dimmer/DimmerInner.js`): The actual dimmer implementation:
- Uses `useMergedRefs(ref, React.useRef())` for container ref
- Uses `useIsomorphicLayoutEffect` to set `display: flex !important` via `style.setProperty('display', 'flex', 'important')` when active, and removes it when inactive
- `handleClick`: Checks if click was inside content (`doesNodeContainClick(contentRef.current, e)`) -- if outside content, fires `onClickOutside`
- Uses `getVerticalAlignProp` for content alignment

**DimmerDimmable** (`src/modules/Dimmer/DimmerDimmable.js`): Simple presentational wrapper with `blurring` and `dimmed` boolean props.

### Embed (`src/modules/Embed/Embed.js`)

Single component with `useAutoControlledValue` for `active` state:
- Generates YouTube or Vimeo embed URLs from `source` + `id` props
- Supports custom `url` as alternative to source/id
- Supports `iframe` shorthand via `createHTMLIframe`
- Click handler activates the embed (`setActive(true)`)
- Renders placeholder image and play icon when inactive
- Uses `getKeyOnly` for active class, `aspectRatio` as bare class
- Icon defaults to `'video play'` when not specified

---

## Detailed Tasks

### Checkbox

#### 1. Convert Checkbox to TypeScript

**File**: `src/modules/Checkbox/Checkbox.js` -> `Checkbox.tsx`

1.1. Create `CheckboxProps` interface with all ~20 props:
```typescript
interface CheckboxProps {
  as?: React.ElementType
  checked?: boolean
  className?: string
  defaultChecked?: boolean
  defaultIndeterminate?: boolean
  disabled?: boolean
  fitted?: boolean
  id?: number | string
  indeterminate?: boolean
  label?: SemanticShorthandItem<HtmlLabelProps>
  name?: string
  onChange?: (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps & { checked: boolean; indeterminate: boolean }) => void
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: CheckboxProps & { checked: boolean; indeterminate: boolean }) => void
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>, data: CheckboxProps & { checked: boolean; indeterminate: boolean }) => void
  onMouseUp?: (event: React.MouseEvent<HTMLDivElement>, data: CheckboxProps & { checked: boolean; indeterminate: boolean }) => void
  radio?: boolean
  readOnly?: boolean
  slider?: boolean
  tabIndex?: number | string
  toggle?: boolean
  type?: 'checkbox' | 'radio'
  value?: string | number
}
```

1.2. Remove `React.forwardRef`. **However**, Checkbox has a special ref situation: the forwarded ref is merged with an internal ref via `useMergedRefs` and attached to the `<input>` element, NOT the root element. In React 19.2, accept `ref` as a prop and pass it to `useMergedRefs`:
```typescript
function Checkbox(props: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { ref, ...otherProps } = props
  const inputRef = useMergedRefs(React.useRef<HTMLInputElement>(null), ref)
  // ...
}
```

1.3. Remove PropTypes block entirely.

1.4. Remove `makeDebugger` usage (or retain for development -- it is a no-op in production).

1.5. Replace all `_.invoke(props, 'callback', e, data)` with `props.callback?.(e, data)`.

1.6. Replace `_.isNil(tabIndex)` with `tabIndex == null`.

1.7. Replace `_.isNil(label)` with `label == null`.

1.8. Replace `_.get(e, 'target.tagName')` with `(e?.target as HTMLElement)?.tagName`.

1.9. Replace `_.invoke(inputRef.current, 'contains', e.target)` with `inputRef.current?.contains(e.target as Node)`.

1.10. Replace `_.invoke(inputRef.current, 'focus')` with `inputRef.current?.focus()`.

1.11. **Address `React.cloneElement` for label ref**: Replace:
```javascript
{React.cloneElement(labelElement, { ref: labelRef })}
```
with a callback ref pattern or direct ref assignment. Options:
- Option A: Wrap the label in a span with the ref: `<span ref={labelRef}>{labelElement}</span>` -- but this changes the DOM structure.
- Option B: Use a ref callback on the label's parent and query for the label: less clean.
- Option C: Keep `cloneElement` for now with a TODO for future elimination -- this is pragmatic since it still works in React 19.
- **Recommended: Option C** for this phase. Add a `// TODO: Replace cloneElement with direct rendering in a future phase` comment.

1.12. Delete `src/modules/Checkbox/Checkbox.d.ts`.

### Dimmer Collection

#### 2. Convert DimmerDimmable to TypeScript

**File**: `src/modules/Dimmer/DimmerDimmable.js` -> `DimmerDimmable.tsx`

2.1. Create `DimmerDimmableProps` with `as`, `blurring`, `children`, `className`, `content`, `dimmed`.

2.2. Standard migration (remove forwardRef, PropTypes).

2.3. Delete `src/modules/Dimmer/DimmerDimmable.d.ts`.

#### 3. Convert DimmerInner to TypeScript

**File**: `src/modules/Dimmer/DimmerInner.js` -> `DimmerInner.tsx`

3.1. Create `DimmerInnerProps` interface:
```typescript
interface DimmerInnerProps {
  as?: React.ElementType
  active?: boolean
  children?: React.ReactNode
  className?: string
  content?: SemanticShorthandContent
  disabled?: boolean
  inverted?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: DimmerInnerProps) => void
  onClickOutside?: (event: React.MouseEvent<HTMLDivElement>, data: DimmerInnerProps) => void
  page?: boolean
  simple?: boolean
  verticalAlign?: 'bottom' | 'top'
}
```

3.2. Remove `React.forwardRef`. Accept `ref` as prop and pass to `useMergedRefs`:
```typescript
function DimmerInner(props: DimmerInnerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const containerRef = useMergedRefs(props.ref, React.useRef<HTMLDivElement>(null))
  // ...
}
```

3.3. Remove PropTypes.

3.4. Replace `_.invoke(props, 'onClick', e, props)` and `_.invoke(props, 'onClickOutside', e, props)` with null-safe calls.

3.5. Retain `useIsomorphicLayoutEffect` for the display style manipulation.

3.6. Retain `doesNodeContainClick` from lib.

3.7. Delete `src/modules/Dimmer/DimmerInner.d.ts`.

#### 4. Convert Dimmer to TypeScript

**File**: `src/modules/Dimmer/Dimmer.js` -> `Dimmer.tsx`

4.1. Create `DimmerProps` interface:
```typescript
interface DimmerProps {
  active?: boolean
  page?: boolean
}
```
Note: Dimmer passes all unhandled props through to DimmerInner, so the actual prop surface is DimmerInnerProps + DimmerProps.

4.2. Remove `React.forwardRef`. Accept `ref` as prop.

4.3. Remove PropTypes.

4.4. Retain Portal integration for page dimmers. Ensure `isBrowser()` check is preserved.

4.5. Attach statics: `Dimmer.Dimmable`, `Dimmer.Inner`.

4.6. Retain `createShorthandFactory` static.

4.7. Delete `src/modules/Dimmer/Dimmer.d.ts`.

#### 5. Update Dimmer Barrel Index

**File**: `src/modules/Dimmer/index.js` -> `index.ts`

5.1. Export all. Delete `index.d.ts`.

### Embed

#### 6. Convert Embed to TypeScript

**File**: `src/modules/Embed/Embed.js` -> `Embed.tsx`

6.1. Create `EmbedProps` interface:
```typescript
interface EmbedProps {
  as?: React.ElementType
  active?: boolean
  aspectRatio?: '4:3' | '16:9' | '21:9'
  autoplay?: boolean
  brandedUI?: boolean
  children?: React.ReactNode
  className?: string
  color?: string
  content?: SemanticShorthandContent
  defaultActive?: boolean
  hd?: boolean
  icon?: SemanticShorthandItem<IconProps>
  id?: string
  iframe?: SemanticShorthandItem<HtmlIframeProps>
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: EmbedProps & { active: boolean }) => void
  placeholder?: string
  source?: 'youtube' | 'vimeo'
  url?: string
}
```

6.2. Remove `React.forwardRef`. Accept `ref` as prop.

6.3. Remove PropTypes.

6.4. Retain `useAutoControlledValue` for `active` state.

6.5. Replace `_.invoke(props, 'onClick', e, ...)` with `props.onClick?.(e, ...)`.

6.6. Retain `Icon.create`, `createHTMLIframe`, `childrenUtils.isNil`.

6.7. Delete `src/modules/Embed/Embed.d.ts`.

#### 7. Update Checkbox and Embed Barrel Indexes

**Files**: `src/modules/Checkbox/index.js` -> `index.ts`, `src/modules/Embed/index.js` -> `index.ts`

7.1. Export all. Delete `index.d.ts` files.

### 8. Write RTL Tests

**File**: Create test files in `test/specs/modules/`

8.1. **Checkbox-test.tsx**:
- Test `ui checkbox` base className
- Test `checked`, `disabled`, `indeterminate`, `fitted`, `radio`, `read-only`, `slider`, `toggle` classes
- Test controlled checked state (prop changes reflected)
- Test uncontrolled checked toggle on click
- Test indeterminate state set imperatively on input DOM node
- Test `onChange` callback fires with toggled state
- Test `onClick` callback fires
- Test disabled checkbox does not toggle
- Test readOnly checkbox does not toggle
- Test radio checkbox does not uncheck when already checked
- Test `onMouseDown` focuses the input and calls preventDefault
- Test label click behavior with and without `id` prop
- Test tabIndex computation (custom, disabled=-1, default=0)
- Test hidden input receives correct HTML attributes
- Test ref attaches to the input element (not root)

8.2. **DimmerDimmable-test.tsx**: Test `dimmable` class, `blurring` and `dimmed` classes.

8.3. **DimmerInner-test.tsx**: Test `ui dimmer` class, `active transition visible` class when active, `inverted`/`page`/`simple` classes, display style manipulation via layout effect, `onClick` callback, `onClickOutside` fires when clicking outside content but inside dimmer, `verticalAlign` class.

8.4. **Dimmer-test.tsx**: Test renders DimmerInner directly when not page, test renders Portal + DimmerInner when page, test body class manipulation (`dimmed`, `dimmable`) on mount/unmount for page dimmers.

8.5. **Embed-test.tsx**: Test `ui embed` class, `active` class, `aspectRatio` class, click activates embed, YouTube URL generation with correct params, Vimeo URL generation, custom `url` prop, `iframe` shorthand, placeholder image rendering, icon rendering (default `video play`), `onClick` callback.

### 9. Remove Obsolete Files

9.1. Delete all 6 `.d.ts` files across Checkbox/, Dimmer/, Embed/.
9.2. Delete 3 `index.d.ts` files.

---

## Files Affected

| Action   | File Path                                                    |
| -------- | ------------------------------------------------------------ |
| Rename   | `src/modules/Checkbox/Checkbox.js` -> `.tsx`                 |
| Rename   | `src/modules/Checkbox/index.js` -> `.ts`                     |
| Rename   | `src/modules/Dimmer/Dimmer.js` -> `.tsx`                     |
| Rename   | `src/modules/Dimmer/DimmerDimmable.js` -> `.tsx`             |
| Rename   | `src/modules/Dimmer/DimmerInner.js` -> `.tsx`                |
| Rename   | `src/modules/Dimmer/index.js` -> `.ts`                       |
| Rename   | `src/modules/Embed/Embed.js` -> `.tsx`                       |
| Rename   | `src/modules/Embed/index.js` -> `.ts`                        |
| Delete   | `src/modules/Checkbox/Checkbox.d.ts`                         |
| Delete   | `src/modules/Checkbox/index.d.ts`                            |
| Delete   | `src/modules/Dimmer/Dimmer.d.ts`                             |
| Delete   | `src/modules/Dimmer/DimmerDimmable.d.ts`                     |
| Delete   | `src/modules/Dimmer/DimmerInner.d.ts`                        |
| Delete   | `src/modules/Dimmer/index.d.ts`                              |
| Delete   | `src/modules/Embed/Embed.d.ts`                               |
| Delete   | `src/modules/Embed/index.d.ts`                               |
| Create   | `test/specs/modules/Checkbox/Checkbox-test.tsx`              |
| Create   | `test/specs/modules/Dimmer/Dimmer-test.tsx`                  |
| Create   | `test/specs/modules/Dimmer/DimmerDimmable-test.tsx`          |
| Create   | `test/specs/modules/Dimmer/DimmerInner-test.tsx`             |
| Create   | `test/specs/modules/Embed/Embed-test.tsx`                    |

---

## Acceptance Criteria

- [ ] All 6 components compile with zero TypeScript errors
- [ ] No `React.forwardRef` wrappers remain -- ref is accepted as a regular prop
- [ ] No `PropTypes` imports remain
- [ ] No `.d.ts` declaration files remain in Checkbox/, Dimmer/, Embed/
- [ ] All components export their props interfaces as named type exports
- [ ] Checkbox `useAutoControlledValue` correctly manages `checked` and `indeterminate` states
- [ ] Checkbox `useIsomorphicLayoutEffect` correctly sets `input.indeterminate` on the DOM node
- [ ] Checkbox event handling preserves all click/change/mouse interaction paths including label-with-id edge case
- [ ] Checkbox ref attaches to the `<input>` element via `useMergedRefs`
- [ ] Checkbox creates an empty label when no label text is provided (required by SUI CSS)
- [ ] DimmerInner layout effect correctly toggles `display: flex !important` style
- [ ] DimmerInner `onClickOutside` only fires when clicking outside the content div but inside the dimmer
- [ ] Dimmer page mode correctly wraps in Portal and manages body classes
- [ ] Embed URL generation is correct for YouTube and Vimeo sources
- [ ] Embed `useAutoControlledValue` manages `active` state correctly
- [ ] All `createShorthandFactory` statics work
- [ ] Lodash usage is minimized
- [ ] RTL tests pass for all components
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

---

## Rollback Strategy

1. Revert all renamed `.tsx` files to `.js`.
2. Restore deleted `.d.ts` files.
3. Delete new test files.
4. These three module groups are independent. Checkbox can be rolled back without affecting Dimmer or Embed, and vice versa.

**Dependency note**: FormCheckbox (Phase 26) imports Checkbox. If Phase 30 is rolled back, ensure FormCheckbox still imports from the correct path. Since the barrel index re-exports, the import path should be stable.

---

## Notes for AI Agents

- **Checkbox is the hardest component in this phase.** Read the event handling logic very carefully. The `isClickFromMouse` ref is critical for distinguishing mouse clicks from keyboard activation. The label-click-with-id edge case prevents double-firing of onChange.

- **Checkbox ref targets the `<input>`, not the root.** This is unusual -- most SUIR components forward ref to the root element. Checkbox forwards to the hidden `<input>` because consumers need access to the form input for things like `input.focus()`, `input.checked`, etc. Preserve this behavior.

- **`useMergedRefs` in React 19.2**: With ref-as-prop, the external ref comes in as `props.ref`. You need to extract it from props and pass it to `useMergedRefs`. Example:
```typescript
function Checkbox({ ref, ...props }: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  const inputRef = useMergedRefs(React.useRef<HTMLInputElement>(null), ref)
```

- **`useIsomorphicLayoutEffect`**: This is `useLayoutEffect` on the client and `useEffect` on the server. It is used in both Checkbox (for indeterminate) and DimmerInner (for display style). Both usages are imperative DOM mutations that must happen synchronously before paint.

- **`partitionHTMLProps`**: Checkbox uses this to split unhandled props into HTML input attributes (for the `<input>`) and remaining props (for the wrapper). This utility must be available from the migrated lib.

- **`cloneElement` in Checkbox**: The `React.cloneElement(labelElement, { ref: labelRef })` line attaches a ref to the label created by `createHTMLLabel`. In React 19, `cloneElement` still works but is discouraged. For this phase, keep it with a TODO. A future enhancement could modify `createHTMLLabel` to accept a ref parameter directly.

- **DimmerInner's display style hack**: The `style.setProperty('display', 'flex', 'important')` is necessary because Semantic UI CSS uses `display: none !important` on inactive dimmers, which cannot be overridden with inline styles without the `!important` flag. This is a known CSS specificity workaround.

- **Embed URL encoding**: The YouTube and Vimeo URL builders use `encodeURIComponent(color)` and `&amp;` separators (HTML entities). These are rendered inside an iframe `src` attribute via `createHTMLIframe`, which handles the encoding correctly. Do not change the URL construction logic.

- **Dimmer's Portal dependency**: Dimmer imports `Portal` from `../../addons/Portal`. Portal may or may not be migrated at this point (depends on Phase ordering). If Portal is still in JS, the import works fine -- TypeScript can import from JS files. If Portal is already migrated, ensure the types match.

- **`doesNodeContainClick`**: Used by DimmerInner. This is a lib utility. Ensure it is available and typed from the Phase 15 migration.

- **`makeDebugger`**: Used by Checkbox. This creates a debug logger. It is a no-op in production. You may keep it or remove it. If keeping, ensure it is typed.
