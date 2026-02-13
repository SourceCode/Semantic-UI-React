import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
  getValueAndKey,
  useEventCallback,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticShorthandContent,
  SemanticShorthandItem,
  SemanticSIZES,
} from '../../generic'
import type { IconProps } from '../Icon'
import type { ImageProps } from '../Image'
import Icon from '../Icon/Icon'
import Image from '../Image/Image'
import LabelDetail from './LabelDetail'
import type { LabelDetailProps } from './LabelDetail'
import LabelGroup from './LabelGroup'

export interface StrictLabelProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** A label can be active. */
  active?: boolean
  /** A label can attach to a content segment. */
  attached?: 'top' | 'bottom' | 'top right' | 'top left' | 'bottom left' | 'bottom right'
  /** A label can reduce its complexity. */
  basic?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** A label can be circular. */
  circular?: boolean
  /** Additional classes. */
  className?: string
  /** Color of the label. */
  color?: SemanticCOLORS
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A label can position itself in the corner of an element. */
  corner?: boolean | 'left' | 'right'
  /** Shorthand for LabelDetail. */
  detail?: SemanticShorthandItem<LabelDetailProps>
  /** Formats the label as a dot. */
  empty?: boolean
  /** Float above another element in the upper right corner. */
  floating?: boolean
  /** A horizontal label is formatted to label content along-side it horizontally. */
  horizontal?: boolean
  /** Add an icon by icon name or pass an <Icon />. */
  icon?: SemanticShorthandItem<IconProps>
  /** A label can be formatted to emphasize an image or prop can be used as shorthand for Image. */
  image?: boolean | SemanticShorthandItem<ImageProps>
  /**
   * Called on click.
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>, data: LabelProps) => void
  /**
   * Adds an "x" icon, called when "x" is clicked.
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onRemove?: (event: React.MouseEvent<HTMLElement>, data: LabelProps) => void
  /** A label can point to content next to it. */
  pointing?: boolean | 'above' | 'below' | 'left' | 'right'
  /** A label can prompt for an error in your forms. */
  prompt?: boolean
  /** Shorthand for Icon to appear as the last child and trigger onRemove. */
  removeIcon?: SemanticShorthandItem<IconProps>
  /** A label can appear as a ribbon attaching itself to an element. */
  ribbon?: boolean | 'right'
  /** A label can have different sizes. */
  size?: SemanticSIZES
  /** A label can appear as a tag. */
  tag?: boolean
}

export interface LabelProps extends StrictLabelProps {
  [key: string]: any
}

/**
 * A label displays content classification.
 */
function Label({ ref, ...props }: LabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active,
    attached,
    basic,
    children,
    circular,
    className,
    color,
    content,
    corner,
    detail,
    empty,
    floating,
    horizontal,
    icon,
    image,
    onRemove,
    pointing,
    prompt,
    removeIcon,
    ribbon,
    size,
    tag,
  } = props

  const pointingClass =
    (pointing === true && 'pointing') ||
    ((pointing === 'left' || pointing === 'right') && `${pointing} pointing`) ||
    ((pointing === 'above' || pointing === 'below') && `pointing ${pointing}`)

  const classes = cx(
    'ui',
    color,
    pointingClass,
    size,
    getKeyOnly(active, 'active'),
    getKeyOnly(basic, 'basic'),
    getKeyOnly(circular, 'circular'),
    getKeyOnly(empty, 'empty'),
    getKeyOnly(floating, 'floating'),
    getKeyOnly(horizontal, 'horizontal'),
    getKeyOnly(image === true, 'image'),
    getKeyOnly(prompt, 'prompt'),
    getKeyOnly(tag, 'tag'),
    getKeyOrValueAndKey(corner, 'corner'),
    getKeyOrValueAndKey(ribbon, 'ribbon'),
    getValueAndKey(attached, 'attached'),
    'label',
    className,
  )
  const rest = getUnhandledProps(Label, props)
  const ElementType = getComponentType(props)

  const handleClick = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    _.invoke(props, 'onClick', e, props)
  })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
        {children}
      </ElementType>
    )
  }

  const removeIconShorthand = _.isUndefined(removeIcon) ? 'delete' : removeIcon

  return (
    <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {typeof image !== 'boolean' && Image.create(image, { autoGenerateKey: false })}
      {content}
      {LabelDetail.create(detail, { autoGenerateKey: false })}
      {onRemove &&
        Icon.create(removeIconShorthand, {
          autoGenerateKey: false,
          overrideProps: (predefinedProps: any) => ({
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              _.invoke(predefinedProps, 'onClick', e)
              _.invoke(props, 'onRemove', e, props)
            },
          }),
        })}
    </ElementType>
  )
}

Label.displayName = 'Label'
Label.handledProps = [
  'as',
  'active',
  'attached',
  'basic',
  'children',
  'circular',
  'className',
  'color',
  'content',
  'corner',
  'detail',
  'empty',
  'floating',
  'horizontal',
  'icon',
  'image',
  'onClick',
  'onRemove',
  'pointing',
  'prompt',
  'removeIcon',
  'ribbon',
  'size',
  'tag',
]

Label.Detail = LabelDetail
Label.Group = LabelGroup

Label.create = createShorthandFactory(Label, (value) => ({ content: value }))

export default Label
