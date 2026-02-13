# Phase 19: Migrate Button, ButtonContent, ButtonGroup, ButtonOr

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| **Phase ID**    | 19                                                 |
| **Stage**       | 4 - Component Migration (Elements)                 |
| **Dependencies**| Phase 15 (Ref Handling Modernization), Phase 17 (Class Component Migration) |
| **Complexity**  | Medium                                             |
| **Scope**       | 4 component files, 4 type definition files, 2 index files |

---

## Objective

Convert the Button component family (Button, ButtonContent, ButtonGroup, ButtonOr) from JavaScript with PropTypes and `React.forwardRef` to TypeScript with React 19 patterns. Remove PropTypes runtime validation, remove the `forwardRef` wrapper (React 19 supports `ref` as a regular prop), merge the separate `.d.ts` type definition files into the `.tsx` source files, and ensure all shorthand factories, sub-component static properties, and className building continue to work correctly.

---

## Background

The Button component family is a foundational building block in Semantic-UI-React. It is used both directly by consumers and internally by other components (Dropdown, Modal, Confirm, etc.). The Button component has three sub-components attached as static properties:

- `Button.Content` -> `ButtonContent`
- `Button.Group` -> `ButtonGroup`
- `Button.Or` -> `ButtonOr`

Additionally, `Button.create` is a shorthand factory created via `createShorthandFactory(Button, (value) => ({ content: value }))`.

### Current Component Architecture

**Button.js** (73 lines of component + 122 lines of PropTypes = ~195 lines):
- `React.forwardRef` function component
- Uses `useMergedRefs(ref, React.useRef())` for ref management
- Uses `getComponentType`, `getUnhandledProps`, `childrenUtils`, `SUI` from `../../lib`
- Imports `Icon` and `Label` for shorthand rendering
- Contains helper functions: `computeButtonAriaRole`, `computeTabIndex`, `hasIconClass`
- Two render paths: labeled (wraps in container div) and standard
- PropTypes include custom validators from `customPropTypes` (e.g., `disallow`, `givenProps`, `contentShorthand`)

**ButtonContent.js** (~56 lines):
- Simple `React.forwardRef` function component
- Renders children or content with `visible`/`hidden` class toggling
- Minimal PropTypes

**ButtonGroup.js** (~159 lines):
- `React.forwardRef` function component
- Accepts a `buttons` shorthand array, maps over it calling `Button.create(button)`
- Uses `getWidthProp` for even-width distribution
- Many boolean class-toggle props

**ButtonOr.js** (~33 lines):
- Simplest component -- renders a `data-text` attribute for localization
- `React.forwardRef` function component
- Three props: `as`, `className`, `text`

### Current Type Definitions

**Button.d.ts**: Defines `ButtonProps`, `StrictButtonProps` interfaces and declares `Button` as `ForwardRefComponent<ButtonProps, HTMLButtonElement>` with static `Content`, `Group`, `Or` properties. Uses `SemanticShorthandItem<IconProps>` and `SemanticShorthandItem<LabelProps>` for shorthand props.

**ButtonContent.d.ts**, **ButtonGroup.d.ts**, **ButtonOr.d.ts**: Each defines a `Props` and `StrictProps` interface with a `ForwardRefComponent` type declaration.

---

## Detailed Tasks

### Task 19.1 -- Convert ButtonOr.js to ButtonOr.tsx

Start with the simplest component to establish the migration pattern.

**File:** `src/elements/Button/ButtonOr.js` -> `src/elements/Button/ButtonOr.tsx`

1. Rename the file from `.js` to `.tsx`.
2. Remove the `PropTypes` import and the entire `ButtonOr.propTypes` block.
3. Define a `ButtonOrProps` interface based on the existing `ButtonOr.d.ts`:
   ```typescript
   export interface ButtonOrProps extends StrictButtonOrProps {
     [key: string]: any
   }
   export interface StrictButtonOrProps {
     as?: React.ElementType
     className?: string
     text?: number | string
   }
   ```
4. Remove the `React.forwardRef` wrapper. Change the component signature to accept `ref` as a regular prop:
   ```typescript
   function ButtonOr(props: ButtonOrProps) {
     const { className, ref, text } = props
     // ...
   }
   ```
5. Update the `getUnhandledProps` call -- ensure it works with the TypeScript component.
6. Keep `ButtonOr.displayName = 'ButtonOr'`.
7. Delete `ButtonOr.d.ts` since types are now co-located.
8. Export the component as default.

### Task 19.2 -- Convert ButtonContent.js to ButtonContent.tsx

**File:** `src/elements/Button/ButtonContent.js` -> `src/elements/Button/ButtonContent.tsx`

1. Rename the file from `.js` to `.tsx`.
2. Remove `PropTypes` import and `ButtonContent.propTypes` block.
3. Define `ButtonContentProps` and `StrictButtonContentProps` interfaces:
   ```typescript
   export interface ButtonContentProps extends StrictButtonContentProps {
     [key: string]: any
   }
   export interface StrictButtonContentProps {
     as?: React.ElementType
     children?: React.ReactNode
     className?: string
     content?: React.ReactNode
     hidden?: boolean
     visible?: boolean
   }
   ```
4. Remove `React.forwardRef` wrapper. Add `ref` to destructured props.
5. Delete `ButtonContent.d.ts`.

### Task 19.3 -- Convert ButtonGroup.js to ButtonGroup.tsx

**File:** `src/elements/Button/ButtonGroup.js` -> `src/elements/Button/ButtonGroup.tsx`

1. Rename the file from `.js` to `.tsx`.
2. Remove `PropTypes` import and `ButtonGroup.propTypes` block.
3. Define `ButtonGroupProps` interface from the existing `ButtonGroup.d.ts`, incorporating:
   - `attached`, `basic`, `buttons`, `children`, `className`, `color`, `compact`, `content`, `floated`, `fluid`, `icon`, `inverted`, `labeled`, `negative`, `positive`, `primary`, `secondary`, `size`, `toggle`, `vertical`, `widths`
   - Use `SemanticCOLORS`, `SemanticFLOATS`, `SemanticSIZES`, `SemanticWIDTHS` from generic types.
   - The `buttons` prop should be typed as `SemanticShorthandCollection<ButtonProps>` or similar.
4. Remove `React.forwardRef` wrapper. Add `ref` to destructured props.
5. The `_.map(buttons, (button) => Button.create(button))` call must continue to work. Ensure the `Button` import is typed correctly.
6. Delete `ButtonGroup.d.ts`.

### Task 19.4 -- Convert Button.js to Button.tsx

**File:** `src/elements/Button/Button.js` -> `src/elements/Button/Button.tsx`

This is the most complex component in this phase.

1. Rename the file from `.js` to `.tsx`.
2. Remove `PropTypes` import and the entire `Button.propTypes` block (~120 lines).
3. Define `ButtonProps` and `StrictButtonProps` interfaces based on the existing `Button.d.ts`:
   ```typescript
   export interface ButtonProps extends StrictButtonProps {
     [key: string]: any
   }
   export interface StrictButtonProps {
     as?: React.ElementType
     active?: boolean
     animated?: boolean | 'fade' | 'vertical'
     attached?: boolean | 'left' | 'right' | 'top' | 'bottom'
     basic?: boolean
     children?: React.ReactNode
     circular?: boolean
     className?: string
     color?: SemanticCOLORS | 'facebook' | 'google plus' | 'vk' | 'twitter' | 'linkedin' | 'instagram' | 'youtube'
     compact?: boolean
     content?: SemanticShorthandContent
     disabled?: boolean
     floated?: SemanticFLOATS
     fluid?: boolean
     icon?: boolean | SemanticShorthandItem<IconProps>
     inverted?: boolean
     label?: SemanticShorthandItem<LabelProps>
     labelPosition?: 'right' | 'left'
     loading?: boolean
     negative?: boolean
     onClick?: (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => void
     positive?: boolean
     primary?: boolean
     role?: string
     secondary?: boolean
     size?: SemanticSIZES
     tabIndex?: number | string
     toggle?: boolean
     type?: 'button' | 'submit' | 'reset'
   }
   ```
4. Remove `React.forwardRef` wrapper. Destructure `ref` from props alongside other props.
5. Update `useMergedRefs(ref, React.useRef())` -- the `ref` is now a regular prop, not the forwardRef callback parameter.
6. Keep the helper functions `computeButtonAriaRole`, `computeTabIndex`, `hasIconClass` as module-level functions. Add TypeScript type annotations to their parameters and return types.
7. Ensure static property assignments work with the TypeScript module system:
   ```typescript
   Button.Content = ButtonContent
   Button.Group = ButtonGroup
   Button.Or = ButtonOr
   Button.create = createShorthandFactory(Button, (value) => ({ content: value }))
   ```
   This may require declaring Button as a function with additional properties using intersection types or a namespace merge.
8. Delete `Button.d.ts`.

### Task 19.5 -- Update index files

**File:** `src/elements/Button/index.js` -> `src/elements/Button/index.ts`

1. Rename to `.ts`.
2. Update imports/exports to reference `.tsx` files (TypeScript resolution will handle this).
3. Ensure both named and default exports work:
   ```typescript
   export { default } from './Button'
   export type { ButtonProps, StrictButtonProps } from './Button'
   export type { ButtonContentProps } from './ButtonContent'
   export type { ButtonGroupProps } from './ButtonGroup'
   export type { ButtonOrProps } from './ButtonOr'
   ```

**File:** `src/elements/Button/index.d.ts`

1. Delete this file -- the `.ts` index file now serves as both implementation and type source.

### Task 19.6 -- Write RTL tests for all Button components

1. Create or update test files for Button, ButtonContent, ButtonGroup, ButtonOr using React Testing Library (RTL).
2. Test cases for **Button**:
   - Renders as a `<button>` by default
   - Renders as a `<div>` when `attached` or `label` is set
   - Applies `disabled` attribute on native button, aria role on non-button elements
   - `onClick` fires with component props as second argument
   - `onClick` does not fire when `disabled`
   - Icon shorthand renders an Icon component
   - Label shorthand renders a Label component with correct `pointing` direction
   - `tabIndex` computation: explicit value, disabled (-1), div element (0)
   - `toggle` sets `aria-pressed`
   - `ref` is forwarded to the DOM element
   - `Button.create` shorthand factory works with string, object, and element values
3. Test cases for **ButtonContent**: renders visible/hidden classes
4. Test cases for **ButtonGroup**: renders buttons from shorthand array via `Button.create`
5. Test cases for **ButtonOr**: renders `data-text` attribute

---

## Files Affected

| File | Action |
|------|--------|
| `src/elements/Button/Button.js` | Rename to `.tsx`, convert to TypeScript, remove forwardRef/PropTypes |
| `src/elements/Button/ButtonContent.js` | Rename to `.tsx`, convert to TypeScript, remove forwardRef/PropTypes |
| `src/elements/Button/ButtonGroup.js` | Rename to `.tsx`, convert to TypeScript, remove forwardRef/PropTypes |
| `src/elements/Button/ButtonOr.js` | Rename to `.tsx`, convert to TypeScript, remove forwardRef/PropTypes |
| `src/elements/Button/Button.d.ts` | Delete -- merged into Button.tsx |
| `src/elements/Button/ButtonContent.d.ts` | Delete -- merged into ButtonContent.tsx |
| `src/elements/Button/ButtonGroup.d.ts` | Delete -- merged into ButtonGroup.tsx |
| `src/elements/Button/ButtonOr.d.ts` | Delete -- merged into ButtonOr.tsx |
| `src/elements/Button/index.js` | Rename to `.ts`, update imports |
| `src/elements/Button/index.d.ts` | Delete -- merged into index.ts |
| `test/specs/elements/Button/Button-test.js` | Update or rewrite with RTL |
| `test/specs/elements/Button/ButtonContent-test.js` | Update or rewrite with RTL |
| `test/specs/elements/Button/ButtonGroup-test.js` | Update or rewrite with RTL |
| `test/specs/elements/Button/ButtonOr-test.js` | Update or rewrite with RTL |

---

## Acceptance Criteria

- [ ] All four `.js` component files are renamed to `.tsx` and compile without TypeScript errors
- [ ] All four `.d.ts` files are deleted and no longer referenced
- [ ] `React.forwardRef` wrapper is removed from all four components
- [ ] `ref` is accepted as a regular prop in all four components and forwarded to the root DOM element
- [ ] `PropTypes` import and all `.propTypes` blocks are removed from all four files
- [ ] TypeScript interfaces (`ButtonProps`, `ButtonContentProps`, `ButtonGroupProps`, `ButtonOrProps`) are exported from each file
- [ ] `Button.Content`, `Button.Group`, `Button.Or` static properties are correctly typed and accessible
- [ ] `Button.create` shorthand factory works with string, props object, and React element inputs
- [ ] `ButtonGroup` correctly renders buttons from the `buttons` shorthand array
- [ ] All className building logic produces identical output to the pre-migration version
- [ ] `useMergedRefs` continues to work with the new ref handling
- [ ] All helper functions (`computeButtonAriaRole`, `computeTabIndex`, `hasIconClass`) are typed and work correctly
- [ ] RTL tests cover all major Button behaviors (click, disabled, label, icon, toggle, ref forwarding)
- [ ] No regressions in components that depend on Button (Dropdown, Modal, Confirm, etc.)
- [ ] The library builds and all existing tests pass

---

## Rollback Strategy

1. Revert the `.tsx` files back to the original `.js` files using git checkout.
2. Restore the deleted `.d.ts` files from git history.
3. Restore the original `index.js` and `index.d.ts` files.
4. Verify that the library builds and tests pass in the reverted state.

Since Button is an element-level component with no dependencies on other migrated components (it depends on Icon and Label which are not yet migrated in this phase), rollback is isolated and straightforward.

---

## Notes for AI Agents

1. **Static properties on function components in TypeScript.** Assigning `Button.Content = ButtonContent` to a function component requires careful typing. The recommended approach is:
   ```typescript
   interface ButtonComponent extends React.FC<ButtonProps> {
     Content: typeof ButtonContent
     Group: typeof ButtonGroup
     Or: typeof ButtonOr
     create: ReturnType<typeof createShorthandFactory>
   }

   const Button: ButtonComponent = Object.assign(
     function Button(props: ButtonProps) { ... },
     {
       Content: ButtonContent,
       Group: ButtonGroup,
       Or: ButtonOr,
       create: createShorthandFactory(Button, (value) => ({ content: value })),
     }
   )
   ```
   Alternatively, use a namespace merge or declare the function first and then assign properties. The `Object.assign` approach avoids circular reference issues with `Button.create`.

2. **`getUnhandledProps(Button, props)` relies on the component's `propTypes` or `handledProps`.** After removing PropTypes, the library's `getUnhandledProps` utility needs an alternative mechanism to determine which props are "handled." This is expected to be addressed in Phase 15/16. If it is not yet done, add a static `handledProps` array to each component listing all prop names that should be filtered out. Example:
   ```typescript
   Button.handledProps = [
     'active', 'animated', 'attached', 'basic', 'children', 'circular',
     'className', 'color', 'compact', 'content', 'disabled', 'floated',
     'fluid', 'icon', 'inverted', 'label', 'labelPosition', 'loading',
     'negative', 'onClick', 'positive', 'primary', 'role', 'secondary',
     'size', 'tabIndex', 'toggle', 'type',
   ]
   ```

3. **The `[key: string]: any` index signature on `ButtonProps`.** This is present in the current `.d.ts` files and allows passing arbitrary HTML attributes. It must be preserved for backward compatibility. In TypeScript, this means the interface must use an index signature. Be aware that this can mask type errors; consider replacing with `React.HTMLAttributes<HTMLButtonElement>` intersection in a future phase.

4. **Import paths.** Button.js imports `Icon` from `'../Icon/Icon'` (direct file) and `Label` from `'../Label/Label'` (direct file), not from the index. This avoids circular dependency issues. Preserve these direct imports when converting to TypeScript.

5. **`customPropTypes` validators.** Props like `children` use complex validators like `customPropTypes.every([...])`, `customPropTypes.disallow(['label'])`, and `customPropTypes.givenProps(...)`. These have no TypeScript equivalent and provide runtime validation only. When removing PropTypes, these validations are lost. Document in the migration notes which validations are being dropped and consider adding runtime `if (process.env.NODE_ENV !== 'production')` warnings for the most important ones.

6. **`lodash` usage.** Button.js uses `_.isNil`, `_.invoke`. These should be preserved as-is during this phase. Lodash removal is a separate concern for a later phase.

7. **Test file pattern.** Check the existing test directory structure. Tests may be in `test/specs/elements/Button/` or similar. The existing tests likely use Enzyme. They should be rewritten using RTL (`@testing-library/react`). If the project is not yet configured for RTL, that setup is a prerequisite from Phase 15.

8. **Execution order.** Convert in this order: ButtonOr (simplest), ButtonContent, ButtonGroup, Button (most complex). This way, `ButtonGroup.tsx` can import from `Button.tsx`, and `Button.tsx` can import from the already-converted sub-components.
