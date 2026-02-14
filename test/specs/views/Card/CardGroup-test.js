import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { render } from '@testing-library/react'

import { SUI } from 'src/lib'
import CardGroup from 'src/views/Card/CardGroup'
import * as common from 'test/specs/commonTests'

describe('CardGroup', () => {
  common.isConformant(CardGroup)

  common.hasUIClassName(CardGroup)
  common.rendersChildren(CardGroup)

  common.implementsTextAlignProp(CardGroup, _.without(SUI.TEXT_ALIGNMENTS, 'justified'))
  common.implementsWidthProp(CardGroup, SUI.WIDTHS, { propKey: 'itemsPerRow', canEqual: false })

  common.propKeyOnlyToClassName(CardGroup, 'centered')
  common.propKeyOnlyToClassName(CardGroup, 'doubling')
  common.propKeyOnlyToClassName(CardGroup, 'stackable')

  describe('renders children', () => {
    const firstText = faker.hacker.phrase()
    const secondText = faker.hacker.phrase()

    it('with `items` prop', () => {
      const items = [{ header: firstText }, { header: secondText }]

      const { container } = render(<CardGroup items={items} />)
      const headers = container.querySelectorAll('.header')

      expect(headers[0]).toHaveTextContent(firstText)
      expect(headers[headers.length - 1]).toHaveTextContent(secondText)
    })
  })
})
