import { render } from '@testing-library/react'

import FeedSummary from 'src/views/Feed/FeedSummary'
import FeedDate from 'src/views/Feed/FeedDate'
import FeedUser from 'src/views/Feed/FeedUser'
import * as common from 'test/specs/commonTests'

describe('FeedSummary', () => {
  common.isConformant(FeedSummary)
  common.rendersChildren(FeedSummary)

  common.implementsShorthandProp(FeedSummary, {
    autoGenerateKey: false,
    propKey: 'date',
    ShorthandComponent: FeedDate,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsShorthandProp(FeedSummary, {
    autoGenerateKey: false,
    propKey: 'user',
    ShorthandComponent: FeedUser,
    mapValueToProps: (val) => ({ content: val }),
  })

  describe('content', () => {
    it('inserts whitespace on both sides of the content', () => {
      const { container } = render(<FeedSummary content='test' />)
      // The component wraps content with whitespace: {content && ' '}{content}{content && ' '}
      // toHaveTextContent normalizes whitespace, so check the raw textContent
      expect(container.firstChild.textContent).toContain(' test ')
    })
  })
})
