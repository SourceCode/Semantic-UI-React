# Phase 23: Migrate Loader, Placeholder and Subcomponents

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| **Phase ID**    | 23                                                 |
| **Stage**       | 4 - Component Migration (Elements)                 |
| **Dependencies**| Phase 15 (Ref Handling Modernization)              |
| **Complexity**  | Low                                                |
| **Scope**       | 6 component files, 6 type definition files, 2 index file pairs |

---

## Objective

Convert Loader and the Placeholder component family (Placeholder, PlaceholderHeader, PlaceholderImage, PlaceholderLine, PlaceholderParagraph) from JavaScript with PropTypes and `React.forwardRef` to TypeScript with React 19 patterns. These are the simplest presentational components in the library -- pure className builders with no event handlers, no shorthand factories, and minimal logic. This phase should be completable rapidly and serves as a low-risk validation that the migration toolchain is working correctly.

---

## Background

### Loader (1 file, ~87 lines)
- Simple presentational component.
- Renders with `ui loader` classes. Supports `active`, `disabled`, `indeterminate`, `inline`, `inverted`, `size`.
- Adds `text` class when `children` or `content` is provided (to style loader text).
- No shorthand factory. No sub-components. No event handlers.
- Uses `childrenUtils.isNil`, `getComponentType`, `getUnhandledProps`, `getKeyOnly`, `getKeyOrValueAndKey`.

### Placeholder (5 files: Placeholder, PlaceholderHeader, PlaceholderImage, PlaceholderLine, PlaceholderParagraph)
- All are purely presentational. No event handlers. No shorthand factories.
- **Placeholder.js** (~65 lines): Container with `fluid` and `inverted` boolean toggles. Has 4 sub-components attached as static properties: `Placeholder.Header`, `Placeholder.Image`, `Placeholder.Line`, `Placeholder.Paragraph`.
- **PlaceholderHeader.js**: Renders with `header` class. Has `image` boolean prop to indicate image-alongside-header layout.
- **PlaceholderImage.js**: Renders with `image` class. Has `square` and `rectangular` boolean props.
- **PlaceholderLine.js**: Renders with `line` class. Has `length` prop (`'full' | 'very long' | 'long' | 'medium' | 'short' | 'very short'`).
- **PlaceholderParagraph.js**: Renders with `paragraph` class. Simple wrapper.

All 6 components follow the exact same internal pattern:
1. Destructure props
2. Build className with `cx()`
3. Get unhandled props and element type
4. Render `<ElementType>` with className, children/content, and ref

---

## Detailed Tasks

### Task 23.1 -- Convert Loader.js to Loader.tsx

**File:** `src/elements/Loader/Loader.js` -> `src/elements/Loader/Loader.tsx`

1. Rename to `.tsx`.
2. Define `LoaderProps` interface:
   ```typescript
   export interface LoaderProps extends StrictLoaderProps {
     [key: string]: any
   }
   export interface StrictLoaderProps {
     as?: React.ElementType
     active?: boolean
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     disabled?: boolean
     indeterminate?: boolean
     inline?: boolean | 'centered'
     inverted?: boolean
     size?: SemanticSIZES
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop:
   ```typescript
   function Loader(props: LoaderProps) {
     const { active, children, className, content, disabled, indeterminate, inline, inverted, ref, size } = props
     // ...
   }
   ```
4. Remove `PropTypes` import and `Loader.propTypes` block.
5. Preserve the `text` class logic: `getKeyOnly(children || content, 'text')`.
6. Add `handledProps` array for `getUnhandledProps`.
7. Delete `Loader.d.ts`.
8. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 23.2 -- Convert PlaceholderLine.js to PlaceholderLine.tsx

**File:** `src/elements/Placeholder/PlaceholderLine.js` -> `src/elements/Placeholder/PlaceholderLine.tsx`

Start with leaf components.

1. Rename to `.tsx`.
2. Define `PlaceholderLineProps` interface:
   ```typescript
   export interface PlaceholderLineProps extends StrictPlaceholderLineProps {
     [key: string]: any
   }
   export interface StrictPlaceholderLineProps {
     as?: React.ElementType
     className?: string
     length?: 'full' | 'very long' | 'long' | 'medium' | 'short' | 'very short'
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `PlaceholderLine.d.ts`.

### Task 23.3 -- Convert PlaceholderImage.js to PlaceholderImage.tsx

**File:** `src/elements/Placeholder/PlaceholderImage.js` -> `src/elements/Placeholder/PlaceholderImage.tsx`

1. Rename to `.tsx`.
2. Define `PlaceholderImageProps` interface:
   ```typescript
   export interface PlaceholderImageProps extends StrictPlaceholderImageProps {
     [key: string]: any
   }
   export interface StrictPlaceholderImageProps {
     as?: React.ElementType
     className?: string
     square?: boolean
     rectangular?: boolean
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `PlaceholderImage.d.ts`.

### Task 23.4 -- Convert PlaceholderHeader.js to PlaceholderHeader.tsx

**File:** `src/elements/Placeholder/PlaceholderHeader.js` -> `src/elements/Placeholder/PlaceholderHeader.tsx`

1. Rename to `.tsx`.
2. Define `PlaceholderHeaderProps` interface:
   ```typescript
   export interface PlaceholderHeaderProps extends StrictPlaceholderHeaderProps {
     [key: string]: any
   }
   export interface StrictPlaceholderHeaderProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     image?: boolean
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `PlaceholderHeader.d.ts`.

### Task 23.5 -- Convert PlaceholderParagraph.js to PlaceholderParagraph.tsx

**File:** `src/elements/Placeholder/PlaceholderParagraph.js` -> `src/elements/Placeholder/PlaceholderParagraph.tsx`

1. Rename to `.tsx`.
2. Define `PlaceholderParagraphProps` interface:
   ```typescript
   export interface PlaceholderParagraphProps extends StrictPlaceholderParagraphProps {
     [key: string]: any
   }
   export interface StrictPlaceholderParagraphProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `PlaceholderParagraph.d.ts`.

### Task 23.6 -- Convert Placeholder.js to Placeholder.tsx

**File:** `src/elements/Placeholder/Placeholder.js` -> `src/elements/Placeholder/Placeholder.tsx`

1. Rename to `.tsx`.
2. Define `PlaceholderProps` interface:
   ```typescript
   export interface PlaceholderProps extends StrictPlaceholderProps {
     [key: string]: any
   }
   export interface StrictPlaceholderProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     fluid?: boolean
     inverted?: boolean
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes.
5. Preserve static property assignments:
   ```typescript
   Placeholder.Header = PlaceholderHeader
   Placeholder.Image = PlaceholderImage
   Placeholder.Line = PlaceholderLine
   Placeholder.Paragraph = PlaceholderParagraph
   ```
6. Delete `Placeholder.d.ts`.

### Task 23.7 -- Update index files

**Loader index:**
- `src/elements/Loader/index.js` -> `src/elements/Loader/index.ts`
- Delete `src/elements/Loader/index.d.ts`
- Export: `export { default } from './Loader'` and `export type { LoaderProps } from './Loader'`

**Placeholder index:**
- `src/elements/Placeholder/index.js` -> `src/elements/Placeholder/index.ts`
- Delete `src/elements/Placeholder/index.d.ts`
- Export default and all sub-component prop types.

### Task 23.8 -- Write RTL tests

1. **Loader tests:**
   - Renders with `ui loader` classes
   - `active` adds `active` class
   - `disabled` adds `disabled` class
   - `indeterminate` adds `indeterminate` class
   - `inline` adds `inline` class; `inline="centered"` adds `centered inline` class
   - `inverted` adds `inverted` class
   - `size` adds size class
   - When `children` is provided, adds `text` class
   - When `content` is provided, adds `text` class
   - When neither children nor content, no `text` class
   - Renders children or content inside the element
   - Ref forwarding works

2. **Placeholder tests:**
   - Renders with `ui placeholder` classes
   - `fluid` adds `fluid` class
   - `inverted` adds `inverted` class
   - Static properties `Placeholder.Header`, `Placeholder.Image`, `Placeholder.Line`, `Placeholder.Paragraph` are accessible
   - Ref forwarding works

3. **PlaceholderHeader tests:** Renders with `header` class, `image` adds `image` class.

4. **PlaceholderImage tests:** Renders with `image` class, `square` and `rectangular` boolean classes.

5. **PlaceholderLine tests:** Renders with `line` class, `length` prop adds the length string as a class.

6. **PlaceholderParagraph tests:** Renders with `paragraph` class.

---

## Files Affected

| File | Action |
|------|--------|
| `src/elements/Loader/Loader.js` | Rename to `.tsx`, convert |
| `src/elements/Loader/Loader.d.ts` | Delete |
| `src/elements/Loader/index.js` | Rename to `.ts` |
| `src/elements/Loader/index.d.ts` | Delete |
| `src/elements/Placeholder/Placeholder.js` | Rename to `.tsx`, convert |
| `src/elements/Placeholder/Placeholder.d.ts` | Delete |
| `src/elements/Placeholder/PlaceholderHeader.js` | Rename to `.tsx`, convert |
| `src/elements/Placeholder/PlaceholderHeader.d.ts` | Delete |
| `src/elements/Placeholder/PlaceholderImage.js` | Rename to `.tsx`, convert |
| `src/elements/Placeholder/PlaceholderImage.d.ts` | Delete |
| `src/elements/Placeholder/PlaceholderLine.js` | Rename to `.tsx`, convert |
| `src/elements/Placeholder/PlaceholderLine.d.ts` | Delete |
| `src/elements/Placeholder/PlaceholderParagraph.js` | Rename to `.tsx`, convert |
| `src/elements/Placeholder/PlaceholderParagraph.d.ts` | Delete |
| `src/elements/Placeholder/index.js` | Rename to `.ts` |
| `src/elements/Placeholder/index.d.ts` | Delete |

---

## Acceptance Criteria

- [ ] All 6 component files compile as TypeScript without errors
- [ ] All 6 `.d.ts` files are deleted
- [ ] `React.forwardRef` is removed from all 6 components
- [ ] PropTypes are removed from all 6 components
- [ ] `ref` is accepted as a regular prop in all 6 components
- [ ] Loader's `text` class logic works correctly (present with children/content, absent without)
- [ ] Loader's `inline` prop handles both `true` and `'centered'` values
- [ ] Placeholder's 4 static properties are typed and accessible
- [ ] PlaceholderLine's `length` prop produces correct class
- [ ] PlaceholderImage's `square` and `rectangular` boolean classes work
- [ ] PlaceholderHeader's `image` boolean class works
- [ ] All index files are converted to `.ts`
- [ ] RTL tests pass for all 6 components
- [ ] No regressions in components that use Loader (Dimmer, Segment) or Placeholder
- [ ] The library builds without errors

---

## Rollback Strategy

Each component family can be rolled back independently:

1. **Loader:** Restore `Loader.js`, `Loader.d.ts`, `index.js`, `index.d.ts` from git.
2. **Placeholder:** Restore all 5 component `.js` files, 5 `.d.ts` files, `index.js`, `index.d.ts` from git.

These components have no internal dependencies on other migrated components. Loader is referenced by Dimmer, and Placeholder is used standalone. Rollback is trivial.

---

## Notes for AI Agents

1. **These are the simplest components in the entire library.** Each follows a near-identical pattern: destructure props, build className with `cx()`, get unhandled props, render `<ElementType>`. Use this phase to validate your migration template and apply it mechanically across all 6 files.

2. **Template for simple components.** Every component in this phase follows this exact structure after migration:
   ```typescript
   import cx from 'clsx'
   import * as React from 'react'
   import { childrenUtils, getComponentType, getUnhandledProps, getKeyOnly } from '../../lib'

   export interface ComponentProps extends StrictComponentProps {
     [key: string]: any
   }
   export interface StrictComponentProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: React.ReactNode
     // ... component-specific props
   }

   function Component(props: ComponentProps) {
     const { children, className, content, ref, /* ... */ } = props
     const classes = cx('ui', /* ... */, 'component-class', className)
     const rest = getUnhandledProps(Component, props)
     const ElementType = getComponentType(props)

     return (
       <ElementType {...rest} className={classes} ref={ref}>
         {childrenUtils.isNil(children) ? content : children}
       </ElementType>
     )
   }

   Component.displayName = 'Component'
   Component.handledProps = ['as', 'children', 'className', 'content', /* ... */]

   export default Component
   ```

3. **No shorthand factories in this phase.** None of the 6 components have `.create()` methods, which simplifies the migration significantly. There are no static property typing challenges beyond the 4 sub-components on Placeholder.

4. **Loader's `text` class.** The logic `getKeyOnly(children || content, 'text')` adds the `text` class when the loader has visible text content. This is important for Semantic UI CSS styling -- without the `text` class, the loader text would not be visible. Preserve this logic exactly.

5. **PlaceholderLine's `length` prop.** The prop value is directly used as a className: `cx(length, 'line', className)`. Values like `'very long'` produce `class="very long line"`. This is correct for Semantic UI CSS. No transformation needed.

6. **PlaceholderImage has no `children` or `content` prop.** It renders as a self-closing element: `<ElementType {...rest} className={classes} ref={ref} />`. This is different from the other Placeholder sub-components which accept children.

7. **Execution order:** Loader (standalone), then PlaceholderLine -> PlaceholderImage -> PlaceholderHeader -> PlaceholderParagraph -> Placeholder. The sub-components have no dependencies on each other, so they can be done in any order before Placeholder itself.

8. **No lodash usage.** None of these 6 components import lodash. This makes them even simpler to migrate -- no `_.isNil`, `_.invoke`, or other lodash utilities to deal with.

9. **This phase has no dependency on Phase 18 (cloneElement).** These components do not use cloneElement, React.Children, or any of the patterns being modernized in Phase 18. They depend only on Phase 15 (ref handling) to ensure `getUnhandledProps` and `getComponentType` work with the new ref-as-prop pattern.
