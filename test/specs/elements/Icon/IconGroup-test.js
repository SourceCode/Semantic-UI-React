import { render } from '@testing-library/react'

import IconGroup from 'src/elements/Icon/IconGroup'
import * as common from 'test/specs/commonTests'

describe('IconGroup', () => {
  common.isConformant(IconGroup)
  common.rendersChildren(IconGroup)

  it('renders as an <i> by default', () => {
    const { container } = render(<IconGroup />)
    expect(container.firstChild.tagName).toBe('I')
  })
})
