# Phase 21: Migrate Icon, Image, Input, Label Components

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| **Phase ID**    | 21                                                 |
| **Stage**       | 4 - Component Migration (Elements)                 |
| **Dependencies**| Phase 18 (Replace cloneElement), Phase 19 (Button Migration) |
| **Complexity**  | Medium                                             |
| **Scope**       | 4 component families (10 component files, 10 type definition files, 4 index files) |

---

## Objective

Convert Icon (with IconGroup), Image (with ImageGroup), Input, and Label (with LabelDetail, LabelGroup) from JavaScript with PropTypes and `React.forwardRef` to TypeScript with React 19 patterns. These components are among the most heavily referenced in the library -- Icon and Label are used as shorthand targets in nearly every complex component. Their migration must be precise because errors here cascade throughout the entire library.

---

## Background

### Icon (2 files: Icon, IconGroup)
- **Icon.js** (~158 lines): Renders as `<i>` by default. Uses `React.memo` for performance. Has a shorthand factory (`MemoIcon.create`). `IconGroup` is attached as `MemoIcon.Group`. Contains `getAriaProps` helper and `useEventCallback` for click handling with disabled state.
- **IconGroup.js**: Simple wrapper with `size` and `content` props.
- Icon is the most frequently used shorthand target in the library. Components that use `Icon.create()`: Button, Dropdown, Header, Input, Label, ListIcon, Step, Accordion, Menu, Message, and more.

### Image (2 files: Image, ImageGroup)
- **Image.js** (~192 lines): Renders as `<img>` by default, switches to `<div>` when `dimmer`, `label`, `wrapped`, or `children` is present. Uses `partitionHTMLProps` with `htmlImageProps`. Has a shorthand factory (`Image.create`). `ImageGroup` is attached as `Image.Group`.
- **ImageGroup.js**: Simple wrapper with `size` prop.
- Image is used as shorthand in: Header, ListItem, Dropdown (via renderItemContent), Card, and others.

### Input (1 file)
- **Input.js** (~239 lines): Uses `React.forwardRef`. Contains `React.cloneElement` usage (Phase 18 dependency). Uses `React.Children.toArray`, `partitionHTMLProps`, `childrenUtils`, `setRef`. Has a shorthand factory (`Input.create`). Two render paths: children mode (with cloneElement) and shorthand mode (action, icon, label).
- Input depends on Button, Icon, and Label for shorthand rendering.
- Input uses `createHTMLInput` from factories for the `input` shorthand prop.

### Label (3 files: Label, LabelDetail, LabelGroup)
- **Label.js** (~214 lines): Uses `useEventCallback` for click handling. Has `onRemove` with a configurable `removeIcon` shorthand. Uses Icon and Image for shorthand rendering. Has a shorthand factory (`Label.create`). `LabelDetail` and `LabelGroup` are attached as static properties.
- **LabelDetail.js**: Simple wrapper with content. Has shorthand factory.
- **LabelGroup.js**: Wrapper with `circular`, `color`, `size`, `tag` class toggles.
- Label is used as shorthand in: Button (labeled buttons), Dropdown (multi-select labels), Input, Form fields, and more.

---

## Detailed Tasks

### Task 21.1 -- Convert IconGroup.js to IconGroup.tsx

**File:** `src/elements/Icon/IconGroup.js` -> `src/elements/Icon/IconGroup.tsx`

1. Rename to `.tsx`.
2. Define `IconGroupProps` interface:
   ```typescript
   export interface IconGroupProps extends StrictIconGroupProps {
     [key: string]: any
   }
   export interface StrictIconGroupProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: SemanticShorthandContent
     size?: SemanticSIZES
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Remove PropTypes.
5. Delete `IconGroup.d.ts`.

### Task 21.2 -- Convert Icon.js to Icon.tsx

**File:** `src/elements/Icon/Icon.js` -> `src/elements/Icon/Icon.tsx`

1. Rename to `.tsx`.
2. Define `IconProps` interface:
   ```typescript
   export interface IconProps extends StrictIconProps {
     [key: string]: any
   }
   export interface StrictIconProps {
     as?: React.ElementType
     bordered?: boolean
     circular?: boolean
     className?: string
     color?: SemanticCOLORS
     corner?: boolean | 'top left' | 'top right' | 'bottom left' | 'bottom right'
     disabled?: boolean
     fitted?: boolean
     flipped?: 'horizontally' | 'vertically'
     inverted?: boolean
     link?: boolean
     loading?: boolean
     name?: string
     rotated?: 'clockwise' | 'counterclockwise'
     size?: Exclude<SemanticSIZES, 'medium'>
     'aria-hidden'?: string
     'aria-label'?: string
     onClick?: (event: React.MouseEvent<HTMLElement>, data: IconProps) => void
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Type the `getAriaProps` helper function:
   ```typescript
   function getAriaProps(props: IconProps): Record<string, string | undefined> {
     // ...
   }
   ```
5. Preserve `React.memo` wrapping. Handle static properties on the memo component:
   ```typescript
   const MemoIcon = Object.assign(React.memo(Icon), {
     Group: IconGroup,
     create: null as any, // assigned below
   })
   MemoIcon.create = createShorthandFactory(MemoIcon, (value: string) => ({ name: value }))
   export default MemoIcon
   ```
6. Remove PropTypes. Remove `customPropTypes.suggest(SUI.ALL_ICONS_IN_ALL_CONTEXTS)` -- this was for runtime suggestion, which TypeScript replaces at compile time.
7. Delete `Icon.d.ts`.
8. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 21.3 -- Convert ImageGroup.js to ImageGroup.tsx

**File:** `src/elements/Image/ImageGroup.js` -> `src/elements/Image/ImageGroup.tsx`

1. Rename to `.tsx`.
2. Define `ImageGroupProps` interface.
3. Remove `React.forwardRef` and PropTypes.
4. Delete `ImageGroup.d.ts`.

### Task 21.4 -- Convert Image.js to Image.tsx

**File:** `src/elements/Image/Image.js` -> `src/elements/Image/Image.tsx`

1. Rename to `.tsx`.
2. Define `ImageProps` interface:
   ```typescript
   export interface ImageProps extends StrictImageProps {
     [key: string]: any
   }
   export interface StrictImageProps {
     as?: React.ElementType
     avatar?: boolean
     bordered?: boolean
     centered?: boolean
     children?: React.ReactNode
     circular?: boolean
     className?: string
     content?: SemanticShorthandContent
     disabled?: boolean
     dimmer?: SemanticShorthandItem<DimmerProps>
     floated?: SemanticFLOATS
     fluid?: boolean
     hidden?: boolean
     href?: string
     inline?: boolean
     label?: SemanticShorthandItem<LabelProps>
     rounded?: boolean
     size?: SemanticSIZES
     spaced?: boolean | 'left' | 'right'
     ui?: boolean
     verticalAlign?: SemanticVERTICALALIGNMENTS
     wrapped?: boolean
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Handle the `ui = true` default prop value -- destructure with default in the function signature.
5. Preserve the `partitionHTMLProps(rest, { htmlProps: htmlImageProps })` pattern. This utility filters HTML image attributes (src, alt, width, height, etc.) from component-level props.
6. Preserve the conditional rendering: `<img>` when ElementType is 'img', `<div>` wrapper with nested `<img>` when dimmer/label/wrapped.
7. Preserve `Image.Group = ImageGroup` static assignment.
8. Preserve `Image.create = createShorthandFactory(Image, (value) => ({ src: value }))`.
9. Remove PropTypes. Delete `Image.d.ts`.
10. Note: Image imports `Dimmer` from `../../modules/Dimmer`. Dimmer is not yet migrated but its `.d.ts` provides types.
11. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 21.5 -- Convert Input.js to Input.tsx

**File:** `src/elements/Input/Input.js` -> `src/elements/Input/Input.tsx`

**Important:** This task depends on Phase 18 (Task 18.6) which addresses the `React.cloneElement` usage in Input. If Phase 18 is not yet complete for Input, this task should either:
- (a) Preserve the cloneElement call as-is and convert to TypeScript around it, OR
- (b) Wait for Phase 18 to be completed first.

1. Rename to `.tsx`.
2. Define `InputProps` interface:
   ```typescript
   export interface InputProps extends StrictInputProps {
     [key: string]: any
   }
   export interface StrictInputProps {
     as?: React.ElementType
     action?: boolean | SemanticShorthandItem<ButtonProps>
     actionPosition?: 'left'
     children?: React.ReactNode
     className?: string
     disabled?: boolean
     error?: boolean
     fluid?: boolean
     focus?: boolean
     icon?: boolean | SemanticShorthandItem<IconProps>
     iconPosition?: 'left'
     input?: SemanticShorthandItem<React.InputHTMLAttributes<HTMLInputElement>>
     inverted?: boolean
     label?: SemanticShorthandItem<LabelProps>
     labelPosition?: 'left' | 'right' | 'left corner' | 'right corner'
     loading?: boolean
     onChange?: (event: React.ChangeEvent<HTMLInputElement>, data: InputProps & { value: string }) => void
     size?: 'mini' | 'small' | 'large' | 'big' | 'huge' | 'massive'
     tabIndex?: number | string
     transparent?: boolean
     type?: string
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Update the `partitionProps` internal function -- the `ref` is now a regular prop, not the forwardRef parameter:
   ```typescript
   const partitionProps = () => {
     const unhandledProps = getUnhandledProps(Input, props)
     const [htmlInputProps, rest] = partitionHTMLProps(unhandledProps)
     return [
       { ...htmlInputProps, disabled, type, tabIndex: computeTabIndex(), onChange: handleChange, ref },
       rest,
     ]
   }
   ```
5. If Phase 18 has been completed for Input, integrate the Context or documented-cloneElement pattern. If not, preserve the cloneElement call with TypeScript typing.
6. Type the `React.Children.toArray(children)` iteration and the `child.type === 'input'` check.
7. Preserve `Input.create = createShorthandFactory(Input, (type) => ({ type }))`.
8. Remove PropTypes. Delete `Input.d.ts`.
9. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 21.6 -- Convert LabelDetail.js to LabelDetail.tsx

**File:** `src/elements/Label/LabelDetail.js` -> `src/elements/Label/LabelDetail.tsx`

1. Rename to `.tsx`.
2. Define `LabelDetailProps` interface.
3. Remove `React.forwardRef` and PropTypes.
4. Preserve `LabelDetail.create` shorthand factory.
5. Delete `LabelDetail.d.ts`.

### Task 21.7 -- Convert LabelGroup.js to LabelGroup.tsx

**File:** `src/elements/Label/LabelGroup.js` -> `src/elements/Label/LabelGroup.tsx`

1. Rename to `.tsx`.
2. Define `LabelGroupProps` interface with `circular`, `color`, `size`, `tag` props.
3. Remove `React.forwardRef` and PropTypes.
4. Delete `LabelGroup.d.ts`.

### Task 21.8 -- Convert Label.js to Label.tsx

**File:** `src/elements/Label/Label.js` -> `src/elements/Label/Label.tsx`

1. Rename to `.tsx`.
2. Define `LabelProps` interface:
   ```typescript
   export interface LabelProps extends StrictLabelProps {
     [key: string]: any
   }
   export interface StrictLabelProps {
     as?: React.ElementType
     active?: boolean
     attached?: 'top' | 'bottom' | 'top right' | 'top left' | 'bottom left' | 'bottom right'
     basic?: boolean
     children?: React.ReactNode
     circular?: boolean
     className?: string
     color?: SemanticCOLORS
     content?: SemanticShorthandContent
     corner?: boolean | 'left' | 'right'
     detail?: SemanticShorthandItem<LabelDetailProps>
     empty?: boolean
     floating?: boolean
     horizontal?: boolean
     icon?: SemanticShorthandItem<IconProps>
     image?: boolean | SemanticShorthandItem<ImageProps>
     onClick?: (event: React.MouseEvent<HTMLElement>, data: LabelProps) => void
     onRemove?: (event: React.MouseEvent<HTMLElement>, data: LabelProps) => void
     pointing?: boolean | 'above' | 'below' | 'left' | 'right'
     prompt?: boolean
     removeIcon?: SemanticShorthandItem<IconProps>
     ribbon?: boolean | 'right'
     size?: SemanticSIZES
     tag?: boolean
   }
   ```
3. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.
4. Preserve `useEventCallback` for click handling.
5. Preserve the `removeIcon` logic: default to `'delete'` when `removeIcon` is undefined and `onRemove` is set.
6. Preserve static properties:
   ```typescript
   Label.Detail = LabelDetail
   Label.Group = LabelGroup
   Label.create = createShorthandFactory(Label, (value) => ({ content: value }))
   ```
7. Remove PropTypes. Delete `Label.d.ts`.
8. Update `index.js` -> `index.ts`, delete `index.d.ts`.

### Task 21.9 -- Write RTL tests

1. **Icon tests:**
   - Renders as `<i>` with correct icon name class
   - Applies color, size, boolean classes (bordered, circular, disabled, fitted, inverted, link, loading)
   - `aria-hidden="true"` is set when no `aria-label` is provided
   - `aria-label` overrides `aria-hidden`
   - Click handler fires with props; disabled click prevents default
   - `React.memo` wrapping is preserved (verify with React DevTools or by checking `Icon.$$typeof`)
   - `Icon.create('user')` produces `<i class="user icon">`
   - `Icon.Group` is accessible
   - Ref forwarding works

2. **Image tests:**
   - Renders as `<img>` by default with correct classes
   - Renders as `<div>` with nested `<img>` when `dimmer`, `label`, or `wrapped` is set
   - `ui` class is present by default, removed when `ui={false}`
   - Shorthand factory: `Image.create('/photo.jpg')` produces correct `src`
   - `Image.Group` is accessible

3. **Input tests:**
   - Renders with `ui input` classes
   - Action, icon, label shorthand rendering
   - `iconPosition="left"` applies `left icon` class
   - `labelPosition` applies correct class
   - `onChange` fires with value
   - Disabled state applies `-1` tabIndex
   - Children mode: `<input>` child receives htmlInputProps
   - Ref forwarding to the native `<input>` element

4. **Label tests:**
   - Renders with correct classes for all props
   - Icon and Image shorthand rendering
   - `onRemove` renders remove icon, clicking it fires `onRemove`
   - `removeIcon` customizes the remove icon
   - `LabelDetail` shorthand
   - `Label.Detail`, `Label.Group` static properties
   - `Label.create` shorthand factory
   - `pointing` prop generates correct class combinations

---

## Files Affected

| File | Action |
|------|--------|
| `src/elements/Icon/Icon.js` | Rename to `.tsx`, convert |
| `src/elements/Icon/Icon.d.ts` | Delete |
| `src/elements/Icon/IconGroup.js` | Rename to `.tsx`, convert |
| `src/elements/Icon/IconGroup.d.ts` | Delete |
| `src/elements/Icon/index.js` | Rename to `.ts` |
| `src/elements/Icon/index.d.ts` | Delete |
| `src/elements/Image/Image.js` | Rename to `.tsx`, convert |
| `src/elements/Image/Image.d.ts` | Delete |
| `src/elements/Image/ImageGroup.js` | Rename to `.tsx`, convert |
| `src/elements/Image/ImageGroup.d.ts` | Delete |
| `src/elements/Image/index.js` | Rename to `.ts` |
| `src/elements/Image/index.d.ts` | Delete |
| `src/elements/Input/Input.js` | Rename to `.tsx`, convert |
| `src/elements/Input/Input.d.ts` | Delete |
| `src/elements/Input/index.js` | Rename to `.ts` |
| `src/elements/Input/index.d.ts` | Delete |
| `src/elements/Label/Label.js` | Rename to `.tsx`, convert |
| `src/elements/Label/Label.d.ts` | Delete |
| `src/elements/Label/LabelDetail.js` | Rename to `.tsx`, convert |
| `src/elements/Label/LabelDetail.d.ts` | Delete |
| `src/elements/Label/LabelGroup.js` | Rename to `.tsx`, convert |
| `src/elements/Label/LabelGroup.d.ts` | Delete |
| `src/elements/Label/index.js` | Rename to `.ts` |
| `src/elements/Label/index.d.ts` | Delete |

---

## Acceptance Criteria

- [ ] All 10 component files compile as TypeScript without errors
- [ ] All 10 `.d.ts` files are deleted
- [ ] `React.forwardRef` is removed from all components; `ref` is a regular prop
- [ ] PropTypes are removed from all components
- [ ] `React.memo` wrapping on Icon and Flag (from Phase 20) is preserved and works with ref-as-prop
- [ ] `Icon.create`, `Image.create`, `Input.create`, `Label.create` shorthand factories work correctly
- [ ] `Icon.Group`, `Image.Group`, `Label.Detail`, `Label.Group` static properties are typed and accessible
- [ ] Input's two render paths (children mode and shorthand mode) both work
- [ ] Input's ref is forwarded to the native `<input>` element in both render paths
- [ ] Label's `onRemove` + `removeIcon` interaction works
- [ ] Image's conditional ElementType logic (img vs div) works correctly
- [ ] All className building produces identical output to pre-migration
- [ ] RTL tests pass for all components
- [ ] No regressions in components that depend on Icon, Image, Input, or Label (Button, Header, Dropdown, Form, Menu, etc.)
- [ ] The library builds without errors

---

## Rollback Strategy

Each component family can be rolled back independently:

1. **Icon:** Restore `Icon.js`, `IconGroup.js`, `Icon.d.ts`, `IconGroup.d.ts`, `index.js`, `index.d.ts`.
2. **Image:** Restore `Image.js`, `ImageGroup.js`, `Image.d.ts`, `ImageGroup.d.ts`, `index.js`, `index.d.ts`.
3. **Input:** Restore `Input.js`, `Input.d.ts`, `index.js`, `index.d.ts`.
4. **Label:** Restore `Label.js`, `LabelDetail.js`, `LabelGroup.js` and all corresponding `.d.ts` and index files.

Since Icon and Label are used as shorthand targets throughout the library, a rollback of either will require verifying that all consumers still resolve the correct types. If the library's build system uses path-based resolution (not package-level), rollback should be seamless.

---

## Notes for AI Agents

1. **Icon and Label are the most critical components in this phase.** They are imported by Button (Phase 19, already migrated), Header (Phase 20), and dozens of other components. Test `Icon.create` and `Label.create` exhaustively with string values, props objects, and React element values.

2. **`React.memo` + static properties pattern.** Both Icon and Flag use `React.memo`. In the current code:
   ```js
   const MemoIcon = React.memo(Icon)
   MemoIcon.Group = IconGroup
   MemoIcon.create = createShorthandFactory(MemoIcon, (value) => ({ name: value }))
   export default MemoIcon
   ```
   In TypeScript, `React.memo` returns `React.MemoExoticComponent<typeof Icon>`, which does not allow arbitrary property assignment. Use `Object.assign` or a type assertion to attach static properties. The recommended pattern:
   ```typescript
   type IconComponent = React.MemoExoticComponent<typeof Icon> & {
     Group: typeof IconGroup
     create: ReturnType<typeof createShorthandFactory>
   }
   const MemoIcon: IconComponent = Object.assign(React.memo(Icon), {
     Group: IconGroup,
     create: createShorthandFactory(React.memo(Icon), (value: string) => ({ name: value })),
   }) as IconComponent
   ```

3. **Input's `setRef` usage.** In the children render path, Input uses `setRef` to assign refs to both the child's ref and the forwarded ref:
   ```js
   ref: (c) => {
     setRef(child.ref, c)
     setRef(ref, c)
   },
   ```
   In React 19, `child.ref` is accessible as `child.props.ref`. Update accordingly. Also, `setRef` is a utility from `../../lib` that handles both callback refs and ref objects -- ensure it is typed correctly.

4. **Image imports Dimmer from modules.** This cross-layer import (`elements/Image` importing from `modules/Dimmer`) is an existing pattern. Do not change the import path. Dimmer will still be a `.js` file with a `.d.ts` type definition at this point.

5. **Label's `pointing` prop generates a complex class.** The current logic:
   ```js
   const pointingClass =
     (pointing === true && 'pointing') ||
     ((pointing === 'left' || pointing === 'right') && `${pointing} pointing`) ||
     ((pointing === 'above' || pointing === 'below') && `pointing ${pointing}`)
   ```
   This should be preserved exactly. TypeScript can narrow the `pointing` type through the conditional checks.

6. **`customPropTypes` validators being removed.** Input has complex validators:
   - `customPropTypes.itemShorthand` on `action`, `icon`, `input`, `label`
   - `customPropTypes.contentShorthand` is not used on Input
   These runtime validators are replaced by TypeScript interfaces. The specific validation they provided (checking that the value is a valid shorthand format) is lost. If critical, add `process.env.NODE_ENV !== 'production'` runtime checks.

7. **Execution order within this phase:** IconGroup -> Icon -> ImageGroup -> Image -> LabelDetail -> LabelGroup -> Label -> Input. This ensures dependencies (sub-components and shorthand targets) are converted before their consumers.

8. **`htmlImageProps` in Image.** The `partitionHTMLProps(rest, { htmlProps: htmlImageProps })` call uses `htmlImageProps` from `../../lib`. This is an array of valid HTML `<img>` attribute names. Ensure it is imported correctly in TypeScript.

9. **Input size prop is more restrictive than SemanticSIZES.** The PropTypes definition uses:
   ```js
   size: PropTypes.oneOf(['mini', 'small', 'large', 'big', 'huge', 'massive'])
   ```
   This excludes `'medium'` and `'tiny'`. Type accordingly: `size?: 'mini' | 'small' | 'large' | 'big' | 'huge' | 'massive'`.
