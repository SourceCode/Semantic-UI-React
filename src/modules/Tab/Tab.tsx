import _ from 'lodash'
import * as React from 'react'

import {
  getComponentType,
  getUnhandledProps,
  useAutoControlledValue } from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import Grid from '../../collections/Grid/Grid'
import GridColumn from '../../collections/Grid/GridColumn'
import Menu from '../../collections/Menu/Menu'
import TabPane from './TabPane'
import type { TabPaneProps } from './TabPane'

export interface StrictTabProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** The initial activeIndex. */
  defaultActiveIndex?: number | string

  /** Index of the currently active tab. */
  activeIndex?: number | string

  /** Shorthand props for the Menu. */
  menu?: any

  /** Align vertical menu */
  menuPosition?: 'left' | 'right'

  /** Shorthand props for the Grid. */
  grid?: any

  /**
   * Called on tab change.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - The proposed new Tab.Pane.
   * @param {object} data.activeIndex - The new proposed activeIndex.
   * @param {object} data.panes - Props of the new proposed active pane.
   */
  onTabChange?: (event: React.MouseEvent<HTMLDivElement>, data: TabProps) => void

  /**
   * Array of objects describing each Menu.Item and Tab.Pane:
   * {
   *   menuItem: 'Home',
   *   render: () => <Tab.Pane>Welcome!</Tab.Pane>,
   * }
   * or
   * {
   *   menuItem: 'Home',
   *   pane: 'Welcome',
   * }
   */
  panes?: {
    pane?: SemanticShorthandItem<TabPaneProps>
    menuItem?: any
    render?: () => React.ReactNode
  }[]

  /** A Tab can render only active pane. */
  renderActiveOnly?: boolean
}

export interface TabProps extends StrictTabProps {
  [key: string]: any
}

/**
 * A Tab is a hidden section of content activated by a Menu.
 * @see Menu
 * @see Segment
 */
function Tab({ ref, ...props }: TabProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    grid = { paneWidth: 12, tabWidth: 4 },
    menu = { attached: true, tabular: true },
    menuPosition,
    panes,
    renderActiveOnly = true,
  } = props

  const [activeIndex, setActiveIndex] = useAutoControlledValue({
    state: props.activeIndex,
    defaultState: props.defaultActiveIndex,
    initialState: 0,
  })

  const handleItemClick = (e: React.MouseEvent, { index }: { index: number }) => {
    _.invoke(props, 'onTabChange', e, { ...props, activeIndex: index })
    setActiveIndex(index)
  }

  const renderItems = () => {
    if (renderActiveOnly) {
      return _.invoke(_.get(panes, `[${activeIndex}]`), 'render', props)
    }

    return _.map(panes, ({ pane }, index) =>
      TabPane.create(pane, {
        overrideProps: {
          active: index === activeIndex,
        },
      }),
    )
  }

  const renderMenu = () => {
    // Fix prop mutation bug: don't mutate menu directly, create a new object if needed
    let menuProps = menu
    if (menu.tabular === true && menuPosition === 'right') {
      menuProps = { ...menu, tabular: 'right' }
    }

    return Menu.create(menuProps, {
      autoGenerateKey: false,
      overrideProps: {
        items: _.map(panes, 'menuItem'),
        onItemClick: handleItemClick,
        activeIndex,
      },
    }) as React.ReactElement<any>
  }

  const renderVertical = (menuElement: React.ReactElement<any>) => {
    const { paneWidth, tabWidth, ...gridProps } = grid

    const position = menuPosition || (menuElement.props.tabular === 'right' && 'right') || 'left'

    return (
      <Grid {...gridProps}>
        {position === 'left' &&
          GridColumn.create({ width: tabWidth, children: menuElement }, { autoGenerateKey: false })}
        {GridColumn.create(
          {
            width: paneWidth,
            children: renderItems(),
            stretched: true,
          },
          { autoGenerateKey: false },
        )}
        {position === 'right' &&
          GridColumn.create({ width: tabWidth, children: menuElement }, { autoGenerateKey: false })}
      </Grid>
    )
  }

  const menuElement = renderMenu()
  const rest = getUnhandledProps(Tab, props)
  const ElementType = getComponentType(props)

  if (menuElement.props.vertical) {
    return (
      <ElementType {...rest} ref={ref}>
        {renderVertical(menuElement)}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} ref={ref}>
      {menuElement.props.attached !== 'bottom' && menuElement}
      {renderItems()}
      {menuElement.props.attached === 'bottom' && menuElement}
    </ElementType>
  )
}

Tab.displayName = 'Tab'
Tab.handledProps = [
  'as',
  'defaultActiveIndex',
  'activeIndex',
  'menu',
  'menuPosition',
  'grid',
  'onTabChange',
  'panes',
  'renderActiveOnly',
]

Tab.Pane = TabPane

export default Tab
