import { render, fireEvent } from '@testing-library/react'

import SearchResult from 'src/modules/Search/SearchResult'
import * as common from 'test/specs/commonTests'

const requiredProps = { title: '' }

describe('SearchResult', () => {
  common.isConformant(SearchResult, { requiredProps })
  common.propKeyOnlyToClassName(SearchResult, 'active', { requiredProps })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const { container } = render(<SearchResult onClick={onClick} {...requiredProps} />)

      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(requiredProps),
      )
    })
  })
})
