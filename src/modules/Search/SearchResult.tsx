import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  createHTMLImage,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictSearchResultProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** The item currently selected by keyboard shortcut. */
  active?: boolean

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Additional text with less emphasis. */
  description?: string

  /** A unique identifier. */
  id?: number | string

  /** Add an image to the item. */
  image?: string

  /**
   * Called on click.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: SearchResultProps) => void

  /** Customized text for price. */
  price?: string

  /**
   * Renders the result contents.
   *
   * @param {object} props - The SearchResult props object.
   * @returns {*} - Renderable result contents.
   */
  renderer?: (props: SearchResultProps) => React.ReactElement<any>[]

  /** Display title. */
  title: string
}

export interface SearchResultProps extends StrictSearchResultProps {
  [key: string]: any
}

// Note: You technically only need the 'content' wrapper when there's an
// image. However, optionally wrapping it makes this function a lot more
// complicated and harder to read. Since always wrapping it doesn't affect
// the style in any way let's just do that.
//
// Note: To avoid requiring a wrapping div, we return an array here so to
// prevent rendering issues each node needs a unique key.
const defaultRenderer = ({ image, price, title, description }: SearchResultProps) => [
  image && (
    <div key='image' className='image'>
      {createHTMLImage(image, { autoGenerateKey: false })}
    </div>
  ),
  <div key='content' className='content'>
    {price && <div className='price'>{price}</div>}
    {title && <div className='title'>{title}</div>}
    {description && <div className='description'>{description}</div>}
  </div>,
]

function SearchResult({ ref, ...props }: SearchResultProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, className, renderer = defaultRenderer } = props

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    _.invoke(props, 'onClick', e, props)
  }

  const classes = cx(getKeyOnly(active, 'active'), 'result', className)
  const rest = getUnhandledProps(SearchResult, props)
  const ElementType = getComponentType(props)

  // Note: You technically only need the 'content' wrapper when there's an
  // image. However, optionally wrapping it makes this function a lot more
  // complicated and harder to read. Since always wrapping it doesn't affect
  // the style in any way let's just do that.
  return (
    <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
      {renderer(props)}
    </ElementType>
  )
}

SearchResult.displayName = 'SearchResult'
SearchResult.handledProps = [
  'as',
  'active',
  'className',
  'content',
  'description',
  'id',
  'image',
  'onClick',
  'price',
  'renderer',
  'title',
]

export default SearchResult
