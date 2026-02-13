import * as React from 'react'

import { createShorthandFactory, getUnhandledProps } from '../../lib'
import type { SemanticSIZES } from '../../generic'
import type { ImageProps } from '../../elements/Image'
import Image from '../../elements/Image'

export interface StrictItemImageProps {
  /** An image may appear at different sizes. */
  size?: SemanticSIZES
}

export interface ItemImageProps extends ImageProps {
  [key: string]: any

  /** An image may appear at different sizes. */
  size?: SemanticSIZES
}

/**
 * An item can contain an image.
 */
function ItemImage({ ref, ...props }: ItemImageProps & { ref?: React.Ref<HTMLImageElement> }) {
  const { size } = props
  const rest = getUnhandledProps(ItemImage, props)

  return <Image {...rest} size={size} ui={!!size} wrapped ref={ref} />
}

ItemImage.displayName = 'ItemImage'
ItemImage.handledProps = [
  'size',
]

ItemImage.create = createShorthandFactory(ItemImage, (src) => ({ src }))

export default ItemImage
