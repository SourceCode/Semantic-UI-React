import { render } from '@testing-library/react'

import ListList from 'src/elements/List/ListList'
import * as common from 'test/specs/commonTests'

describe('ListList', () => {
  common.isConformant(ListList)
  common.rendersChildren(ListList)

  describe('list', () => {
    it('omitted when rendered as `ol`', () => {
      const { container } = render(<ListList as='ol' />)
      expect(container.firstChild).not.toHaveClass('list')
    })

    it('omitted when rendered as `ul`', () => {
      const { container } = render(<ListList as='ul' />)
      expect(container.firstChild).not.toHaveClass('list')
    })
  })
})
