import _ from 'lodash'
import { act } from 'react'
import { render, fireEvent } from '@testing-library/react'

import { SUI } from 'src/lib'
import Popup from 'src/modules/Popup/Popup'
import PopupHeader from 'src/modules/Popup/PopupHeader'
import PopupContent from 'src/modules/Popup/PopupContent'
import * as common from 'test/specs/commonTests'
import { domEvent } from 'test/utils'

// ----------------------------------------
// Wrapper
// ----------------------------------------
let wrapper

const wrapperMount = (element) => {
  const result = render(element)
  wrapper = result
  return result
}

const assertInBody = (selector, isPresent = true) => {
  const didFind = document.body.querySelector(selector) !== null
  expect(didFind).toBe(isPresent)
}

describe('Popup', () => {
  beforeEach(() => {
    wrapper = undefined
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount()
    }
  })

  common.isConformant(Popup, { rendersChildren: false, rendersPortal: true, forwardsRef: false })
  common.hasSubcomponents(Popup, [PopupHeader, PopupContent])

  describe('children', () => {
    it('renders to the document body', () => {
      wrapperMount(<Popup open />)
      assertInBody('.ui.popup.visible')
    })

    it('renders child text', () => {
      wrapperMount(<Popup open>child text</Popup>)

      expect(document.querySelector('.ui.popup.visible').textContent).toBe('child text')
    })

    it('renders child components', () => {
      const child = <div data-child />
      wrapperMount(<Popup open>{child}</Popup>)

      expect(
        document.querySelector('.ui.popup.visible').querySelector('[data-child]'),
      ).not.toBeNull()
    })
  })

  describe('className', () => {
    it('should add className to the wrapping node', () => {
      wrapperMount(<Popup className='some-class' open />)
      assertInBody('.ui.popup.visible.some-class')
    })
  })

  describe('basic', () => {
    it('adds basic to the popup className', () => {
      wrapperMount(<Popup basic open />)
      assertInBody('.ui.basic.popup.visible')
    })
  })

  describe('disabled', () => {
    it('does not render popup content when disabled', () => {
      wrapperMount(<Popup disabled open />)
      assertInBody('.ui.popup.visible', false)
    })
  })

  describe('flowing', () => {
    it('adds flowing to the popup className', () => {
      wrapperMount(<Popup flowing open />)
      assertInBody('.ui.flowing.popup.visible')
    })
  })

  describe('hideOnScroll', () => {
    it('hides on window scroll', () => {
      const { container } = wrapperMount(
        <Popup content='foo' hideOnScroll trigger={<button>foo</button>} />,
      )

      fireEvent.click(container.querySelector('button'))
      assertInBody('.ui.popup.visible')

      domEvent.scroll(window)
      assertInBody('.ui.popup.visible', false)
    })

    it('is called with (e, props) when scroll', () => {
      const onClose = vi.fn()
      const trigger = <button>foo</button>

      const { container } = wrapperMount(
        <Popup content='foo' hideOnScroll onClose={onClose} trigger={trigger} />,
      )

      fireEvent.click(container.querySelector('button'))
      domEvent.scroll(window)

      expect(onClose).toHaveBeenCalledOnce()
      expect(onClose).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ content: 'foo', onClose }),
      )
    })

    it('not hide on scroll from inside a popup', () => {
      const onClose = vi.fn()
      const child = <div data-child />
      const trigger = <button>foo</button>

      const { container } = wrapperMount(
        <Popup hideOnScroll onClose={onClose} trigger={trigger}>
          {child}
        </Popup>,
      )
      fireEvent.click(container.querySelector('button'))

      domEvent.scroll(document.querySelector('[data-child]'))
      expect(onClose).not.toHaveBeenCalled()

      domEvent.scroll(window)
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('inverted', () => {
    it('adds inverted to the popup className', () => {
      wrapperMount(<Popup inverted open />)
      assertInBody('.ui.inverted.popup.visible')
    })
  })

  describe('onClose', () => {
    it('is not called on click inside of the popup', () => {
      const onClose = vi.fn()
      wrapperMount(<Popup defaultOpen onClose={onClose} />)

      domEvent.click('.ui.popup')
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is called on body click', () => {
      const onClose = vi.fn()
      wrapperMount(<Popup defaultOpen onClose={onClose} />)

      domEvent.click('body')
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('is called when pressing escape', () => {
      const onClose = vi.fn()
      wrapperMount(<Popup defaultOpen onClose={onClose} />)

      domEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('is not called when the open prop changes to false', () => {
      const onClose = vi.fn()
      const { rerender } = wrapperMount(<Popup defaultOpen onClose={onClose} />)

      rerender(<Popup open={false} onClose={onClose} />)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const onOpen = vi.fn()
      const { container } = wrapperMount(
        <Popup onOpen={onOpen} trigger={<div id='trigger' />}>
          <p />
        </Popup>,
      )

      fireEvent.click(container.querySelector('#trigger'))
      expect(onOpen).toHaveBeenCalledOnce()
      expect(onOpen).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ open: true }),
      )
    })
  })

  describe('onClose (second describe)', () => {
    it('is called on body click', () => {
      const onClose = vi.fn()
      wrapperMount(
        <Popup defaultOpen onClose={onClose} trigger={<div />}>
          <p />
        </Popup>,
      )

      domEvent.click(document.body)
      expect(onClose).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ open: false }),
      )
    })
  })

  describe('open', () => {
    it('is not open by default', () => {
      wrapperMount(<Popup />)
      assertInBody('.ui.popup.visible', false)
    })

    it('does not show the popup when false', () => {
      wrapperMount(<Popup open={false} />)
      assertInBody('.ui.popup.visible', false)
    })

    it('shows the popup on changing from false to true', () => {
      const { rerender } = wrapperMount(<Popup open={false} />)
      assertInBody('.ui.popup.visible', false)

      rerender(<Popup open />)
      assertInBody('.ui.popup.visible')
    })

    it('hides the popup on changing from true to false', () => {
      const { rerender } = wrapperMount(<Popup open />)
      assertInBody('.ui.popup.visible')

      rerender(<Popup open={false} />)
      assertInBody('.ui.popup.visible', false)
    })
  })

  describe('size', () => {
    const sizes = _.without(SUI.SIZES, 'medium', 'big', 'massive')

    sizes.forEach((size) => {
      it(`adds the ${size} to the popup className`, () => {
        wrapperMount(<Popup size={size} open />)
        assertInBody(`.ui.${size}.popup`)
      })
    })
  })

  describe('trigger', () => {
    it('opens Popup on click', () => {
      const { container } = wrapperMount(
        <Popup on='click' content='foo' trigger={<button />} />,
      )

      fireEvent.click(container.querySelector('button'))
      assertInBody('.ui.popup.visible')
    })

    it('opens Popup on hover', async () => {
      const { container } = wrapperMount(
        <Popup content='foo' mouseEnterDelay={0} trigger={<button />} />,
      )

      fireEvent.mouseEnter(container.querySelector('button'))
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })
      assertInBody('.ui.popup.visible')
    })

    it('opens Popup on focus', () => {
      const { container } = wrapperMount(
        <Popup on='focus' content='foo' trigger={<input />} />,
      )

      fireEvent.focus(container.querySelector('input'))
      assertInBody('.ui.popup.visible')
    })

    it('opens Popup on multiple', async () => {
      const { container } = wrapperMount(
        <Popup on={['click', 'hover']} content='foo' trigger={<button />} />,
      )
      const button = container.querySelector('button')

      fireEvent.click(button)
      assertInBody('.ui.popup.visible')

      domEvent.click('body')

      fireEvent.mouseEnter(button)
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 51))
      })
      assertInBody('.ui.popup.visible')
    })
  })

  describe('wide', () => {
    it('adds to the popup className', () => {
      wrapperMount(<Popup wide open />)
      assertInBody('.ui.wide.popup.visible')
    })

    it('adds "very" to the popup className', () => {
      wrapperMount(<Popup wide='very' open />)
      assertInBody('.ui.very.wide.popup.visible')
    })
  })
})
