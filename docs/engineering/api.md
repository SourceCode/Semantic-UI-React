# API — Component Conventions

Semantic UI React is a component library, not a REST API. This document covers the **component API conventions** that apply across all components.

## Common Props

Every component accepts these base props:

| Prop        | Type                | Description                                                 |
| ----------- | ------------------- | ----------------------------------------------------------- |
| `as`        | `React.ElementType` | Render as a different element (e.g., `as="a"`, `as={Link}`) |
| `className` | `string`            | Additional CSS classes                                      |
| `children`  | `React.ReactNode`   | Child content                                               |
| `ref`       | `React.Ref`         | Direct ref (React 19 ref-as-prop)                           |

## Controlled / Uncontrolled Pattern

Components with state support both controlled and uncontrolled modes:

| Controlled Prop | Uncontrolled Prop    | Components                                           |
| --------------- | -------------------- | ---------------------------------------------------- |
| `value`         | `defaultValue`       | `Dropdown`, `Input`, `Search`, `Rating`              |
| `open`          | `defaultOpen`        | `Dropdown`, `Popup`, `Modal`, `Sidebar`, `Accordion` |
| `active`        | `defaultActive`      | `Accordion`                                          |
| `activeIndex`   | `defaultActiveIndex` | `Accordion`, `Tab`                                   |
| `activePage`    | `defaultActivePage`  | `Pagination`                                         |

## Event Handlers

All event handlers receive `(event, data)`:

```typescript
interface ButtonProps {
  onClick?: (event: React.MouseEvent, data: ButtonProps) => void
}
```

The second argument (`data`) always contains the component's props merged with any computed values, enabling access to component state without refs.

## Sub-component Pattern

Complex components expose sub-components as static properties:

```jsx
<Form>
  <Form.Field>
    <Form.Input label='Name' />
  </Form.Field>
  <Form.Group>
    <Form.Button>Submit</Form.Button>
  </Form.Group>
</Form>
```

Sub-components are also available as standalone imports:

```jsx
import { FormField, FormInput, FormButton } from 'semantic-ui-react'
```

## className Construction

Components use helper functions from `src/lib/classNameBuilders.js`:

| Helper                            | Usage                                   |
| --------------------------------- | --------------------------------------- |
| `useKeyOnly(value, key)`          | Boolean props → `"disabled"`            |
| `useKeyOrValueAndKey(value, key)` | Boolean or string → `"left floated"`    |
| `useValueAndKey(value, key)`      | String value + key → `"left aligned"`   |
| `useTextAlignProp(value)`         | Text alignment → `"center aligned"`     |
| `useVerticalAlignProp(value)`     | Vertical alignment → `"middle aligned"` |
| `useWidthProp(value, type)`       | Width → `"four wide"` / `"four column"` |
| `useMultipleProp(value, key)`     | Array → `"small medium"`                |

## React 19 Form API

```jsx
import { Form, useFormAction, useFormStatus } from 'semantic-ui-react'

function MyForm() {
  async function handleSubmit(formData) {
    await saveData(formData)
  }

  return (
    <Form action={handleSubmit}>
      <Form.Input name='email' label='Email' />
      <Form.Status>
        {({ pending }) => <Form.Button loading={pending}>Submit</Form.Button>}
      </Form.Status>
    </Form>
  )
}
```

## Hooks

| Hook                        | Module                                       | Description                              |
| --------------------------- | -------------------------------------------- | ---------------------------------------- |
| `useTheme`                  | `src/lib/hooks/useTheme.ts`                  | Access current theme context             |
| `useFormAction`             | `src/lib/hooks/useFormAction.ts`             | Wraps `React.useActionState`             |
| `useFormStatus`             | `src/lib/hooks/useFormStatus.ts`             | Re-exports from `react-dom`              |
| `useOptimistic`             | `src/lib/hooks/useOptimistic.ts`             | Re-exports from `react`                  |
| `useAutoControlledValue`    | `src/lib/hooks/useAutoControlledValue.js`    | Controlled/uncontrolled state management |
| `useMergedRefs`             | `src/lib/hooks/useMergedRefs.js`             | Merge multiple refs into one             |
| `useEventCallback`          | `src/lib/hooks/useEventCallback.js`          | Stable callback reference                |
| `usePrevious`               | `src/lib/hooks/usePrevious.js`               | Access previous render value             |
| `useForceUpdate`            | `src/lib/hooks/useForceUpdate.js`            | Force re-render trigger                  |
| `useClassNamesOnNode`       | `src/lib/hooks/useClassNamesOnNode.js`       | Apply classes to DOM nodes               |
| `useIsomorphicLayoutEffect` | `src/lib/hooks/useIsomorphicLayoutEffect.js` | SSR-safe `useLayoutEffect`               |
