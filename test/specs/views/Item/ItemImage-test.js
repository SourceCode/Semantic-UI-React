import { render } from '@testing-library/react'

import ItemImage from 'src/views/Item/ItemImage'
import * as common from 'test/specs/commonTests'

describe('ItemImage', () => {
  common.isConformant(ItemImage, { rendersChildren: false })
  common.implementsCreateMethod(ItemImage)

  it('renders Image component', () => {
    const { container } = render(<ItemImage />)
    expect(container.querySelector('img')).toBeInTheDocument()
  })

  it('is wrapped without ui', () => {
    const { container } = render(<ItemImage />)

    expect(container.firstChild).not.toHaveClass('ui')
  })

  it('has ui with size prop', () => {
    const { container } = render(<ItemImage size='small' />)
    expect(container.firstChild).toHaveClass('ui')
  })
})
