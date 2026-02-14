import { render, fireEvent } from '@testing-library/react'

import TransitionablePortal from 'src/addons/TransitionablePortal/TransitionablePortal'
import * as common from 'test/specs/commonTests'
import { domEvent, assertWithTimeout } from 'test/utils'

const quickTransition = { duration: 0 }
const requiredProps = {
  children: <div id='children' />,
}

describe('TransitionablePortal', () => {

  common.isConformant(TransitionablePortal, {
    rendersChildren: false,
    rendersPortal: true,
    requiredProps,
    forwardsRef: false,
  })

  describe('children', () => {
    it('renders a Transition', () => {
      render(<TransitionablePortal {...requiredProps} open />)

      expect(document.body.querySelector('.transition')).toBeInTheDocument()
    })
  })

  describe('onClose', () => {
    it('is called with (null, data) on a click outside', async () => {
      const onClose = vi.fn()
      const { unmount } = render(
        <TransitionablePortal
          {...requiredProps}
          onClose={onClose}
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      fireEvent.click(document.querySelector('button'))
      domEvent.click(document.body)

      await assertWithTimeout(() => {
        expect(onClose).toHaveBeenCalledOnce()
        expect(onClose).toHaveBeenCalledWith(
          null,
          expect.objectContaining({ portalOpen: false }),
        )
      })

      unmount()
    })

    it('hides contents on a click outside', () => {
      const { container } = render(
        <TransitionablePortal {...requiredProps} trigger={<button />} />,
      )

      fireEvent.click(container.querySelector('button'))
      expect(document.body.querySelector('.in#children')).toBeInTheDocument()

      domEvent.click(document.body)
      expect(document.body.querySelector('.out#children')).toBeInTheDocument()
    })
  })

  describe('onHide', () => {
    it('is called with (null, data) when exiting transition finished', async () => {
      const onHide = vi.fn()
      const { rerender, unmount } = render(
        <TransitionablePortal
          {...requiredProps}
          onHide={onHide}
          open
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      rerender(
        <TransitionablePortal
          {...requiredProps}
          onHide={onHide}
          open={false}
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      await assertWithTimeout(() => {
        expect(onHide).toHaveBeenCalledOnce()
        expect(onHide).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            ...quickTransition,
            portalOpen: false,
            transitionVisible: false,
          }),
        )
      })

      unmount()
    })
  })

  describe('onOpen', () => {
    it('is called with (null, data) when opens', () => {
      const onOpen = vi.fn()
      const { container } = render(
        <TransitionablePortal {...requiredProps} onOpen={onOpen} trigger={<button />} />,
      )

      fireEvent.click(container.querySelector('button'))
      expect(onOpen).toHaveBeenCalledOnce()
      expect(onOpen).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ portalOpen: true }),
      )
    })

    it('renders contents', () => {
      const { container } = render(
        <TransitionablePortal {...requiredProps} trigger={<button />} />,
      )

      fireEvent.click(container.querySelector('button'))
      expect(document.body.querySelector('.in#children')).toBeInTheDocument()
    })
  })

  describe('open', () => {
    it('blocks update of state on a portal close', () => {
      render(<TransitionablePortal {...requiredProps} open />)
      expect(document.body.querySelector('#children')).toHaveClass('in')

      domEvent.click(document.body)
      expect(document.body.querySelector('#children')).toHaveClass('in')
    })

    it('passes `open` prop to Transition when defined', () => {
      const { rerender } = render(<TransitionablePortal {...requiredProps} />)

      rerender(<TransitionablePortal {...requiredProps} open />)
      expect(document.body.querySelector('#children')).toHaveClass('in')

      rerender(<TransitionablePortal {...requiredProps} open={false} />)
      expect(document.body.querySelector('#children')).toHaveClass('out')
    })

    it('does not pass `open` prop to Transition when not defined', () => {
      const { rerender } = render(<TransitionablePortal {...requiredProps} />)
      expect(document.body.querySelector('#children')).not.toBeInTheDocument()

      rerender(<TransitionablePortal {...requiredProps} transition={{}} />)
      expect(document.body.querySelector('#children')).not.toBeInTheDocument()
    })
  })
})
