import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { render } from '@testing-library/react'

import { htmlImageProps } from 'src/lib'
import CommentAvatar from 'src/views/Comment/CommentAvatar'
import * as common from 'test/specs/commonTests'

describe('CommentAvatar', () => {
  common.isConformant(CommentAvatar)

  describe('src', () => {
    it('passes to the "img" element', () => {
      const src = faker.image.url()
      const { container } = render(<CommentAvatar src={src} />)
      const image = container.querySelector('img')

      expect(image).toHaveAttribute('src', src)
    })
  })

  describe('image props', () => {
    _.forEach(htmlImageProps, (propName) => {
      it(`passes "${propName}" to the "img" element`, () => {
        const propValue = faker.lorem.word()
        const { container } = render(
          <CommentAvatar src='foo.jpg' {...{ [propName]: propValue }} />,
        )
        const image = container.querySelector('img')

        expect(image).toHaveAttribute(propName, propValue)
      })
    })
  })
})
