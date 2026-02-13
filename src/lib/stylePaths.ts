/**
 * CSS file paths for per-component stylesheet loading.
 * These paths are relative to the package root and can be used with
 * StylesheetLink or dynamic imports.
 *
 * @example
 * import { STYLE_PATHS } from 'semantic-ui-react'
 * <StylesheetLink href={STYLE_PATHS.button} />
 */
export const STYLE_PATHS = {
  // Full bundle
  all: 'semantic-ui-react/dist/styles/semantic-ui-react.css',

  // Tokens
  tokens: 'semantic-ui-react/dist/styles/tokens/index.css',

  // Collections
  breadcrumb: 'semantic-ui-react/dist/styles/collections/breadcrumb.css',
  form: 'semantic-ui-react/dist/styles/collections/form.css',
  grid: 'semantic-ui-react/dist/styles/collections/grid.css',
  menu: 'semantic-ui-react/dist/styles/collections/menu.css',
  message: 'semantic-ui-react/dist/styles/collections/message.css',
  table: 'semantic-ui-react/dist/styles/collections/table.css',

  // Elements
  button: 'semantic-ui-react/dist/styles/elements/button.css',
  container: 'semantic-ui-react/dist/styles/elements/container.css',
  divider: 'semantic-ui-react/dist/styles/elements/divider.css',
  flag: 'semantic-ui-react/dist/styles/elements/flag.css',
  header: 'semantic-ui-react/dist/styles/elements/header.css',
  icon: 'semantic-ui-react/dist/styles/elements/icon.css',
  image: 'semantic-ui-react/dist/styles/elements/image.css',
  input: 'semantic-ui-react/dist/styles/elements/input.css',
  label: 'semantic-ui-react/dist/styles/elements/label.css',
  list: 'semantic-ui-react/dist/styles/elements/list.css',
  loader: 'semantic-ui-react/dist/styles/elements/loader.css',
  placeholder: 'semantic-ui-react/dist/styles/elements/placeholder.css',
  rail: 'semantic-ui-react/dist/styles/elements/rail.css',
  reveal: 'semantic-ui-react/dist/styles/elements/reveal.css',
  segment: 'semantic-ui-react/dist/styles/elements/segment.css',
  step: 'semantic-ui-react/dist/styles/elements/step.css',

  // Modules
  accordion: 'semantic-ui-react/dist/styles/modules/accordion.css',
  checkbox: 'semantic-ui-react/dist/styles/modules/checkbox.css',
  dimmer: 'semantic-ui-react/dist/styles/modules/dimmer.css',
  dropdown: 'semantic-ui-react/dist/styles/modules/dropdown.css',
  embed: 'semantic-ui-react/dist/styles/modules/embed.css',
  modal: 'semantic-ui-react/dist/styles/modules/modal.css',
  popup: 'semantic-ui-react/dist/styles/modules/popup.css',
  progress: 'semantic-ui-react/dist/styles/modules/progress.css',
  rating: 'semantic-ui-react/dist/styles/modules/rating.css',
  search: 'semantic-ui-react/dist/styles/modules/search.css',
  sidebar: 'semantic-ui-react/dist/styles/modules/sidebar.css',
  sticky: 'semantic-ui-react/dist/styles/modules/sticky.css',
  tab: 'semantic-ui-react/dist/styles/modules/tab.css',
  transition: 'semantic-ui-react/dist/styles/modules/transition.css',

  // Views
  advertisement: 'semantic-ui-react/dist/styles/views/advertisement.css',
  card: 'semantic-ui-react/dist/styles/views/card.css',
  comment: 'semantic-ui-react/dist/styles/views/comment.css',
  feed: 'semantic-ui-react/dist/styles/views/feed.css',
  item: 'semantic-ui-react/dist/styles/views/item.css',
  statistic: 'semantic-ui-react/dist/styles/views/statistic.css',

  // Themes
  defaultTheme: 'semantic-ui-react/dist/styles/themes/default.css',
  darkTheme: 'semantic-ui-react/dist/styles/themes/dark.css',
} as const
