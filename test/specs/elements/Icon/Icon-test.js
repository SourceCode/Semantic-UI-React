import _ from 'lodash'
import { render, fireEvent } from '@testing-library/react'

import Icon from 'src/elements/Icon/Icon'
import IconGroup from 'src/elements/Icon/IconGroup'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('Icon', () => {
  common.isConformant(Icon)
  common.hasSubcomponents(Icon, [IconGroup])

  common.implementsCreateMethod(Icon)

  common.propKeyAndValueToClassName(Icon, 'flipped', ['horizontally', 'vertically'])
  common.propKeyAndValueToClassName(Icon, 'rotated', ['clockwise', 'counterclockwise'])

  common.propKeyOnlyToClassName(Icon, 'bordered')
  common.propKeyOnlyToClassName(Icon, 'circular')
  common.propKeyOnlyToClassName(Icon, 'disabled')
  common.propKeyOnlyToClassName(Icon, 'fitted')
  common.propKeyOnlyToClassName(Icon, 'inverted')
  common.propKeyOnlyToClassName(Icon, 'link')
  common.propKeyOnlyToClassName(Icon, 'loading')

  common.propKeyOrValueAndKeyToClassName(Icon, 'corner', [
    'top left',
    'top right',
    'bottom left',
    'bottom right',
  ])

  common.propValueOnlyToClassName(Icon, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Icon, 'name', ['money'])
  common.propValueOnlyToClassName(Icon, 'size', _.without(SUI.SIZES, 'medium'))

  it('renders as an <i> by default', () => {
    const { container } = render(<Icon />)
    expect(container.firstChild.tagName).toBe('I')
  })

  describe('aria-hidden', () => {
    it('should add aria-hidden by default', () => {
      const { container } = render(<Icon />)
      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    })

    it('should pass aria-hidden', () => {
      const { container: c1 } = render(<Icon aria-hidden='true' />)
      expect(c1.firstChild).toHaveAttribute('aria-hidden', 'true')

      const { container: c2 } = render(<Icon aria-hidden='false' />)
      expect(c2.firstChild).toHaveAttribute('aria-hidden', 'false')
    })

    it('should passed aria-hidden with aria-label', () => {
      const { container } = render(<Icon aria-hidden='false' aria-label='icon' />)
      expect(container.firstChild).toHaveAttribute('aria-hidden', 'false')
    })
  })

  describe('aria-label', () => {
    it('should not applied by default', () => {
      const { container } = render(<Icon />)
      expect(container.firstChild).not.toHaveAttribute('aria-label')
    })

    it('should pass value and omit aria-hidden when is set', () => {
      const { container } = render(<Icon aria-label='icon' />)

      expect(container.firstChild).not.toHaveAttribute('aria-hidden')
      expect(container.firstChild).toHaveAttribute('aria-label', 'icon')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const { container } = render(<Icon onClick={onClick} />)

      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ onClick }),
      )
    })

    it('is not called when "disabled" is true', () => {
      const onClick = vi.fn()
      const { container } = render(<Icon disabled onClick={onClick} />)

      fireEvent.click(container.firstChild)

      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
