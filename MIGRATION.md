# Migrating from Semantic-UI-React v3 to v4

## Prerequisites

- React 19.0.0 or later
- Node.js 20 or later
- Modern browser (Chrome 92+, Firefox 90+, Safari 15.4+, Edge 92+)

## Step 1: Update Dependencies

```bash
npm install semantic-ui-react@4 react@19 react-dom@19
npm install -D @types/react@19 @types/react-dom@19
```

## Step 2: Replace CSS Import

### Before (v3)

```js
import 'semantic-ui-css/semantic.min.css'
```

### After (v4) -- Full CSS

```js
import 'semantic-ui-react/styles'
```

### After (v4) -- Per-component CSS (recommended)

```js
import 'semantic-ui-react/styles/elements/button.css'
import 'semantic-ui-react/styles/collections/form.css'
```

## Step 3: Remove `semantic-ui-css` Dependency

```bash
npm uninstall semantic-ui-css
```

## Step 4: Update Component Usage (if needed)

### ref Prop

React 19 passes `ref` as a regular prop. If you used `innerRef`, replace it with `ref`:

```diff
- <Dropdown innerRef={myRef} />
+ <Dropdown ref={myRef} />
```

### Class Component Instance Methods

If you used `ref.someMethod()` on class component instances, replace with DOM ref access:

```diff
- const ref = React.createRef()
- ref.current.someMethod()
+ const ref = React.useRef(null)
+ // Access DOM element directly via ref.current
```

### defaultProps

If you relied on component `defaultProps` in your code, note that default values are now inline. This does not affect consumer code that passes props normally.

### UMD Bundle

If you loaded Semantic UI React via a `<script>` tag from a CDN:

**Before:**

```html
<script src="https://unpkg.com/semantic-ui-react/dist/umd/semantic-ui-react.min.js"></script>
```

**After:**

```html
<script type="module">
  import * as SUI from 'https://unpkg.com/semantic-ui-react/dist/esm/semantic-ui-react.mjs'
</script>
```

## Step 5: Adopt New Features (Optional)

### Theming with CSS Custom Properties

```jsx
import { ThemeProvider } from 'semantic-ui-react'
import 'semantic-ui-react/styles/themes/dark.css'

function App() {
  return (
    <ThemeProvider theme="dark">
      <YourApp />
    </ThemeProvider>
  )
}
```

### Form Actions (React 19)

```jsx
import { Form, useFormAction } from 'semantic-ui-react'

async function submitForm(prevState, formData) {
  const name = formData.get('name')
  return { success: true, name }
}

function MyForm() {
  const [state, formAction, isPending] = useFormAction(submitForm, {})

  return (
    <Form action={formAction} loading={isPending}>
      <Form.Input name="name" label="Name" />
      <Form.Button type="submit">Submit</Form.Button>
    </Form>
  )
}
```

### CSS Preloading

```jsx
import { preinitStyles, preloadIconFont } from 'semantic-ui-react'

// Preload CSS early
preinitStyles({ href: '/styles/semantic-ui-react.css', precedence: 'default' })

// Preload icon font
preloadIconFont()
```

### useTheme Hook

```jsx
import { useTheme } from 'semantic-ui-react'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'default' ? 'dark' : 'default')}>
      Current: {theme}
    </button>
  )
}
```

## Troubleshooting

### "Cannot find module 'semantic-ui-css'"

You need to replace the CSS import. See Step 2.

### "React 19 is required" / peer dependency warning

Update React: `npm install react@19 react-dom@19`

### Components look unstyled

Ensure you imported the CSS. See Step 2.

### TypeScript errors after upgrade

Update types: `npm install -D @types/react@19 @types/react-dom@19`

### `innerRef` prop no longer works

Replace `innerRef` with `ref`. See Step 4.
