import { render, fireEvent } from '@testing-library/react'

import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/specs/commonTests'

describe('AccordionTitle', () => {
  common.isConformant(AccordionTitle)
  common.rendersChildren(AccordionTitle)

  common.implementsCreateMethod(AccordionTitle)
  common.implementsIconProp(AccordionTitle, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  common.propKeyOnlyToClassName(AccordionTitle, 'active')

  describe('onClick', () => {
    it('is called with (e, { name, index }) when clicked', () => {
      const onClick = vi.fn()
      const props = { content: 'title', index: 0 }

      const { container } = render(<AccordionTitle onClick={onClick} {...props} />)
      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining(props),
      )
    })
  })
})
