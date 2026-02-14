import { render } from '@testing-library/react'

import MessageContent from 'src/collections/Message/MessageContent'
import * as common from 'test/specs/commonTests'

describe('MessageContent', () => {
  common.isConformant(MessageContent)
  common.rendersChildren(MessageContent)

  it('renders an div tag', () => {
    const { container } = render(<MessageContent />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  it('has className content', () => {
    const { container } = render(<MessageContent />)
    expect(container.firstChild).toHaveClass('content')
  })
})
