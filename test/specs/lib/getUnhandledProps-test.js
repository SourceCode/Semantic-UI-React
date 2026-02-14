import { render } from '@testing-library/react'

import getUnhandledProps from 'src/lib/getUnhandledProps'

// We spread the unhandled props onto the rendered result.
// Then, we can test the props of the rendered result.
// This is the intended usage of the util.
function TestComponent(props) {
  return <div {...getUnhandledProps(TestComponent, props)} />
}

describe('getUnhandledProps', () => {
  it('removes the proprietary childKey prop', () => {
    const { container } = render(<TestComponent childKey={1} />)
    expect(container.firstChild.hasAttribute('childKey')).toBe(false)
  })

  it('leaves props that are not defined in handledProps', () => {
    const { container } = render(<TestComponent data-leave-this='it is unhandled' />)
    expect(container.firstChild.getAttribute('data-leave-this')).toBe('it is unhandled')
  })

  it('removes props defined in handledProps', () => {
    TestComponent.handledProps = ['data-remove-me']
    const { container } = render(<TestComponent data-remove-me='it is handled' />)
    expect(container.firstChild.hasAttribute('data-remove-me')).toBe(false)
  })
})
