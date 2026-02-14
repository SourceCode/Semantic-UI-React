import { render } from '@testing-library/react'

import Divider from 'src/elements/Divider/Divider'
import * as common from 'test/specs/commonTests'

describe('Divider', () => {
  common.isConformant(Divider)
  common.rendersChildren(Divider)
  common.hasUIClassName(Divider)

  common.propKeyOnlyToClassName(Divider, 'horizontal')
  common.propKeyOnlyToClassName(Divider, 'vertical')
  common.propKeyOnlyToClassName(Divider, 'inverted')
  common.propKeyOnlyToClassName(Divider, 'fitted')
  common.propKeyOnlyToClassName(Divider, 'hidden')
  common.propKeyOnlyToClassName(Divider, 'section')
  common.propKeyOnlyToClassName(Divider, 'clearing')

  it('renders a <div /> element', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  it('adds the "divider" class', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild).toHaveClass('divider')
  })
})
