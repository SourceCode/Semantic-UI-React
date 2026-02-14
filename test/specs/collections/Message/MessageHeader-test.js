import { render } from '@testing-library/react'

import MessageHeader from 'src/collections/Message/MessageHeader'
import * as common from 'test/specs/commonTests'

describe('MessageHeader', () => {
  common.isConformant(MessageHeader)
  common.implementsCreateMethod(MessageHeader)
  common.rendersChildren(MessageHeader)

  it('renders an div tag', () => {
    const { container } = render(<MessageHeader />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  it('has className header', () => {
    const { container } = render(<MessageHeader />)
    expect(container.firstChild).toHaveClass('header')
  })
})
