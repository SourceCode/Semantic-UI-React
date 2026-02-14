import { faker } from '@faker-js/faker'
import { render, fireEvent } from '@testing-library/react'

import DimmerInner from 'src/modules/Dimmer/DimmerInner'
import * as common from 'test/specs/commonTests'

describe('DimmerInner', () => {
  common.isConformant(DimmerInner)
  common.hasUIClassName(DimmerInner)
  common.rendersChildren(DimmerInner)

  common.implementsVerticalAlignProp(DimmerInner, ['bottom', 'top'])

  common.propKeyOnlyToClassName(DimmerInner, 'active', {
    className: 'active transition visible',
  })
  common.propKeyOnlyToClassName(DimmerInner, 'disabled')
  common.propKeyOnlyToClassName(DimmerInner, 'inverted')
  common.propKeyOnlyToClassName(DimmerInner, 'simple')

  describe('active', () => {
    it('adds "display: flex" after set to "true"', () => {
      const { container, rerender } = render(<DimmerInner />)
      expect(container.firstChild.style.display).toBeFalsy()

      rerender(<DimmerInner active />)
      expect(container.firstChild.style.display).toBe('flex')
    })
  })

  describe('onClickOutside', () => {
    it('called when Dimmer has not children', () => {
      const onClickOutside = vi.fn()
      const { container } = render(<DimmerInner onClickOutside={onClickOutside} />)

      fireEvent.click(container.firstChild)
      expect(onClickOutside).toHaveBeenCalledOnce()
    })

    it('omitted when click on children', () => {
      const onClickOutside = vi.fn()
      const { container } = render(
        <DimmerInner onClickOutside={onClickOutside}>
          <div>{faker.hacker.phrase()}</div>
        </DimmerInner>,
      )

      const childDiv = container.querySelector('div.content > div')
      fireEvent.click(childDiv)
      expect(onClickOutside).not.toHaveBeenCalled()
    })

    it('called when click on Dimmer', () => {
      const onClickOutside = vi.fn()
      const { container } = render(
        <DimmerInner onClickOutside={onClickOutside}>{faker.hacker.phrase()}</DimmerInner>,
      )

      fireEvent.click(container.firstChild)
      expect(onClickOutside).toHaveBeenCalledOnce()
    })

    it('called when click on center', () => {
      const onClickOutside = vi.fn()
      const { container } = render(
        <DimmerInner onClickOutside={onClickOutside}>{faker.hacker.phrase()}</DimmerInner>,
      )

      fireEvent.click(container.querySelector('div.content'))
      expect(onClickOutside).toHaveBeenCalledOnce()
    })
  })
})
