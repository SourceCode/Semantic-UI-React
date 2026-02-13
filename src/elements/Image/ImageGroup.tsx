import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent, SemanticSIZES } from '../../generic'

export interface StrictImageGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A group of images can be formatted to have the same size. */
  size?: SemanticSIZES
}

export interface ImageGroupProps extends StrictImageGroupProps {
  [key: string]: any
}

/**
 * A group of images.
 */
function ImageGroup({ ref, ...props }: ImageGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, size } = props

  const classes = cx('ui', size, className, 'images')
  const rest = getUnhandledProps(ImageGroup, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ImageGroup.displayName = 'ImageGroup'
ImageGroup.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'size',
]

export default ImageGroup
