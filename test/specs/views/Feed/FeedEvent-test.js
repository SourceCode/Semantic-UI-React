import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { render } from '@testing-library/react'

import FeedEvent from 'src/views/Feed/FeedEvent'
import FeedLabel from 'src/views/Feed/FeedLabel'
import * as common from 'test/specs/commonTests'

describe('FeedEvent', () => {
  common.isConformant(FeedEvent)
  common.rendersChildren(FeedEvent, {
    rendersContent: false,
  })

  common.implementsShorthandProp(FeedEvent, {
    autoGenerateKey: false,
    propKey: 'icon',
    ShorthandComponent: FeedLabel,
    mapValueToProps: (val) => ({ icon: val }),
  })
  common.implementsShorthandProp(FeedEvent, {
    autoGenerateKey: false,
    propKey: 'image',
    ShorthandComponent: FeedLabel,
    mapValueToProps: (val) => ({ image: val }),
  })

  describe('content props', () => {
    it('renders <FeedContent> with extraImages prop', () => {
      const images = _.times(3, () => faker.image.url())
      const { container } = render(<FeedEvent extraImages={images} />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })

    it('renders <FeedContent> with other content props', () => {
      const contentProps = ['content', 'date', 'extraText', 'meta', 'summary']

      contentProps.forEach((propKey) => {
        const props = { [propKey]: faker.hacker.phrase() }
        const { container } = render(<FeedEvent {...props} />)
        expect(container.querySelector('.content')).toBeInTheDocument()
      })
    })
  })
})
