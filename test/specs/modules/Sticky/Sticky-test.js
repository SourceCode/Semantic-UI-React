import React from 'react'
import { render } from '@testing-library/react'

import Sticky from 'src/modules/Sticky/Sticky'
import * as common from 'test/specs/commonTests'
import { domEvent } from 'test/utils'

let contextEl
let wrapper
let positions

const mockContextEl = (values = {}) => (contextEl = { getBoundingClientRect: () => values })

const mockTriggerEl = (wrapperContainer, values = {}) => {
  const wrapperEl = wrapperContainer.firstChild
  const triggerEl = wrapperEl.childNodes[0]

  vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue(values)
}

const mockStickyEl = (wrapperContainer, values = {}) => {
  const wrapperEl = wrapperContainer.firstChild
  const stickyEl = wrapperEl.childNodes[1]

  vi.spyOn(stickyEl, 'getBoundingClientRect').mockReturnValue(values)
}

const mockPositions = ({ bottomOffset = 5, offset = 5, height = 5 } = {}) =>
  (positions = {
    bottomOffset,
    height,
    offset,
  })

// Scroll to the top of the screen
const scrollToTop = (container, rerender, StickyComponent) => {
  const { bottomOffset, height, offset } = positions

  rerender(
    React.cloneElement(StickyComponent, {
      context: { getBoundingClientRect: () => ({ bottom: height + offset + bottomOffset }) },
    }),
  )

  mockTriggerEl(container, { top: offset })
  mockStickyEl(container, { height, top: offset })

  domEvent.scroll(window)
}

// Scroll until the trigger is not visible
const scrollAfterTrigger = (container, rerender, StickyComponent) => {
  const { bottomOffset, height, offset } = positions

  rerender(
    React.cloneElement(StickyComponent, {
      context: { getBoundingClientRect: () => ({ bottom: window.innerHeight - bottomOffset + 1 }) },
    }),
  )

  mockTriggerEl(container, { top: offset - 1 })
  mockStickyEl(container, { height })

  domEvent.scroll(window)
}

// Scroll until the context bottom is not visible
const scrollAfterContext = (container, rerender, StickyComponent) => {
  const { height, offset } = positions

  rerender(
    React.cloneElement(StickyComponent, {
      context: { getBoundingClientRect: () => ({ bottom: -1 }) },
    }),
  )

  mockTriggerEl(container, { top: offset - 1 })
  mockStickyEl(container, { height })

  domEvent.scroll(window)
}

// Scroll to the last part of the context
const scrollToContextBottom = (container, rerender, StickyComponent) => {
  const { height, offset } = positions

  rerender(
    React.cloneElement(StickyComponent, {
      context: { getBoundingClientRect: () => ({ bottom: height + 1 }) },
    }),
  )

  mockTriggerEl(container, { top: offset - 1 })
  mockStickyEl(container, { height })

  domEvent.scroll(window)
}

describe('Sticky', () => {
  common.isConformant(Sticky)
  common.rendersChildren(Sticky, {
    rendersContent: false,
  })

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb())
    wrapper = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (wrapper && wrapper.unmount) {
      try {
        wrapper.unmount()
        // eslint-disable-next-line no-empty
      } catch {}
    }
  })

  describe('children', () => {
    it('should create two divs', () => {
      const { container } = render(<Sticky />)
      const children = container.firstChild.childNodes

      expect(children).toHaveLength(2)
      children.forEach((child) => {
        expect(child.tagName).toBe('DIV')
      })
    })
  })

  describe('active', () => {
    it('should handle update on mount when active', () => {
      const onTop = vi.fn()
      render(<Sticky context={mockContextEl()} onTop={onTop} />)

      expect(onTop).toHaveBeenCalledOnce()
    })

    it('should not handle update on mount when not active', () => {
      const onTop = vi.fn()
      render(<Sticky active={false} context={mockContextEl()} onTop={onTop} />)

      expect(onTop).not.toHaveBeenCalled()
    })

    it('fires event when changes to true', () => {
      const onTop = vi.fn()

      const { rerender } = render(<Sticky active={false} context={mockContextEl()} onTop={onTop} />)
      expect(onTop).not.toHaveBeenCalled()

      rerender(<Sticky active context={mockContextEl()} onTop={onTop} />)
      expect(onTop).toHaveBeenCalledOnce()
    })

    it('omits event and removes styles when changes to false', () => {
      const onStick = vi.fn()
      const onUnStick = vi.fn()

      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })

      const element = (
        <Sticky {...positions} context={contextEl} onStick={onStick} onUnstick={onUnStick} />
      )
      const { container, rerender } = render(element)

      const stickyEl = container.firstChild.childNodes[1]
      expect(stickyEl).toHaveClass('ui', 'sticky', 'fixed', 'top')

      expect(onStick).toHaveBeenCalledOnce()
      expect(onStick).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(positions))

      rerender(<Sticky {...positions} context={contextEl} onStick={onStick} onUnstick={onUnStick} active={false} />)

      const updatedStickyEl = container.firstChild.childNodes[1]
      expect(updatedStickyEl).not.toHaveClass('fixed')
      expect(onUnStick).not.toHaveBeenCalled()
    })
  })

  describe('context', () => {
    it('should handle React refs', () => {
      const contextRef = { current: mockContextEl() }
      const onTop = vi.fn()
      render(<Sticky context={contextRef} onTop={onTop} />)

      expect(onTop).toHaveBeenCalledOnce()
    })
  })

  describe('behaviour', () => {
    it('should stick to top of screen', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 12, height: 200, offset: 12 })

      const element = <Sticky {...positions} context={contextEl} />
      const { container, rerender } = render(element)

      // Scroll after trigger
      scrollAfterTrigger(container, (newEl) => rerender(newEl), element)

      const stickyEl = container.firstChild.childNodes[1]
      expect(stickyEl).toHaveClass('ui', 'sticky', 'fixed', 'top')
      expect(stickyEl.style.top).toBe('12px')
    })

    it('should stick to bottom of context', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 100, offset: 20 })
      const element = <Sticky {...positions} context={contextEl} />
      const { container, rerender } = render(element)

      scrollAfterContext(container, (newEl) => rerender(newEl), element)

      const stickyEl = container.firstChild.childNodes[1]
      expect(stickyEl).toHaveClass('ui', 'sticky', 'bound', 'bottom')
      expect(stickyEl.style.bottom).toBe('0px')
    })

    it('should preserve sticky element height', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 0, height: 100, offset: 0 })
      const element = <Sticky {...positions} context={contextEl} />
      const { container, rerender } = render(element)

      // Scroll after trigger
      scrollAfterTrigger(container, (newEl) => rerender(newEl), element)

      const triggerEl = container.firstChild.childNodes[0]
      expect(triggerEl.style.height).toBe('100px')
    })
  })

  describe('onBottom', () => {
    it('is called with (e, data) when is on bottom', () => {
      const onBottom = vi.fn()
      mockContextEl()
      mockPositions()
      const element = <Sticky {...positions} context={contextEl} onBottom={onBottom} />
      const { container, rerender } = render(element)

      scrollAfterContext(container, (newEl) => rerender(newEl), element)
      expect(onBottom).toHaveBeenCalledOnce()
      expect(onBottom).toHaveBeenCalledWith(expect.objectContaining({}), expect.objectContaining(positions))
      onBottom.mockClear()

      scrollToTop(container, (newEl) => rerender(newEl), element)
      expect(onBottom).not.toHaveBeenCalled()
    })
  })

  describe('onStick', () => {
    it('is called with (e, data) when stick', () => {
      const onStick = vi.fn()
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })
      const element = <Sticky {...positions} context={contextEl} onStick={onStick} />
      const { container, rerender } = render(element)

      scrollAfterTrigger(container, (newEl) => rerender(newEl), element)
      expect(onStick).toHaveBeenCalledTimes(2)
      expect(onStick).toHaveBeenCalledWith(expect.objectContaining({}), expect.objectContaining(positions))
      onStick.mockClear()

      scrollToTop(container, (newEl) => rerender(newEl), element)
      expect(onStick).not.toHaveBeenCalled()
    })
  })

  describe('onTop', () => {
    it('is called with (e, data) when is on top', () => {
      const onTop = vi.fn()
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })
      const element = <Sticky {...positions} context={contextEl} onTop={onTop} />
      const { container, rerender } = render(element)

      scrollAfterContext(container, (newEl) => rerender(newEl), element)
      expect(onTop).not.toHaveBeenCalled()

      scrollToTop(container, (newEl) => rerender(newEl), element)
      expect(onTop).toHaveBeenCalledOnce()
      expect(onTop).toHaveBeenCalledWith(expect.objectContaining({}), expect.objectContaining(positions))
    })
  })

  describe('onUnstick', () => {
    it('is called with (e, data) when unstick', () => {
      const onUnstick = vi.fn()
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })
      const element = <Sticky {...positions} context={contextEl} onUnstick={onUnstick} />
      const { container, rerender } = render(element)

      scrollAfterTrigger(container, (newEl) => rerender(newEl), element)
      expect(onUnstick).not.toHaveBeenCalled()

      scrollToTop(container, (newEl) => rerender(newEl), element)
      expect(onUnstick).toHaveBeenCalledOnce()
      expect(onUnstick).toHaveBeenCalledWith(expect.objectContaining({}), expect.objectContaining(positions))
    })
  })

  describe('pushing', () => {
    it('should push component back', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 30, height: 100, offset: 10 })
      const element = <Sticky {...positions} context={contextEl} pushing />
      const { container, rerender } = render(element)

      scrollAfterTrigger(container, (newEl) => rerender(newEl), element)

      // Scroll back: component should still stick to context bottom
      scrollToContextBottom(container, (newEl) => rerender(newEl), element)

      const element2 = <Sticky {...positions} context={mockContextEl({ bottom: 0 })} pushing />
      rerender(element2)
      domEvent.scroll(window)

      const stickyEl = container.firstChild.childNodes[1]
      expect(stickyEl).toHaveClass('ui', 'sticky', 'bound', 'bottom')
      expect(stickyEl.style.bottom).toBe('0px')
    })

    it('should stop pushing when reaching top', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 100, offset: 10 })

      const element = <Sticky {...positions} context={contextEl} pushing />
      const { container, rerender } = render(element)

      scrollAfterTrigger(container, (newEl) => rerender(newEl), element)
      scrollToContextBottom(container, (newEl) => rerender(newEl), element)
      scrollToTop(container, (newEl) => rerender(newEl), element)
      scrollAfterTrigger(container, (newEl) => rerender(newEl), element)

      // Component should stick again to the top
      const stickyEl = container.firstChild.childNodes[1]
      expect(stickyEl).toHaveClass('ui', 'sticky', 'fixed', 'top')
      expect(stickyEl.style.top).toBe('10px')
    })
  })

  describe('scrollContext', () => {
    it('should use window as default', () => {
      const onStick = vi.fn()

      const { container } = render(<Sticky onStick={onStick} />)
      mockTriggerEl(container, { top: -1 })

      domEvent.scroll(window)
      expect(onStick).toHaveBeenCalled()
    })

    it('should set a scroll context', () => {
      const div = document.createElement('div')
      const onStick = vi.fn()

      const { container } = render(<Sticky scrollContext={div} onStick={onStick} />)
      mockTriggerEl(container, { top: -1 })

      domEvent.scroll(window)
      expect(onStick).not.toHaveBeenCalled()

      domEvent.scroll(div)
      expect(onStick).toHaveBeenCalled()
    })

    it('should set a scroll context via React refs', () => {
      const scrollContextRef = { current: document.createElement('div') }
      const onStick = vi.fn()

      const { container } = render(<Sticky scrollContext={scrollContextRef} onStick={onStick} />)
      mockTriggerEl(container, { top: -1 })

      domEvent.scroll(window)
      expect(onStick).not.toHaveBeenCalled()

      domEvent.scroll(scrollContextRef.current)
      expect(onStick).toHaveBeenCalled()
    })

    it('should not call onStick when context is null', () => {
      const onStick = vi.fn()

      const { container } = render(<Sticky scrollContext={null} onStick={onStick} />)
      mockTriggerEl(container, { top: -1 })

      domEvent.scroll(document)
      expect(onStick).not.toHaveBeenCalled()
    })

    it('should call onStick when scrollContext changes', () => {
      const div = document.createElement('div')
      const onStick = vi.fn()
      const { container, rerender } = render(<Sticky scrollContext={null} onStick={onStick} />)

      rerender(<Sticky scrollContext={div} onStick={onStick} />)
      mockTriggerEl(container, { top: -1 })

      domEvent.scroll(div)
      expect(onStick).toHaveBeenCalled()
    })
  })

  describe('styleElement', () => {
    it('is passed to matching element', () => {
      const { container } = render(<Sticky styleElement={{ zIndex: 10 }} />)
      const stickyEl = container.firstChild.childNodes[1]

      expect(stickyEl.style.zIndex).toBe('10')
    })
  })
})
