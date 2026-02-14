import { render } from '@testing-library/react'

import Radio from 'src/addons/Radio/Radio'
import * as common from 'test/specs/commonTests'

describe('Radio', () => {
  common.isConformant(Radio)

  it('renders an input with type="radio"', () => {
    const { container } = render(<Radio />)
    const input = container.querySelector('input')

    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'radio')
  })

  it('is not a radio when slider', () => {
    const { container } = render(<Radio slider />)
    const input = container.querySelector('input')

    expect(input).toHaveAttribute('type', 'radio')
    // When slider is set, the `radio` prop is not passed, so no `radio` class
    expect(container.firstChild).toHaveClass('slider')
    expect(container.firstChild).not.toHaveClass('radio')
  })

  it('is not a radio when toggle', () => {
    const { container } = render(<Radio toggle />)
    const input = container.querySelector('input')

    expect(input).toHaveAttribute('type', 'radio')
    // When toggle is set, the `radio` prop is not passed, so no `radio` class
    expect(container.firstChild).toHaveClass('toggle')
    expect(container.firstChild).not.toHaveClass('radio')
  })
})
