import { render } from '@testing-library/react'

import ListIcon from 'src/elements/List/ListIcon'
import * as common from 'test/specs/commonTests'

describe('ListIcon', () => {
  common.isConformant(ListIcon)
  common.implementsVerticalAlignProp(ListIcon)

  it('returns Icon component', () => {
    const { container } = render(<ListIcon />)
    expect(container.querySelector('i.icon')).toBeTruthy()
  })
})
