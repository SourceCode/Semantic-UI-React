import { render, fireEvent } from '@testing-library/react'

import Pagination from 'src/addons/Pagination/Pagination'
import PaginationItem from 'src/addons/Pagination/PaginationItem'
import * as common from 'test/specs/commonTests'

const requiredProps = {
  totalPages: 0,
}

describe('Pagination', () => {
  common.isConformant(Pagination, { requiredProps })
  common.hasSubcomponents(Pagination, [PaginationItem])

  describe('disabled', () => {
    it('is passed to each item', () => {
      const { container } = render(<Pagination activePage={1} disabled totalPages={3} />)
      const items = container.querySelectorAll('[role="menuitem"], a.item')

      items.forEach((item) => {
        expect(item).toHaveClass('disabled')
      })
    })
  })

  describe('onPageChange', () => {
    it('is called with (e, data) when clicked on a pagination item', () => {
      const onPageChange = vi.fn()
      const onPageItemClick = vi.fn()

      const { container } = render(
        <Pagination
          activePage={1}
          onPageChange={onPageChange}
          pageItem={{ onClick: onPageItemClick }}
          totalPages={3}
        />,
      )

      // Items: first, prev, page1(active), page2, page3, next, last
      // Click page3 (index 4)
      const items = container.querySelectorAll('a.item')
      fireEvent.click(items[4])

      expect(onPageChange).toHaveBeenCalledOnce()
      expect(onPageChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ activePage: 3 }),
      )
      expect(onPageItemClick).toHaveBeenCalledOnce()
      expect(onPageItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ value: 3 }),
      )
    })

    it('will be omitted if occurred for the same pagination item as the current', () => {
      const onPageChange = vi.fn()
      const { container } = render(
        <Pagination
          activePage={1}
          firstItem={null}
          onPageChange={onPageChange}
          prevItem={null}
          totalPages={3}
        />,
      )

      // Items: page1(active), page2, page3, next, last
      // Click page1 (index 0) which is already active
      const items = container.querySelectorAll('a.item')
      fireEvent.click(items[0])
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('will be omitted when item "type" is "ellipsisItem"', () => {
      const onPageChange = vi.fn()
      const { container } = render(
        <Pagination
          activePage={5}
          firstItem={null}
          onPageChange={onPageChange}
          prevItem={null}
          totalPages={10}
        />,
      )

      // Items: page1, ellipsis, page4, page5(active), page6, ellipsis, page10, next, last
      // Click the first ellipsis (index 1)
      const items = container.querySelectorAll('a.item')
      fireEvent.click(items[1])
      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('activePage', () => {
    it('defaults to "1"', () => {
      const { container } = render(<Pagination totalPages={3} />)
      const items = container.querySelectorAll('a.item')

      // The first page item should be active (after first/prev items)
      // Items: first, prev, page1(active), page2, page3, next, last
      expect(items[2]).toHaveClass('active')
    })

    it('can be set via "defaultActivePage"', () => {
      const { container } = render(<Pagination defaultActivePage={2} totalPages={3} />)
      const items = container.querySelectorAll('a.item')

      // Items: first, prev, page1, page2(active), page3, next, last
      expect(items[3]).toHaveClass('active')
    })

    it('can be set via "activePage"', () => {
      const { container } = render(<Pagination activePage={2} totalPages={3} />)
      const items = container.querySelectorAll('a.item')

      // Items: first, prev, page1, page2(active), page3, next, last
      expect(items[3]).toHaveClass('active')
    })
  })
})
