import { render } from '@testing-library/react'

import FormInput from 'src/collections/Form/FormInput'
import * as common from 'test/specs/commonTests'

describe('FormInput', () => {
  common.isConformant(FormInput, {
    eventTargets: {
      // keyboard
      onKeyDown: 'input',
      onKeyPress: 'input',
      onKeyUp: 'input',

      // focus
      onFocus: 'input',
      onBlur: 'input',

      // form
      onChange: 'input',
      onInput: 'input',

      // mouse
      onClick: 'input',
      onContextMenu: 'input',
      onDrag: 'input',
      onDragEnd: 'input',
      onDragEnter: 'input',
      onDragExit: 'input',
      onDragLeave: 'input',
      onDragOver: 'input',
      onDragStart: 'input',
      onDrop: 'input',
      onMouseDown: 'input',
      onMouseEnter: 'input',
      onMouseLeave: 'input',
      onMouseMove: 'input',
      onMouseOut: 'input',
      onMouseOver: 'input',
      onMouseUp: 'input',

      // selection
      onSelect: 'input',

      // touch
      onTouchCancel: 'input',
      onTouchEnd: 'input',
      onTouchMove: 'input',
      onTouchStart: 'input',
    },
    ignoredTypingsProps: ['label', 'error'],
  })
  common.labelImplementsHtmlForProp(FormInput)

  it('renders a FormField with a Input control', () => {
    const { container } = render(<FormInput />)
    expect(container.querySelector('input')).toBeInTheDocument()
  })
})
