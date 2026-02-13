# Phase 22: Migrate List and All List Subcomponents

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| **Phase ID**    | 22                                                 |
| **Stage**       | 4 - Component Migration (Elements)                 |
| **Dependencies**| Phase 21 (Icon, Image, Input, Label Migration)     |
| **Complexity**  | Medium                                             |
| **Scope**       | 7 component files, 7 type definition files, 1 index file pair |

---

## Objective

Convert the entire List component family -- List, ListItem, ListContent, ListDescription, ListHeader, ListIcon, and ListList -- from JavaScript with PropTypes and `React.forwardRef` to TypeScript with React 19 patterns. The List family is a cohesive group of 7 components with extensive internal cross-references and shorthand usage. All 7 must be migrated together to avoid type mismatches at the boundaries.

---

## Background

The List component family follows a classic composite pattern:

```
List
  |-- List.Content   -> ListContent
  |-- List.Description -> ListDescription
  |-- List.Header    -> ListHeader
  |-- List.Icon      -> ListIcon
  |-- List.Item      -> ListItem
  |-- List.List      -> ListList
```

### Component Inventory

**List.js** (~173 lines):
- Main container component. Renders `role="list"`.
- Accepts an `items` shorthand array, mapping each through `ListItem.create(item, { overrideProps })`.
- Supports `onItemClick` callback that delegates to each item's `onClick`.
- Class toggles: `animated`, `bulleted`, `celled`, `divided`, `horizontal`, `inverted`, `link`, `ordered`, `relaxed`, `selection`, `size`, `verticalAlign`.
- Uses `getVerticalAlignProp` for vertical alignment class.
- 6 sub-components attached as static properties.

**ListItem.js** (~187 lines):
- The most complex sub-component. Has multiple render paths:
  1. Children mode: renders children directly.
  2. Content-as-object mode: renders `ListContent.create(content, { defaultProps: { header, description } })`.
  3. Icon/Image mode: renders icon/image alongside `ListContent` wrapper.
  4. Plain mode: renders header, description, content directly without wrapper.
- Uses `useEventCallback` for click handling with disabled state.
- Uses `React.isValidElement` and `_.isPlainObject` to determine the content render path.
- Renders `role="listitem"`.
- Has a `value` prop that maps to either HTML `value` attribute (when `li`) or `data-value` (when not `li`).
- Has a shorthand factory: `ListItem.create`.

**ListContent.js** (~65 lines):
- Wrapper for list item content. Accepts `verticalAlign`, `floated` for positioning.
- Has a shorthand factory: `ListContent.create`.
- Renders children, or constructs from `header`, `description`, `content` shorthand props.

**ListDescription.js** (~40 lines):
- Simple wrapper. Has a shorthand factory.

**ListHeader.js** (~40 lines):
- Simple wrapper. Has a shorthand factory.

**ListIcon.js** (~55 lines):
- Thin wrapper around Icon. Accepts `verticalAlign`. Uses `createShorthandFactory`.
- Renders Icon with additional `className` computation.

**ListList.js** (~35 lines):
- Renders a nested list. Adds `list` className. Simple wrapper.

### Dependency Graph Within the Family

```
List -> ListItem, ListContent, ListDescription, ListHeader, ListIcon, ListList
ListItem -> ListContent, ListDescription, ListHeader, ListIcon, Image (external)
ListContent -> ListDescription, ListHeader
ListIcon -> Icon (external)
```

External dependencies: `Icon` (Phase 21), `Image` (Phase 21).

---

## Detailed Tasks

### Task 22.1 -- Convert ListDescription.js to ListDescription.tsx

**File:** `src/elements/List/ListDescription.js` -> `src/elements/List/ListDescription.tsx`

Start with leaf components that have no internal dependencies.

1. Rename to `.tsx`.
2. Define `ListDescriptionProps` interface:
   ```typescript
   export interface ListDescriptionProps extends StrictListDescriptionProps {
     [key: string]: any
   }
   export interface StrictListDescriptionProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes.
5. Preserve shorthand factory: `ListDescription.create = createShorthandFactory(ListDescription, (val) => ({ content: val }))`.
6. Delete `ListDescription.d.ts`.

### Task 22.2 -- Convert ListHeader.js to ListHeader.tsx

**File:** `src/elements/List/ListHeader.js` -> `src/elements/List/ListHeader.tsx`

1. Rename to `.tsx`.
2. Define `ListHeaderProps` interface (same structure as ListDescription).
3. Remove `React.forwardRef` and PropTypes.
4. Preserve shorthand factory.
5. Delete `ListHeader.d.ts`.

### Task 22.3 -- Convert ListIcon.js to ListIcon.tsx

**File:** `src/elements/List/ListIcon.js` -> `src/elements/List/ListIcon.tsx`

1. Rename to `.tsx`.
2. Define `ListIconProps` interface:
   ```typescript
   export interface ListIconProps extends StrictListIconProps {
     [key: string]: any
   }
   export interface StrictListIconProps {
     className?: string
     verticalAlign?: SemanticVERTICALALIGNMENTS
     // Also accepts all IconProps via spread
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. The component renders `<Icon>` with additional className. Ensure the Icon import resolves to the already-migrated `.tsx` version.
5. Preserve shorthand factory: `ListIcon.create`.
6. Delete `ListIcon.d.ts`.

### Task 22.4 -- Convert ListList.js to ListList.tsx

**File:** `src/elements/List/ListList.js` -> `src/elements/List/ListList.tsx`

1. Rename to `.tsx`.
2. Define `ListListProps` interface:
   ```typescript
   export interface ListListProps extends StrictListListProps {
     [key: string]: any
   }
   export interface StrictListListProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Delete `ListList.d.ts`.

### Task 22.5 -- Convert ListContent.js to ListContent.tsx

**File:** `src/elements/List/ListContent.js` -> `src/elements/List/ListContent.tsx`

1. Rename to `.tsx`.
2. Define `ListContentProps` interface:
   ```typescript
   export interface ListContentProps extends StrictListContentProps {
     [key: string]: any
   }
   export interface StrictListContentProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     description?: SemanticShorthandItem<ListDescriptionProps>
     floated?: SemanticFLOATS
     header?: SemanticShorthandItem<ListHeaderProps>
     verticalAlign?: SemanticVERTICALALIGNMENTS
   }
   ```
3. Remove `React.forwardRef` and PropTypes.
4. Preserve shorthand factory: `ListContent.create`.
5. ListContent renders `ListHeader.create(header)` and `ListDescription.create(description)` internally. These imports should now point to the `.tsx` versions.
6. Delete `ListContent.d.ts`.

### Task 22.6 -- Convert ListItem.js to ListItem.tsx

**File:** `src/elements/List/ListItem.js` -> `src/elements/List/ListItem.tsx`

This is the most complex component in the List family.

1. Rename to `.tsx`.
2. Define `ListItemProps` interface:
   ```typescript
   export interface ListItemProps extends StrictListItemProps {
     [key: string]: any
   }
   export interface StrictListItemProps {
     as?: React.ElementType
     active?: boolean
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandItem<ListContentProps>
     description?: SemanticShorthandItem<ListDescriptionProps>
     disabled?: boolean
     header?: SemanticShorthandItem<ListHeaderProps>
     icon?: SemanticShorthandItem<ListIconProps>
     image?: SemanticShorthandItem<ImageProps>
     onClick?: (event: React.MouseEvent<HTMLElement>, data: ListItemProps) => void
     value?: string
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes.
5. Preserve `useEventCallback` for click handling.
6. Type the four render paths:
   - Children path: straightforward.
   - Content-as-object path: uses `React.isValidElement(content)` and `_.isPlainObject(content)` checks. Type `content` as `SemanticShorthandItem<ListContentProps>` and handle the type narrowing.
   - Icon/Image path: uses `ListIcon.create(icon)` and `Image.create(image)`.
   - Plain path: uses `ListHeader.create(header)` and `ListDescription.create(description)`.
7. Type the `valueProp` conditional:
   ```typescript
   const valueProp = ElementType === 'li'
     ? { value }
     : { 'data-value': value }
   ```
8. Preserve shorthand factory: `ListItem.create`.
9. Delete `ListItem.d.ts`.

### Task 22.7 -- Convert List.js to List.tsx

**File:** `src/elements/List/List.js` -> `src/elements/List/List.tsx`

1. Rename to `.tsx`.
2. Define `ListProps` interface:
   ```typescript
   export interface ListProps extends StrictListProps {
     [key: string]: any
   }
   export interface StrictListProps {
     as?: React.ElementType
     animated?: boolean
     bulleted?: boolean
     celled?: boolean
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     divided?: boolean
     floated?: SemanticFLOATS
     horizontal?: boolean
     inverted?: boolean
     items?: SemanticShorthandCollection<ListItemProps>
     link?: boolean
     onItemClick?: (event: React.MouseEvent<HTMLElement>, data: ListItemProps) => void
     ordered?: boolean
     relaxed?: boolean | 'very'
     selection?: boolean
     size?: SemanticSIZES
     verticalAlign?: SemanticVERTICALALIGNMENTS
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes.
5. Preserve the three render paths: children, content, items (shorthand array).
6. Preserve the `items` mapping with `ListItem.create(item, { overrideProps })` including the `onItemClick` delegation:
   ```typescript
   _.map(items, (item) =>
     ListItem.create(item, {
       overrideProps: (predefinedProps: ListItemProps) => ({
         onClick: (e: React.MouseEvent<HTMLElement>, itemProps: ListItemProps) => {
           predefinedProps.onClick?.(e, itemProps)
           props.onItemClick?.(e, itemProps)
         },
       }),
     }),
   )
   ```
7. Preserve all 6 static property assignments:
   ```typescript
   List.Content = ListContent
   List.Description = ListDescription
   List.Header = ListHeader
   List.Icon = ListIcon
   List.Item = ListItem
   List.List = ListList
   ```
8. Delete `List.d.ts`.

### Task 22.8 -- Update index files

**File:** `src/elements/List/index.js` -> `src/elements/List/index.ts`

1. Rename to `.ts`.
2. Export all components and their prop types:
   ```typescript
   export { default } from './List'
   export type { ListProps } from './List'
   export type { ListItemProps } from './ListItem'
   export type { ListContentProps } from './ListContent'
   export type { ListDescriptionProps } from './ListDescription'
   export type { ListHeaderProps } from './ListHeader'
   export type { ListIconProps } from './ListIcon'
   export type { ListListProps } from './ListList'
   ```
3. Delete `index.d.ts`.

### Task 22.9 -- Write RTL tests

1. **List tests:**
   - Renders with `ui list` classes and `role="list"`
   - Applies all boolean class toggles (animated, bulleted, celled, divided, horizontal, inverted, link, ordered, selection)
   - `relaxed` and `relaxed="very"` produce correct classes
   - `verticalAlign` produces correct class via `getVerticalAlignProp`
   - `items` shorthand renders ListItem components
   - `onItemClick` fires when an item is clicked
   - All 6 static properties are accessible
   - Ref forwarding works

2. **ListItem tests:**
   - Children render path
   - Content-as-object render path (wraps in ListContent)
   - Icon/Image render path (icon + ListContent wrapper)
   - Plain render path (header + description directly)
   - `disabled` prevents onClick
   - `active` and `disabled` classes applied
   - `value` maps to `value` attr on `<li>`, `data-value` otherwise
   - `role="listitem"` is set
   - `ListItem.create` shorthand works

3. **ListContent tests:** Renders with floated/verticalAlign classes, shorthand header/description.

4. **ListDescription, ListHeader, ListList tests:** Render with correct classes, shorthand factories work.

5. **ListIcon tests:** Renders Icon with additional verticalAlign class.

---

## Files Affected

| File | Action |
|------|--------|
| `src/elements/List/List.js` | Rename to `.tsx`, convert |
| `src/elements/List/List.d.ts` | Delete |
| `src/elements/List/ListItem.js` | Rename to `.tsx`, convert |
| `src/elements/List/ListItem.d.ts` | Delete |
| `src/elements/List/ListContent.js` | Rename to `.tsx`, convert |
| `src/elements/List/ListContent.d.ts` | Delete |
| `src/elements/List/ListDescription.js` | Rename to `.tsx`, convert |
| `src/elements/List/ListDescription.d.ts` | Delete |
| `src/elements/List/ListHeader.js` | Rename to `.tsx`, convert |
| `src/elements/List/ListHeader.d.ts` | Delete |
| `src/elements/List/ListIcon.js` | Rename to `.tsx`, convert |
| `src/elements/List/ListIcon.d.ts` | Delete |
| `src/elements/List/ListList.js` | Rename to `.tsx`, convert |
| `src/elements/List/ListList.d.ts` | Delete |
| `src/elements/List/index.js` | Rename to `.ts` |
| `src/elements/List/index.d.ts` | Delete |

---

## Acceptance Criteria

- [ ] All 7 component files compile as TypeScript without errors
- [ ] All 7 `.d.ts` files are deleted
- [ ] `React.forwardRef` is removed from all 7 components
- [ ] PropTypes are removed from all 7 components
- [ ] All shorthand factories work: `ListItem.create`, `ListContent.create`, `ListDescription.create`, `ListHeader.create`, `ListIcon.create`
- [ ] All 6 static properties on `List` are typed and accessible
- [ ] ListItem's 4 render paths produce correct output
- [ ] ListItem's `value` prop correctly maps to `value` (li) or `data-value` (non-li)
- [ ] List's `items` shorthand with `onItemClick` delegation works
- [ ] ListIcon correctly renders Icon with verticalAlign class
- [ ] `role="list"` on List and `role="listitem"` on ListItem are preserved
- [ ] All className building produces identical output
- [ ] RTL tests pass for all 7 components
- [ ] No regressions in components that use List (e.g., Menu items, Search results)
- [ ] The library builds without errors

---

## Rollback Strategy

The List family is self-contained. Rollback requires restoring all 7 component `.js` files, all 7 `.d.ts` files, and the `index.js`/`index.d.ts` pair from git history. Since the List family's only external dependencies are Icon (Phase 21) and Image (Phase 21), which are imported by path and have stable interfaces, rollback does not affect other component families.

1. Restore all 16 files from git history.
2. Verify the library builds and List-related tests pass.

---

## Notes for AI Agents

1. **Convert in dependency order.** The recommended order is:
   - Leaf components first: ListDescription, ListHeader, ListList (no internal dependencies)
   - Then: ListIcon (depends on external Icon only)
   - Then: ListContent (depends on ListDescription, ListHeader)
   - Then: ListItem (depends on ListContent, ListDescription, ListHeader, ListIcon, Image)
   - Finally: List (depends on ListItem, ListContent, ListDescription, ListHeader, ListIcon, ListList)

2. **ListItem's content-as-object check.** The code uses `!isValidElement(content) && _.isPlainObject(content)` to determine if `content` should be passed to `ListContent.create`. In TypeScript, this requires type narrowing. The `content` prop is typed as `SemanticShorthandItem<ListContentProps>`, which can be a string, number, props object, or React element. After the `isPlainObject` check, TypeScript should narrow it to a plain object.

3. **`customPropTypes.every` and `customPropTypes.disallow` validators on ListItem.** The `icon` prop uses:
   ```js
   icon: customPropTypes.every([customPropTypes.disallow(['image']), customPropTypes.itemShorthand])
   ```
   This means icon and image are mutually exclusive. This validation is lost when PropTypes are removed. Consider adding a runtime dev-mode warning:
   ```typescript
   if (process.env.NODE_ENV !== 'production' && icon && image) {
     console.warn('ListItem: `icon` and `image` props are mutually exclusive.')
   }
   ```

4. **6 static properties on List.** This is the largest number of static properties on any component in this phase set. Use the same pattern established in Phase 19 (Object.assign or namespace merge) to type these correctly.

5. **`onItemClick` uses `customPropTypes.every([customPropTypes.disallow(['children']), PropTypes.func])`.** This means `onItemClick` should not be used when `children` is provided. This validation is lost with PropTypes removal. Document this constraint in the TypeScript interface via JSDoc comment.

6. **ListIcon is not just a re-export of Icon.** It adds `verticalAlign` handling and additional className logic. It renders as `<Icon className={classes} {...rest} />` where `classes` includes the verticalAlign class. Ensure this wrapper behavior is preserved.

7. **The `_.invoke(props, 'onClick', e, props)` pattern.** This lodash pattern calls `props.onClick(e, props)` if `onClick` exists. It is equivalent to `props.onClick?.(e, props)`. When converting to TypeScript, you may replace `_.invoke` with optional chaining for type safety, but this is a broader lodash-removal concern. For now, preserve `_.invoke`.
