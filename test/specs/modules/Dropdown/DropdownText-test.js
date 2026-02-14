import { render } from '@testing-library/react'

import DropdownText from 'src/modules/Dropdown/DropdownText'
import * as common from 'test/specs/commonTests'

describe('DropdownText', () => {
  common.isConformant(DropdownText)
  common.rendersChildren(DropdownText)

  it('aria attributes', () => {
    const { container } = render(<DropdownText />)
    const el = container.firstChild

    expect(el).toHaveAttribute('aria-live', 'polite')
    expect(el).toHaveAttribute('aria-atomic', 'true')
    expect(el).toHaveAttribute('role', 'alert')
  })
})
