import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { render, fireEvent } from '@testing-library/react'

import Modal from 'src/modules/Modal/Modal'
import ModalHeader from 'src/modules/Modal/ModalHeader'
import ModalContent from 'src/modules/Modal/ModalContent'
import ModalActions from 'src/modules/Modal/ModalActions'
import ModalDescription from 'src/modules/Modal/ModalDescription'
import ModalDimmer from 'src/modules/Modal/ModalDimmer'

import {
  assertNodeContains,
  assertBodyContains,
  domEvent,
  flushEffects,
} from 'test/utils'
import * as common from 'test/specs/commonTests'
import isBrowser from 'src/lib/isBrowser'

let wrapper

const wrapperMount = (element) => {
  const result = render(element)
  wrapper = result
  return result
}

describe('Modal', () => {
  beforeEach(() => {
    wrapper = undefined

    const dimmer = document.querySelector('.ui.dimmer')
    const modal = document.querySelector('.ui.modal')

    if (dimmer) dimmer.parentNode.removeChild(dimmer)
    if (modal) modal.parentNode.removeChild(modal)
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      try {
        wrapper.unmount()
        // eslint-disable-next-line no-empty
      } catch {}
    }
  })

  common.isConformant(Modal, { rendersPortal: true, requiredProps: { open: true } })
  common.hasSubcomponents(Modal, [
    ModalHeader,
    ModalContent,
    ModalActions,
    ModalDescription,
    ModalDimmer,
  ])
  common.implementsShorthandProp(Modal, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: ModalHeader,
    mapValueToProps: (content) => ({ content }),
    rendersPortal: true,
    requiredProps: { open: true },
  })
  common.implementsShorthandProp(Modal, {
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: ModalContent,
    mapValueToProps: (content) => ({ content }),
    rendersPortal: true,
    requiredProps: { open: true },
  })

  it('renders to the document body', () => {
    wrapperMount(<Modal open />)
    assertBodyContains('.ui.modal')
  })

  it('renders child text', () => {
    wrapperMount(<Modal open>child text</Modal>)
    expect(document.querySelector('.ui.modal').textContent).toBe('child text')
  })

  it('renders child components', () => {
    const child = <div data-child />
    wrapperMount(<Modal open>{child}</Modal>)

    expect(
      document.querySelector('.ui.modal').querySelector('[data-child]'),
    ).not.toBeNull()
  })

  it("spreads the user's style prop on the Modal", () => {
    const style = { marginTop: '1em', top: 0 }

    wrapperMount(<Modal open style={style} />)
    const element = document.querySelector('.ui.modal')

    expect(element.style.marginTop).toBe('1em')
    expect(element.style.top).toBe('0px')
  })

  describe('actions', () => {
    it('closes the modal on action click', () => {
      wrapperMount(<Modal actions={['OK']} defaultOpen />)

      assertBodyContains('.ui.modal')
      domEvent.click('.ui.modal .actions .button')
      assertBodyContains('.ui.modal', false)
    })

    it('calls shorthand onActionClick callback', () => {
      const onActionClick = vi.fn()
      const modalActions = { onActionClick, actions: [{ key: 'ok', content: 'OK' }] }
      wrapperMount(<Modal actions={modalActions} defaultOpen />)

      expect(onActionClick).not.toHaveBeenCalled()
      domEvent.click('.ui.modal .actions .button')
      expect(onActionClick).toHaveBeenCalledOnce()
    })
  })

  describe('onActionClick', () => {
    it('is called when an action is clicked', () => {
      const onActionClick = vi.fn()
      const props = { actions: ['OK'], defaultOpen: true, onActionClick }

      wrapperMount(<Modal {...props} />)
      domEvent.click('.ui.modal .actions .button')

      expect(onActionClick).toHaveBeenCalledOnce()
    })
  })

  describe('open', () => {
    it('is not open by default', () => {
      wrapperMount(<Modal />)
      assertBodyContains('.ui.modal.open', false)
    })

    it('does not show the modal when false', () => {
      wrapperMount(<Modal open={false} />)
      assertBodyContains('.ui.modal', false)
    })

    it('does not show the dimmer when false', () => {
      wrapperMount(<Modal open={false} />)
      assertBodyContains('.ui.dimmer', false)
    })

    it('shows the dimmer when true', () => {
      wrapperMount(<Modal open dimmer />)
      assertBodyContains('.ui.dimmer')
    })

    it('shows the modal when true', () => {
      wrapperMount(<Modal open />)
      assertBodyContains('.ui.modal')
    })

    it('shows the modal and dimmer on changing from false to true', () => {
      const { rerender } = wrapperMount(<Modal open={false} />)
      assertBodyContains('.ui.modal', false)
      assertBodyContains('.ui.dimmer', false)

      rerender(<Modal open />)

      assertBodyContains('.ui.modal')
      assertBodyContains('.ui.dimmer')
    })

    it('hides the modal and dimmer on changing from true to false', () => {
      const { rerender } = wrapperMount(<Modal open />)
      assertBodyContains('.ui.modal')
      assertBodyContains('.ui.dimmer')

      rerender(<Modal open={false} />)

      assertBodyContains('.ui.modal', false)
      assertBodyContains('.ui.dimmer', false)
    })
  })

  describe('basic', () => {
    it('adds basic to the modal className', () => {
      wrapperMount(<Modal basic open />)
      assertBodyContains('.ui.basic.modal')
    })
  })

  describe('size', () => {
    const sizes = ['mini', 'tiny', 'small', 'large', 'fullscreen']

    sizes.forEach((size) => {
      it(`adds the "${size}" to the modal className`, () => {
        wrapperMount(<Modal size={size} open />)
        assertBodyContains(`.ui.${size}.modal`)
      })
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const onOpen = vi.fn()
      const { container } = wrapperMount(
        <Modal onOpen={onOpen} trigger={<div id='trigger' />} />,
      )

      fireEvent.click(container.querySelector('#trigger'))
      expect(onOpen).toHaveBeenCalledOnce()
    })

    it('is not called on body click', () => {
      const onOpen = vi.fn()
      wrapperMount(<Modal onOpen={onOpen} />)

      domEvent.click(document.body)
      expect(onOpen).not.toHaveBeenCalled()
    })
  })

  describe('onClose', () => {
    it('is called on dimmer click', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await flushEffects()
      domEvent.click('.ui.dimmer')
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('is called on click outside of the modal', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await flushEffects()
      domEvent.click(document.querySelector('.ui.modal').parentNode)
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('is not called on mousedown inside and mouseup outside of the modal', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await flushEffects()
      domEvent.mouseDown(document.querySelector('.ui.modal'))
      domEvent.click(document.querySelector('.ui.modal').parentNode)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on click inside of the modal', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await flushEffects()
      domEvent.click(document.querySelector('.ui.modal'))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on body click', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await flushEffects()
      domEvent.click(document.body)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is called when pressing escape', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await flushEffects()
      domEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('is not called when the open prop changes to false', () => {
      const onClose = vi.fn()
      const { rerender } = wrapperMount(<Modal onClose={onClose} defaultOpen />)

      rerender(<Modal onClose={onClose} open={false} />)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on dimmer click when closeOnDimmerClick is false', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen closeOnDimmerClick={false} />)

      await flushEffects()
      domEvent.click('.ui.dimmer')
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on body click when closeOnDocumentClick is false', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen closeOnDocumentClick={false} />)

      await flushEffects()
      domEvent.click(document.body)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('handles unmount without errors', async () => {
      function ControlledExample() {
        const [open, setState] = React.useState(true)

        return (
          <>
            {open && <Modal open onClose={() => setState(false)} />}
            <button id='close-button' />
          </>
        )
      }

      wrapperMount(<ControlledExample />)
      assertBodyContains('.ui.modal')

      await flushEffects()
      domEvent.keyDown(document, { key: 'Escape' })
      assertBodyContains('.ui.modal', false)
    })
  })

  describe('closeOnEscape', () => {
    it('closes the modal when Escape is pressed by default', async () => {
      wrapperMount(<Modal defaultOpen closeOnEscape />)

      assertBodyContains('.ui.dimmer')
      await flushEffects()
      domEvent.keyDown(document, { key: 'Escape' })
      assertBodyContains('.ui.dimmer', false)
    })

    it('does not close the modal when false and Escape is pressed', async () => {
      wrapperMount(<Modal defaultOpen closeOnEscape={false} />)

      assertBodyContains('.ui.dimmer')
      await flushEffects()
      domEvent.keyDown(document, { key: 'Escape' })
      assertBodyContains('.ui.dimmer')
    })
  })

  describe('closeOnDocumentClick', () => {
    it('is false by default', async () => {
      wrapperMount(<Modal defaultOpen />)

      assertBodyContains('.ui.dimmer')
      await flushEffects()
      domEvent.click(document.body)
      assertBodyContains('.ui.dimmer', true)
    })
    it('closes the modal on document click when true', async () => {
      wrapperMount(<Modal defaultOpen closeOnDocumentClick />)

      assertBodyContains('.ui.dimmer')
      await flushEffects()
      domEvent.click(document.body)
      assertBodyContains('.ui.dimmer', false)
    })
    it('does not close the modal on document click when false', async () => {
      wrapperMount(<Modal defaultOpen closeOnDocumentClick={false} />)

      assertBodyContains('.ui.dimmer')
      await flushEffects()
      domEvent.click(document.body)
      assertBodyContains('.ui.dimmer')
    })
  })

  describe('mountNode', () => {
    it('render modal within mountNode', () => {
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      wrapperMount(
        <Modal mountNode={mountNode} open>
          foo
        </Modal>,
      )
      assertNodeContains(mountNode, '.ui.modal')
    })
  })

  describe('closeIcon', () => {
    it('is not present by default', () => {
      wrapperMount(<Modal open>foo</Modal>)
      assertBodyContains('.ui.modal .icon', false)
    })

    it('defaults to `close` when boolean', () => {
      wrapperMount(
        <Modal open closeIcon>
          foo
        </Modal>,
      )
      assertBodyContains('.ui.modal .icon.close')
    })

    it('is present when passed', () => {
      wrapperMount(
        <Modal open closeIcon='bullseye'>
          foo
        </Modal>,
      )
      assertBodyContains('.ui.modal .icon.bullseye')
    })

    it('triggers onClose when clicked', () => {
      const spy = vi.fn()

      wrapperMount(
        <Modal onClose={spy} open closeIcon='bullseye'>
          foo
        </Modal>,
      )
      domEvent.click('.ui.modal .icon.bullseye')
      expect(spy).toHaveBeenCalledOnce()
    })
  })

  describe('server-side', () => {
    beforeAll(() => {
      isBrowser.override = false
    })

    afterAll(() => {
      isBrowser.override = null
    })

    it('renders empty content when trigger is not a valid component', () => {
      const markup = ReactDOMServer.renderToStaticMarkup(<Modal />)
      expect(markup).toBe('')
    })

    it('renders a valid trigger component', () => {
      const markup = ReactDOMServer.renderToStaticMarkup(<Modal trigger={<div id='trigger' />} />)
      expect(markup).toBe('<div id="trigger"></div>')
    })
  })
})
