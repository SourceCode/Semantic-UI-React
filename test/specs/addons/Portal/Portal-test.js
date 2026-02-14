import _ from 'lodash'
import React from 'react'
import { act } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import { domEvent } from 'test/utils'
import Portal from 'src/addons/Portal/Portal'
import PortalInner from 'src/addons/Portal/PortalInner'
import wait from 'test/utils/wait'

describe('Portal', () => {

  common.hasSubcomponents(Portal, [PortalInner])

  describe('open', () => {
    it('opens the portal when toggled from false to true', () => {
      const { rerender } = render(
        <Portal open={false}>
          <p />
        </Portal>,
      )
      expect(document.body.querySelector('[data-suir-portal]')).not.toBeInTheDocument()

      rerender(
        <Portal open>
          <p />
        </Portal>,
      )
      expect(document.body.querySelector('p')).toBeInTheDocument()
    })

    it('closes the portal when toggled from true to false', () => {
      const { rerender } = render(
        <Portal open>
          <p />
        </Portal>,
      )
      expect(document.body.querySelector('p')).toBeInTheDocument()

      rerender(
        <Portal open={false}>
          <p />
        </Portal>,
      )
      expect(document.body.querySelector('p')).not.toBeInTheDocument()
    })
  })

  describe('onMount', () => {
    it('called when portal opens', () => {
      const onMount = vi.fn()
      const { rerender } = render(
        <Portal open={false} onMount={onMount}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal open onMount={onMount}>
          <p />
        </Portal>,
      )
      expect(onMount).toHaveBeenCalledOnce()
    })

    it('is not called when portal receives props', () => {
      const onMount = vi.fn()
      const { rerender } = render(
        <Portal open={false} onMount={onMount}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal open onMount={onMount} className='old'>
          <p />
        </Portal>,
      )
      expect(onMount).toHaveBeenCalledOnce()

      rerender(
        <Portal open onMount={onMount} className='new'>
          <p />
        </Portal>,
      )
      expect(onMount).toHaveBeenCalledOnce()
    })
  })

  describe('onUnmount', () => {
    it('is called when portal closes', () => {
      const onUnmount = vi.fn()
      const { rerender } = render(
        <Portal open onUnmount={onUnmount}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal open={false} onUnmount={onUnmount}>
          <p />
        </Portal>,
      )
      expect(onUnmount).toHaveBeenCalledOnce()
    })

    it('is not called when portal receives props', () => {
      const onUnmount = vi.fn()
      const { rerender } = render(
        <Portal open onUnmount={onUnmount}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal open={false} onUnmount={onUnmount} className='old'>
          <p />
        </Portal>,
      )
      expect(onUnmount).toHaveBeenCalledOnce()

      rerender(
        <Portal open={false} onUnmount={onUnmount} className='new'>
          <p />
        </Portal>,
      )
      expect(onUnmount).toHaveBeenCalledOnce()
    })

    it('is called only once when portal closes and then is unmounted', () => {
      const onUnmount = vi.fn()
      const { rerender, unmount } = render(
        <Portal onUnmount={onUnmount} open>
          <p />
        </Portal>,
      )

      rerender(
        <Portal onUnmount={onUnmount} open={false}>
          <p />
        </Portal>,
      )
      act(() => {
        unmount()
      })
      expect(onUnmount).toHaveBeenCalledOnce()
    })

    it('is called only once when directly unmounting', () => {
      const onUnmount = vi.fn()
      const { unmount } = render(
        <Portal onUnmount={onUnmount} open>
          <p />
        </Portal>,
      )

      act(() => {
        unmount()
      })
      expect(onUnmount).toHaveBeenCalledOnce()
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const onOpen = vi.fn()
      const { container } = render(
        <Portal onOpen={onOpen} trigger={<div id='trigger' />}>
          <p />
        </Portal>,
      )

      fireEvent.click(container.querySelector('#trigger'))
      expect(onOpen).toHaveBeenCalledOnce()
      expect(onOpen).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ open: true }),
      )
    })
  })

  describe('onClose', () => {
    it('is called on body click', () => {
      const onClose = vi.fn()
      render(
        <Portal defaultOpen onClose={onClose} trigger={<div />}>
          <p />
        </Portal>,
      )

      domEvent.click(document.body)
      expect(onClose).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ open: false }),
      )
    })
  })

  describe('trigger', () => {
    it('renders null when not set', () => {
      const { container } = render(
        <Portal>
          <p />
        </Portal>,
      )

      expect(container.innerHTML).toBe('')
    })

    it('renders the trigger when set', () => {
      const text = 'open by click on me'
      const trigger = <button>{text}</button>
      const { container } = render(
        <Portal trigger={trigger}>
          <p />
        </Portal>,
      )

      expect(container.textContent).toBe(text)
    })

    _.forEach(['onBlur', 'onClick', 'onFocus', 'onMouseLeave', 'onMouseEnter'], (handlerName) => {
      it(`handles ${handlerName} on trigger and passes all arguments`, () => {
        const handler = vi.fn()

        // Create a trigger component that calls the handler with props
        // eslint-disable-next-line no-unused-vars
        const Trigger = React.forwardRef(({ color, handler: handlerProp, ...rest }, ref) => {
          const handleEvent = (e) => handlerProp(e, { handler: handlerProp, color })
          const buttonProps = { [handlerName]: handleEvent }

          return <button {...buttonProps} ref={ref} />
        })
        Trigger.displayName = 'Trigger'

        const trigger = <Trigger color='blue' handler={handler} />

        const { container } = render(
          <Portal trigger={trigger}>
            <p />
          </Portal>,
        )

        const button = container.querySelector('button')
        // Convert onMouseLeave -> mouseLeave (camelCase for fireEvent)
        const rawName = handlerName.substring(2) // MouseLeave
        const eventName = rawName.charAt(0).toLowerCase() + rawName.slice(1) // mouseLeave
        fireEvent[eventName](button)

        expect(handler).toHaveBeenCalledOnce()
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({}),
          expect.objectContaining({
            handler,
            color: 'blue',
          }),
        )
      })
    })
  })

  describe('triggerRef', () => {
    it('calls itself and an original ref', () => {
      const elementRef = React.createRef()
      const triggerRef = React.createRef()

      const { container } = render(
        <Portal trigger={<div id='trigger' ref={elementRef} />} triggerRef={triggerRef}>
          <p />
        </Portal>,
      )

      // Portal wraps trigger in a span with display:contents
      const triggerSpan = container.querySelector('span')
      expect(triggerSpan).toBeInTheDocument()

      expect(triggerRef.current).toBe(triggerSpan)
      // The original ref on the div goes to the div itself
      const triggerDiv = container.querySelector('#trigger')
      expect(elementRef.current).toBe(triggerDiv)
    })
  })

  describe('mountNode', () => {
    it('renders portal content into the mountNode', () => {
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      const { unmount } = render(
        <Portal mountNode={mountNode} open>
          <p id='inner' />
        </Portal>,
      )

      expect(mountNode.querySelector('#inner')).toBeInTheDocument()
      unmount()
      document.body.removeChild(mountNode)
    })
  })

  describe('openOnTriggerClick', () => {
    it('defaults to true', () => {
      const onTriggerClick = vi.fn()
      const trigger = <button onClick={onTriggerClick}>button</button>

      const { container } = render(
        <Portal trigger={trigger}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()

      fireEvent.click(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
      expect(onTriggerClick).toHaveBeenCalledOnce()
    })

    it('does not open the portal on trigger click when false', () => {
      const spy = vi.fn()
      const trigger = <button onClick={spy}>button</button>

      const { container } = render(
        <Portal trigger={trigger} openOnTriggerClick={false}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()

      fireEvent.click(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
      expect(spy).toHaveBeenCalledOnce()
    })

    it('opens the portal on trigger click when true', () => {
      const spy = vi.fn()
      const trigger = <button onClick={spy}>button</button>

      const { container } = render(
        <Portal trigger={trigger} openOnTriggerClick>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()

      fireEvent.click(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
      expect(spy).toHaveBeenCalledOnce()
    })
  })

  describe('closeOnTriggerClick', () => {
    it('does not close the portal on click', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.click(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })

    it('closes the portal on click when set', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerClick>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.click(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
    })
  })

  describe('openOnTriggerMouseEnter', () => {
    it('does not open the portal on mouseenter when not set', () => {
      const { container } = render(
        <Portal trigger={<button />}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()

      fireEvent.mouseEnter(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
    })

    it('opens the portal on mouseenter when set', async () => {
      const { container } = render(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={0}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()

      // mouseenter doesn't bubble, so fire on the wrapper span (which has the handler)
      const triggerSpan = container.querySelector('span')
      fireEvent.mouseEnter(triggerSpan)
      await waitFor(() => {
        expect(document.body.querySelector('#inner')).toBeInTheDocument()
      })
    })

    /**
     * e--l--d--v
     * ^: mouseenter
     *    ^: BEFORE_DELAY: mouseleave
     *       ^: expected DELAY
     *          ^: final validation
     */
    it('does not open the portal when leave before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      const { container } = render(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={DELAY}>
          <p id='inner' />
        </Portal>,
      )

      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
      fireEvent.mouseEnter(container.querySelector('button'))

      await wait(BEFORE_DELAY)

      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
      fireEvent.mouseLeave(container.querySelector('span'))

      await wait(DELAY)

      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
    })
  })

  describe('closeOnTriggerMouseLeave', () => {
    it('does not close the portal on mouseleave when not set', async () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.mouseLeave(container.querySelector('span'))
      await wait(1)
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })

    it('closes the portal on mouseleave when set', async () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={0}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.mouseLeave(container.querySelector('span'))
      await waitFor(() => {
        expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
      })
    })

    /**
     * e--l--e--d--v
     * ^: mouseenter
     *    ^: mouseleave
     *       ^: BEFORE_DELAY: reenter
     *          ^: expected DELAY
     *             ^: final validation
     */
    it('does not close the portal when reenter before delay', async () => {
      const DELAY = 20

      const { container } = render(
        <Portal
          trigger={<button />}
          openOnTriggerMouseEnter
          closeOnTriggerMouseLeave
          mouseLeaveDelay={DELAY}
        >
          <p id='inner' />
        </Portal>,
      )

      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
      fireEvent.mouseEnter(container.querySelector('span'))

      await waitFor(() => {
        expect(document.body.querySelector('#inner')).toBeInTheDocument()
      })
      fireEvent.mouseLeave(container.querySelector('span'))

      // Re-enter before the delay expires
      await wait(DELAY / 2)

      expect(document.body.querySelector('#inner')).toBeInTheDocument()
      fireEvent.mouseEnter(container.querySelector('span'))

      await wait(DELAY)

      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })
  })

  describe('closeOnPortalMouseLeave', () => {
    it('does not close the portal on mouseleave of portal when not set', async () => {
      render(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      domEvent.mouseLeave('#inner')
      await wait(1)
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })

    it('closes the portal on mouseleave of portal when set', async () => {
      render(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      // Fire mouseleave on the portal wrapper (which has the event listener)
      domEvent.mouseLeave('[data-suir-portal]')
      await waitFor(() => {
        expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
      })
    })

    it("does not close the portal on mouseleave triggered by the portal's children", async () => {
      render(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <div>
            <p id='child' />
          </div>
        </Portal>,
      )
      expect(document.body.querySelector('#child')).toBeInTheDocument()

      domEvent.mouseLeave('#child')
      await wait(1)
      expect(document.body.querySelector('#child')).toBeInTheDocument()
    })
  })

  describe('closeOnTriggerMouseLeave + closeOnPortalMouseLeave', () => {
    it('closes the portal on trigger mouseleave even when portal receives mouseenter within limit', async () => {
      const delay = 10
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={delay}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.mouseLeave(container.querySelector('span'))

      // Fire a mouseEnter on the portal within the time limit
      await wait(delay - 1)
      domEvent.mouseEnter('[data-suir-portal]')

      // The portal should close because closeOnPortalMouseLeave not set
      await waitFor(() => {
        expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
      })
    })

    it('does not close the portal on trigger mouseleave when portal receives mouseenter within limit', async () => {
      const delay = 10
      const { container } = render(
        <Portal
          trigger={<button />}
          defaultOpen
          closeOnTriggerMouseLeave
          closeOnPortalMouseLeave
          mouseLeaveDelay={delay}
        >
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.mouseLeave(container.querySelector('span'))

      // Fire a mouseEnter on the portal wrapper (which has the event listener)
      await wait(delay - 1)
      domEvent.mouseEnter('[data-suir-portal]')

      // The portal should not have closed
      await wait(delay + 5)
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })
  })

  describe('openOnTriggerFocus', () => {
    it('does not open the portal on focus when not set', () => {
      const { container } = render(
        <Portal trigger={<button />}>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()

      fireEvent.focus(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
    })

    it('opens the portal on focus when set', () => {
      const { container } = render(
        <Portal trigger={<button />} openOnTriggerFocus>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()

      fireEvent.focus(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })
  })

  describe('closeOnTriggerBlur', () => {
    it('does not close the portal on blur when not set', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.blur(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })

    it('closes the portal on blur when set', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerBlur>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      fireEvent.blur(container.querySelector('button'))
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
    })
  })

  describe('closeOnEscape', () => {
    it('closes the portal on escape', () => {
      render(
        <Portal closeOnEscape defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      domEvent.keyDown(document, { key: 'Escape' })
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
    })

    it('does not close the portal on escape when false', () => {
      render(
        <Portal closeOnEscape={false} defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      domEvent.keyDown(document, { key: 'Escape' })
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })
  })

  describe('closeOnDocumentClick', () => {
    it('closes the portal on document click', () => {
      render(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      domEvent.click(document)
      expect(document.body.querySelector('#inner')).not.toBeInTheDocument()
    })

    it('does not close on click inside', () => {
      render(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      domEvent.click('#inner')
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })

    it('does not close on mousedown inside and mouseup outside', () => {
      render(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(document.body.querySelector('#inner')).toBeInTheDocument()

      domEvent.mouseDown('#inner')
      domEvent.click(document)
      expect(document.body.querySelector('#inner')).toBeInTheDocument()
    })
  })

  // Heads Up!
  // Portals used to take focus on mount and restore focus to the original activeElement on unMount.
  // One by one, these auto set/remove focus features were removed and the assertions negated.
  // Leave these tests here to ensure we aren't ever stealing focus.
  describe('focus', () => {
    it('does not take focus onMount', async () => {
      render(
        <Portal defaultOpen>
          <p id='inner' />
        </Portal>,
      )

      await wait(0)
      expect(document.activeElement).not.toBe(document.getElementById('inner'))
    })

    it('does not take focus on unMount', async () => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      expect(document.activeElement).toBe(input)

      const { rerender, unmount } = render(
        <Portal open>
          <p />
        </Portal>,
      )
      expect(document.activeElement).toBe(input)

      await wait(0)
      expect(document.activeElement).toBe(input)

      rerender(
        <Portal open={false}>
          <p />
        </Portal>,
      )
      unmount()

      expect(document.activeElement).toBe(input)

      document.body.removeChild(input)
    })

    it('does not take focus on re-render', async () => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      expect(document.activeElement).toBe(input)

      const { rerender } = render(
        <Portal defaultOpen>
          <p />
        </Portal>,
      )
      expect(document.activeElement).toBe(input)

      await wait(0)
      expect(document.activeElement).toBe(input)

      rerender(
        <Portal defaultOpen>
          <p />
        </Portal>,
      )
      expect(document.activeElement).toBe(input)

      document.body.removeChild(input)
    })
  })
})
