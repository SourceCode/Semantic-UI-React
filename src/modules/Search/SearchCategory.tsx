import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'
import SearchCategoryLayout from './SearchCategoryLayout'
import type { SearchCategoryLayoutProps } from './SearchCategoryLayout'
import type SearchResult from './SearchResult'

export interface StrictSearchCategoryProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** The item currently selected by keyboard shortcut. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Display name. */
  name?: string

  /**
   * Renders the SearchCategory layout.
   *
   * @param {object} props - The SearchCategoryLayout props object.
   * @returns {*} - Renderable SearchCategory layout.
   */
  layoutRenderer?: (
    props: Pick<SearchCategoryLayoutProps, 'categoryContent' | 'resultsContent'>,
  ) => React.ReactElement<any>

  /**
   * Renders the category contents.
   *
   * @param {object} props - The SearchCategory props object.
   * @returns {*} - Renderable category contents.
   */
  renderer?: (props: SearchCategoryProps) => React.ReactElement<any>

  /** Array of Search.Result props. */
  results?: typeof SearchResult[]
}

export interface SearchCategoryProps extends StrictSearchCategoryProps {
  [key: string]: any
}

function SearchCategory({ ref, ...props }: SearchCategoryProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active,
    children,
    className,
    content,
    layoutRenderer = SearchCategoryLayout,
    renderer = ({ name }: any) => name,
  } = props

  const classes = cx(getKeyOnly(active, 'active'), 'category', className)
  const rest = getUnhandledProps(SearchCategory, props)
  const ElementType = getComponentType(props)

  const categoryContent = renderer(props)
  const resultsContent = childrenUtils.isNil(children) ? content : children

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {layoutRenderer({ categoryContent, resultsContent } as any)}
    </ElementType>
  )
}

SearchCategory.displayName = 'SearchCategory'
SearchCategory.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
  'name',
  'layoutRenderer',
  'renderer',
  'results',
]

export default SearchCategory
