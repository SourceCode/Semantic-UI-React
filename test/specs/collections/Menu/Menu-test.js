import _ from 'lodash'
import { render, fireEvent } from '@testing-library/react'

import Menu from 'src/collections/Menu/Menu'
import MenuItem from 'src/collections/Menu/MenuItem'
import MenuHeader from 'src/collections/Menu/MenuHeader'
import MenuMenu from 'src/collections/Menu/MenuMenu'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('Menu', () => {
  common.isConformant(Menu)
  common.hasSubcomponents(Menu, [MenuHeader, MenuItem, MenuMenu])
  common.hasUIClassName(Menu)
  common.rendersChildren(Menu, {
    rendersContent: false,
  })

  common.implementsWidthProp(Menu, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'widths',
  })

  common.propKeyAndValueToClassName(Menu, 'fixed', ['left', 'right', 'bottom', 'top'])

  common.propKeyOnlyToClassName(Menu, 'borderless')
  common.propKeyOnlyToClassName(Menu, 'compact')
  common.propKeyOnlyToClassName(Menu, 'fluid')
  common.propKeyOnlyToClassName(Menu, 'inverted')
  common.propKeyOnlyToClassName(Menu, 'pagination')
  common.propKeyOnlyToClassName(Menu, 'pointing')
  common.propKeyOnlyToClassName(Menu, 'secondary')
  common.propKeyOnlyToClassName(Menu, 'stackable')
  common.propKeyOnlyToClassName(Menu, 'text')
  common.propKeyOnlyToClassName(Menu, 'vertical')

  common.propKeyOrValueAndKeyToClassName(Menu, 'attached', ['top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'floated', ['right'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'icon', ['labeled'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'tabular', ['right'])

  common.propValueOnlyToClassName(Menu, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Menu, 'size', _.without(SUI.SIZES, 'medium', 'big'))

  it('renders a `div` by default', () => {
    const { container } = render(<Menu />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  describe('activeIndex', () => {
    const items = [
      { key: 'home', name: 'home' },
      { key: 'users', name: 'users' },
    ]

    it('is null by default', () => {
      const { container } = render(<Menu items={items} />)
      expect(container.querySelector('.active')).toBeNull()
    })

    it('is set when clicking an item', () => {
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      fireEvent.click(menuItems[1])

      // Re-query after click
      expect(container.querySelectorAll('.item')[1]).toHaveClass('active')
    })

    it('works as a string', () => {
      const { container } = render(<Menu items={items} activeIndex={1} />)
      const menuItems = container.querySelectorAll('.item')

      expect(menuItems[1]).toHaveClass('active')
    })
  })

  describe('items', () => {
    it('renders children', () => {
      const items = [
        { key: 'home', name: 'home', 'data-foo': 'something' },
        { key: 'users', name: 'users', active: true, 'data-foo': 'something' },
      ]
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      expect(menuItems[0]).toHaveTextContent('Home')
      expect(menuItems[1]).toHaveTextContent('Users')
    })

    it('onClick can be omitted', () => {
      const items = [
        { key: 'home', name: 'home' },
        { key: 'users', name: 'users', active: true },
      ]
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      expect(() => fireEvent.click(menuItems[1])).not.toThrow()
    })

    it('passes onClick handler', () => {
      const spy = vi.fn()
      const items = [
        { key: 'home', name: 'home', onClick: spy, 'data-foo': 'something' },
        { key: 'users', name: 'users', active: true, 'data-foo': 'something' },
      ]
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      fireEvent.click(menuItems[0])

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ name: 'home', index: 0 }),
      )
    })

    it('passes arbitrary props', () => {
      const items = [
        { key: 'home', name: 'home', 'data-foo': 'something' },
        { key: 'users', name: 'users', active: true, 'data-foo': 'something' },
      ]
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      menuItems.forEach((item) => {
        expect(item).toHaveAttribute('data-foo', 'something')
      })
    })
  })

  describe('onItemClick', () => {
    it('is called with (e, { name, index }) when clicked', () => {
      const onClick = vi.fn()
      const onItemClick = vi.fn()

      const items = [
        { key: 'home', name: 'home' },
        { key: 'users', name: 'users', onClick },
      ]
      const matchProps = { index: 1, name: 'users' }

      const { container } = render(<Menu items={items} onItemClick={onItemClick} />)
      const menuItems = container.querySelectorAll('.item')

      fireEvent.click(menuItems[1])

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(matchProps),
      )
      expect(onItemClick).toHaveBeenCalledOnce()
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(matchProps),
      )
    })
  })
})
