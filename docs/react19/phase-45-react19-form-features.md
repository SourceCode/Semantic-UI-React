# Phase 45: Implement React 19 Form Features

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-45                                                                 |
| **Title**        | Implement React 19 Form Features                                         |
| **Stage**        | 9 -- New React 19 Features                                               |
| **Dependencies** | Phase 26 (Form component migration to function component)               |
| **Complexity**   | Medium                                                                   |
| **Scope**        | Form component, FormButton, new hooks, new components, TypeScript types  |

---

## Objective

Extend the Form component family with React 19's new form features: `useActionState` for form action state management, `useFormStatus` for pending state awareness in form children, form `action` prop support for server/client actions, `useOptimistic` for optimistic UI updates, and `formAction` prop support on buttons. These features must be additive -- the existing `onSubmit` callback pattern must continue to work unchanged. Consumers can opt into the new patterns incrementally.

---

## Background

### React 19 Form Features Overview

React 19 introduces several primitives for form handling:

1. **`useActionState(action, initialState)`**: Manages form action state (pending, result, error). Returns `[state, formAction, isPending]`. The `formAction` is passed to `<form action={formAction}>`.

2. **`useFormStatus()`**: Returns `{ pending, data, method, action }` for the nearest parent `<form>` that was submitted with an action. Must be called from a component rendered inside a `<form>`.

3. **Form `action` prop**: `<form action={asyncFunction}>` -- React intercepts form submission and calls the async function with `FormData`. Supports both client-side and server-side actions.

4. **`useOptimistic(state, updateFn)`**: Provides optimistic state that reverts when an action completes or errors.

5. **Button `formAction` prop**: `<button formAction={asyncFunction}>` -- individual buttons can trigger different actions within the same form.

### Current Form Component Architecture

The Form component (`J:\code\semantic\Semantic-UI-React\src\collections\Form\Form.js`) is a function component using `React.forwardRef` (lines 27-72). Its current behavior:

- Renders as `<form>` by default (line 65: `getComponentType(props, { defaultAs: 'form' })`)
- Accepts an `action` prop typed as `PropTypes.string` (line 81) -- currently only for the HTML form `action` attribute
- Has an `onSubmit` callback prop (line 99) invoked via `_.invoke(props, 'onSubmit', e, props, ...args)` (line 47)
- Prevents default submission if `action` is not a string (line 46: `if (typeof action !== 'string') _.invoke(e, 'preventDefault')`)
- Passes `action` directly to the rendered element (line 68: `<ElementType {...rest} action={action}>`)

The Form component family includes:
- `Form` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\Form.js`)
- `FormButton` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormButton.js`)
- `FormCheckbox` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormCheckbox.js`)
- `FormDropdown` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormDropdown.js`)
- `FormField` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormField.js`)
- `FormGroup` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormGroup.js`)
- `FormInput` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormInput.js`)
- `FormRadio` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormRadio.js`)
- `FormSelect` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormSelect.js`)
- `FormTextArea` (`J:\code\semantic\Semantic-UI-React\src\collections\Form\FormTextArea.js`)

---

## Detailed Tasks

### 1. Update the Form `action` prop to support async functions

Modify `J:\code\semantic\Semantic-UI-React\src\collections\Form\Form.js`:

Currently, the `action` prop is typed as `PropTypes.string` (line 81). Update it to accept both strings (HTML action URL) and functions (React 19 form actions):

```js
Form.propTypes = {
  // ...existing props...

  /** The HTML form action URL, or a React 19 form action function. */
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}
```

Update the `handleSubmit` function (lines 43-48) to handle the new action pattern:

```js
const handleSubmit = (e, ...args) => {
  // If action is a function (React 19 form action), let React handle it natively
  // Do not preventDefault -- React 19 manages the form submission lifecycle
  if (typeof action === 'function') {
    // React 19 handles form actions natively when action prop is a function
    // Still invoke onSubmit callback if provided, for backward compatibility
    _.invoke(props, 'onSubmit', e, props, ...args)
    return
  }

  // Legacy behavior: prevent default if action is not a string URL
  if (typeof action !== 'string') _.invoke(e, 'preventDefault')
  _.invoke(props, 'onSubmit', e, props, ...args)
}
```

**Important**: When `action` is a function, the `<form action={action}>` is rendered directly, and React 19 intercepts the form submission. The `handleSubmit` is still called (via `onSubmit`), but `preventDefault` must NOT be called because React 19 needs the native form submission event.

### 2. Create `useFormAction` convenience hook

Create `J:\code\semantic\Semantic-UI-React\src\lib\hooks\useFormAction.js`:

This hook wraps `React.useActionState` and returns values compatible with the Form component:

```js
import * as React from 'react'

/**
 * Convenience hook wrapping React.useActionState for use with Form component.
 *
 * @param {Function} action - Async function (prevState, formData) => newState
 * @param {*} initialState - Initial state value
 * @param {string} [permalink] - Optional permalink for progressive enhancement
 * @returns {[state: any, formAction: Function, isPending: boolean]}
 *
 * @example
 * const [state, formAction, isPending] = useFormAction(async (prev, formData) => {
 *   const result = await submitForm(formData)
 *   return result
 * }, { error: null, data: null })
 *
 * <Form action={formAction} loading={isPending}>
 *   ...
 * </Form>
 */
export default function useFormAction(action, initialState, permalink) {
  return React.useActionState(action, initialState, permalink)
}
```

Also create `J:\code\semantic\Semantic-UI-React\src\lib\hooks\useFormAction.d.ts`:

```typescript
export default function useFormAction<State>(
  action: (prevState: State, formData: FormData) => State | Promise<State>,
  initialState: State,
  permalink?: string,
): [state: State, formAction: (payload: FormData) => void, isPending: boolean]
```

### 3. Create `FormStatus` component

Create `J:\code\semantic\Semantic-UI-React\src\collections\Form\FormStatus.js`:

```js
import * as React from 'react'
import PropTypes from 'prop-types'

/**
 * FormStatus provides the pending state of the nearest parent Form's action.
 * It must be rendered inside a Form that uses a form action.
 *
 * Uses React 19's useFormStatus hook internally.
 *
 * @see Form
 */
const FormStatus = (props) => {
  const { children } = props
  const status = React.useFormStatus()

  if (typeof children === 'function') {
    return children(status)
  }

  return children
}

FormStatus.displayName = 'FormStatus'

FormStatus.propTypes = {
  /**
   * Render function or React node.
   * When a function, receives { pending, data, method, action } as argument.
   *
   * @param {{ pending: boolean, data: FormData|null, method: string, action: string|Function }} status
   * @returns {React.ReactNode}
   */
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
}

export default FormStatus
```

Also create `J:\code\semantic\Semantic-UI-React\src\collections\Form\FormStatus.d.ts`:

```typescript
import * as React from 'react'

export interface FormStatusProps {
  children: React.ReactNode | ((status: {
    pending: boolean
    data: FormData | null
    method: string
    action: string | ((formData: FormData) => void)
  }) => React.ReactNode)
}

declare const FormStatus: React.FC<FormStatusProps>
export default FormStatus
```

### 4. Update FormButton to support `formAction` prop

Modify `J:\code\semantic\Semantic-UI-React\src\collections\Form\FormButton.js`:

Add the `formAction` prop to FormButton, which passes it through to the underlying Button component:

```js
FormButton.propTypes = {
  // ...existing props...

  /** A form action function for this specific button. Overrides the form-level action. */
  formAction: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}
```

The `formAction` prop is passed directly to the `<button>` element via the unhandled props mechanism (`getUnhandledProps`), which already passes through unknown props. Verify that `formAction` is NOT in the handled props list so it passes through correctly.

### 5. Create `useFormStatus` re-export

Create `J:\code\semantic\Semantic-UI-React\src\lib\hooks\useFormStatus.js`:

```js
import * as React from 'react'

/**
 * Re-export of React.useFormStatus for convenience.
 * Returns the status of the nearest parent <form> submission.
 *
 * Must be called from a component rendered inside a <Form> that uses a form action.
 *
 * @returns {{ pending: boolean, data: FormData|null, method: string, action: string|Function }}
 */
export default function useFormStatus() {
  return React.useFormStatus()
}
```

### 6. Create `useOptimistic` re-export with Form integration

Create `J:\code\semantic\Semantic-UI-React\src\lib\hooks\useOptimistic.js`:

```js
import * as React from 'react'

/**
 * Re-export of React.useOptimistic for convenience.
 * Provides optimistic state updates during form action execution.
 *
 * @param {*} state - The current state value
 * @param {Function} updateFn - Function (currentState, optimisticValue) => newState
 * @returns {[optimisticState: any, addOptimistic: Function]}
 *
 * @example
 * const [optimisticItems, addOptimisticItem] = useOptimistic(
 *   items,
 *   (currentItems, newItem) => [...currentItems, { ...newItem, pending: true }]
 * )
 */
export default function useOptimistic(state, updateFn) {
  return React.useOptimistic(state, updateFn)
}
```

### 7. Auto-wire Form `loading` state from `useFormStatus`

Update the Form component to automatically show loading state when a form action is pending. Add an internal component that uses `useFormStatus`:

This is tricky because `useFormStatus` must be called from INSIDE the `<form>`, but the Form component renders the `<form>`. The solution is to use an inner wrapper component:

Create `J:\code\semantic\Semantic-UI-React\src\collections\Form\FormInner.js`:

```js
import * as React from 'react'

/**
 * Internal component rendered inside <form> to access useFormStatus.
 * Applies the 'loading' class to the form when an action is pending.
 */
const FormInner = ({ children, formRef, onPendingChange }) => {
  const { pending } = React.useFormStatus()

  React.useEffect(() => {
    onPendingChange?.(pending)
  }, [pending, onPendingChange])

  return children
}

export default FormInner
```

However, this adds complexity. A simpler approach is to document that consumers should pass the `isPending` value from `useActionState` to the Form's `loading` prop:

```jsx
const [state, formAction, isPending] = useFormAction(myAction, initialState)

<Form action={formAction} loading={isPending}>
  {/* form fields */}
</Form>
```

**Recommendation**: Use the simpler approach (consumer passes `isPending` to `loading`). Do NOT auto-wire. This keeps the Form component simple and avoids the inner-component pattern.

### 8. Register FormStatus on Form component

Update `J:\code\semantic\Semantic-UI-React\src\collections\Form\Form.js` to register the new sub-component:

```js
import FormStatus from './FormStatus'

// Add at the end, alongside other sub-components (lines 120-128):
Form.Status = FormStatus
```

### 9. Export new hooks from the library index

Update `J:\code\semantic\Semantic-UI-React\src\index.js` to export the new hooks:

```js
export { default as useFormAction } from './lib/hooks/useFormAction'
export { default as useFormStatus } from './lib/hooks/useFormStatus'
export { default as useOptimistic } from './lib/hooks/useOptimistic'
```

### 10. Update TypeScript declarations

Update `J:\code\semantic\Semantic-UI-React\index.d.ts` to include:

- Updated `FormProps` with `action: string | ((formData: FormData) => void | Promise<void>)`
- `FormStatus` component type
- `FormButtonProps` with `formAction` prop
- `useFormAction` hook type
- `useFormStatus` hook type
- `useOptimistic` hook type

Update the Form type in the existing `J:\code\semantic\Semantic-UI-React\src\collections\Form\Form.d.ts`:

```typescript
export interface FormProps extends StrictFormProps {
  [key: string]: any
}

export interface StrictFormProps {
  as?: any
  action?: string | ((formData: FormData) => void | Promise<void>)
  children?: React.ReactNode
  className?: string
  error?: boolean
  inverted?: boolean
  loading?: boolean
  onSubmit?: (event: React.FormEvent<HTMLFormElement>, data: FormProps) => void
  reply?: boolean
  size?: string
  success?: boolean
  unstackable?: boolean
  warning?: boolean
  widths?: 'equal'
}

export interface FormComponent extends React.ForwardRefExoticComponent<FormProps & React.RefAttributes<HTMLFormElement>> {
  Button: typeof FormButton
  Checkbox: typeof FormCheckbox
  Dropdown: typeof FormDropdown
  Field: typeof FormField
  Group: typeof FormGroup
  Input: typeof FormInput
  Radio: typeof FormRadio
  Select: typeof FormSelect
  Status: typeof FormStatus
  TextArea: typeof FormTextArea
}
```

### 11. Create comprehensive examples

Create documentation examples showing the new form patterns:

**Example 1: Basic form action**
```jsx
import { Form, useFormAction } from 'semantic-ui-react'

function ContactForm() {
  const [state, formAction, isPending] = useFormAction(
    async (prevState, formData) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })
      return response.json()
    },
    { message: null, error: null },
  )

  return (
    <Form action={formAction} loading={isPending} success={!!state.message} error={!!state.error}>
      <Form.Input label="Name" name="name" required />
      <Form.Input label="Email" name="email" type="email" required />
      <Form.TextArea label="Message" name="message" required />
      <Form.Button type="submit">Send</Form.Button>
      {state.message && <Message success header="Sent!" content={state.message} />}
      {state.error && <Message error header="Error" content={state.error} />}
    </Form>
  )
}
```

**Example 2: Form with pending status feedback**
```jsx
function SubmitButton() {
  return (
    <Form.Status>
      {({ pending }) => (
        <Form.Button type="submit" disabled={pending} loading={pending}>
          {pending ? 'Submitting...' : 'Submit'}
        </Form.Button>
      )}
    </Form.Status>
  )
}
```

**Example 3: Multiple actions with formAction**
```jsx
function MultiActionForm() {
  const [state, formAction, isPending] = useFormAction(handleSave, initialState)

  return (
    <Form action={formAction} loading={isPending}>
      <Form.Input label="Title" name="title" />
      <Form.Button type="submit">Save</Form.Button>
      <Form.Button formAction={handleSaveAndPublish}>Save & Publish</Form.Button>
    </Form>
  )
}
```

**Example 4: Optimistic updates**
```jsx
function TodoForm({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (current, newTodo) => [...current, { ...newTodo, pending: true }],
  )

  const [state, formAction] = useFormAction(async (prev, formData) => {
    const newTodo = { text: formData.get('text'), id: Date.now() }
    addOptimisticTodo(newTodo)
    await saveTodo(newTodo)
    return { ...prev }
  }, {})

  return (
    <Form action={formAction}>
      <Form.Input name="text" placeholder="Add todo..." />
      <Form.Button type="submit">Add</Form.Button>
    </Form>
  )
}
```

### 12. Maintain backward compatibility with `onSubmit`

Verify that the existing `onSubmit` pattern continues to work without changes:

```jsx
// This MUST still work exactly as before
<Form onSubmit={(e, data) => console.log(data)}>
  <Form.Input label="Name" name="name" />
  <Form.Button>Submit</Form.Button>
</Form>
```

The `handleSubmit` function must correctly handle all three cases:
1. `action` is undefined, `onSubmit` is provided: preventDefault + call onSubmit (existing behavior)
2. `action` is a string URL: native form submission (existing behavior)
3. `action` is a function: React 19 form action + optional onSubmit callback (new behavior)

---

## Files Affected

| File | Action |
|------|--------|
| `src/collections/Form/Form.js` | MODIFY (action prop type, handleSubmit logic, add Form.Status) |
| `src/collections/Form/Form.d.ts` | MODIFY (action type, add FormStatus) |
| `src/collections/Form/FormButton.js` | MODIFY (add formAction prop) |
| `src/collections/Form/FormButton.d.ts` | MODIFY (add formAction type) |
| `src/collections/Form/FormStatus.js` | CREATE |
| `src/collections/Form/FormStatus.d.ts` | CREATE |
| `src/collections/Form/index.js` | MODIFY (export FormStatus) |
| `src/collections/Form/index.d.ts` | MODIFY (export FormStatus) |
| `src/lib/hooks/useFormAction.js` | CREATE |
| `src/lib/hooks/useFormAction.d.ts` | CREATE |
| `src/lib/hooks/useFormStatus.js` | CREATE |
| `src/lib/hooks/useFormStatus.d.ts` | CREATE |
| `src/lib/hooks/useOptimistic.js` | CREATE |
| `src/lib/hooks/useOptimistic.d.ts` | CREATE |
| `src/lib/hooks/index.js` | MODIFY (export new hooks) |
| `src/index.js` | MODIFY (export new hooks) |
| `index.d.ts` | MODIFY (add hook types, FormStatus type) |

**Total: ~10 files created, ~7 files modified**

---

## Acceptance Criteria

- [ ] `Form` component accepts `action` as both `string` and `function`
- [ ] When `action` is a function, React 19 form action lifecycle is used (no preventDefault)
- [ ] When `action` is a string or undefined, existing behavior is preserved exactly
- [ ] `onSubmit` callback works alongside form actions (called in addition to the action)
- [ ] `Form.Status` component renders and receives `useFormStatus` data
- [ ] `Form.Status` supports render function children `{({ pending }) => ...}`
- [ ] `FormButton` accepts and passes through `formAction` prop
- [ ] `useFormAction` hook wraps `React.useActionState` and returns `[state, formAction, isPending]`
- [ ] `useFormStatus` hook re-exports `React.useFormStatus`
- [ ] `useOptimistic` hook re-exports `React.useOptimistic`
- [ ] All new hooks and components are exported from the library's main entry point
- [ ] TypeScript declarations are complete for all new APIs
- [ ] Existing Form tests pass without modification
- [ ] New tests cover form action, FormStatus, and formAction patterns
- [ ] Documentation examples demonstrate all four form patterns (basic action, pending status, multiple actions, optimistic updates)

---

## Rollback Strategy

1. Revert `Form.js` to accept `action` only as `PropTypes.string`.
2. Delete the `FormStatus.js` component and remove `Form.Status` registration.
3. Delete the three new hooks (`useFormAction`, `useFormStatus`, `useOptimistic`).
4. Revert `FormButton.js` to remove `formAction` prop.
5. Remove the new exports from `src/index.js`.
6. All changes are additive -- removing them returns the Form to its pre-Phase 45 behavior.

---

## Notes for AI Agents

1. **The `action` prop collision is the trickiest part.** The Form component currently has `action: PropTypes.string` which maps to the HTML `<form action="URL">` attribute. React 19 overloads this same prop to accept functions. The Form component must detect whether `action` is a string or function and behave accordingly. The existing code at line 46 already checks `typeof action !== 'string'` -- extend this check to handle the function case explicitly.

2. **`useFormStatus` has a placement requirement.** It MUST be called from a component that is a descendant of a `<form>` element that was submitted with an action. Calling it from the Form component itself will NOT work because the Form component renders the `<form>` -- `useFormStatus` needs to be called from INSIDE the form. This is why `FormStatus` is a separate child component, not integrated into Form itself.

3. **Do NOT auto-wire `loading` from form status.** It is tempting to automatically set the Form's `loading` class based on the form action's pending state, but this requires an inner component and adds hidden complexity. Instead, document that consumers should pass `isPending` from `useActionState` to the `loading` prop. This is explicit and predictable.

4. **The `useFormAction` hook is a thin wrapper.** Its value is discoverability -- consumers importing from `semantic-ui-react` will find it alongside the Form component. It also provides a place to add Semantic-UI-specific behavior in the future (e.g., automatic error state mapping).

5. **`useOptimistic` is a pure re-export.** Its inclusion in the library is for API completeness -- consumers do not need to import from both `react` and `semantic-ui-react` for form-related hooks.

6. **The `handleSubmit` function in Form.js** (lines 43-48) currently uses `_.invoke(e, 'preventDefault')` and `_.invoke(props, 'onSubmit', e, props, ...args)`. After Phase 15 removes lodash, these will be native calls. Regardless of lodash status, the logic must correctly handle the three action cases.

7. **FormButton already passes through props.** The `getUnhandledProps` utility in `J:\code\semantic\Semantic-UI-React\src\lib\getUnhandledProps.js` passes through any props not explicitly declared as handled. Since `formAction` is a new HTML attribute, it may already pass through without code changes. Verify by checking if `formAction` is in the handled props list. If it already passes through, the only change needed is updating PropTypes and TypeScript types.

8. **The `'use server'` directive** for server actions is NOT relevant to this library. Semantic-UI-React is a client-side component library. Server actions are defined by the consumer's application framework (Next.js, etc.). The library just needs to accept functions as the `action` prop and let React handle the rest.
