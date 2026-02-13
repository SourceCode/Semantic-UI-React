import cx from 'clsx'
import * as React from 'react'

import { getComponentType, getUnhandledProps, getKeyOnly } from '../../lib'

export interface StrictPlaceholderImageProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Additional classes. */
  className?: string
  /** An image can modify size correctly with responsive styles. */
  square?: boolean
  /** An image can modify size correctly with responsive styles. */
  rectangular?: boolean
}

export interface PlaceholderImageProps extends StrictPlaceholderImageProps {
  [key: string]: any
}

/**
 * A placeholder can contain an image.
 */
function PlaceholderImage({ ref, ...props }: PlaceholderImageProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, square, rectangular } = props
  const classes = cx(
    getKeyOnly(square, 'square'),
    getKeyOnly(rectangular, 'rectangular'),
    'image',
    className,
  )
  const rest = getUnhandledProps(PlaceholderImage, props)
  const ElementType = getComponentType(props)

  return <ElementType {...rest} className={classes} ref={ref} />
}

PlaceholderImage.displayName = 'PlaceholderImage'
PlaceholderImage.handledProps = [
  'as',
  'className',
  'square',
  'rectangular',
]

export default PlaceholderImage
