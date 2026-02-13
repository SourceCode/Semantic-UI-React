import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getValueAndKey,
  getTextAlignProp,
  getKeyOrValueAndKey,
  getKeyOnly,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticShorthandContent,
  SemanticShorthandItem,
  SemanticTEXTALIGNMENTS,
} from '../../generic'
import type { IconProps } from '../Icon'
import type { ImageProps } from '../Image'
import Icon from '../Icon'
import Image from '../Image'

import HeaderSubheader from './HeaderSubheader'
import type { HeaderSubheaderProps } from './HeaderSubheader'
import HeaderContent from './HeaderContent'

export interface StrictHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Attach header to other content, like a segment. */
  attached?: boolean | 'top' | 'bottom'
  /** Format header to appear inside a content block. */
  block?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Color of the header. */
  color?: SemanticCOLORS
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Show that the header is inactive. */
  disabled?: boolean
  /** Divide header from the content below it. */
  dividing?: boolean
  /** Header can sit to the left or right of other content. */
  floated?: SemanticFLOATS
  /** Add an icon by icon name or pass an Icon. */
  icon?: boolean | SemanticShorthandItem<IconProps>
  /** Add an image by img src or pass an Image. */
  image?: boolean | SemanticShorthandItem<ImageProps>
  /** Inverts the color of the header for dark backgrounds. */
  inverted?: boolean
  /** Content headings are sized with em and are based on the font-size of their container. */
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge'
  /** Headers may be formatted to label smaller or de-emphasized content. */
  sub?: boolean
  /** Shorthand for Header.Subheader. */
  subheader?: SemanticShorthandItem<HeaderSubheaderProps>
  /** Align header content. */
  textAlign?: SemanticTEXTALIGNMENTS
}

export interface HeaderProps extends StrictHeaderProps {
  [key: string]: any
}

/**
 * A header provides a short summary of content
 */
function Header({ ref, ...props }: HeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    attached,
    block,
    children,
    className,
    color,
    content,
    disabled,
    dividing,
    floated,
    icon,
    image,
    inverted,
    size,
    sub,
    subheader,
    textAlign,
  } = props

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(block, 'block'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(dividing, 'dividing'),
    getValueAndKey(floated, 'floated'),
    getKeyOnly(icon === true, 'icon'),
    getKeyOnly(image === true, 'image'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(sub, 'sub'),
    getKeyOrValueAndKey(attached, 'attached'),
    getTextAlignProp(textAlign),
    'header',
    className,
  )
  const rest = getUnhandledProps(Header, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  const iconElement = Icon.create(icon, { autoGenerateKey: false })
  const imageElement = Image.create(image, { autoGenerateKey: false })
  const subheaderElement = HeaderSubheader.create(subheader, { autoGenerateKey: false })

  if (iconElement || imageElement) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {iconElement || imageElement}
        {(content || subheaderElement) && (
          <HeaderContent>
            {content}
            {subheaderElement}
          </HeaderContent>
        )}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {content}
      {subheaderElement}
    </ElementType>
  )
}

Header.displayName = 'Header'
Header.handledProps = [
  'as',
  'attached',
  'block',
  'children',
  'className',
  'color',
  'content',
  'disabled',
  'dividing',
  'floated',
  'icon',
  'image',
  'inverted',
  'size',
  'sub',
  'subheader',
  'textAlign',
]

Header.Content = HeaderContent
Header.Subheader = HeaderSubheader

export default Header
