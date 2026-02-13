import cx from 'clsx'
import * as React from 'react'

import {
  createHTMLImage,
  getComponentType,
  getUnhandledProps,
  htmlImageProps,
  partitionHTMLProps,
} from '../../lib'

export interface StrictCommentAvatarProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Additional classes. */
  className?: string

  /** Specifies the URL of the image. */
  src?: string
}

export interface CommentAvatarProps extends StrictCommentAvatarProps {
  [key: string]: any
}

/**
 * A comment can contain an image or avatar.
 */
function CommentAvatar({ ref, ...props }: CommentAvatarProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, src } = props

  const classes = cx('avatar', className)
  const rest = getUnhandledProps(CommentAvatar, props)
  const [imageProps, rootProps] = partitionHTMLProps(rest, { htmlProps: htmlImageProps })
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rootProps} className={classes} ref={ref}>
      {createHTMLImage(src, { autoGenerateKey: false, defaultProps: imageProps })}
    </ElementType>
  )
}

CommentAvatar.displayName = 'CommentAvatar'
CommentAvatar.handledProps = [
  'as',
  'className',
  'src',
]

export default CommentAvatar
