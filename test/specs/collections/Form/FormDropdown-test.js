import { render } from '@testing-library/react'

import FormDropdown from 'src/collections/Form/FormDropdown'
import * as common from 'test/specs/commonTests'

describe('FormDropdown', () => {
  common.isConformant(FormDropdown, { ignoredTypingsProps: ['error'] })
  common.labelImplementsHtmlForProp(FormDropdown)

  it('renders a FormField with a Dropdown control', () => {
    const { container } = render(<FormDropdown />)
    expect(container.querySelector('[role="listbox"]') || container.querySelector('.dropdown')).toBeInTheDocument()
  })
})
