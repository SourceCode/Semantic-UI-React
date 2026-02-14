import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'

import ButtonOr from 'src/elements/Button/ButtonOr'
import * as common from 'test/specs/commonTests'

describe('ButtonOr', () => {
  common.isConformant(ButtonOr)

  describe('text', () => {
    it('should not define attr when not defined', () => {
      const { container } = render(<ButtonOr />)
      expect(container.firstChild).not.toHaveAttribute('data-text')
    })

    it('should pass value to attr', () => {
      const word = faker.lorem.word()
      const { container } = render(<ButtonOr text={word} />)
      expect(container.firstChild).toHaveAttribute('data-text', word)
    })
  })
})
