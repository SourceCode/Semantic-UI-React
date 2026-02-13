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
  useEventCallback,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticShorthandContent,
  SemanticShorthandItem,
} from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictMenuItemProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A menu item can be active. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Additional colors can be specified. */
  color?: SemanticCOLORS

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A menu item can be disabled. */
  disabled?: boolean

  /** A menu item or menu can remove element padding, vertically or horizontally. */
  fitted?: boolean | 'horizontally' | 'vertically'

  /** A menu item may include a header or may itself be a header. */
  header?: boolean

  /** MenuItem can be only icon. */
  icon?: boolean | SemanticShorthandItem<IconProps>

  /** MenuItem index inside Menu. */
  index?: number

  /** A menu item can be link. */
  link?: boolean

  /** Internal name of the MenuItem. */
  name?: string

  /**
   * Called on click. When passed, the component will render as an `a`
   * tag by default instead of a `div`.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: MenuItemProps) => void

  /** A menu item can take left or right position. */
  position?: 'left' | 'right'
}

export interface MenuItemProps extends StrictMenuItemProps {
  [key: string]: any
}

/**
 * A menu can contain an item.
 */
function MenuItem({ ref, ...props }: MenuItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active,
    children,
    className,
    color,
    content,
    disabled,
    fitted,
    header,
    icon,
    link,
    name,
    onClick,
    position,
  } = props

  const classes = cx(
    color,
    position,
    getKeyOnly(active, 'active'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(icon === true || (icon && !(name || content)), 'icon'),
    getKeyOnly(header, 'header'),
    getKeyOnly(link, 'link'),
    getKeyOrValueAndKey(fitted, 'fitted'),
    'item',
    className,
  )
  const ElementType = getComponentType(props, {
    getDefault: () => {
      if (onClick) return 'a'
      return undefined
    },
  })
  const rest = getUnhandledProps(MenuItem, props)

  const handleClick = useEventCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disabled) {
      _.invoke(props, 'onClick', e, props)
    }
  })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {childrenUtils.isNil(content) ? _.startCase(name) : content}
    </ElementType>
  )
}

MenuItem.displayName = 'MenuItem'
MenuItem.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'color',
  'content',
  'disabled',
  'fitted',
  'header',
  'icon',
  'index',
  'link',
  'name',
  'onClick',
  'position',
]

MenuItem.create = createShorthandFactory(MenuItem, (val) => ({ content: val, name: val }))

export default MenuItem
