import { render, fireEvent } from '@testing-library/react'

import PaginationItem from 'src/addons/Pagination/PaginationItem'
import * as common from 'test/specs/commonTests'

describe('PaginationItem', () => {
  common.isConformant(PaginationItem)
  common.implementsCreateMethod(PaginationItem)

  describe('active', () => {
    it('is not active by default', () => {
      const { container } = render(<PaginationItem />)
      expect(container.firstChild).not.toHaveClass('active')
    })

    it('can be set to active', () => {
      const { container } = render(<PaginationItem active />)
      expect(container.firstChild).toHaveClass('active')
    })
  })

  describe('aria-current', () => {
    it('matches the values of "active" prop by default', () => {
      const { container } = render(<PaginationItem active />)
      expect(container.firstChild).toHaveAttribute('aria-current', 'true')
    })

    it('can be overridden', () => {
      const { container } = render(<PaginationItem active aria-current={false} />)
      expect(container.firstChild).toHaveAttribute('aria-current', 'false')
    })
  })

  describe('disabled', () => {
    it('is not disabled by default', () => {
      const { container } = render(<PaginationItem />)
      expect(container.firstChild).not.toHaveClass('disabled')
      expect(container.firstChild).toHaveAttribute('aria-disabled', 'false')
    })

    it('is disabled when "type" is "ellipsisItem"', () => {
      const { container } = render(<PaginationItem type='ellipsisItem' />)
      expect(container.firstChild).toHaveClass('disabled')
      expect(container.firstChild).toHaveAttribute('aria-disabled', 'true')
    })

    it('can be overridden', () => {
      const { container } = render(<PaginationItem disabled />)
      expect(container.firstChild).toHaveClass('disabled')
      expect(container.firstChild).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', () => {
      const onClick = vi.fn()

      const { container } = render(<PaginationItem onClick={onClick} />)
      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ onClick }),
      )
    })

    it('is called with (e, props) when "Enter" is pressed', () => {
      const onClick = vi.fn()

      const { container } = render(<PaginationItem onClick={onClick} />)
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' }),
        expect.objectContaining({ onClick }),
      )
    })
  })

  describe('onKeyDown', () => {
    it('is called with (e, props) when a key is pressed', () => {
      const onKeyDown = vi.fn()

      const { container } = render(<PaginationItem onKeyDown={onKeyDown} />)
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      expect(onKeyDown).toHaveBeenCalledOnce()
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' }),
        expect.objectContaining({ onKeyDown }),
      )
    })
  })

  describe('tabIndex', () => {
    it('is "0" by default', () => {
      const { container } = render(<PaginationItem />)
      expect(container.firstChild).toHaveAttribute('tabindex', '0')
    })

    it('is "-1" when "type" is "ellipsisItem"', () => {
      const { container } = render(<PaginationItem type='ellipsisItem' />)
      expect(container.firstChild).toHaveAttribute('tabindex', '-1')
    })

    it('can be overridden', () => {
      const { container } = render(<PaginationItem tabIndex={5} />)
      expect(container.firstChild).toHaveAttribute('tabindex', '5')
    })
  })
})
