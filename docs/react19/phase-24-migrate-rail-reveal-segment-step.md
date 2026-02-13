# Phase 24: Migrate Rail, Reveal, Segment, Step and Subcomponents

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| **Phase ID**    | 24                                                 |
| **Stage**       | 4 - Component Migration (Elements)                 |
| **Dependencies**| Phase 15 (Ref Handling Modernization)              |
| **Complexity**  | Medium                                             |
| **Scope**       | 4 component families (11 component files, 11 type definition files, 4 index file pairs) |

---

## Objective

Convert Rail, Reveal (with RevealContent), Segment (with SegmentGroup, SegmentInline), and Step (with StepContent, StepDescription, StepGroup, StepTitle) from JavaScript with PropTypes and `React.forwardRef` to TypeScript with React 19 patterns. This phase completes the migration of all Element-category components, bringing the `src/elements/` directory to full TypeScript with React 19 ref handling.

---

## Background

### Rail (1 file, ~86 lines)
- Simple presentational component. Renders as a sidebar rail.
- `position` is a **required** prop (`'left' | 'right'`). This is one of the few required props in the library.
- Boolean class toggles: `attached`, `dividing`, `internal`.
- `close` prop: `boolean | 'very'`.
- `size` excludes `'medium'`.
- No shorthand factory. No sub-components. No event handlers.

### Reveal (2 files: Reveal, RevealContent)
- **Reveal.js** (~77 lines): Wrapper for reveal effect. `animated` prop controls the animation type. Boolean toggles: `active`, `disabled`, `instant`.
- **RevealContent.js**: Simple wrapper that adds `visible` or `hidden` class. No shorthand factory.
- Sub-component: `Reveal.Content = RevealContent`.
- No event handlers. No shorthand factories.

### Segment (3 files: Segment, SegmentGroup, SegmentInline)
- **Segment.js** (~163 lines): Content grouping component. Many class toggles: `attached`, `basic`, `circular`, `clearing`, `color`, `compact`, `disabled`, `floated`, `inverted`, `loading`, `padded`, `placeholder`, `piled`, `raised`, `secondary`, `stacked`, `tertiary`, `textAlign`, `vertical`.
- **SegmentGroup.js**: Groups segments together. Accepts `compact`, `horizontal`, `piled`, `raised`, `size`, `stacked` props. No shorthand factory.
- **SegmentInline.js**: Inline segment wrapper. Simple component.
- Sub-components: `Segment.Group = SegmentGroup`, `Segment.Inline = SegmentInline`.
- `size` excludes `'medium'` (uses `_.without(SUI.SIZES, 'medium')`).
- `textAlign` excludes `'justified'` (uses `_.without(SUI.TEXT_ALIGNMENTS, 'justified')`).
- No event handlers. No shorthand factories.

### Step (5 files: Step, StepContent, StepDescription, StepGroup, StepTitle)
- **Step.js** (~146 lines): Most complex component in this phase. Uses `useEventCallback` for click handling. Has `onClick` handler that changes default element type to `<a>`. Boolean class toggles: `active`, `completed`, `disabled`, `link`. Accepts `icon` shorthand (renders via `Icon.create`). Accepts `description` and `title` shorthand (renders via `StepContent.create`).
- **StepContent.js**: Wrapper. Renders `StepTitle.create(title)` and `StepDescription.create(description)`. Has a shorthand factory.
- **StepDescription.js**: Simple wrapper. Has a shorthand factory.
- **StepTitle.js**: Simple wrapper. Has a shorthand factory.
- **StepGroup.js** (~124 lines): Groups steps. Accepts `items` shorthand array (maps through `Step.create(item)`). Has `ordered`, `fluid`, `size`, `stackable`, `unstackable`, `vertical`, `widths`, `attached` props. Uses `getWidthProp` and `numberToWordMap`.
- Sub-components: `Step.Content`, `Step.Description`, `Step.Group`, `Step.Title`.
- External dependencies: `Icon` (Phase 21) for step icon shorthand.

---

## Detailed Tasks

### Task 24.1 -- Convert Rail.js to Rail.tsx

**File:** `src/elements/Rail/Rail.js` -> `src/elements/Rail/Rail.tsx`

1. Rename to `.tsx`.
2. Define `RailProps` interface:
   ```typescript
   export interface RailProps extends StrictRailProps {
     [key: string]: any
   }
   export interface StrictRailProps {
     as?: React.ElementType
     attached?: boolean
     children?: React.ReactNode
     className?: string
     close?: boolean | 'very'
     content?: SemanticShorthandContent
     dividing?: boolean
     internal?: boolean
     position: 'left' | 'right'  // REQUIRED
     size?: Exclude<SemanticSIZES, 'medium'>
   }
   ```
   Note: `position` is **not optional** -- it uses `PropTypes.oneOf(SUI.FLOATS).isRequired` in the current code.
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes.
5. The `_.without(SUI.SIZES, 'medium')` is only used in PropTypes, not at runtime. Remove the lodash import if it was only used for this.
6. Delete `Rail.d.ts`.
7. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 24.2 -- Convert RevealContent.js to RevealContent.tsx

**File:** `src/elements/Reveal/RevealContent.js` -> `src/elements/Reveal/RevealContent.tsx`

1. Rename to `.tsx`.
2. Define `RevealContentProps` interface:
   ```typescript
   export interface RevealContentProps extends StrictRevealContentProps {
     [key: string]: any
   }
   export interface StrictRevealContentProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     hidden?: boolean
     visible?: boolean
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `RevealContent.d.ts`.

### Task 24.3 -- Convert Reveal.js to Reveal.tsx

**File:** `src/elements/Reveal/Reveal.js` -> `src/elements/Reveal/Reveal.tsx`

1. Rename to `.tsx`.
2. Define `RevealProps` interface:
   ```typescript
   export interface RevealProps extends StrictRevealProps {
     [key: string]: any
   }
   export interface StrictRevealProps {
     as?: React.ElementType
     active?: boolean
     animated?: 'fade' | 'small fade' | 'move' | 'move right' | 'move up' | 'move down' | 'rotate' | 'rotate left'
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     disabled?: boolean
     instant?: boolean
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Preserve `Reveal.Content = RevealContent`.
5. Delete `Reveal.d.ts`.
6. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 24.4 -- Convert SegmentInline.js to SegmentInline.tsx

**File:** `src/elements/Segment/SegmentInline.js` -> `src/elements/Segment/SegmentInline.tsx`

1. Rename to `.tsx`.
2. Define `SegmentInlineProps` interface:
   ```typescript
   export interface SegmentInlineProps extends StrictSegmentInlineProps {
     [key: string]: any
   }
   export interface StrictSegmentInlineProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `SegmentInline.d.ts`.

### Task 24.5 -- Convert SegmentGroup.js to SegmentGroup.tsx

**File:** `src/elements/Segment/SegmentGroup.js` -> `src/elements/Segment/SegmentGroup.tsx`

1. Rename to `.tsx`.
2. Define `SegmentGroupProps` interface:
   ```typescript
   export interface SegmentGroupProps extends StrictSegmentGroupProps {
     [key: string]: any
   }
   export interface StrictSegmentGroupProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     compact?: boolean
     content?: SemanticShorthandContent
     horizontal?: boolean
     piled?: boolean
     raised?: boolean
     size?: Exclude<SemanticSIZES, 'medium'>
     stacked?: boolean
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `SegmentGroup.d.ts`.

### Task 24.6 -- Convert Segment.js to Segment.tsx

**File:** `src/elements/Segment/Segment.js` -> `src/elements/Segment/Segment.tsx`

1. Rename to `.tsx`.
2. Define `SegmentProps` interface:
   ```typescript
   export interface SegmentProps extends StrictSegmentProps {
     [key: string]: any
   }
   export interface StrictSegmentProps {
     as?: React.ElementType
     attached?: boolean | 'top' | 'bottom'
     basic?: boolean
     children?: React.ReactNode
     circular?: boolean
     className?: string
     clearing?: boolean
     color?: SemanticCOLORS
     compact?: boolean
     content?: SemanticShorthandContent
     disabled?: boolean
     floated?: SemanticFLOATS
     inverted?: boolean
     loading?: boolean
     padded?: boolean | 'very'
     placeholder?: boolean
     piled?: boolean
     raised?: boolean
     secondary?: boolean
     size?: Exclude<SemanticSIZES, 'medium'>
     stacked?: boolean
     tertiary?: boolean
     textAlign?: Exclude<SemanticTEXTALIGNMENTS, 'justified'>
     vertical?: boolean
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes. Remove lodash import (only used for `_.without` in PropTypes).
5. Preserve static properties:
   ```typescript
   Segment.Group = SegmentGroup
   Segment.Inline = SegmentInline
   ```
6. Delete `Segment.d.ts`.
7. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 24.7 -- Convert StepDescription.js to StepDescription.tsx

**File:** `src/elements/Step/StepDescription.js` -> `src/elements/Step/StepDescription.tsx`

1. Rename to `.tsx`.
2. Define `StepDescriptionProps` interface.
3. Remove `React.forwardRef` and PropTypes.
4. Preserve shorthand factory: `StepDescription.create`.
5. Delete `StepDescription.d.ts`.

### Task 24.8 -- Convert StepTitle.js to StepTitle.tsx

**File:** `src/elements/Step/StepTitle.js` -> `src/elements/Step/StepTitle.tsx`

1. Rename to `.tsx`.
2. Define `StepTitleProps` interface.
3. Remove `React.forwardRef` and PropTypes.
4. Preserve shorthand factory: `StepTitle.create`.
5. Delete `StepTitle.d.ts`.

### Task 24.9 -- Convert StepContent.js to StepContent.tsx

**File:** `src/elements/Step/StepContent.js` -> `src/elements/Step/StepContent.tsx`

1. Rename to `.tsx`.
2. Define `StepContentProps` interface:
   ```typescript
   export interface StepContentProps extends StrictStepContentProps {
     [key: string]: any
   }
   export interface StrictStepContentProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     description?: SemanticShorthandItem<StepDescriptionProps>
     title?: SemanticShorthandItem<StepTitleProps>
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Preserve shorthand factory: `StepContent.create`.
5. StepContent renders `StepTitle.create(title)` and `StepDescription.create(description)`. These should now reference the `.tsx` versions.
6. Delete `StepContent.d.ts`.

### Task 24.10 -- Convert Step.js to Step.tsx

**File:** `src/elements/Step/Step.js` -> `src/elements/Step/Step.tsx`

1. Rename to `.tsx`.
2. Define `StepProps` interface:
   ```typescript
   export interface StepProps extends StrictStepProps {
     [key: string]: any
   }
   export interface StrictStepProps {
     as?: React.ElementType
     active?: boolean
     children?: React.ReactNode
     className?: string
     completed?: boolean
     content?: SemanticShorthandContent
     description?: SemanticShorthandItem<StepDescriptionProps>
     disabled?: boolean
     href?: string
     icon?: SemanticShorthandItem<IconProps>
     link?: boolean
     onClick?: (event: React.MouseEvent<HTMLElement>, data: StepProps) => void
     ordered?: boolean
     title?: SemanticShorthandItem<StepTitleProps>
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes.
5. Preserve `useEventCallback` for click handling with disabled guard.
6. Preserve `getComponentType` with `getDefault` that returns `'a'` when `onClick` is set.
7. Preserve the three render paths: children, content, and icon+StepContent shorthand.
8. Preserve static properties:
   ```typescript
   Step.Content = StepContent
   Step.Description = StepDescription
   Step.Group = StepGroup
   Step.Title = StepTitle
   ```
9. Preserve shorthand factory: `Step.create = createShorthandFactory(Step, (content) => ({ content }))`.
10. Delete `Step.d.ts`.

### Task 24.11 -- Convert StepGroup.js to StepGroup.tsx

**File:** `src/elements/Step/StepGroup.js` -> `src/elements/Step/StepGroup.tsx`

1. Rename to `.tsx`.
2. Define `StepGroupProps` interface:
   ```typescript
   export interface StepGroupProps extends StrictStepGroupProps {
     [key: string]: any
   }
   export interface StrictStepGroupProps {
     as?: React.ElementType
     attached?: boolean | 'top' | 'bottom'
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     fluid?: boolean
     items?: SemanticShorthandCollection<StepProps>
     ordered?: boolean
     size?: Exclude<SemanticSIZES, 'medium'>
     stackable?: 'tablet'
     unstackable?: boolean
     vertical?: boolean
     widths?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight'
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. The `numberMap` variable at module level:
   ```js
   const numberMap = _.pickBy(numberToWordMap, (val, key) => key <= 8)
   ```
   This is only used in PropTypes to define the `widths` allowed values. In TypeScript, the allowed values are expressed in the type union. However, `numberMap` may be used by `getWidthProp` at runtime. Check if `getWidthProp` still needs it. If not, remove the lodash import and `numberMap` variable.
5. Preserve the three render paths: children, content, items (shorthand array via `Step.create(item)`).
6. Delete `StepGroup.d.ts`.

### Task 24.12 -- Update index files

**Step index:**
- `src/elements/Step/index.js` -> `src/elements/Step/index.ts`
- Delete `src/elements/Step/index.d.ts`
- Export Step default and all sub-component prop types.

**Rail, Reveal, Segment indexes:** Same pattern.

### Task 24.13 -- Write RTL tests

1. **Rail tests:**
   - Renders with `ui rail` classes
   - `position` (required) adds `left` or `right` class
   - `attached`, `dividing`, `internal` boolean classes
   - `close` boolean and `close="very"` classes
   - `size` class (excluding medium)
   - Ref forwarding

2. **Reveal tests:**
   - Renders with `ui reveal` classes
   - `animated` prop adds animation type class (e.g., `fade`, `move right`)
   - `active`, `disabled`, `instant` boolean classes
   - `Reveal.Content` static property accessible
   - Ref forwarding

3. **RevealContent tests:** `visible` and `hidden` boolean classes.

4. **Segment tests:**
   - Renders with `ui segment` classes
   - All boolean class toggles (basic, circular, clearing, compact, disabled, inverted, loading, placeholder, piled, raised, secondary, stacked, tertiary, vertical)
   - `attached` with boolean and string values
   - `color` adds color class
   - `floated` adds floated class
   - `padded` boolean and `padded="very"` classes
   - `textAlign` adds text alignment class (excluding justified)
   - `Segment.Group` and `Segment.Inline` static properties
   - Ref forwarding

5. **SegmentGroup tests:** `compact`, `horizontal`, `piled`, `raised`, `size`, `stacked` classes.

6. **SegmentInline tests:** Renders with inline class.

7. **Step tests:**
   - Renders with `step` class
   - `active`, `completed`, `disabled`, `link` boolean classes
   - `onClick` fires with props; disabled prevents onClick
   - Default element type is `<a>` when `onClick` is set, `<div>` otherwise
   - `href` is passed to the element
   - Icon shorthand renders via `Icon.create`
   - `description` and `title` shorthand render via `StepContent.create`
   - Static properties: `Step.Content`, `Step.Description`, `Step.Group`, `Step.Title`
   - `Step.create` shorthand factory works

8. **StepGroup tests:**
   - Renders with `ui steps` classes
   - `ordered`, `fluid`, `unstackable`, `vertical` boolean classes
   - `attached` with boolean and string values
   - `stackable="tablet"` class
   - `items` shorthand renders Step components
   - `widths` produces correct width class
   - `size` class (excluding medium)

9. **StepContent, StepDescription, StepTitle tests:** Render with correct classes, shorthand factories work.

---

## Files Affected

| File | Action |
|------|--------|
| `src/elements/Rail/Rail.js` | Rename to `.tsx`, convert |
| `src/elements/Rail/Rail.d.ts` | Delete |
| `src/elements/Rail/index.js` | Rename to `.ts` |
| `src/elements/Rail/index.d.ts` | Delete |
| `src/elements/Reveal/Reveal.js` | Rename to `.tsx`, convert |
| `src/elements/Reveal/Reveal.d.ts` | Delete |
| `src/elements/Reveal/RevealContent.js` | Rename to `.tsx`, convert |
| `src/elements/Reveal/RevealContent.d.ts` | Delete |
| `src/elements/Reveal/index.js` | Rename to `.ts` |
| `src/elements/Reveal/index.d.ts` | Delete |
| `src/elements/Segment/Segment.js` | Rename to `.tsx`, convert |
| `src/elements/Segment/Segment.d.ts` | Delete |
| `src/elements/Segment/SegmentGroup.js` | Rename to `.tsx`, convert |
| `src/elements/Segment/SegmentGroup.d.ts` | Delete |
| `src/elements/Segment/SegmentInline.js` | Rename to `.tsx`, convert |
| `src/elements/Segment/SegmentInline.d.ts` | Delete |
| `src/elements/Segment/index.js` | Rename to `.ts` |
| `src/elements/Segment/index.d.ts` | Delete |
| `src/elements/Step/Step.js` | Rename to `.tsx`, convert |
| `src/elements/Step/Step.d.ts` | Delete |
| `src/elements/Step/StepContent.js` | Rename to `.tsx`, convert |
| `src/elements/Step/StepContent.d.ts` | Delete |
| `src/elements/Step/StepDescription.js` | Rename to `.tsx`, convert |
| `src/elements/Step/StepDescription.d.ts` | Delete |
| `src/elements/Step/StepGroup.js` | Rename to `.tsx`, convert |
| `src/elements/Step/StepGroup.d.ts` | Delete |
| `src/elements/Step/StepTitle.js` | Rename to `.tsx`, convert |
| `src/elements/Step/StepTitle.d.ts` | Delete |
| `src/elements/Step/index.js` | Rename to `.ts` |
| `src/elements/Step/index.d.ts` | Delete |

---

## Acceptance Criteria

- [ ] All 11 component files compile as TypeScript without errors
- [ ] All 11 `.d.ts` files are deleted
- [ ] `React.forwardRef` is removed from all 11 components
- [ ] PropTypes are removed from all 11 components
- [ ] `ref` is accepted as a regular prop in all components
- [ ] Rail's `position` prop is typed as required
- [ ] Reveal's `animated` prop accepts all 8 animation type strings
- [ ] `Reveal.Content` static property is typed and accessible
- [ ] `Segment.Group` and `Segment.Inline` static properties are typed and accessible
- [ ] Segment's `size` excludes `'medium'`; `textAlign` excludes `'justified'`
- [ ] Step's `onClick` changes default element type to `<a>`
- [ ] Step's icon, description, and title shorthand rendering works
- [ ] `Step.Content`, `Step.Description`, `Step.Group`, `Step.Title` static properties are typed
- [ ] `Step.create` shorthand factory works
- [ ] StepGroup's `items` shorthand renders Step components via `Step.create`
- [ ] StepGroup's `widths` prop accepts numbers, strings, and word values
- [ ] All className building produces identical output
- [ ] All index files are converted to `.ts`
- [ ] RTL tests pass for all 11 components
- [ ] No regressions in components that use Segment (many layout patterns), Step (checkout flows), etc.
- [ ] The library builds without errors
- [ ] **All Element-category components are now migrated to TypeScript with React 19 patterns**

---

## Rollback Strategy

Each component family can be rolled back independently:

1. **Rail:** Restore 2 files + index pair.
2. **Reveal:** Restore 2 component files + 2 `.d.ts` files + index pair.
3. **Segment:** Restore 3 component files + 3 `.d.ts` files + index pair.
4. **Step:** Restore 5 component files + 5 `.d.ts` files + index pair.

Step depends on Icon (Phase 21) for shorthand rendering. If Icon has been rolled back, Step's icon shorthand would also need attention. However, since Step imports Icon by path and Icon's API is stable, this is unlikely to be an issue.

---

## Notes for AI Agents

1. **This phase completes all Element-category components.** After Phase 24, every file in `src/elements/` should be TypeScript with React 19 patterns. Verify this by checking that no `.js` component files remain in any `src/elements/` subdirectory (index files may still be `.js` if not yet renamed, but component files should all be `.tsx`).

2. **Rail's `position` is required.** This is one of very few required props in the library. In the TypeScript interface, do NOT mark it as optional:
   ```typescript
   position: 'left' | 'right'  // No ? -- this is required
   ```
   The current PropTypes definition uses `PropTypes.oneOf(SUI.FLOATS).isRequired`.

3. **StepGroup's `widths` prop is complex.** The current PropTypes:
   ```js
   widths: PropTypes.oneOf([
     ..._.keys(numberMap),          // '1', '2', ..., '8' (string keys)
     ..._.keys(numberMap).map(Number), // 1, 2, ..., 8 (numbers)
     ..._.values(numberMap),        // 'one', 'two', ..., 'eight' (word strings)
   ])
   ```
   In TypeScript, express this as a union type. The `numberMap` is `_.pickBy(numberToWordMap, (val, key) => key <= 8)`, which filters `numberToWordMap` to entries 1-8. The `getWidthProp` utility handles the runtime conversion. Ensure `getWidthProp` is compatible with the TypeScript type.

4. **StepGroup imports `numberToWordMap` from `../../lib`.** This is a utility that maps numbers to their word equivalents (1 -> 'one', 2 -> 'two', etc.). It is used both in PropTypes (for validation) and potentially by `getWidthProp` (for runtime className computation). After removing PropTypes, verify that `numberToWordMap` is still needed. If it is only used by `getWidthProp` internally, remove the import from StepGroup.

5. **Step uses `useEventCallback`.** This is a custom hook from `../../lib` that stabilizes event handler references. It is similar to `useCallback` but does not require a dependency array. Preserve it.

6. **Step's `ordered` prop.** This prop is defined in Step's PropTypes but is documented as "Passed from StepGroup." It is not used in Step's className building -- it is used by StepGroup to add the `ordered` class to the group container. In the TypeScript interface, include it but add a JSDoc comment: `/** Passed from StepGroup. */`.

7. **Segment has many props (22+).** This is the component with the most class-toggle props in this phase. The `handledProps` array will be long. Ensure all props are listed.

8. **Lodash usage.** Rail uses `_.without(SUI.SIZES, 'medium')` only in PropTypes. Segment uses `_.without` in two places (both PropTypes). StepGroup uses `_.pickBy`, `_.keys`, `_.values`, and `_.map`. After removing PropTypes:
   - Rail: Remove lodash import entirely.
   - Segment: Remove lodash import if only used for PropTypes.
   - StepGroup: Keep lodash for `_.map(items, ...)` in the items render path, and `_.without` if used at runtime. Check carefully.

9. **Execution order:**
   - Rail (standalone, simplest)
   - RevealContent -> Reveal (2 files)
   - SegmentInline -> SegmentGroup -> Segment (3 files)
   - StepDescription -> StepTitle -> StepContent -> Step -> StepGroup (5 files)
   This ensures dependencies are converted before their parents.

10. **After this phase, plan for Collections and Modules.** The remaining component categories are:
    - Collections: Breadcrumb, Form, Grid, Menu, Message, Table
    - Modules: Accordion, Checkbox, Dimmer, Dropdown, Embed, Modal, Popup, Progress, Rating, Search, Sidebar, Sticky, Tab, Transition
    - Views: Advertisement, Card, Comment, Feed, Item, Statistic
    - Addons: Confirm, MountNode, Pagination, Portal, Radio, Ref, Select, TextArea, TransitionablePortal
    These will be addressed in subsequent phases (25+).
