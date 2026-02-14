import _ from 'lodash'
import { render, fireEvent } from '@testing-library/react'

import { SUI } from 'src/lib'
import Rating from 'src/modules/Rating/Rating'
import * as common from 'test/specs/commonTests'

describe('Rating', () => {
  common.isConformant(Rating)
  common.hasUIClassName(Rating)

  common.propKeyOnlyToClassName(Rating, 'disabled')

  common.propValueOnlyToClassName(Rating, 'icon', ['star', 'heart'])
  common.propValueOnlyToClassName(Rating, 'size', _.without(SUI.SIZES, 'medium', 'big'))

  describe('clicking on icons', () => {
    it('makes icons active up to and including the clicked icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[1])

      expect(icons[0]).toHaveClass('active')
      expect(icons[1]).toHaveClass('active')
      expect(icons[2]).not.toHaveClass('active')
    })

    it('if no rating selected no icon should have aria-checked', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      expect(icons[0]).toHaveAttribute('aria-checked', 'false')
      expect(icons[1]).toHaveAttribute('aria-checked', 'false')
      expect(icons[2]).toHaveAttribute('aria-checked', 'false')
    })

    it('makes the clicked icon aria-checked', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[1])

      expect(icons[0]).toHaveAttribute('aria-checked', 'false')
      expect(icons[1]).toHaveAttribute('aria-checked', 'true')
      expect(icons[2]).toHaveAttribute('aria-checked', 'false')
    })

    it('set aria-setsize on each rating icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      expect(icons[0]).toHaveAttribute('aria-setsize', '3')
      expect(icons[1]).toHaveAttribute('aria-setsize', '3')
      expect(icons[2]).toHaveAttribute('aria-setsize', '3')
    })

    it('sets aria-posinset on each rating icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      expect(icons[0]).toHaveAttribute('aria-posinset', '1')
      expect(icons[1]).toHaveAttribute('aria-posinset', '2')
      expect(icons[2]).toHaveAttribute('aria-posinset', '3')
    })

    it('removes the "selected" prop', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.mouseEnter(icons[icons.length - 1])
      fireEvent.click(icons[icons.length - 1])

      expect(container.firstChild).not.toHaveClass('selected')
      expect(container.querySelectorAll('.selected')).toHaveLength(0)
    })
  })

  describe('hovering on icons', () => {
    it('adds the "selected" className to the Rating', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.mouseEnter(icons[0])
      expect(container.firstChild).toHaveClass('selected')
    })

    it('selects icons up to and including the hovered icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.mouseEnter(icons[1])

      expect(icons[0]).toHaveClass('selected')
      expect(icons[1]).toHaveClass('selected')
      expect(icons[2]).not.toHaveClass('selected')
    })

    it('unselects icons on mouse leave', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.mouseEnter(icons[icons.length - 1])
      fireEvent.mouseLeave(container.firstChild)

      expect(container.querySelectorAll('.selected')).toHaveLength(0)
    })
  })

  describe('clearable', () => {
    it('prevents clearing by default with multiple icons', () => {
      const { container } = render(<Rating defaultRating={5} maxRating={5} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[icons.length - 1])
      expect(container.querySelectorAll('.active')).toHaveLength(5)
    })

    it('allows toggling when set to "auto" with a single icon', () => {
      const { container } = render(<Rating clearable='auto' maxRating={1} />)
      const icon = container.querySelector('i')

      fireEvent.click(icon)
      expect(icon).toHaveClass('active')

      fireEvent.click(icon)
      expect(icon).not.toHaveClass('active')
    })

    it('allows clearing when true with a single icon', () => {
      const { container } = render(<Rating clearable defaultRating={1} maxRating={1} />)
      const icon = container.querySelector('i')

      fireEvent.click(icon)
      expect(icon).not.toHaveClass('active')
    })

    it('allows clearing when true with multiple icons', () => {
      const { container } = render(<Rating clearable defaultRating={4} maxRating={5} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[3])
      expect(container.querySelectorAll('.active')).toHaveLength(0)
    })

    it('prevents clearing when false with a single icon', () => {
      const { container } = render(<Rating clearable={false} defaultRating={1} maxRating={1} />)
      const icon = container.querySelector('i')

      fireEvent.click(icon)
      expect(icon).toHaveClass('active')
    })

    it('prevents clearing when false with multiple icons', () => {
      const { container } = render(<Rating clearable={false} defaultRating={5} maxRating={5} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[icons.length - 1])
      expect(container.querySelectorAll('.active')).toHaveLength(5)
    })
  })

  describe('disabled', () => {
    it('prevents the rating from being toggled', () => {
      const { container: c1 } = render(
        <Rating clearable='auto' disabled maxRating={1} rating={1} />,
      )
      fireEvent.click(c1.querySelector('i'))
      expect(c1.querySelector('i')).toHaveClass('active')

      const { container: c2 } = render(
        <Rating clearable='auto' disabled maxRating={1} rating={0} />,
      )
      fireEvent.click(c2.querySelector('i'))
      expect(c2.querySelector('i')).not.toHaveClass('active')
    })

    it('prevents the rating from being cleared', () => {
      const { container } = render(<Rating disabled maxRating={3} rating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[icons.length - 1])
      expect(container.querySelectorAll('.active')).toHaveLength(3)
    })

    it('prevents icons from becoming selected on mouse enter', () => {
      const { container } = render(<Rating disabled maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.mouseEnter(icons[icons.length - 1])
      expect(container.querySelectorAll('.selected')).toHaveLength(0)
    })

    it('prevents icons from becoming unselected on mouse leave', () => {
      const { container, rerender } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.mouseEnter(icons[icons.length - 1])
      expect(container.querySelectorAll('i.selected')).toHaveLength(3)

      rerender(<Rating disabled maxRating={3} />)
      fireEvent.mouseLeave(container.firstChild)
      expect(container.querySelectorAll('i.selected')).toHaveLength(3)
    })

    it('prevents icons from becoming active on click', () => {
      const { container } = render(<Rating disabled maxRating={3} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[icons.length - 1])
      expect(container.querySelectorAll('.active')).toHaveLength(0)
    })
  })

  describe('maxRating', () => {
    it('controls how many icons are displayed', () => {
      _.times(10, (i) => {
        const maxRating = i + 1
        const { container } = render(<Rating maxRating={maxRating} />)
        expect(container.querySelectorAll('i')).toHaveLength(maxRating)
      })
    })
  })

  describe('onRate', () => {
    it('is called with (event, { rating, maxRating } on icon click', () => {
      const spy = vi.fn()

      const { container } = render(<Rating maxRating={3} onRate={spy} />)
      const icons = container.querySelectorAll('i')

      fireEvent.click(icons[icons.length - 1])

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ rating: 3, maxRating: 3 }),
      )
    })
  })

  describe('rating', () => {
    it('controls how many icons are active', () => {
      const { container, rerender } = render(<Rating maxRating={10} />)

      _.times(10, (rating) => {
        rerender(<Rating maxRating={10} rating={rating} />)
        expect(container.querySelectorAll('.active')).toHaveLength(rating)
      })
    })
  })

  describe('tabIndex', () => {
    it('sets icons tabIndex to -1 to prevent focus when element is disabled', () => {
      const { container: c1 } = render(<Rating maxRating={3} />)
      c1.querySelectorAll('i').forEach((node) => {
        expect(node).toHaveAttribute('tabIndex', '0')
      })

      const { container: c2 } = render(<Rating disabled maxRating={3} />)
      c2.querySelectorAll('i').forEach((node) => {
        expect(node).toHaveAttribute('tabIndex', '-1')
      })
    })

    it('sets Rating element tabIndex to 0 to allow focusing the whole group when disabled', () => {
      const { container: c1 } = render(<Rating maxRating={3} />)
      expect(c1.firstChild).toHaveAttribute('tabIndex', '-1')

      const { container: c2 } = render(<Rating disabled maxRating={3} />)
      expect(c2.firstChild).toHaveAttribute('tabIndex', '0')
    })
  })
})
