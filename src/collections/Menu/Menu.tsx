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
  getWidthProp,
  useAutoControlledValue,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticShorthandCollection,
  SemanticWIDTHS,
} from '../../generic'
import type { MenuItemProps } from './MenuItem'
import MenuHeader from './MenuHeader'
import MenuItem from './MenuItem'
import MenuMenu from './MenuMenu'

export interface StrictMenuProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Index of the currently active item. */
  activeIndex?: number | string

  /** A menu may be attached to other content segments. */
  attached?: boolean | 'bottom' | 'top'

  /** A menu item or menu can have no borders. */
  borderless?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Additional colors can be specified. */
  color?: SemanticCOLORS

  /** A menu can take up only the space necessary to fit its content. */
  compact?: boolean

  /** Initial activeIndex value. */
  defaultActiveIndex?: number | string

  /** A menu can be fixed to a side of its context. */
  fixed?: 'left' | 'right' | 'bottom' | 'top'

  /** A menu can be floated. */
  floated?: boolean | 'right'

  /** A vertical menu may take the size of its container. */
  fluid?: boolean

  /** A menu may have labeled icons. */
  icon?: boolean | 'labeled'

  /** A menu may have its colors inverted to show greater contrast. */
  inverted?: boolean

  /** Shorthand array of props for Menu. */
  items?: SemanticShorthandCollection<MenuItemProps>

  /**
   * onClick handler for MenuItem. Mutually exclusive with children.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All item props.
   */
  onItemClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: MenuItemProps) => void

  /** A pagination menu is specially formatted to present links to pages of content. */
  pagination?: boolean

  /** A menu can point to show its relationship to nearby content. */
  pointing?: boolean

  /** A menu can adjust its appearance to de-emphasize its contents. */
  secondary?: boolean

  /** A menu can vary in size. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'huge' | 'massive'

  /** A menu can stack at mobile resolutions. */
  stackable?: boolean

  /** A menu can be formatted to show tabs of information. */
  tabular?: boolean | 'right'

  /** A menu can be formatted for text content. */
  text?: boolean

  /** A vertical menu displays elements vertically. */
  vertical?: boolean

  /** A menu can have its items divided evenly. */
  widths?: SemanticWIDTHS
}

export interface MenuProps extends StrictMenuProps {
  [key: string]: any
}

/**
 * A menu displays grouped navigation actions.
 * @see Dropdown
 */
function Menu({ ref, ...props }: MenuProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    attached,
    borderless,
    children,
    className,
    color,
    compact,
    fixed,
    floated,
    fluid,
    icon,
    inverted,
    items,
    pagination,
    pointing,
    secondary,
    size,
    stackable,
    tabular,
    text,
    vertical,
    widths,
  } = props
  const [activeIndex, setActiveIndex] = useAutoControlledValue({
    state: props.activeIndex,
    defaultState: props.defaultActiveIndex,
    initialState: -1,
  })

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(borderless, 'borderless'),
    getKeyOnly(compact, 'compact'),
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(pagination, 'pagination'),
    getKeyOnly(pointing, 'pointing'),
    getKeyOnly(secondary, 'secondary'),
    getKeyOnly(stackable, 'stackable'),
    getKeyOnly(text, 'text'),
    getKeyOnly(vertical, 'vertical'),
    getKeyOrValueAndKey(attached, 'attached'),
    getKeyOrValueAndKey(floated, 'floated'),
    getKeyOrValueAndKey(icon, 'icon'),
    getKeyOrValueAndKey(tabular, 'tabular'),
    getValueAndKey(fixed, 'fixed'),
    getWidthProp(widths, 'item'),
    className,
    'menu',
  )
  const rest = getUnhandledProps(Menu, props)
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
      {_.map(items, (item, index) =>
        MenuItem.create(item, {
          defaultProps: {
            active: parseInt(activeIndex as string, 10) === index,
            index,
          },
          overrideProps: (predefinedProps: any) => ({
            onClick: (e: React.MouseEvent<HTMLAnchorElement>, itemProps: MenuItemProps) => {
              const itemIndex = itemProps.index

              setActiveIndex(itemIndex)

              _.invoke(predefinedProps, 'onClick', e, itemProps)
              _.invoke(props, 'onItemClick', e, itemProps)
            },
          }),
        }),
      )}
    </ElementType>
  )
}

Menu.displayName = 'Menu'
Menu.handledProps = [
  'as',
  'activeIndex',
  'attached',
  'borderless',
  'children',
  'className',
  'color',
  'compact',
  'defaultActiveIndex',
  'fixed',
  'floated',
  'fluid',
  'icon',
  'inverted',
  'items',
  'onItemClick',
  'pagination',
  'pointing',
  'secondary',
  'size',
  'stackable',
  'tabular',
  'text',
  'vertical',
  'widths',
]

Menu.Header = MenuHeader
Menu.Item = MenuItem
Menu.Menu = MenuMenu

Menu.create = createShorthandFactory(Menu, (items) => ({ items }))

export default Menu
