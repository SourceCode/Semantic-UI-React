import { render, fireEvent } from '@testing-library/react'

import Tab from 'src/modules/Tab/Tab'
import TabPane from 'src/modules/Tab/TabPane'
import * as common from 'test/specs/commonTests'

describe('Tab', () => {
  common.isConformant(Tab)
  common.hasSubcomponents(Tab, [TabPane])

  const panes = [
    { menuItem: 'Tab 1', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
    { menuItem: 'Tab 2', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
    { menuItem: 'Tab 3', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  ]

  describe('menu', () => {
    it('passes the props to the Menu', () => {
      const { container } = render(<Tab menu={{ 'data-foo': 'bar' }} />)
      const menu = container.querySelector('.ui.menu')

      expect(menu).toHaveAttribute('data-foo', 'bar')
    })

    it('has an item for every menuItem in panes', () => {
      const { container } = render(<Tab panes={panes} />)
      const items = container.querySelectorAll('.ui.menu .item')

      expect(items).toHaveLength(3)
      expect(items[0].textContent).toContain('Tab 1')
      expect(items[1].textContent).toContain('Tab 2')
      expect(items[2].textContent).toContain('Tab 3')
    })

    it('renders above the pane by default', () => {
      const { container } = render(<Tab panes={panes} />)
      const children = container.firstChild.children

      expect(children[0]).toHaveClass('menu')
      expect(children[1]).toHaveClass('segment')
    })

    it("renders below the pane when attached='bottom'", () => {
      const { container } = render(<Tab menu={{ attached: 'bottom' }} panes={panes} />)
      const children = container.firstChild.children

      expect(children[0]).toHaveClass('segment')
      expect(children[1]).toHaveClass('menu')
    })

    it("infers tabular's value from tab's menuPosition if tabular is set to true", () => {
      const menu = { fluid: true, vertical: true, tabular: true }
      const { container } = render(<Tab menu={menu} menuPosition='right' panes={panes} />)

      expect(container.querySelector('.ui.grid')).toBeInTheDocument()
      const menuEl = container.querySelector('.ui.menu')
      expect(menuEl).toHaveClass('right')
      expect(menuEl).toHaveClass('tabular')
    })

    it("does not infer tabular's value from tab's menuPosition if tabular is explicitly set", () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)

      expect(container.querySelector('.ui.grid')).toBeInTheDocument()
      const menuEl = container.querySelector('.ui.menu')
      expect(menuEl).toHaveClass('right')
      expect(menuEl).toHaveClass('tabular')
    })

    it('renders right when tabular is set to right', () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} panes={panes} />)

      expect(container.querySelector('.ui.grid')).toBeInTheDocument()
      expect(container.querySelector('.ui.menu')).toBeInTheDocument()
      expect(container.querySelector('.segment')).toBeInTheDocument()
    })
  })

  describe('menuPosition', () => {
    it('renders left of the pane when set left', () => {
      const menu = { fluid: true, vertical: true }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)

      expect(container.querySelector('.ui.grid')).toBeInTheDocument()
      expect(container.querySelector('.ui.menu')).toBeInTheDocument()
      expect(container.querySelector('.segment')).toBeInTheDocument()
    })

    it("renders left of the pane when set 'left', even if tabular is right", () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)

      expect(container.querySelector('.ui.grid')).toBeInTheDocument()
      expect(container.querySelector('.ui.menu')).toBeInTheDocument()
      expect(container.querySelector('.segment')).toBeInTheDocument()
    })

    it("renders right of the pane when set 'right'", () => {
      const menu = { fluid: true, vertical: true }
      const { container } = render(<Tab menu={menu} menuPosition='right' panes={panes} />)

      expect(container.querySelector('.ui.grid')).toBeInTheDocument()
      expect(container.querySelector('.ui.menu')).toBeInTheDocument()
      expect(container.querySelector('.segment')).toBeInTheDocument()
    })
  })

  describe('activeIndex', () => {
    it('is passed to the Menu', () => {
      const { container } = render(<Tab panes={panes} activeIndex={123} />)
      const activeItems = container.querySelectorAll('.ui.menu .item.active')
      // activeIndex 123 is out of range, no active item expected
      expect(activeItems).toHaveLength(0)
    })

    it('is set when clicking an item', () => {
      const { container } = render(<Tab panes={panes} />)

      expect(container.querySelector('.segment').textContent).toContain('Tab 1')

      const items = container.querySelectorAll('.ui.menu .item')
      fireEvent.click(items[1])
      expect(container.querySelector('.segment').textContent).toContain('Tab 2 Content')
    })

    it('can be set via props', () => {
      const { container, rerender } = render(<Tab panes={panes} activeIndex={1} />)

      expect(container.querySelector('.segment').textContent).toContain('Tab 2 Content')

      rerender(<Tab panes={panes} activeIndex={2} />)
      expect(container.querySelector('.segment').textContent).toContain('Tab 3 Content')
    })

    it('determines which pane render method is called', () => {
      const activeIndex = 1
      const props = { activeIndex, panes }
      vi.spyOn(panes[activeIndex], 'render')

      render(<Tab {...props} />)

      expect(panes[activeIndex].render).toHaveBeenCalledOnce()
      expect(panes[activeIndex].render).toHaveBeenCalledWith(
        expect.objectContaining(props),
      )
      panes[activeIndex].render.mockRestore()
    })
  })

  describe('onTabChange', () => {
    it('is called with (e, { ...props, activeIndex }) a menu item is clicked', () => {
      const activeIndex = 1
      const spy = vi.fn()
      const props = { onTabChange: spy, panes }

      const { container } = render(<Tab {...props} />)
      const items = container.querySelectorAll('.ui.menu .item')
      fireEvent.click(items[activeIndex])

      // Since React will have generated a key the returned tab won't match
      // exactly so match on the props instead.
      expect(spy).toHaveBeenCalledOnce()
      expect(spy.mock.calls[0][1]).toHaveProperty('activeIndex', 1)
      expect(spy.mock.calls[0][1]).toHaveProperty('onTabChange', spy)
      expect(spy.mock.calls[0][1]).toHaveProperty('panes', panes)
    })
    it('is called with the new proposed activeIndex, not the current', () => {
      const spy = vi.fn()

      const { container } = render(<Tab activeIndex={-1} onTabChange={spy} panes={panes} />)
      const items = container.querySelectorAll('.ui.menu .item')

      expect(spy).toHaveBeenCalledTimes(0)

      fireEvent.click(items[0])
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][1]).toHaveProperty('activeIndex', 0)

      fireEvent.click(items[1])
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy.mock.calls[1][1]).toHaveProperty('activeIndex', 1)

      fireEvent.click(items[2])
      expect(spy).toHaveBeenCalledTimes(3)
      expect(spy.mock.calls[2][1]).toHaveProperty('activeIndex', 2)
    })
  })

  describe('renderActiveOnly', () => {
    it('renders all tabs when false', () => {
      const textPanes = [{ pane: 'Tab 1' }, { pane: 'Tab 2' }, { pane: 'Tab 3' }]
      const { container } = render(<Tab panes={textPanes} renderActiveOnly={false} />)
      const tabPanes = container.querySelectorAll('.segment')

      expect(tabPanes).toHaveLength(3)
      expect(tabPanes[0].textContent).toContain('Tab 1')
      expect(tabPanes[1].textContent).toContain('Tab 2')
      expect(tabPanes[2].textContent).toContain('Tab 3')
    })
  })
})
