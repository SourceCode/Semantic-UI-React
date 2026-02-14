import React from 'react'
import { render } from '@testing-library/react'

import PortalInner from 'src/addons/Portal/PortalInner'
import { isBrowser } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('PortalInner', () => {
  common.isConformant(PortalInner, {
    rendersChildren: false,
    requiredProps: { children: <p /> },
    forwardsRef: false,
  })

  describe('children', () => {
    beforeEach(() => {
      isBrowser.override = false
    })

    afterEach(() => {
      isBrowser.override = null
    })

    it('renders `null` when during Server-Side Rendering', () => {
      const { container } = render(
        <PortalInner>
          <p />
        </PortalInner>,
      )

      // PortalInner renders into document.body via createPortal, but when isBrowser is false
      // it returns null, so nothing should be rendered via the portal
      expect(container.innerHTML).toBe('')
    })
  })

  describe('ref', () => {
    it('returns ref to a DOM element', () => {
      const portalRef = React.createRef()
      const elementRef = React.createRef()

      render(
        <PortalInner ref={portalRef}>
          <p ref={elementRef} />
        </PortalInner>,
      )

      expect(elementRef.current).toBeInstanceOf(HTMLElement)
      expect(elementRef.current.tagName).toBe('P')

      // usePortalElement wraps children in a <div data-suir-portal="true">,
      // so portalRef points to the wrapper div, not the inner element
      expect(portalRef.current).toBeInstanceOf(HTMLElement)
      expect(portalRef.current.tagName).toBe('DIV')
      expect(portalRef.current.dataset.suirPortal).toBe('true')
      expect(portalRef.current).toContainElement(elementRef.current)
    })

    it('returns ref for elements that use ref forwarding', () => {
      const CustomComponent = React.forwardRef((props, ref) => {
        return <p {...props} ref={ref} />
      })
      CustomComponent.displayName = 'CustomComponent'

      const portalRef = React.createRef()
      const elementRef = React.createRef()

      render(
        <PortalInner ref={portalRef}>
          <CustomComponent ref={elementRef} />
        </PortalInner>,
      )

      expect(elementRef.current).toBeInstanceOf(HTMLElement)
      expect(elementRef.current.tagName).toBe('P')

      // usePortalElement wraps children in a <div data-suir-portal="true">,
      // so portalRef points to the wrapper div, not the inner element
      expect(portalRef.current).toBeInstanceOf(HTMLElement)
      expect(portalRef.current.tagName).toBe('DIV')
      expect(portalRef.current.dataset.suirPortal).toBe('true')
      expect(portalRef.current).toContainElement(elementRef.current)
    })

    it('returns ref to a created element in other cases', () => {
      function CustomComponent(props) {
        return <p {...props} />
      }

      const portalRef = React.createRef()
      render(
        <PortalInner ref={portalRef}>
          <CustomComponent />
        </PortalInner>,
      )

      expect(portalRef.current).toBeInstanceOf(HTMLElement)
      expect(portalRef.current.tagName).toBe('DIV')
      expect(portalRef.current.dataset.suirPortal).toBe('true')
    })
  })

  describe('onMount', () => {
    it('called when mounting', () => {
      const onMount = vi.fn()
      render(
        <PortalInner onMount={onMount}>
          <p />
        </PortalInner>,
      )

      expect(onMount).toHaveBeenCalledOnce()
    })
  })

  describe('onUnmount', () => {
    it('is called only once when unmounting', () => {
      const onUnmount = vi.fn()
      const { unmount } = render(
        <PortalInner onUnmount={onUnmount}>
          <p />
        </PortalInner>,
      )

      unmount()
      expect(onUnmount).toHaveBeenCalledOnce()
    })
  })
})
