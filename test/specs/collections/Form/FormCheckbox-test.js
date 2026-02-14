import { render } from '@testing-library/react'

import FormCheckbox from 'src/collections/Form/FormCheckbox'
import * as common from 'test/specs/commonTests'

describe('FormCheckbox', () => {
  common.isConformant(FormCheckbox, {
    ignoredTypingsProps: ['type'],
  })

  it('renders a FormField with a Checkbox control', () => {
    const { container } = render(<FormCheckbox />)
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
  })
})
