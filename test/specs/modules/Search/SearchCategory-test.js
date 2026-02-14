import { render } from '@testing-library/react'

import SearchCategory from 'src/modules/Search/SearchCategory'
import * as common from 'test/specs/commonTests'

describe('SearchCategory', () => {
  common.isConformant(SearchCategory)
  common.rendersChildren(SearchCategory)

  describe('children', () => {
    it('should be a child with a "name" className', () => {
      const { container } = render(<SearchCategory />)
      expect(container.firstChild.firstChild).toHaveClass('name')
    })

    it('should be wrapped with a "results" className', () => {
      const { container } = render(<SearchCategory />)
      expect(container.firstChild.children[1]).toHaveClass('results')
    })
  })
})
