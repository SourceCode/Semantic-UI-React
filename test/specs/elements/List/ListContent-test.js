import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'

import ListContent from 'src/elements/List/ListContent'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('ListContent', () => {
  common.isConformant(ListContent)
  common.rendersChildren(ListContent)

  common.implementsCreateMethod(ListContent)

  common.implementsVerticalAlignProp(ListContent)
  common.propKeyAndValueToClassName(ListContent, 'floated', SUI.FLOATS)

  describe('shorthand', () => {
    const baseProps = {
      content: faker.hacker.phrase(),
      description: faker.hacker.phrase(),
      header: faker.hacker.phrase(),
    }

    it('renders content without wrapping ListContent', () => {
      const { container } = render(<ListContent {...baseProps} />)

      expect(container.querySelector('.header')).toHaveTextContent(baseProps.header)
      expect(container.querySelector('.description')).toHaveTextContent(baseProps.description)
      expect(container.firstChild).toHaveTextContent(baseProps.content)
    })
  })
})
