import { render } from '@testing-library/react'

import Dimmer from 'src/modules/Dimmer/Dimmer'
import DimmerDimmable from 'src/modules/Dimmer/DimmerDimmable'
import DimmerInner from 'src/modules/Dimmer/DimmerInner'
import * as common from 'test/specs/commonTests'

describe('Dimmer', () => {
  common.isConformant(Dimmer)
  common.hasSubcomponents(Dimmer, [DimmerDimmable, DimmerInner])

  common.implementsCreateMethod(Dimmer)

  describe('children', () => {
    it('renders a DimmerInner', () => {
      const { container } = render(<Dimmer />)
      expect(container.querySelector('.dimmer')).toBeInTheDocument()
    })
  })

  describe('page', () => {
    it('renders a Portal when page', () => {
      const { baseElement } = render(<Dimmer page active />)
      expect(baseElement.querySelector('.dimmer')).toBeInTheDocument()
    })

    describe('active', () => {
      beforeEach(() => {
        document.body.classList.remove('dimmable', 'dimmed')
      })

      it('when true, Portal is opened dimmer classes are present on body', () => {
        render(<Dimmer page active />)
        const classes = document.body.classList

        expect(classes.contains('dimmable')).toBe(true)
        expect(classes.contains('dimmed')).toBe(true)
      })

      it('when false, Portal is closed dimmer classes are absent on body', () => {
        render(<Dimmer page active={false} />)
        const classes = document.body.classList

        expect(classes.contains('dimmable')).toBe(false)
        expect(classes.contains('dimmed')).toBe(false)
      })

      it('when changed to false, dimmer classes are removed from body', () => {
        const { rerender } = render(<Dimmer page active />)
        const classes = document.body.classList

        rerender(<Dimmer page active={false} />)

        expect(classes.contains('dimmable')).toBe(false)
        expect(classes.contains('dimmed')).toBe(false)
      })
    })
  })
})
