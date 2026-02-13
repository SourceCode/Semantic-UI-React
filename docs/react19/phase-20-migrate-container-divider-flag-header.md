# Phase 20: Migrate Container, Divider, Flag, Header Components

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| **Phase ID**    | 20                                                 |
| **Stage**       | 4 - Component Migration (Elements)                 |
| **Dependencies**| Phase 15 (Ref Handling Modernization), Phase 17 (Class Component Migration) |
| **Complexity**  | Low                                                |
| **Scope**       | 4 component families (8 component files, 8 type definition files, 4 index files) |

---

## Objective

Convert Container, Divider, Flag, and Header (with HeaderContent and HeaderSubheader sub-components) from JavaScript with PropTypes and `React.forwardRef` to TypeScript with React 19 patterns. These are among the simplest components in the library -- mostly presentational with straightforward className building. This phase establishes a cadence for migrating low-complexity elements efficiently.

---

## Background

### Container (1 file, ~62 lines)
- Pure presentational wrapper. Accepts `fluid`, `text`, `textAlign` props.
- No shorthand factory. No sub-components. No event handlers.
- Uses `childrenUtils.isNil`, `getComponentType`, `getUnhandledProps`, `getKeyOnly`, `getTextAlignProp`.

### Divider (1 file, ~88 lines)
- Pure presentational. Accepts boolean class toggles: `clearing`, `fitted`, `hidden`, `horizontal`, `inverted`, `section`, `vertical`.
- No shorthand factory. No sub-components. No event handlers.

### Flag (1 file, ~539 lines including the `names` array)
- Renders as `<i>` by default. Has a large static `names` array (~500 entries) for country codes and names.
- Wrapped in `React.memo` for performance.
- Has a shorthand factory: `MemoFlag.create = createShorthandFactory(MemoFlag, (value) => ({ name: value }))`.
- Uses `customPropTypes.suggest(names)` for the `name` prop validation.

### Header (3 files: Header, HeaderContent, HeaderSubheader)
- **Header.js** (~163 lines): Moderate complexity. Uses Icon and Image shorthand, has a `subheader` shorthand prop. Three render paths: children-only, icon/image with HeaderContent wrapper, and simple content.
- **HeaderContent.js**: Simple wrapper component. No shorthand.
- **HeaderSubheader.js**: Simple wrapper. Has a shorthand factory: `HeaderSubheader.create`.
- Sub-components attached as static properties: `Header.Content`, `Header.Subheader`.

---

## Detailed Tasks

### Task 20.1 -- Convert Container.js to Container.tsx

**File:** `src/elements/Container/Container.js` -> `src/elements/Container/Container.tsx`

1. Rename file to `.tsx`.
2. Define `ContainerProps` interface:
   ```typescript
   export interface ContainerProps extends StrictContainerProps {
     [key: string]: any
   }
   export interface StrictContainerProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     fluid?: boolean
     text?: boolean
     textAlign?: SemanticTEXTALIGNMENTS
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop:
   ```typescript
   function Container(props: ContainerProps) {
     const { children, className, content, fluid, ref, text, textAlign } = props
     // ...
   }
   ```
4. Remove `PropTypes` import and `Container.propTypes` block.
5. Delete `Container.d.ts`.
6. Update `index.js` -> `index.ts`.
7. Delete `index.d.ts`.

### Task 20.2 -- Convert Divider.js to Divider.tsx

**File:** `src/elements/Divider/Divider.js` -> `src/elements/Divider/Divider.tsx`

1. Rename file to `.tsx`.
2. Define `DividerProps` interface:
   ```typescript
   export interface DividerProps extends StrictDividerProps {
     [key: string]: any
   }
   export interface StrictDividerProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     clearing?: boolean
     content?: SemanticShorthandContent
     fitted?: boolean
     hidden?: boolean
     horizontal?: boolean
     inverted?: boolean
     section?: boolean
     vertical?: boolean
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove `PropTypes` import and `Divider.propTypes` block.
5. Delete `Divider.d.ts`.
6. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 20.3 -- Convert Flag.js to Flag.tsx

**File:** `src/elements/Flag/Flag.js` -> `src/elements/Flag/Flag.tsx`

1. Rename file to `.tsx`.
2. The `names` array is a large export used for autocomplete/validation. Keep it as a `const` with `as const` for better type inference:
   ```typescript
   export const names = [
     'ad', 'andorra', 'ae', 'united arab emirates', 'uae',
     // ... (all 500+ entries)
   ] as const

   export type FlagNameValues = (typeof names)[number]
   ```
3. Define `FlagProps` interface:
   ```typescript
   export interface FlagProps extends StrictFlagProps {
     [key: string]: any
   }
   export interface StrictFlagProps {
     as?: React.ElementType
     className?: string
     name?: FlagNameValues | string
   }
   ```
4. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
5. Remove `PropTypes` import and `Flag.propTypes` block.
6. Preserve the `React.memo` wrapping:
   ```typescript
   const MemoFlag = React.memo(Flag)
   MemoFlag.create = createShorthandFactory(MemoFlag, (value) => ({ name: value }))
   export default MemoFlag
   ```
   Note: In React 19, `React.memo` still works. The `ref` prop is passed through `memo` without issue since it is now a regular prop.
7. Delete `Flag.d.ts`.
8. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 20.4 -- Convert HeaderContent.js to HeaderContent.tsx

**File:** `src/elements/Header/HeaderContent.js` -> `src/elements/Header/HeaderContent.tsx`

1. Rename file to `.tsx`.
2. Define `HeaderContentProps` interface:
   ```typescript
   export interface HeaderContentProps extends StrictHeaderContentProps {
     [key: string]: any
   }
   export interface StrictHeaderContentProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
   }
   ```
3. Remove `React.forwardRef` wrapper and PropTypes.
4. Delete `HeaderContent.d.ts`.

### Task 20.5 -- Convert HeaderSubheader.js to HeaderSubheader.tsx

**File:** `src/elements/Header/HeaderSubheader.js` -> `src/elements/Header/HeaderSubheader.tsx`

1. Rename file to `.tsx`.
2. Define `HeaderSubheaderProps` interface:
   ```typescript
   export interface HeaderSubheaderProps extends StrictHeaderSubheaderProps {
     [key: string]: any
   }
   export interface StrictHeaderSubheaderProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
   }
   ```
3. Remove `React.forwardRef` wrapper and PropTypes.
4. Preserve the shorthand factory: `HeaderSubheader.create = createShorthandFactory(HeaderSubheader, (val) => ({ content: val }))`.
5. Delete `HeaderSubheader.d.ts`.

### Task 20.6 -- Convert Header.js to Header.tsx

**File:** `src/elements/Header/Header.js` -> `src/elements/Header/Header.tsx`

1. Rename file to `.tsx`.
2. Define `HeaderProps` interface:
   ```typescript
   export interface HeaderProps extends StrictHeaderProps {
     [key: string]: any
   }
   export interface StrictHeaderProps {
     as?: React.ElementType
     attached?: boolean | 'top' | 'bottom'
     block?: boolean
     children?: React.ReactNode
     className?: string
     color?: SemanticCOLORS
     content?: SemanticShorthandContent
     disabled?: boolean
     dividing?: boolean
     floated?: SemanticFLOATS
     icon?: boolean | SemanticShorthandItem<IconProps>
     image?: boolean | SemanticShorthandItem<ImageProps>
     inverted?: boolean
     size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge'
     sub?: boolean
     subheader?: SemanticShorthandItem<HeaderSubheaderProps>
     textAlign?: SemanticTEXTALIGNMENTS
   }
   ```
   Note: `size` excludes 'big', 'massive', 'mini' per the current PropTypes definition using `_.without(SUI.SIZES, 'big', 'massive', 'mini')`.
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove `PropTypes` and `customPropTypes` imports, remove `Header.propTypes` block.
5. Keep `lodash` import for `_.without` used in the original PropTypes (no longer needed at runtime since TypeScript handles validation at compile time).
6. Preserve static property assignments:
   ```typescript
   Header.Content = HeaderContent
   Header.Subheader = HeaderSubheader
   ```
7. Preserve the three render paths (children-only, icon/image with content wrapper, plain content).
8. Delete `Header.d.ts`.
9. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 20.7 -- Write RTL tests

1. **Container tests:** Renders with `ui container` classes, applies `fluid`, `text`, `textAlign` classes, forwards ref.
2. **Divider tests:** Renders with `ui divider` classes, applies all boolean class toggles, forwards ref.
3. **Flag tests:** Renders as `<i>` with flag name class, `React.memo` wrapping preserved, `Flag.create` shorthand works with string values.
4. **Header tests:**
   - Renders with correct classes for `color`, `size`, `block`, `dividing`, etc.
   - Icon shorthand renders `<Icon>` inside header
   - Image shorthand renders `<Image>` inside header
   - When icon or image is present, content is wrapped in `<HeaderContent>`
   - Subheader shorthand renders `<HeaderSubheader>`
   - `Header.Content` and `Header.Subheader` static properties are accessible
   - Ref forwarding works
5. **HeaderContent tests:** Renders children or content.
6. **HeaderSubheader tests:** Renders children or content, shorthand factory works.

---

## Files Affected

| File | Action |
|------|--------|
| `src/elements/Container/Container.js` | Rename to `.tsx`, convert |
| `src/elements/Container/Container.d.ts` | Delete |
| `src/elements/Container/index.js` | Rename to `.ts` |
| `src/elements/Container/index.d.ts` | Delete |
| `src/elements/Divider/Divider.js` | Rename to `.tsx`, convert |
| `src/elements/Divider/Divider.d.ts` | Delete |
| `src/elements/Divider/index.js` | Rename to `.ts` |
| `src/elements/Divider/index.d.ts` | Delete |
| `src/elements/Flag/Flag.js` | Rename to `.tsx`, convert |
| `src/elements/Flag/Flag.d.ts` | Delete |
| `src/elements/Flag/index.js` | Rename to `.ts` |
| `src/elements/Flag/index.d.ts` | Delete |
| `src/elements/Header/Header.js` | Rename to `.tsx`, convert |
| `src/elements/Header/Header.d.ts` | Delete |
| `src/elements/Header/HeaderContent.js` | Rename to `.tsx`, convert |
| `src/elements/Header/HeaderContent.d.ts` | Delete |
| `src/elements/Header/HeaderSubheader.js` | Rename to `.tsx`, convert |
| `src/elements/Header/HeaderSubheader.d.ts` | Delete |
| `src/elements/Header/index.js` | Rename to `.ts` |
| `src/elements/Header/index.d.ts` | Delete |

---

## Acceptance Criteria

- [ ] Container compiles as TypeScript, renders correctly with all prop combinations
- [ ] Divider compiles as TypeScript, renders correctly with all boolean class toggles
- [ ] Flag compiles as TypeScript, `React.memo` wrapping preserved, `Flag.create` shorthand works
- [ ] Flag `names` array is typed with `as const` for IDE autocomplete
- [ ] Header compiles as TypeScript with all three render paths working
- [ ] HeaderContent and HeaderSubheader compile as TypeScript
- [ ] `Header.Content` and `Header.Subheader` static properties are accessible and typed
- [ ] `HeaderSubheader.create` shorthand factory works
- [ ] All 8 `.d.ts` files are deleted
- [ ] All `React.forwardRef` wrappers are removed; `ref` is accepted as a regular prop
- [ ] All `PropTypes` imports and `.propTypes` blocks are removed
- [ ] All index files are converted to `.ts`
- [ ] RTL tests pass for all components
- [ ] No regressions in Header usage within other components (e.g., Modal.Header, Card.Header, which may import Header or HeaderContent)
- [ ] The library builds without TypeScript errors

---

## Rollback Strategy

Each component family can be rolled back independently:

1. **Container:** Restore `Container.js`, `Container.d.ts`, `index.js`, `index.d.ts` from git.
2. **Divider:** Restore `Divider.js`, `Divider.d.ts`, `index.js`, `index.d.ts` from git.
3. **Flag:** Restore `Flag.js`, `Flag.d.ts`, `index.js`, `index.d.ts` from git.
4. **Header:** Restore all 6 Header files (`Header.js`, `HeaderContent.js`, `HeaderSubheader.js` and their `.d.ts` counterparts) plus `index.js` and `index.d.ts` from git.

These components have minimal inter-dependencies within this phase. The only dependency is Header on Icon and Image (not yet migrated), but since Header imports them by their current paths, rollback does not affect those imports.

---

## Notes for AI Agents

1. **Container and Divider are ideal first targets** for establishing the TypeScript migration pattern. They have no shorthand factories, no sub-components, and no event handlers. Use them to validate the `getUnhandledProps` + `getComponentType` pattern in TypeScript before tackling more complex components.

2. **Flag uses `React.memo`.** In the current code, the export is:
   ```js
   const MemoFlag = React.memo(Flag)
   MemoFlag.create = createShorthandFactory(MemoFlag, (value) => ({ name: value }))
   export default MemoFlag
   ```
   In TypeScript with React 19, `React.memo` returns `React.MemoExoticComponent`. To add `.create` as a static property, you will need to use `Object.assign`:
   ```typescript
   const MemoFlag = Object.assign(React.memo(Flag), {
     create: createShorthandFactory(MemoFlag, (value: string) => ({ name: value })),
   })
   ```
   Beware of circular reference: `MemoFlag` references itself inside `createShorthandFactory`. You may need to define `create` after the initial assignment.

3. **Flag's `names` array is ~500 entries.** Do not modify the array contents. Only add the `as const` assertion and derive the `FlagNameValues` type from it. The `customPropTypes.suggest(names)` validator is removed with PropTypes -- the TypeScript type union provides compile-time validation instead.

4. **Header imports Icon and Image.** These components are not yet migrated in this phase (they are in Phase 21). Header imports them as:
   ```js
   import Icon from '../Icon'
   import Image from '../Image'
   ```
   These will still be `.js` files during Phase 20. TypeScript can import `.js` files if `allowJs` is enabled in `tsconfig.json`, or if the `.d.ts` files still exist for Icon and Image. Since Icon and Image `.d.ts` files are not deleted until Phase 21, the types will resolve correctly.

5. **`getUnhandledProps` and `handledProps`.** As noted in Phase 19, after removing PropTypes, `getUnhandledProps` needs a `handledProps` array on each component. Add this for all components in this phase. For Container:
   ```typescript
   Container.handledProps = ['as', 'children', 'className', 'content', 'fluid', 'text', 'textAlign']
   ```

6. **`_.without(SUI.SIZES, 'big', 'massive', 'mini')` for Header size.** This runtime filtering is only used in PropTypes validation. In TypeScript, express this as a type literal union: `'tiny' | 'small' | 'medium' | 'large' | 'huge'`. The lodash import for `_.without` can then be removed from Header if it was only used for this purpose. However, Header also imports `lodash` for no other purpose in the current code, so the import should indeed be removed.

7. **Test existing `.d.ts` files before deleting them.** Read each `.d.ts` file to ensure the TypeScript interfaces you create in the `.tsx` file match exactly. Pay attention to optional vs. required props, union types, and the `[key: string]: any` index signature.

8. **Execution order within this phase:** Container -> Divider -> Flag -> HeaderContent -> HeaderSubheader -> Header. This ensures sub-components are converted before their parent.
