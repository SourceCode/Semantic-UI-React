import { render } from '@testing-library/react'

import FormSelect from 'src/collections/Form/FormSelect'
import * as common from 'test/specs/commonTests'

const requiredProps = {
  options: [],
}

describe('FormSelect', () => {
  common.isConformant(FormSelect, { requiredProps, ignoredTypingsProps: ['error'] })
  common.labelImplementsHtmlForProp(FormSelect, { requiredProps })

  it('renders a FormField with a Select control', () => {
    const { container } = render(<FormSelect {...requiredProps} />)
    expect(
      container.querySelector('[role="listbox"]') || container.querySelector('.dropdown'),
    ).toBeInTheDocument()
  })
})
