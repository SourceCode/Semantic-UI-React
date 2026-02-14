# Functionality

## Component Categories

Semantic UI React organizes 50+ components into five categories:

### Addons

Utility components that enhance other components or provide standalone functionality.

| Component              | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `Confirm`              | Confirmation dialog wrapping `Modal`                          |
| `Pagination`           | Page navigation with customizable items                       |
| `Portal`               | Renders children into a DOM node outside the parent hierarchy |
| `Radio`                | Shorthand for `Checkbox` with `type="radio"`                  |
| `Select`               | Shorthand for `Dropdown` with `selection`                     |
| `TextArea`             | Auto-sizing textarea element                                  |
| `ThemeProvider`        | Scoped CSS custom property theming via React Context          |
| `TransitionablePortal` | Portal with enter/exit transitions                            |

### Collections

Compound components that group related elements.

| Component    | Sub-components                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Breadcrumb` | `Breadcrumb.Section`, `Breadcrumb.Divider`                                                                                              |
| `Form`       | `Form.Button`, `Form.Checkbox`, `Form.Dropdown`, `Form.Field`, `Form.Group`, `Form.Input`, `Form.Radio`, `Form.Select`, `Form.TextArea` |
| `Grid`       | `Grid.Column`, `Grid.Row`                                                                                                               |
| `Menu`       | `Menu.Header`, `Menu.Item`, `Menu.Menu`                                                                                                 |
| `Message`    | `Message.Content`, `Message.Header`, `Message.Item`, `Message.List`                                                                     |
| `Table`      | `Table.Body`, `Table.Cell`, `Table.Footer`, `Table.Header`, `Table.HeaderCell`, `Table.Row`                                             |

### Elements

Basic UI building blocks.

| Component     | Sub-components                                                                           |
| ------------- | ---------------------------------------------------------------------------------------- |
| `Button`      | `Button.Content`, `Button.Group`, `Button.Or`                                            |
| `Container`   | —                                                                                        |
| `Divider`     | —                                                                                        |
| `Flag`        | —                                                                                        |
| `Header`      | `Header.Content`, `Header.Subheader`                                                     |
| `Icon`        | `Icon.Group`                                                                             |
| `Image`       | `Image.Group`                                                                            |
| `Input`       | —                                                                                        |
| `Label`       | `Label.Detail`, `Label.Group`                                                            |
| `List`        | `List.Content`, `List.Description`, `List.Header`, `List.Icon`, `List.Item`, `List.List` |
| `Loader`      | —                                                                                        |
| `Placeholder` | `Placeholder.Header`, `Placeholder.Image`, `Placeholder.Line`, `Placeholder.Paragraph`   |
| `Rail`        | —                                                                                        |
| `Reveal`      | `Reveal.Content`                                                                         |
| `Segment`     | `Segment.Group`, `Segment.Inline`                                                        |
| `Step`        | `Step.Content`, `Step.Description`, `Step.Group`, `Step.Title`                           |

### Modules

Interactive components with complex behavior.

| Component    | Sub-components                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `Accordion`  | `Accordion.Accordion`, `Accordion.Content`, `Accordion.Panel`, `Accordion.Title`                |
| `Checkbox`   | —                                                                                               |
| `Dimmer`     | `Dimmer.Dimmable`, `Dimmer.Inner`                                                               |
| `Dropdown`   | `Dropdown.Divider`, `Dropdown.Header`, `Dropdown.Item`, `Dropdown.Menu`, `Dropdown.SearchInput` |
| `Embed`      | —                                                                                               |
| `Modal`      | `Modal.Actions`, `Modal.Content`, `Modal.Description`, `Modal.Dimmer`, `Modal.Header`           |
| `Popup`      | `Popup.Content`, `Popup.Header`                                                                 |
| `Progress`   | —                                                                                               |
| `Rating`     | `Rating.Icon`                                                                                   |
| `Search`     | `Search.Category`, `Search.Result`, `Search.Results`                                            |
| `Sidebar`    | `Sidebar.Pushable`, `Sidebar.Pusher`                                                            |
| `Sticky`     | —                                                                                               |
| `Tab`        | `Tab.Pane`                                                                                      |
| `Transition` | `Transition.Group`                                                                              |

### Views

Components that display data in specific layouts.

| Component       | Sub-components                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Advertisement` | —                                                                                                                                               |
| `Card`          | `Card.Content`, `Card.Description`, `Card.Group`, `Card.Header`, `Card.Meta`                                                                    |
| `Comment`       | `Comment.Action`, `Comment.Actions`, `Comment.Author`, `Comment.Avatar`, `Comment.Content`, `Comment.Group`, `Comment.Metadata`, `Comment.Text` |
| `Feed`          | `Feed.Content`, `Feed.Date`, `Feed.Event`, `Feed.Extra`, `Feed.Label`, `Feed.Like`, `Feed.Meta`, `Feed.Summary`, `Feed.User`                    |
| `Item`          | `Item.Content`, `Item.Description`, `Item.Extra`, `Item.Group`, `Item.Header`, `Item.Image`, `Item.Meta`                                        |
| `Statistic`     | `Statistic.Group`, `Statistic.Label`, `Statistic.Value`                                                                                         |

## Key Features

### React 19 Support

- **ref-as-prop**: All components accept `ref` directly (no `forwardRef` wrappers)
- **Form Actions**: `Form` accepts async `action` prop with `Form.Status` for pending state
- **React 19 Hooks**: `useFormAction`, `useFormStatus`, `useOptimistic`
- **Context as Provider**: `<Context value={}>` pattern (no `.Provider`)
- **React Compiler**: All components compatible with `babel-plugin-react-compiler`

### Built-in CSS

- Ships CSS in `dist/styles/` — no external `semantic-ui-css` required
- Per-component CSS imports for tree-shaking
- CSS Cascade Layers (`@layer`) for predictable ordering
- Modern CSS: `:is()`, `:where()`, `:has()`, `color-mix()`, container queries, `:focus-visible`

### Theming

- **CSS Custom Properties**: All design tokens are CSS variables
- **ThemeProvider**: Scoped theming via React Context
- **Dark theme**: Built-in at `semantic-ui-react/styles/themes/dark.css`
- **useTheme**: Hook for runtime theme access and control
- **Runtime switching**: No rebuild required to change themes

### Shorthand Props

Most components support shorthand prop syntax:

```jsx
// String shorthand
<Button icon="user" />

// Object shorthand
<Button icon={{ name: 'user', size: 'large' }} />

// Element shorthand
<Button icon={<Icon name="user" />} />

// Render function shorthand
<Button icon={(Component, props) => <Component {...props} color="red" />} />
```
