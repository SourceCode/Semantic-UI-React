import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'

import FeedLabel from 'src/views/Feed/FeedLabel'
import * as common from 'test/specs/commonTests'

describe('FeedLabel', () => {
  common.isConformant(FeedLabel)
  common.rendersChildren(FeedLabel)

  common.implementsIconProp(FeedLabel, { autoGenerateKey: false })

  describe('image prop', () => {
    it('renders <img> with string', () => {
      const src = faker.image.url()
      const { container } = render(<FeedLabel image={src} />)

      expect(container.querySelector('img')).toBeInTheDocument()
      expect(container.querySelector('img')).toHaveAttribute('src', src)
    })

    it('renders node', () => {
      const src = faker.image.url()
      const img = <img src={src} />
      const { container } = render(<FeedLabel image={img} />)

      expect(container.querySelector('img')).toBeInTheDocument()
      expect(container.querySelector('img')).toHaveAttribute('src', src)
    })
  })
})
