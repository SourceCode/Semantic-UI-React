import _ from 'lodash'
import { render, fireEvent } from '@testing-library/react'

import Message from 'src/collections/Message/Message'
import MessageContent from 'src/collections/Message/MessageContent'
import MessageHeader from 'src/collections/Message/MessageHeader'
import MessageList from 'src/collections/Message/MessageList'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('Message', () => {
  common.isConformant(Message)
  common.hasSubcomponents(Message, [MessageContent, MessageHeader, MessageList])
  common.hasUIClassName(Message)
  common.rendersChildren(Message, {
    rendersContent: false,
  })

  common.implementsIconProp(Message, { autoGenerateKey: false })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: 'p',
    mapValueToProps: (val) => ({ children: val }),
  })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: MessageHeader,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'list',
    ShorthandComponent: MessageList,
    mapValueToProps: (val) => ({ items: val }),
  })

  common.propKeyOnlyToClassName(Message, 'compact')
  common.propKeyOnlyToClassName(Message, 'error')
  common.propKeyOnlyToClassName(Message, 'floating')
  common.propKeyOnlyToClassName(Message, 'hidden')
  common.propKeyOnlyToClassName(Message, 'icon')
  common.propKeyOnlyToClassName(Message, 'info')
  common.propKeyOnlyToClassName(Message, 'negative')
  common.propKeyOnlyToClassName(Message, 'positive')
  common.propKeyOnlyToClassName(Message, 'success')
  common.propKeyOnlyToClassName(Message, 'visible')
  common.propKeyOnlyToClassName(Message, 'warning')

  common.propKeyOrValueAndKeyToClassName(Message, 'attached', ['bottom', 'top'])

  common.propValueOnlyToClassName(Message, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Message, 'size', _.without(SUI.SIZES, 'medium'))

  describe('header', () => {
    it('adds MessageContent when defined', () => {
      const { container } = render(<Message header='This is a message' />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })

  describe('icon', () => {
    it('does not have MessageContent by default', () => {
      const { container } = render(<Message />)
      expect(container.querySelector('.content')).toBeNull()
    })
    it('renders children when "true"', () => {
      const text = 'child text'
      const node = <div id='foo' />

      const { container: c1 } = render(<Message icon>{text}</Message>)
      expect(c1.firstChild).toHaveTextContent(text)

      const { container: c2 } = render(<Message icon>{node}</Message>)
      expect(c2.querySelector('#foo')).toBeInTheDocument()
    })
  })

  describe('list', () => {
    it('adds MessageContent when defined', () => {
      const { container } = render(<Message list={[]} />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })

  describe('onDismiss', () => {
    it('has no close icon by default', () => {
      const { container } = render(<Message />)
      expect(container.querySelector('.close.icon')).toBeNull()
    })

    it('adds a close icon when defined', () => {
      const { container } = render(<Message onDismiss={() => undefined} />)
      expect(container.querySelector('.close.icon')).toBeInTheDocument()
    })

    it('is called with (event) on close icon click', () => {
      const props = { icon: true }

      const spy = vi.fn()
      const { container } = render(<Message {...props} onDismiss={spy} />)

      expect(container.querySelector('.close.icon')).toBeInTheDocument()
      fireEvent.click(container.querySelector('.close.icon'))

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(props),
      )
    })
  })
})
