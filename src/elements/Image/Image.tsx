import _ from 'lodash'
import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  htmlImageProps,
  partitionHTMLProps,
  getKeyOnly,
  getKeyOrValueAndKey,
  getValueAndKey,
  getVerticalAlignProp,
} from '../../lib'
import type {
  SemanticFLOATS,
  SemanticShorthandContent,
  SemanticShorthandItem,
  SemanticSIZES,
  SemanticVERTICALALIGNMENTS,
} from '../../generic'
import type { DimmerProps } from '../../modules/Dimmer'
import type { LabelProps } from '../Label'
import Dimmer from '../../modules/Dimmer'
import Label from '../Label/Label'
import ImageGroup from './ImageGroup'

export interface StrictImageProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** An image may be formatted to appear inline with text as an avatar. */
  avatar?: boolean
  /** An image may include a border to emphasize the edges of white or transparent content. */
  bordered?: boolean
  /** An image can appear centered in a content block. */
  centered?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** An image may appear circular. */
  circular?: boolean
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** An image can show that it is disabled and cannot be selected. */
  disabled?: boolean
  /** Shorthand for Dimmer. */
  dimmer?: SemanticShorthandItem<DimmerProps>
  /** An image can sit to the left or right of other content. */
  floated?: SemanticFLOATS
  /** An image can take up the width of its container. */
  fluid?: boolean
  /** An image can be hidden. */
  hidden?: boolean
  /** Renders the Image as an <a> tag with this href. */
  href?: string
  /** An image may appear inline. */
  inline?: boolean
  /** Shorthand for Label. */
  label?: SemanticShorthandItem<LabelProps>
  /** An image may appear rounded. */
  rounded?: boolean
  /** An image may appear at different sizes. */
  size?: SemanticSIZES
  /** An image can specify that it needs an additional spacing to separate it from nearby content. */
  spaced?: boolean | 'left' | 'right'
  /** Whether or not to add the ui className. */
  ui?: boolean
  /** An image can specify its vertical alignment. */
  verticalAlign?: SemanticVERTICALALIGNMENTS
  /** An image can render wrapped in a `div.ui.image` as alternative HTML markup. */
  wrapped?: boolean
}

export interface ImageProps extends StrictImageProps {
  [key: string]: any
}

/**
 * An image is a graphic representation of something.
 * @see Icon
 */
function Image({ ref, ...props }: ImageProps & { ref?: React.Ref<HTMLImageElement> }) {
  const {
    avatar,
    bordered,
    centered,
    children,
    circular,
    className,
    content,
    dimmer,
    disabled,
    floated,
    fluid,
    hidden,
    href,
    inline,
    label,
    rounded,
    size,
    spaced,
    verticalAlign,
    wrapped,
    ui = true,
  } = props

  const classes = cx(
    getKeyOnly(ui, 'ui'),
    size,
    getKeyOnly(avatar, 'avatar'),
    getKeyOnly(bordered, 'bordered'),
    getKeyOnly(circular, 'circular'),
    getKeyOnly(centered, 'centered'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(hidden, 'hidden'),
    getKeyOnly(inline, 'inline'),
    getKeyOnly(rounded, 'rounded'),
    getKeyOrValueAndKey(spaced, 'spaced'),
    getValueAndKey(floated, 'floated'),
    getVerticalAlignProp(verticalAlign),
    'image',
    className,
  )

  const rest = getUnhandledProps(Image, props)
  const [imgTagProps, rootProps] = partitionHTMLProps(rest, { htmlProps: htmlImageProps })

  const ElementType = getComponentType(props, {
    defaultAs: 'img',
    getDefault: () => {
      if (
        !_.isNil(dimmer) ||
        !_.isNil(label) ||
        !_.isNil(wrapped) ||
        !childrenUtils.isNil(children)
      ) {
        return 'div'
      }
      return undefined
    },
  })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }
  if (!childrenUtils.isNil(content)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {content}
      </ElementType>
    )
  }

  if (ElementType === 'img') {
    return <ElementType {...rootProps} {...imgTagProps} className={classes} ref={ref} />
  }

  return (
    <ElementType {...rootProps} className={classes} href={href}>
      {Dimmer.create(dimmer, { autoGenerateKey: false })}
      {Label.create(label, { autoGenerateKey: false })}

      <img {...imgTagProps} ref={ref} />
    </ElementType>
  )
}

Image.Group = ImageGroup

Image.displayName = 'Image'
Image.handledProps = [
  'as',
  'avatar',
  'bordered',
  'centered',
  'children',
  'circular',
  'className',
  'content',
  'disabled',
  'dimmer',
  'floated',
  'fluid',
  'hidden',
  'href',
  'inline',
  'label',
  'rounded',
  'size',
  'spaced',
  'ui',
  'verticalAlign',
  'wrapped',
]

Image.create = createShorthandFactory(Image, (value) => ({ src: value }))

export default Image
