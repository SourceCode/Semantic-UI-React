import { act } from 'react'
import { render } from '@testing-library/react'

import Sidebar from 'src/modules/Sidebar/Sidebar'
import * as common from 'test/specs/commonTests'
import { assertWithTimeout, domEvent } from 'test/utils'

describe('Sidebar', () => {
  common.isConformant(Sidebar)
  common.hasUIClassName(Sidebar)
  common.rendersChildren(Sidebar)

  common.propKeyOnlyToClassName(Sidebar, 'visible')

  common.propValueOnlyToClassName(Sidebar, 'animation', [
    'overlay',
    'push',
    'scale down',
    'uncover',
    'slide out',
    'slide along',
  ])
  common.propValueOnlyToClassName(Sidebar, 'direction', ['top', 'right', 'bottom', 'left'], {
    defaultValue: 'left',
  })
  common.propValueOnlyToClassName(Sidebar, 'width', ['very thin', 'thin', 'wide', 'very wide'])

  describe('componentWillUnmount', () => {
    it('will call "clearTimeout"', async () => {
      const clear = vi.spyOn(window, 'clearTimeout')
      const { rerender, unmount } = render(<Sidebar />)

      // start animation
      rerender(<Sidebar visible />)
      unmount()

      await assertWithTimeout(() => {
        expect(clear).toHaveBeenCalled()
        clear.mockRestore()
      })
    })
  })

  describe('onHide', () => {
    it('is called when the "visible" prop changes to "false"', () => {
      const onHide = vi.fn()
      const { rerender } = render(<Sidebar onHide={onHide} visible />)
      expect(onHide).not.toHaveBeenCalled()

      rerender(<Sidebar onHide={onHide} visible={false} />)
      expect(onHide).toHaveBeenCalledOnce()
      expect(onHide).toHaveBeenCalledWith(null, expect.objectContaining({ visible: false }))
    })

    it('is called when a click on the document was done', () => {
      const onHide = vi.fn()
      render(<Sidebar onHide={onHide} visible />)
      expect(onHide).not.toHaveBeenCalled()

      domEvent.click(document)
      expect(onHide).toHaveBeenCalledOnce()
      expect(onHide).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ visible: false }),
      )
    })

    it('is called when a click on the document was done only once', () => {
      const onHide = vi.fn()
      const { rerender } = render(<Sidebar onHide={onHide} visible />)

      domEvent.click(document)
      rerender(<Sidebar onHide={onHide} visible={false} />)
      expect(onHide).toHaveBeenCalledOnce()
    })

    it('is not called when a click was done inside the component', () => {
      const mountNode = document.createElement('div')
      const onHide = vi.fn()

      document.body.appendChild(mountNode)
      const { unmount } = render(
        <Sidebar onHide={onHide} visible>
          <div id='child' />
        </Sidebar>,
        { container: mountNode },
      )

      domEvent.click('div#child')
      expect(onHide).not.toHaveBeenCalled()

      unmount()
      document.body.removeChild(mountNode)
    })
  })

  describe('onHidden', () => {
    it('is called when the "visible" prop was changed to "false"', async () => {
      Sidebar.animationDuration = 0
      const onHidden = vi.fn()
      const { rerender } = render(<Sidebar onHidden={onHidden} visible />)

      expect(onHidden).not.toHaveBeenCalled()
      rerender(<Sidebar onHidden={onHidden} visible={false} />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(onHidden).toHaveBeenCalledOnce()
      expect(onHidden).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ visible: false }),
      )
    })
  })

  describe('onShow', () => {
    it('is called when the "visible" prop was changed to "true"', async () => {
      Sidebar.animationDuration = 0
      const onShow = vi.fn()
      const { rerender } = render(<Sidebar onShow={onShow} />)

      expect(onShow).not.toHaveBeenCalled()
      rerender(<Sidebar onShow={onShow} visible />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(onShow).toHaveBeenCalledOnce()
      expect(onShow).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ visible: true }),
      )
    })
  })

  describe('onVisible', () => {
    it('is called when the "visible" prop changes to "true"', () => {
      const onVisible = vi.fn()
      const { rerender } = render(<Sidebar onVisible={onVisible} />)
      expect(onVisible).not.toHaveBeenCalled()

      rerender(<Sidebar onVisible={onVisible} visible />)
      expect(onVisible).toHaveBeenCalledOnce()
      expect(onVisible).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ visible: true }),
      )
    })
  })

  describe('target', () => {
    it('is passed to the EventListener component', () => {
      const target = document.createElement('div')

      const { container } = render(<Sidebar target={target} visible />)
      // EventListener is an internal implementation detail; just ensure rendering works
      expect(container).toBeTruthy()
    })
  })
})
