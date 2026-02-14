# Testing

## Test Strategy

| Type             | Framework                      | Location                  | Description                       |
| ---------------- | ------------------------------ | ------------------------- | --------------------------------- |
| **Unit**         | Vitest + React Testing Library | `test/specs/`             | Component behavior and rendering  |
| **Conformance**  | Custom (`isConformant`)        | `test/specs/commonTests/` | Standard component contract tests |
| **Common Tests** | Shared test functions          | `test/specs/commonTests/` | Reusable test patterns            |

> There are no integration or end-to-end tests. The Astro docs site serves as a manual integration test.

## Running Tests

```bash
# Watch mode (default)
yarn test

# Single run (CI)
yarn test -- --run

# Single run with coverage
yarn test -- --run --coverage

# Run specific tests
yarn test -- --run test/specs/elements/Button
```

## Test Configuration (`vitest.config.mjs`)

| Setting            | Value                                            |
| ------------------ | ------------------------------------------------ |
| Environment        | `jsdom`                                          |
| Setup file         | `test/setup.js`                                  |
| Globals            | `true` (describe, it, expect available globally) |
| Include pattern    | `test/specs/**/*-test.{js,ts,tsx}`               |
| Coverage provider  | `v8`                                             |
| Coverage reporters | `lcov`, `json`, `text`                           |

### Custom Babel Transform Plugin

Vitest uses a custom Vite plugin (`babelTransformPlugin()`) that transforms all `.js` and `.ts` files through Babel. This handles:

1. JSX syntax in `.js` files (non-standard)
2. `export X from './X'` syntax used throughout the codebase

### Console Override (`test/setup.js`)

Tests **fail on any console output** (`console.log`, `console.warn`, `console.error`). This catches unexpected warnings or errors. Allowed exceptions:

- DOM nesting warnings (e.g., `<div>` inside `<tbody>`) from `rendersChildren` tests
- React concurrent rendering recovery errors

## Test Structure

Tests mirror the `src/` directory:

```
test/
├── specs/
│   ├── addons/           # Addon component tests
│   ├── collections/      # Collection component tests
│   ├── elements/         # Element component tests
│   ├── modules/          # Module component tests
│   ├── views/            # View component tests
│   ├── commonTests/      # Shared test functions
│   │   ├── isConformant.js
│   │   ├── hasUIClassName.js
│   │   ├── hasSubcomponents.js
│   │   └── rendersChildren.js
│   └── lib/              # Utility function tests
├── utils/                # Test helpers
│   ├── domEvent.js       # DOM event simulation
│   ├── getComponentProps.js
│   └── index.js          # Shared test utilities
└── setup.js              # Bootstrap: RTL matchers + console override
```

## Conformance Testing (`isConformant`)

Every component **must** have an `isConformant()` test. This validates:

- Component renders without crashing
- `displayName` is set
- `className` prop is forwarded
- `as` prop is functional
- Unhandled props are spread to root element
- `ref` is forwarded to DOM node

```js
import { common } from 'test/utils'
import Button from 'src/elements/Button/Button'

describe('Button', () => {
  common.isConformant(Button)
})
```

## Writing a Test

```js
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { common } from 'test/utils'
import Button from 'src/elements/Button/Button'

describe('Button', () => {
  common.isConformant(Button)

  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```
