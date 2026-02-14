import _ from 'lodash'
import { render } from '@testing-library/react'

import Confirm from 'src/addons/Confirm/Confirm'
import Modal from 'src/modules/Modal/Modal'
import { assertBodyContains, domEvent } from 'test/utils'
import * as common from 'test/specs/commonTests'

describe('Confirm', () => {

  common.isConformant(Confirm, { rendersPortal: true, requiredProps: { open: true } })

  common.implementsShorthandProp(Confirm, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: Modal.Header,
    rendersPortal: true,
    mapValueToProps: (content) => ({ content }),
    requiredProps: { open: true },
  })
  common.implementsShorthandProp(Confirm, {
    defaultValue: 'OK',
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: Modal.Content,
    rendersPortal: true,
    mapValueToProps: (content) => ({ content }),
    requiredProps: { open: true },
  })

  describe('children', () => {
    it('renders a Modal', () => {
      const { unmount } = render(<Confirm open />)
      // Confirm renders a Modal which renders with class "ui modal"
      assertBodyContains('.ui.modal')
      unmount()
    })
  })

  describe('size', () => {
    it('has "small" size by default', () => {
      const { unmount } = render(<Confirm open />)
      assertBodyContains('.ui.small.modal')
      unmount()
    })

    _.forEach(['mini', 'tiny', 'small', 'large', 'fullscreen'], (size) => {
      it(`applies ${size} size`, () => {
        const { unmount } = render(<Confirm open size={size} />)
        assertBodyContains(`.ui.${size}.modal`)
        unmount()
      })
    })
  })

  describe('cancelButton', () => {
    it('is "Cancel" by default', () => {
      const { unmount } = render(<Confirm open />)
      const actions = document.body.querySelector('.actions')
      const buttons = actions.querySelectorAll('.ui.button')
      // First button is Cancel
      expect(buttons[0].textContent).toBe('Cancel')
      unmount()
    })

    it('sets the cancel button text', () => {
      const { unmount } = render(<Confirm open cancelButton='foo' />)
      const actions = document.body.querySelector('.actions')
      const buttons = actions.querySelectorAll('.ui.button')
      expect(buttons[0].textContent).toBe('foo')
      unmount()
    })
  })

  describe('confirmButton', () => {
    it('is "OK" by default', () => {
      const { unmount } = render(<Confirm open />)
      const actions = document.body.querySelector('.actions')
      const primaryButton = actions.querySelector('.ui.primary.button')
      expect(primaryButton.textContent).toBe('OK')
      unmount()
    })

    it('sets the confirm button text', () => {
      const { unmount } = render(<Confirm open confirmButton='foo' />)
      const actions = document.body.querySelector('.actions')
      const primaryButton = actions.querySelector('.ui.primary.button')
      expect(primaryButton.textContent).toBe('foo')
      unmount()
    })
  })

  describe('onCancel', () => {
    it('omitted when not defined', () => {
      const { unmount } = render(<Confirm open />)
      const actions = document.body.querySelector('.actions')
      const buttons = actions.querySelectorAll('.ui.button')

      expect(() => buttons[0].click()).not.toThrow()
      unmount()
    })

    it('is called on Cancel button click', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm open onCancel={spy} />)
      const actions = document.body.querySelector('.actions')
      const cancelButton = actions.querySelectorAll('.ui.button')[0]

      cancelButton.click()
      expect(spy).toHaveBeenCalledOnce()
      unmount()
    })

    it('is called on dimmer click', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm defaultOpen onCancel={spy} />)

      domEvent.click('.ui.dimmer')
      expect(spy).toHaveBeenCalledOnce()
      unmount()
    })

    it('is called on click outside of the modal', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm defaultOpen onCancel={spy} />)

      domEvent.click(document.querySelector('.ui.modal').parentNode)
      expect(spy).toHaveBeenCalledOnce()
      unmount()
    })

    it('is not called on click inside of the modal', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm defaultOpen onCancel={spy} />)

      domEvent.click(document.querySelector('.ui.modal'))
      expect(spy).not.toHaveBeenCalled()
      unmount()
    })

    it('is not called on body click', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm defaultOpen onCancel={spy} />)

      domEvent.click('body')
      expect(spy).not.toHaveBeenCalled()
      unmount()
    })

    it('is called when pressing escape', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm defaultOpen onCancel={spy} />)

      domEvent.keyDown(document, { key: 'Escape' })
      expect(spy).toHaveBeenCalledOnce()
      unmount()
    })

    it('is not called when pressing a key other than "Escape"', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm defaultOpen onCancel={spy} />)

      // Test representative non-Escape keys
      ;['Enter', 'ArrowDown', 'ArrowUp', ' ', 'Tab', 'a'].forEach((key) => {
        domEvent.keyDown(document, { key })
        expect(spy).not.toHaveBeenCalled()
      })
      unmount()
    })

    it('is not called when the open prop changes to false', () => {
      const spy = vi.fn()
      const { rerender, unmount } = render(<Confirm open onCancel={spy} />)

      rerender(<Confirm open={false} onCancel={spy} />)
      expect(spy).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('onConfirm', () => {
    it('omitted when not defined', () => {
      const { unmount } = render(<Confirm open />)
      const actions = document.body.querySelector('.actions')
      const primaryButton = actions.querySelector('.ui.primary.button')

      expect(() => primaryButton.click()).not.toThrow()
      unmount()
    })

    it('is called on OK button click', () => {
      const spy = vi.fn()
      const { unmount } = render(<Confirm open onConfirm={spy} />)
      const actions = document.body.querySelector('.actions')
      const primaryButton = actions.querySelector('.ui.primary.button')

      primaryButton.click()
      expect(spy).toHaveBeenCalledOnce()
      unmount()
    })
  })

  describe('open', () => {
    it('is not open by default', () => {
      const { unmount } = render(<Confirm />)
      assertBodyContains('.ui.modal.open', false)
      unmount()
    })

    it('does not show the modal when false', () => {
      const { unmount } = render(<Confirm open={false} />)
      assertBodyContains('.ui.modal', false)
      unmount()
    })

    it('shows the modal when true', () => {
      const { unmount } = render(<Confirm open />)
      assertBodyContains('.ui.modal')
      unmount()
    })

    it('shows the modal on changing from false to true', () => {
      const { rerender, unmount } = render(<Confirm open={false} />)
      assertBodyContains('.ui.modal', false)

      rerender(<Confirm open />)
      assertBodyContains('.ui.modal')
      unmount()
    })

    it('hides the modal on changing from true to false', () => {
      const { rerender, unmount } = render(<Confirm open />)
      assertBodyContains('.ui.modal')

      rerender(<Confirm open={false} />)
      assertBodyContains('.ui.modal', false)
      unmount()
    })
  })
})
