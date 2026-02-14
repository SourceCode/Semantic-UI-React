import { render } from '@testing-library/react'

import FormTextArea from 'src/collections/Form/FormTextArea'
import * as common from 'test/specs/commonTests'

describe('FormTextArea', () => {
  common.isConformant(FormTextArea)
  common.labelImplementsHtmlForProp(FormTextArea)

  it('renders a FormField with a TextArea control', () => {
    const { container } = render(<FormTextArea />)
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })
})
