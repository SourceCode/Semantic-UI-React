<!-- Logo -->
<p align="center">
  <a href="https://react.semantic-ui.com">
    <img height="128" width="128" src="https://github.com/Semantic-Org/Semantic-UI-React/raw/master/docs/public/logo.png">
  </a>
</p>

<!-- Name -->
<h1 align="center">
  <a href="https://react.semantic-ui.com/">Semantic UI React</a>
</h1>

<!-- Badges -->
<p align="center">
  <a href="https://circleci.com/gh/Semantic-Org/Semantic-UI-React/tree/master">
    <img alt="Circle" src="https://img.shields.io/circleci/project/github/Semantic-Org/Semantic-UI-React/master.svg?style=flat-square" />
  </a>
  <a href="https://codecov.io/gh/Semantic-Org/Semantic-UI-React">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/Semantic-Org/Semantic-UI-React/master.svg?style=flat-square" />
  </a>
  <a href="https://www.npmjs.com/package/semantic-ui-react">
    <img alt="npm" src="https://img.shields.io/npm/v/semantic-ui-react.svg?style=flat-square" />
  </a>
</p>

The official React component library for [Semantic UI](https://semantic-ui.com/), with built-in CSS, theming, and React 19 support.

## Requirements

- **React** 19.0.0 or later
- **Node.js** 20 or later (for development)
- **Browser**: Chrome 92+, Firefox 90+, Safari 15.4+, Edge 92+

## Installation

```bash
npm install semantic-ui-react react react-dom
```

## CSS Setup

Semantic UI React v4 ships its own CSS. No `semantic-ui-css` package needed.

### Full CSS (simplest)

```js
import 'semantic-ui-react/styles'
```

### Per-component CSS (recommended for smaller bundles)

```js
import 'semantic-ui-react/styles/elements/button.css'
import 'semantic-ui-react/styles/collections/form.css'
```

## Quick Start

```jsx
import { Button } from 'semantic-ui-react'
import 'semantic-ui-react/styles'

function App() {
  return <Button primary>Click Me</Button>
}
```

## Features

- **50+ Components**: Buttons, forms, modals, dropdowns, tables, and more
- **React 19 Native**: ref-as-prop, form actions, React Compiler support
- **Built-in CSS**: No external CSS dependency, with per-component imports
- **Theming**: CSS custom properties for runtime theme switching
- **Dark Mode**: Built-in dark theme
- **TypeScript**: Written in TypeScript with full type safety
- **Accessible**: Built with ARIA attributes and keyboard navigation
- **Tree-Shakeable**: Import only what you use

## Theming

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

## React 19 Form Actions

```jsx
import { Form, useFormAction } from 'semantic-ui-react'

async function submitAction(prevState, formData) {
  return { success: true }
}

function MyForm() {
  const [state, formAction, isPending] = useFormAction(submitAction, {})
  return (
    <Form action={formAction} loading={isPending}>
      <Form.Input name="email" label="Email" />
      <Form.Button type="submit">Submit</Form.Button>
    </Form>
  )
}
```

## Migration from v3

See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions.

## Documentation

See the [**Documentation**](https://react.semantic-ui.com) for full API reference, examples, and guides.

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](LICENSE)
