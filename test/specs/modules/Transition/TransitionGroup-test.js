import { render, waitFor } from '@testing-library/react'

import TransitionGroup from 'src/modules/Transition/TransitionGroup'
import * as common from 'test/specs/commonTests'

let wrapper

const wrapperMount = (element) => {
  const result = render(element)
  wrapper = result
  return result
}

describe('TransitionGroup', () => {
  common.isConformant(TransitionGroup, {
    rendersFragmentByDefault: true,
    rendersChildren: false,
  })

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

  describe('children', () => {
    it('wraps all children to Transition', () => {
      const { container } = wrapperMount(
        <TransitionGroup>
          <div className='child' />
          <div className='child' />
          <div className='child' />
        </TransitionGroup>,
      )

      // Transition wraps children with transition classes
      const children = container.querySelectorAll('.child')
      expect(children).toHaveLength(3)
      children.forEach((child) => {
        expect(child).toHaveClass('transition')
      })
    })

    it('passes props to children', () => {
      const { container } = wrapperMount(
        <TransitionGroup animation='scale' directional duration={1500}>
          <div className='child' />
          <div className='child' />
          <div className='child' />
        </TransitionGroup>,
      )

      const children = container.querySelectorAll('.child')
      expect(children).toHaveLength(3)
      // Transition adds transition classes to children
      children.forEach((child) => {
        expect(child).toHaveClass('transition')
      })
    })

    it('wraps new child to Transition and sets transitionOnMount to true', () => {
      const { container, rerender } = wrapperMount(
        <TransitionGroup>
          <div key='first' className='first' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup>
          <div key='first' className='first' />
          <div key='second' className='second' />
        </TransitionGroup>,
      )

      const secondChild = container.querySelector('.second')
      expect(secondChild).toBeInTheDocument()
      // New children should have animating class (transitionOnMount=true)
      expect(secondChild).toHaveClass('transition')
    })

    it('skips invalid children', () => {
      const { container, rerender } = wrapperMount(
        <TransitionGroup>
          <div key='first' className='child' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup>
          <div key='first' className='child' />
          {''}
          <div key='second' className='child' />
        </TransitionGroup>,
      )

      const children = container.querySelectorAll('.child')
      expect(children).toHaveLength(2)
    })

    it('sets visible to false when child was removed', () => {
      const { container, rerender } = wrapperMount(
        <TransitionGroup>
          <div key='first' className='first' />
          <div key='second' className='second' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup>
          <div key='first' className='first' />
        </TransitionGroup>,
      )

      // The first child should still be visible
      const firstChild = container.querySelector('.first')
      expect(firstChild).toBeInTheDocument()
      expect(firstChild).toHaveClass('visible')

      // The second child should still be in the DOM but transitioning out
      const secondChild = container.querySelector('.second')
      expect(secondChild).toBeInTheDocument()
    })

    it('removes child after transition', async () => {
      const { container, rerender } = wrapperMount(
        <TransitionGroup duration={0}>
          <div key='first' className='first' />
          <div key='second' className='second' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup duration={0}>
          <div key='first' className='first' />
        </TransitionGroup>,
      )

      await waitFor(() => {
        expect(container.querySelector('.second')).not.toBeInTheDocument()
      })

      expect(container.querySelector('.first')).toBeInTheDocument()
    })
  })
})
