import { render, fireEvent } from '@testing-library/react'

import MenuItem from 'src/collections/Menu/MenuItem'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('MenuItem', () => {
  common.isConformant(MenuItem)
  common.rendersChildren(MenuItem)

  common.implementsCreateMethod(MenuItem)
  common.implementsIconProp(MenuItem, { autoGenerateKey: false })

  common.propKeyOnlyToClassName(MenuItem, 'active')
  common.propKeyOnlyToClassName(MenuItem, 'disabled')
  common.propKeyOnlyToClassName(MenuItem, 'header')
  common.propKeyOnlyToClassName(MenuItem, 'icon')
  common.propKeyOnlyToClassName(MenuItem, 'link')

  common.propKeyOrValueAndKeyToClassName(MenuItem, 'fitted', ['horizontally', 'vertically'])

  common.propValueOnlyToClassName(MenuItem, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(MenuItem, 'position', ['left', 'right'])

  describe('as', () => {
    it('renders a `div` by default', () => {
      const { container } = render(<MenuItem />)
      expect(container.firstChild.tagName).toBe('DIV')
    })

    it('renders an `a` tag', () => {
      const { container } = render(<MenuItem onClick={() => null} />)
      expect(container.firstChild.tagName).toBe('A')
    })
  })

  describe('name', () => {
    it('uses the name prop as Start Cased child text', () => {
      const { container } = render(<MenuItem name='upcomingEvents' />)
      expect(container.firstChild).toHaveTextContent('Upcoming Events')
    })
  })

  describe('icon', () => {
    it('does not add `icon` className if there is also `name`', () => {
      const { container } = render(<MenuItem icon='user' name='users' />)
      expect(container.firstChild).not.toHaveClass('icon')
    })
    it('does not add `icon` className if there is also `content`', () => {
      const { container } = render(<MenuItem icon='user' content='Users' />)
      expect(container.firstChild).not.toHaveClass('icon')
    })
    it('adds `icon` className if there is an `icon` without `name` or `content`', () => {
      const { container } = render(<MenuItem icon='user' />)
      expect(container.firstChild).toHaveClass('icon')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const props = { name: 'home', index: 0 }

      const { container } = render(<MenuItem onClick={onClick} {...props} />)
      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(props),
      )
    })

    it('is not called when is disabled', () => {
      const onClick = vi.fn()

      const { container } = render(<MenuItem disabled onClick={onClick} />)
      fireEvent.click(container.firstChild)
      expect(onClick).toHaveBeenCalledTimes(0)
    })
  })
})
