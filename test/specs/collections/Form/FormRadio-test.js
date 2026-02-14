import { render } from '@testing-library/react'

import FormRadio from 'src/collections/Form/FormRadio'
import * as common from 'test/specs/commonTests'

describe('FormRadio', () => {
  common.isConformant(FormRadio, {
    ignoredTypingsProps: ['type'],
  })

  it('renders a FormField with a Radio control', () => {
    const { container } = render(<FormRadio />)
    expect(container.querySelector('input[type="radio"]')).toBeInTheDocument()
  })
})
