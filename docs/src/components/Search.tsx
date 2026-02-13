import * as React from 'react'

interface SearchResult {
  name: string
  category: string
  path: string
}

const allComponents: SearchResult[] = [
  { name: 'Button', category: 'Elements', path: '/elements/button' },
  { name: 'Container', category: 'Elements', path: '/elements/container' },
  { name: 'Divider', category: 'Elements', path: '/elements/divider' },
  { name: 'Flag', category: 'Elements', path: '/elements/flag' },
  { name: 'Header', category: 'Elements', path: '/elements/header' },
  { name: 'Icon', category: 'Elements', path: '/elements/icon' },
  { name: 'Image', category: 'Elements', path: '/elements/image' },
  { name: 'Input', category: 'Elements', path: '/elements/input' },
  { name: 'Label', category: 'Elements', path: '/elements/label' },
  { name: 'List', category: 'Elements', path: '/elements/list' },
  { name: 'Loader', category: 'Elements', path: '/elements/loader' },
  { name: 'Placeholder', category: 'Elements', path: '/elements/placeholder' },
  { name: 'Rail', category: 'Elements', path: '/elements/rail' },
  { name: 'Reveal', category: 'Elements', path: '/elements/reveal' },
  { name: 'Segment', category: 'Elements', path: '/elements/segment' },
  { name: 'Step', category: 'Elements', path: '/elements/step' },
  { name: 'Breadcrumb', category: 'Collections', path: '/collections/breadcrumb' },
  { name: 'Form', category: 'Collections', path: '/collections/form' },
  { name: 'Grid', category: 'Collections', path: '/collections/grid' },
  { name: 'Menu', category: 'Collections', path: '/collections/menu' },
  { name: 'Message', category: 'Collections', path: '/collections/message' },
  { name: 'Table', category: 'Collections', path: '/collections/table' },
  { name: 'Accordion', category: 'Modules', path: '/modules/accordion' },
  { name: 'Checkbox', category: 'Modules', path: '/modules/checkbox' },
  { name: 'Dimmer', category: 'Modules', path: '/modules/dimmer' },
  { name: 'Dropdown', category: 'Modules', path: '/modules/dropdown' },
  { name: 'Embed', category: 'Modules', path: '/modules/embed' },
  { name: 'Modal', category: 'Modules', path: '/modules/modal' },
  { name: 'Popup', category: 'Modules', path: '/modules/popup' },
  { name: 'Progress', category: 'Modules', path: '/modules/progress' },
  { name: 'Rating', category: 'Modules', path: '/modules/rating' },
  { name: 'Search', category: 'Modules', path: '/modules/search' },
  { name: 'Sidebar', category: 'Modules', path: '/modules/sidebar' },
  { name: 'Sticky', category: 'Modules', path: '/modules/sticky' },
  { name: 'Tab', category: 'Modules', path: '/modules/tab' },
  { name: 'Transition', category: 'Modules', path: '/modules/transition' },
  { name: 'Card', category: 'Views', path: '/views/card' },
  { name: 'Comment', category: 'Views', path: '/views/comment' },
  { name: 'Feed', category: 'Views', path: '/views/feed' },
  { name: 'Item', category: 'Views', path: '/views/item' },
  { name: 'Statistic', category: 'Views', path: '/views/statistic' },
  { name: 'Advertisement', category: 'Views', path: '/views/advertisement' },
  { name: 'Confirm', category: 'Addons', path: '/addons/confirm' },
  { name: 'Pagination', category: 'Addons', path: '/addons/pagination' },
  { name: 'Portal', category: 'Addons', path: '/addons/portal' },
  { name: 'Radio', category: 'Addons', path: '/addons/radio' },
  { name: 'Select', category: 'Addons', path: '/addons/select' },
  { name: 'TextArea', category: 'Addons', path: '/addons/textarea' },
  { name: 'TransitionablePortal', category: 'Addons', path: '/addons/transitionableportal' },
]

export default function SearchComponent() {
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  const results = query.length > 0
    ? allComponents.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : []

  return (
    <div className="docs-search">
      <input
        type="search"
        placeholder="Search components..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      {isOpen && results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => (
            <li key={result.path}>
              <a href={result.path}>
                <span className="search-result-name">{result.name}</span>
                <span className="search-result-category">{result.category}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
