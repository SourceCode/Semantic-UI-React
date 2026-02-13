# Phase 26: Migrate Form and All Form Subcomponents

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Phase ID**   | 26                                           |
| **Title**      | Migrate Form and All Form Subcomponents       |
| **Stage**      | 5 - Component Migration: Collections          |
| **Dependencies** | Phase 15 (Shared Infrastructure), Phase 19 (Elements -- Button, Input, Label), Phase 21 (Elements -- Icon), Phase 30 (Checkbox, for FormCheckbox) |
| **Complexity** | High                                         |
| **Scope**      | 10 components, 10 type definition files, 1 barrel index |

---

## Objective

Convert the entire Form collection (Form, FormButton, FormCheckbox, FormDropdown, FormField, FormGroup, FormInput, FormRadio, FormSelect, FormTextArea) from JavaScript with PropTypes and `React.forwardRef` to native TypeScript with React 19.2 ref-as-prop semantics. This is the largest collection group with 10 components. Additionally, evaluate and optionally integrate React 19 form primitives (`useActionState`, `useFormStatus`) while maintaining full backward compatibility with the existing `onSubmit` callback pattern.

---

## Background

The Form collection has a two-tier architecture:

**FormField** (`src/collections/Form/FormField.js`) is the central workhorse. It accepts a `control` prop (a React component like `Input`, `Checkbox`, `Dropdown`, or an HTML tag string like `'input'`) and renders it within a field wrapper with label, error, and width support. Key behaviors:
- Uses `React.createElement(control, controlProps)` to render the control dynamically
- Has special-case logic for `control === 'input'` with `type === 'checkbox'` or `type === 'radio'` (wraps in label)
- Has special-case logic for `control === Checkbox` or `control === Radio` (passes label prop through)
- Generates `aria-describedby` and `aria-invalid` attributes for accessibility when `error` and `id` are present
- Uses `Label.create(error, ...)` for error label rendering with `prompt` and `pointing` props
- Uses `createHTMLLabel(label, ...)` for standard HTML labels with `htmlFor` binding
- Uses `getWidthProp(width, 'wide')` for grid-width classes

**Form** (`src/collections/Form/Form.js`) wraps the native `<form>` element with Semantic UI classes. It calls `e.preventDefault()` on submit (unless `action` is a string) and invokes the `onSubmit` callback. Uses `getWidthProp(widths, null, true)` for equal-width fields.

**Form Sugar Components** (FormButton, FormCheckbox, FormDropdown, FormInput, FormRadio, FormSelect, FormTextArea) are thin wrappers following an identical pattern:
```javascript
const FormXxx = React.forwardRef((props, ref) => {
  const { control = DefaultControl } = props
  const rest = getUnhandledProps(FormXxx, props)
  const ElementType = getComponentType(props, { defaultAs: FormField })
  return <ElementType {...rest} control={control} ref={ref} />
})
```
They set a default `control` prop (e.g., `Button`, `Checkbox`, `Dropdown`, `Input`, `Radio`, `Select`, `TextArea`) and delegate everything to FormField. FormSelect additionally passes `options` explicitly.

**Cross-component dependencies**:
- FormField imports `Label` (elements), `Checkbox` (modules), `Radio` (addons)
- FormButton imports `Button` (elements)
- FormCheckbox imports `Checkbox` (modules)
- FormDropdown imports `Dropdown` (modules)
- FormInput imports `Input` (elements)
- FormRadio imports `Radio` (addons)
- FormSelect imports `Select` (addons) and `Dropdown` (modules)
- FormTextArea imports `TextArea` (addons)

---

## Detailed Tasks

### 1. Convert FormField to TypeScript (FIRST -- all sugar components depend on it)

**File**: `src/collections/Form/FormField.js` -> `FormField.tsx`

1.1. Create `FormFieldProps` interface:
```typescript
interface FormFieldProps {
  as?: React.ElementType
  children?: React.ReactNode
  className?: string
  content?: SemanticShorthandContent
  control?: React.ElementType | 'button' | 'input' | 'select' | 'textarea'
  disabled?: boolean
  error?: boolean | SemanticShorthandItem<LabelProps>
  id?: string
  inline?: boolean
  label?: React.ReactNode | object
  required?: boolean
  type?: string
  width?: SemanticWIDTHS
}
```

1.2. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop.

1.3. Remove PropTypes block entirely.

1.4. Replace `_.isNil(control)`, `_.isNil(label)`, `_.get(error, 'pointing', 'above')` with TypeScript-idiomatic equivalents.

1.5. Retain `React.createElement(control, ...)` calls -- these are necessary for dynamic component rendering and are valid in React 19.

1.6. Keep the Checkbox/Radio identity checks (`control === Checkbox`, `control === Radio`) but add TypeScript type narrowing.

1.7. Delete `src/collections/Form/FormField.d.ts`.

### 2. Convert FormGroup to TypeScript

**File**: `src/collections/Form/FormGroup.js` -> `FormGroup.tsx`

2.1. Create `FormGroupProps` interface with `as`, `children`, `className`, `disabled`, `error`, `grouped`, `inline`, `unstackable`, `widths`. Type `widths` as `SemanticWIDTHS | 'equal'`.

2.2. Remove `React.forwardRef`. Accept `ref` as prop.

2.3. Remove PropTypes. Remove `customPropTypes.disallow` mutual exclusion of `grouped`/`inline` -- document as TypeScript comment.

2.4. Delete `src/collections/Form/FormGroup.d.ts`.

### 3. Convert Form to TypeScript

**File**: `src/collections/Form/Form.js` -> `Form.tsx`

3.1. Create `FormProps` interface with all current props. Type `onSubmit` as:
```typescript
onSubmit?: (event: React.FormEvent<HTMLFormElement>, data: FormProps) => void
```

3.2. Remove `React.forwardRef`. Accept `ref` as prop.

3.3. Remove PropTypes. Replace `_.without(SUI.SIZES, 'medium')` with literal union type.

3.4. Replace `_.invoke(e, 'preventDefault')` with `e?.preventDefault?.()`.

3.5. Replace `_.invoke(props, 'onSubmit', e, props, ...args)` with `props.onSubmit?.(e, props)`.

3.6. Attach all subcomponent statics with proper typing.

3.7. **React 19 Form Actions (Optional Enhancement)**: Consider adding optional support for React 19 `<form action={...}>` pattern alongside the existing `onSubmit`. This is additive and should not break existing behavior. If the `action` prop is a function (React 19 server action), pass it through as the form's `action` attribute and skip `preventDefault`. Document this as a new feature.

3.8. Delete `src/collections/Form/Form.d.ts`.

### 4. Convert All Sugar Components to TypeScript

For each of the following, apply the same pattern:

**4.1. FormButton** (`FormButton.js` -> `FormButton.tsx`)
- Create `FormButtonProps` extending relevant Button props
- Default control = `Button`
- Delete `FormButton.d.ts`

**4.2. FormCheckbox** (`FormCheckbox.js` -> `FormCheckbox.tsx`)
- Create `FormCheckboxProps` extending relevant Checkbox props
- Default control = `Checkbox`
- Delete `FormCheckbox.d.ts`

**4.3. FormDropdown** (`FormDropdown.js` -> `FormDropdown.tsx`)
- Create `FormDropdownProps` extending relevant Dropdown props
- Default control = `Dropdown`
- Delete `FormDropdown.d.ts`

**4.4. FormInput** (`FormInput.js` -> `FormInput.tsx`)
- Create `FormInputProps` extending relevant Input props
- Default control = `Input`
- Delete `FormInput.d.ts`

**4.5. FormRadio** (`FormRadio.js` -> `FormRadio.tsx`)
- Create `FormRadioProps` extending relevant Radio props
- Default control = `Radio`
- Delete `FormRadio.d.ts`

**4.6. FormSelect** (`FormSelect.js` -> `FormSelect.tsx`)
- Create `FormSelectProps` with `options` typed as `DropdownItemProps[]` (required)
- Default control = `Select`
- Passes `options` explicitly alongside rest props
- Delete `FormSelect.d.ts`

**4.7. FormTextArea** (`FormTextArea.js` -> `FormTextArea.tsx`)
- Create `FormTextAreaProps` extending relevant TextArea props
- Default control = `TextArea`
- Delete `FormTextArea.d.ts`

### 5. Update Barrel Index

**File**: `src/collections/Form/index.js` -> `index.ts`

5.1. Export Form as default and all subcomponents as named exports.

5.2. Export all prop interfaces as type-only exports.

5.3. Delete `src/collections/Form/index.d.ts`.

### 6. Write RTL Tests

**File**: Create test files in `test/specs/collections/Form/`

6.1. **Form-test.tsx**: Test `ui form` className, `size` class, boolean state classes (`error`, `loading`, `success`, `warning`), `widths='equal'` class, `onSubmit` callback with `preventDefault`, `action` prop pass-through (string action skips preventDefault), `as` prop, ref attachment.

6.2. **FormField-test.tsx**: Test no-control rendering, control rendering with `createElement`, checkbox/radio wrapping in label, Checkbox/Radio component identity check and label pass-through, error label rendering with `pointing` variants (`above`, `below`, `left`, `right`), `width` class, `disabled`/`inline`/`required` classes, `aria-describedby` and `aria-invalid` attributes when error + id, ref attachment.

6.3. **FormGroup-test.tsx**: Test `fields` className, `grouped`/`inline` classes, `widths` classes, `error`/`disabled` classes.

6.4. **FormButton-test.tsx through FormTextArea-test.tsx**: Test that each sugar component renders a FormField with the correct default control, passes through props correctly, accepts `as` and `ref`.

### 7. Remove Obsolete Files

7.1. Delete all 10 `.d.ts` files in `src/collections/Form/`.
7.2. Delete `src/collections/Form/index.d.ts`.

---

## Files Affected

| Action   | File Path                                              |
| -------- | ------------------------------------------------------ |
| Rename   | `src/collections/Form/Form.js` -> `.tsx`               |
| Rename   | `src/collections/Form/FormButton.js` -> `.tsx`         |
| Rename   | `src/collections/Form/FormCheckbox.js` -> `.tsx`       |
| Rename   | `src/collections/Form/FormDropdown.js` -> `.tsx`       |
| Rename   | `src/collections/Form/FormField.js` -> `.tsx`          |
| Rename   | `src/collections/Form/FormGroup.js` -> `.tsx`          |
| Rename   | `src/collections/Form/FormInput.js` -> `.tsx`          |
| Rename   | `src/collections/Form/FormRadio.js` -> `.tsx`          |
| Rename   | `src/collections/Form/FormSelect.js` -> `.tsx`         |
| Rename   | `src/collections/Form/FormTextArea.js` -> `.tsx`       |
| Rename   | `src/collections/Form/index.js` -> `.ts`               |
| Delete   | `src/collections/Form/Form.d.ts`                       |
| Delete   | `src/collections/Form/FormButton.d.ts`                 |
| Delete   | `src/collections/Form/FormCheckbox.d.ts`               |
| Delete   | `src/collections/Form/FormDropdown.d.ts`               |
| Delete   | `src/collections/Form/FormField.d.ts`                  |
| Delete   | `src/collections/Form/FormGroup.d.ts`                  |
| Delete   | `src/collections/Form/FormInput.d.ts`                  |
| Delete   | `src/collections/Form/FormRadio.d.ts`                  |
| Delete   | `src/collections/Form/FormSelect.d.ts`                 |
| Delete   | `src/collections/Form/FormTextArea.d.ts`               |
| Delete   | `src/collections/Form/index.d.ts`                      |
| Create   | `test/specs/collections/Form/Form-test.tsx`            |
| Create   | `test/specs/collections/Form/FormField-test.tsx`       |
| Create   | `test/specs/collections/Form/FormGroup-test.tsx`       |
| Create   | `test/specs/collections/Form/FormButton-test.tsx`      |
| Create   | `test/specs/collections/Form/FormCheckbox-test.tsx`    |
| Create   | `test/specs/collections/Form/FormDropdown-test.tsx`    |
| Create   | `test/specs/collections/Form/FormInput-test.tsx`       |
| Create   | `test/specs/collections/Form/FormRadio-test.tsx`       |
| Create   | `test/specs/collections/Form/FormSelect-test.tsx`      |
| Create   | `test/specs/collections/Form/FormTextArea-test.tsx`    |

---

## Acceptance Criteria

- [ ] All 10 Form components compile with zero TypeScript errors
- [ ] No `React.forwardRef` wrappers remain -- ref is accepted as a regular prop
- [ ] No `PropTypes` imports or runtime type-checking remain in any Form component
- [ ] No `.d.ts` declaration files remain in `src/collections/Form/`
- [ ] All 10 components export their props interfaces as named type exports
- [ ] `Form.Field`, `Form.Button`, `Form.Checkbox`, `Form.Dropdown`, `Form.Group`, `Form.Input`, `Form.Radio`, `Form.Select`, `Form.TextArea` statics are correctly typed
- [ ] FormField correctly handles all three rendering paths: no-control, checkbox/radio control, and generic control
- [ ] FormField error label positioning works for all four `pointing` directions
- [ ] FormField aria attributes (`aria-describedby`, `aria-invalid`) are generated correctly when `error` and `id` are present
- [ ] Form `onSubmit` handler calls `preventDefault` for non-string actions and invokes callback
- [ ] Sugar components (FormButton, FormCheckbox, etc.) correctly delegate to FormField with their default controls
- [ ] FormSelect correctly passes `options` prop through to the Select control
- [ ] RTL tests pass for all 10 components
- [ ] Lodash usage is reduced (replace `_.invoke`, `_.isNil`, `_.get` with native alternatives)
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Backward compatibility with existing `onSubmit` patterns is maintained

---

## Rollback Strategy

1. Revert all renamed `.tsx` files back to `.js` from version control.
2. Restore all deleted `.d.ts` files from version control.
3. Delete newly created test files.
4. The Form collection is widely used as a consumer of other components (Button, Checkbox, Dropdown, Input, etc.) but nothing depends on Form internals except the sugar components within the same directory. Rollback is self-contained.

**Caution**: FormDropdown and FormSelect depend on Dropdown/Select being available. If Phase 31 (Dropdown migration) is incomplete, these components may need to import from the pre-migration Dropdown. Plan the dependency chain carefully.

---

## Notes for AI Agents

- **Migration order within this phase**: FormField MUST be converted first because all 7 sugar components import it and reference `FormField.propTypes.control` for their own PropTypes. Once FormField is TypeScript, the sugar components can reference `FormFieldProps['control']` for their type instead.
- The sugar components are nearly identical in structure. After converting FormButton, you can template the remaining 6 with minimal changes (just the default control import and component name).
- **FormField's `control` prop comparison**: The lines `if (control === Checkbox)` and `if (control === Radio)` compare against imported component references. In TypeScript, this works the same way -- it is a reference equality check. Ensure the imports remain consistent.
- **FormField's `createElement` usage**: `React.createElement(control, controlProps)` is the dynamic rendering mechanism. This is intentional and must not be replaced with JSX (which would require a known component type at compile time). TypeScript will need the `control` type to be `React.ElementType` for this to work.
- **Error label complexity**: FormField's error label has 4 pointing positions that determine whether the error label renders before or after the control. The boolean logic `errorLabelBefore` / `errorLabelAfter` must be preserved exactly.
- **React 19 Form Actions**: If adding `useActionState`/`useFormStatus` support, ensure it is purely additive. The existing `onSubmit` prop must continue working unchanged. Consider: if `action` is a function (not a string), pass it as the form's native `action` prop (React 19 form actions) and do not call `preventDefault`.
- **getWidthProp**: Form uses `getWidthProp(widths, null, true)` where `true` means "use number word" (e.g., `'two'` instead of `2`). FormField uses `getWidthProp(width, 'wide')`. These are different call signatures -- preserve both.
- **FormSelect is special**: Unlike other sugar components, it explicitly destructures and passes `options` in addition to rest props. Do not simplify this away.
