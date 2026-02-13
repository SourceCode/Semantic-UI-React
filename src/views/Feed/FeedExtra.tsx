import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createHTMLImage,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { HtmlImageProps, SemanticShorthandCollection, SemanticShorthandContent } from '../../generic'

export interface StrictFeedExtraProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** An event can contain additional information like a set of images. */
  images?: boolean | SemanticShorthandCollection<HtmlImageProps>[]

  /** An event can contain additional text information. */
  text?: boolean
}

export interface FeedExtraProps extends StrictFeedExtraProps {
  [key: string]: any
}

/**
 * A feed can contain an extra content.
 */
function FeedExtra({ ref, ...props }: FeedExtraProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, images, text } = props

  const classes = cx(
    getKeyOnly(images, 'images'),
    getKeyOnly(content || text, 'text'),
    'extra',
    className,
  )
  const rest = getUnhandledProps(FeedExtra, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  // TODO need a "collection factory" to handle creating multiple image elements and their keys
  const imageElements = _.map(images as any[], (image, index) => {
    const key = [index, image].join('-')
    return createHTMLImage(image, { key })
  })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {content}
      {imageElements}
    </ElementType>
  )
}

FeedExtra.displayName = 'FeedExtra'
FeedExtra.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'text',
]

export default FeedExtra
