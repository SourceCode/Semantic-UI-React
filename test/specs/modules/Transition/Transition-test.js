import { act } from 'react'
import { render } from '@testing-library/react'

import { SUI } from 'src/lib'
import Transition from 'src/modules/Transition/Transition'
import TransitionGroup from 'src/modules/Transition/TransitionGroup'
import {
  TRANSITION_STATUS_ENTERED,
  TRANSITION_STATUS_ENTERING,
  TRANSITION_STATUS_EXITED,
  TRANSITION_STATUS_EXITING,
} from 'src/modules/Transition/utils/computeStatuses'
import * as common from 'test/specs/commonTests'

let wrapper

const wrapperMount = (element) => {
  const result = render(element)
  wrapper = result
  return result
}

describe('Transition', () => {
  common.hasSubcomponents(Transition, [TransitionGroup])

  beforeEach(() => {
    wrapper = undefined
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      try {
        wrapper.unmount()
        // eslint-disable-next-line no-empty
      } catch {}
    }
  })

  describe('animation', () => {
    SUI.DIRECTIONAL_TRANSITIONS.forEach((animation) => {
      it(`directional ${animation}`, () => {
        const { container, rerender } = wrapperMount(
          <Transition animation={animation} transitionOnMount>
            <p />
          </Transition>,
        )

        const p = container.querySelector('p')
        expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
        animation.split(' ').forEach((className) => expect(p).toHaveClass(className))
        expect(p).toHaveClass('in')

        rerender(
          <Transition animation={animation} transitionOnMount visible={false}>
            <p />
          </Transition>,
        )
        const pAfter = container.querySelector('p')
        expect(pAfter).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
        animation.split(' ').forEach((className) => expect(pAfter).toHaveClass(className))
        expect(pAfter).toHaveClass('out')
      })
    })

    SUI.STATIC_TRANSITIONS.forEach((animation) => {
      it(`static ${animation}`, () => {
        const { container, rerender } = wrapperMount(
          <Transition animation={animation} transitionOnMount>
            <p />
          </Transition>,
        )

        const p = container.querySelector('p')
        expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
        expect(p).toHaveClass(animation)
        expect(p).not.toHaveClass('in')

        rerender(
          <Transition animation={animation} transitionOnMount visible={false}>
            <p />
          </Transition>,
        )
        const pAfter = container.querySelector('p')
        expect(pAfter).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
        expect(pAfter).toHaveClass(animation)
        expect(pAfter).not.toHaveClass('out')
      })
    })

    it('supports custom animations', () => {
      const { container, rerender } = wrapperMount(
        <Transition animation='jump' transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p).toHaveClass('jump')

      rerender(
        <Transition animation='jump' transitionOnMount visible={false}>
          <p />
        </Transition>,
      )
      const pAfter = container.querySelector('p')
      expect(pAfter).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(pAfter).toHaveClass('jump')
    })
  })

  describe('className', () => {
    it("passes element's className", () => {
      const { container } = wrapperMount(
        <Transition>
          <p className='foo bar' />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveClass('foo')
      expect(p).toHaveClass('bar')
    })

    it('adds classes when ENTERED', () => {
      const { container } = wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveClass('visible')
      expect(p).toHaveClass('transition')
    })

    it('adds classes when ENTERING', () => {
      const { container } = wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveClass('animating')
      expect(p).toHaveClass('visible')
      expect(p).toHaveClass('transition')
    })

    it('adds classes when EXITED', () => {
      const { container } = wrapperMount(
        <Transition visible={false} mountOnShow={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveClass('hidden')
      expect(p).toHaveClass('transition')
    })

    it('adds classes when EXITING', () => {
      const { container, rerender } = wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )
      rerender(
        <Transition transitionOnMount={false} visible={false}>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveClass('animating')
      expect(p).toHaveClass('visible')
      expect(p).toHaveClass('transition')
    })
  })

  describe('directional', () => {
    it('adds classes when is "true"', () => {
      const { container, rerender } = wrapperMount(
        <Transition directional transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p).toHaveClass('in')

      rerender(
        <Transition directional transitionOnMount visible={false}>
          <p />
        </Transition>,
      )
      const pAfter = container.querySelector('p')
      expect(pAfter).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(pAfter).toHaveClass('out')
    })

    it('do not add classes when is "false"', () => {
      const { container, rerender } = wrapperMount(
        <Transition directional={false} transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p).not.toHaveClass('in')

      rerender(
        <Transition directional={false} transitionOnMount visible={false}>
          <p />
        </Transition>,
      )
      const pAfter = container.querySelector('p')
      expect(pAfter).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(pAfter).not.toHaveClass('out')
    })
  })

  describe('children', () => {
    it('clones element', () => {
      const { container } = wrapperMount(
        <Transition>
          <p className='foo' />
        </Transition>,
      )
      expect(container.querySelector('p.foo')).toBeInTheDocument()
    })

    it('renders in EXITED state when mountOnShow and unmountOnHide are false and visible is false', () => {
      const { container } = wrapperMount(
        <Transition mountOnShow={false} unmountOnHide={false} visible={false}>
          <p className='foo bar' />
        </Transition>,
      )
      const p = container.querySelector('p')
      expect(p).toBeInTheDocument()
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITED)
    })
  })

  describe('constructor', () => {
    it('has default statuses', () => {
      const { container } = wrapperMount(
        <Transition>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERED)
      expect(p).not.toHaveAttribute('data-test-next-status')
    })

    it('sets statuses when `visible` is false', () => {
      const { container } = wrapperMount(
        <Transition visible={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).not.toBeInTheDocument()
    })

    it('sets statuses when mount is disabled', () => {
      const { container } = wrapperMount(
        <Transition visible={false} mountOnShow={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITED)
      expect(p).not.toHaveAttribute('data-test-next-status')
    })
  })

  describe('duration', () => {
    it('does not apply to style when ENTERED', () => {
      const { container } = wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').style.animationDuration).toBe('')
    })

    it('applies default value to style when ENTERING', () => {
      const { container } = wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p.style.animationDuration).toBe('500ms')
    })

    it('applies numeric value to style when ENTERING', () => {
      const { container } = wrapperMount(
        <Transition duration={1000} transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p.style.animationDuration).toBe('1000ms')
    })

    it('applies object value to style when ENTERING', () => {
      const { container } = wrapperMount(
        <Transition duration={{ hide: 1000, show: 2000 }} transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p.style.animationDuration).toBe('2000ms')
    })

    it('does not apply to style when EXITED', () => {
      const { container } = wrapperMount(
        <Transition visible={false} mountOnShow={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITED)
      expect(p.style.animationDuration).toBe('')
    })

    it('applies default value to style when EXITING', () => {
      const { container, rerender } = wrapperMount(
        <Transition>
          <p />
        </Transition>,
      )

      rerender(
        <Transition visible={false}>
          <p />
        </Transition>,
      )
      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(p.style.animationDuration).toBeTruthy()
    })

    it('applies numeric value to style when EXITING', () => {
      const { container } = wrapperMount(
        <Transition duration={1000} transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p.style.animationDuration).toBe('1000ms')
    })

    it('applies object value to style when EXITING', () => {
      const { container, rerender } = wrapperMount(
        <Transition duration={{ hide: 1000, show: 2000 }}>
          <p />
        </Transition>,
      )

      rerender(
        <Transition duration={{ hide: 1000, show: 2000 }} visible={false}>
          <p />
        </Transition>,
      )
      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(p.style.animationDuration).toBe('1000ms')
    })
  })

  describe('visible', () => {
    it('updates status when set to false while ENTERING', () => {
      const { container, rerender } = wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)

      rerender(
        <Transition transitionOnMount visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)
    })

    it('updates status when set to false while ENTERED', () => {
      const { container, rerender } = wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERED)

      rerender(
        <Transition transitionOnMount={false} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)
    })

    it('updates status when set to true while UNMOUNTED', () => {
      const { container, rerender } = wrapperMount(
        <Transition visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).not.toBeInTheDocument()

      rerender(
        <Transition visible>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)
    })

    it('updates next status when set to true while performs an ENTERING transition', () => {
      const { container, rerender } = wrapperMount(
        <Transition duration={10} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)

      rerender(
        <Transition duration={10} transitionOnMount visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)
    })

    it('updates next status when set to true while performs an EXITING transition', () => {
      const { container, rerender } = wrapperMount(
        <Transition duration={10} visible>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERED)

      rerender(
        <Transition duration={10} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)

      rerender(
        <Transition duration={10} visible>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)
    })
  })

  describe('onComplete', () => {
    it('is called with (null, props) when transition completed', async () => {
      const onComplete = vi.fn()

      await new Promise((resolve) => {
        const handleComplete = (...args) => {
          onComplete(...args)
          resolve()
        }

        wrapperMount(
          <Transition duration={0} onComplete={handleComplete} transitionOnMount>
            <p />
          </Transition>,
        )
      })

      expect(onComplete).toHaveBeenCalledOnce()
      expect(onComplete).toHaveBeenCalledWith(null, expect.objectContaining({
        duration: 0,
        status: TRANSITION_STATUS_ENTERED,
      }))
    })

    it('is called after a render with visibility changes', async () => {
      // This test ensures that a setTimeout will not be cleared on a simple rerender
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/4059

      const onComplete = vi.fn()

      const { rerender } = wrapperMount(
        <Transition duration={200} onComplete={onComplete} transitionOnMount>
          <p />
        </Transition>,
      )

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      rerender(
        <Transition duration={200} onComplete={onComplete} transitionOnMount>
          <p />
        </Transition>,
      )

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
      })
      expect(onComplete).toHaveBeenCalledOnce()
    })
  })

  describe('onHide', () => {
    it('is called with (null, props) when hidden', async () => {
      const onHide = vi.fn()

      await new Promise((resolve) => {
        const handleHide = (...args) => {
          onHide(...args)
          resolve()
        }

        const { rerender } = wrapperMount(
          <Transition duration={0} onHide={handleHide} transitionOnMount={false}>
            <p />
          </Transition>,
        )
        rerender(
          <Transition duration={0} onHide={handleHide} transitionOnMount={false} visible={false}>
            <p />
          </Transition>,
        )
      })

      expect(onHide).toHaveBeenCalledOnce()
      expect(onHide).toHaveBeenCalledWith(null, expect.objectContaining({
        duration: 0,
        status: TRANSITION_STATUS_EXITED,
      }))
    })

    it('depends on the specified duration', async () => {
      const onHide = vi.fn()
      const { container, rerender } = wrapperMount(
        <Transition duration={{ hide: 200 }} onHide={onHide} transitionOnMount={false}>
          <p />
        </Transition>,
      )

      rerender(
        <Transition duration={{ hide: 200 }} onHide={onHide} transitionOnMount={false} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
      })
      expect(onHide).toHaveBeenCalledOnce()
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITED)
    })

    it('will be called once even during rerender', () => {
      const onStart = vi.fn()

      const { container, rerender } = wrapperMount(
        <Transition duration={200} onStart={onStart}>
          <p />
        </Transition>,
      )

      rerender(
        <Transition duration={200} onStart={onStart} visible={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)

      rerender(
        <Transition duration={200} onStart={onStart} visible={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)

      expect(onStart).toHaveBeenCalledOnce()
    })
  })

  describe('onShow', () => {
    it('is called with (null, props) when shown', async () => {
      const onShow = vi.fn()

      await new Promise((resolve) => {
        const handleShow = (...args) => {
          onShow(...args)
          resolve()
        }

        wrapperMount(
          <Transition duration={0} onShow={handleShow} transitionOnMount>
            <p />
          </Transition>,
        )
      })

      expect(onShow).toHaveBeenCalledOnce()
      expect(onShow).toHaveBeenCalledWith(null, expect.objectContaining({
        duration: 0,
        status: TRANSITION_STATUS_ENTERED,
      }))
    })

    it('depends on the specified duration', async () => {
      const onShow = vi.fn()
      const { container } = wrapperMount(
        <Transition duration={{ show: 200 }} onShow={onShow} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
      })
      expect(onShow).toHaveBeenCalledOnce()
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERED)
    })
  })

  describe('onStart', () => {
    it('is called with (null, props) when transition started', async () => {
      const onStart = vi.fn()

      await new Promise((resolve) => {
        const handleStart = (...args) => {
          onStart(...args)
          resolve()
        }

        wrapperMount(
          <Transition duration={0} onStart={handleStart} transitionOnMount>
            <p />
          </Transition>,
        )
      })

      expect(onStart).toHaveBeenCalledOnce()
      expect(onStart).toHaveBeenCalledWith(null, expect.objectContaining({
        duration: 0,
        status: TRANSITION_STATUS_ENTERING,
      }))
    })

    it('will be called once even during rerender', () => {
      const onStart = vi.fn()

      const { container, rerender } = wrapperMount(
        <Transition duration={200} onStart={onStart} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)

      rerender(
        <Transition duration={200} onStart={onStart} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p')).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)

      expect(onStart).toHaveBeenCalledOnce()
    })
  })

  describe('style', () => {
    it("passes element's style", () => {
      const { container } = wrapperMount(
        <Transition>
          <p style={{ bottom: 5, top: 10 }} />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p.style.bottom).toBe('5px')
      expect(p.style.top).toBe('10px')
    })
  })

  describe('transitionOnMount', () => {
    it('sets statuses when is true', () => {
      const { container } = wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      const p = container.querySelector('p')
      expect(p).toHaveAttribute('data-test-status', TRANSITION_STATUS_ENTERING)
      expect(p).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)
    })
  })

  describe('unmountOnHide', () => {
    it('unmounts child when true', () => {
      const { container, rerender } = wrapperMount(
        <Transition duration={0} transitionOnMount={false} unmountOnHide>
          <p />
        </Transition>,
      )

      rerender(
        <Transition duration={0} transitionOnMount={false} unmountOnHide visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).not.toBeInTheDocument()
    })

    it('lefts mounted when false', () => {
      const { container, rerender } = wrapperMount(
        <Transition duration={0} transitionOnMount={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      rerender(
        <Transition duration={0} transitionOnMount={false} unmountOnHide={false} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).toHaveAttribute('data-test-status', TRANSITION_STATUS_EXITED)
    })
  })
})
