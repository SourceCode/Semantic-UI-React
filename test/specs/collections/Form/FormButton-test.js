import { render } from '@testing-library/react'

import FormButton from 'src/collections/Form/FormButton'
import * as common from 'test/specs/commonTests'

describe('FormButton', () => {
  common.isConformant(FormButton, {
    ignoredTypingsProps: ['label'],
  })
  common.labelImplementsHtmlForProp(FormButton)

  it('renders a FormField with a Button control', () => {
    const { container } = render(<FormButton />)
    expect(container.querySelector('button')).toBeInTheDocument()
  })
})
