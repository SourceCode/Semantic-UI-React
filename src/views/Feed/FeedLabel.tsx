import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createHTMLImage,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { HtmlImageProps, SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictFeedLabelProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** An event can contain icon label. */
  icon?: SemanticShorthandItem<IconProps>

  /** An event can contain image label. */
  image?: SemanticShorthandItem<HtmlImageProps>
}

export interface FeedLabelProps extends StrictFeedLabelProps {
  [key: string]: any
}

/**
 * An event can contain an image or icon label.
 */
function FeedLabel({ ref, ...props }: FeedLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, icon, image } = props

  const classes = cx('label', className)
  const rest = getUnhandledProps(FeedLabel, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {content}
      {Icon.create(icon, { autoGenerateKey: false })}
      {createHTMLImage(image)}
    </ElementType>
  )
}

FeedLabel.displayName = 'FeedLabel'
FeedLabel.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'icon',
  'image',
]

export default FeedLabel
