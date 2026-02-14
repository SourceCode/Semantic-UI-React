import { render } from '@testing-library/react'

import ModalDimmer from 'src/modules/Modal/ModalDimmer'
import * as common from 'test/specs/commonTests'

describe('ModalDimmer', () => {
  common.isConformant(ModalDimmer)
  common.hasUIClassName(ModalDimmer)
  common.rendersChildren(ModalDimmer)

  common.propKeyOnlyToClassName(ModalDimmer, 'inverted')

  it('has required classes', () => {
    const { container } = render(<ModalDimmer mountNode={null} />)
    const el = container.firstChild

    expect(el).toHaveClass('page')
    expect(el).toHaveClass('modals')
    expect(el).toHaveClass('dimmer')
    expect(el).toHaveClass('transition')
    expect(el).toHaveClass('visible')
    expect(el).toHaveClass('active')
  })

  describe('children', () => {
    it('adds classes to "mountNode"', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} />)

      expect(element.className).toContain('dimmable')
      expect(element.className).toContain('dimmed')
    })
  })

  describe('blurring', () => {
    it('adds nothing "mountNode" by default', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} />)

      expect(element.className).not.toContain('blurring')
    })

    it('adds a class to "MountNode" when is "true"', () => {
      const element = document.createElement('div')
      render(<ModalDimmer blurring mountNode={element} />)

      expect(element.className).toContain('blurring')
    })
  })

  describe('centered', () => {
    it('adds "top aligned" to "className" by default', () => {
      const { container } = render(<ModalDimmer />)
      expect(container.querySelector('.dimmer')).toHaveClass('top aligned')
    })

    it('adds nothing to "className" when is "true"', () => {
      const { container } = render(<ModalDimmer centered />)
      expect(container.querySelector('.dimmer')).not.toHaveClass('top aligned')
    })
  })

  describe('scrolling', () => {
    it('adds nothing "MountNode" by default', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} />)

      expect(element.className).not.toContain('scrolling')
    })

    it('adds "className" to "MountNode"', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} scrolling />)

      expect(element.className).toContain('scrolling')
    })
  })

  describe('style', () => {
    it('adds "display: flex" with "important"', () => {
      const { container } = render(<ModalDimmer />)
      const style = container.firstChild.style

      expect(style.getPropertyValue('display')).toBe('flex')
      expect(style.getPropertyPriority('display')).toBe('important')
    })
  })
})
