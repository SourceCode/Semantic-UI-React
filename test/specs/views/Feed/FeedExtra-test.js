import { render } from '@testing-library/react'

import FeedExtra from 'src/views/Feed/FeedExtra'
import * as common from 'test/specs/commonTests'

describe('FeedExtra', () => {
  common.isConformant(FeedExtra)
  common.rendersChildren(FeedExtra)

  common.propKeyOnlyToClassName(FeedExtra, 'images')
  common.propKeyOnlyToClassName(FeedExtra, 'text')

  describe('images', () => {
    it('renders <img> with images prop', () => {
      const { container } = render(<FeedExtra images={['a', 'b', 'c']} />)
      expect(container.querySelectorAll('img')).toHaveLength(3)
    })
  })
})
