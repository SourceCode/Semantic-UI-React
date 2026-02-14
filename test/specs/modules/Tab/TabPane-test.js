import { render } from '@testing-library/react'

import TabPane from 'src/modules/Tab/TabPane'
import * as common from 'test/specs/commonTests'

describe('TabPane', () => {
  common.isConformant(TabPane)

  common.implementsCreateMethod(TabPane)

  common.propKeyOnlyToClassName(TabPane, 'active', { defaultValue: 'left' })
  common.propKeyOnlyToClassName(TabPane, 'loading')

  it('renders a Segment by default', () => {
    const { container } = render(<TabPane />)
    expect(container.querySelector('.segment')).toBeInTheDocument()
  })
})
