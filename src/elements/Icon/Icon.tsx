import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  useEventCallback,
  getKeyOnly,
  getKeyOrValueAndKey,
  getValueAndKey,
} from '../../lib'
import type { SemanticCOLORS } from '../../generic'
import IconGroup from './IconGroup'

export type IconCorner = 'bottom right' | 'top right' | 'top left' | 'bottom left'

export interface StrictIconProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Formatted to appear bordered. */
  bordered?: boolean
  /** Icon can formatted to appear circular. */
  circular?: boolean
  /** Additional classes. */
  className?: string
  /** Color of the icon. */
  color?: SemanticCOLORS
  /** Icons can display a smaller corner icon. */
  corner?: boolean | IconCorner
  /** Show that the icon is inactive. */
  disabled?: boolean
  /** Fitted, without space to left or right of Icon. */
  fitted?: boolean
  /** Icon can be flipped. */
  flipped?: 'horizontally' | 'vertically'
  /** Formatted to have its colors inverted for contrast. */
  inverted?: boolean
  /** Icon can be formatted as a link. */
  link?: boolean
  /** Icon can be used as a simple loader. */
  loading?: boolean
  /** Name of the icon. */
  name?: string
  /**
   * Called on click.
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>, data: IconProps) => void
  /** Icon can rotated. */
  rotated?: 'clockwise' | 'counterclockwise'
  /** Size of the icon. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'
  /** Icon can have an aria hidden. */
  'aria-hidden'?: string
  /** Icon can have an aria label. */
  'aria-label'?: string
}

export interface IconProps extends StrictIconProps {
  [key: string]: any
}

function getAriaProps(props: IconProps): Record<string, string | undefined> {
  const ariaOptions: Record<string, string | undefined> = {}
  const { 'aria-label': ariaLabel, 'aria-hidden': ariaHidden } = props

  if (_.isNil(ariaLabel)) {
    ariaOptions['aria-hidden'] = 'true'
  } else {
    ariaOptions['aria-label'] = ariaLabel
  }

  if (!_.isNil(ariaHidden)) {
    ariaOptions['aria-hidden'] = ariaHidden
  }

  return ariaOptions
}

/**
 * An icon is a glyph used to represent something else.
 * @see Image
 */
function Icon({ ref, ...props }: IconProps & { ref?: React.Ref<HTMLElement> }) {
  const {
    bordered,
    circular,
    className,
    color,
    corner,
    disabled,
    fitted,
    flipped,
    inverted,
    link,
    loading,
    name,
    rotated,
    size,
  } = props

  const classes = cx(
    color,
    name,
    size,
    getKeyOnly(bordered, 'bordered'),
    getKeyOnly(circular, 'circular'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(fitted, 'fitted'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(link, 'link'),
    getKeyOnly(loading, 'loading'),
    getKeyOrValueAndKey(corner, 'corner'),
    getValueAndKey(flipped, 'flipped'),
    getValueAndKey(rotated, 'rotated'),
    'icon',
    className,
  )

  const rest = getUnhandledProps(Icon, props)
  const ElementType = getComponentType(props, { defaultAs: 'i' })
  const ariaProps = getAriaProps(props)

  const handleClick = useEventCallback((e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }

    _.invoke(props, 'onClick', e, props)
  })

  return (
    <ElementType {...rest} {...ariaProps} className={classes} onClick={handleClick} ref={ref} />
  )
}

Icon.displayName = 'Icon'
Icon.handledProps = [
  'as',
  'bordered',
  'circular',
  'className',
  'color',
  'corner',
  'disabled',
  'fitted',
  'flipped',
  'inverted',
  'link',
  'loading',
  'name',
  'onClick',
  'rotated',
  'size',
]

// Heads up!
// .create() factories should be defined on exported component to be visible as static properties
const IconWithStatics = Icon as typeof Icon & {
  Group: typeof IconGroup
  create: (val: any, options?: Record<string, any>) => React.ReactElement | null
}

IconWithStatics.Group = IconGroup
IconWithStatics.create = createShorthandFactory(IconWithStatics, (value) => ({ name: value }))

export default IconWithStatics
