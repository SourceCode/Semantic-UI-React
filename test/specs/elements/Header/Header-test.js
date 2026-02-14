import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { render } from '@testing-library/react'

import Header from 'src/elements/Header/Header'
import HeaderContent from 'src/elements/Header/HeaderContent'
import HeaderSubheader from 'src/elements/Header/HeaderSubheader'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('Header', () => {
  common.hasUIClassName(Header)
  common.hasSubcomponents(Header, [HeaderContent, HeaderSubheader])
  common.rendersChildren(Header)

  common.implementsIconProp(Header, { autoGenerateKey: false })
  common.implementsImageProp(Header, { autoGenerateKey: false })
  common.implementsShorthandProp(Header, {
    autoGenerateKey: false,
    propKey: 'subheader',
    ShorthandComponent: HeaderSubheader,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsTextAlignProp(Header)

  common.propKeyAndValueToClassName(Header, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Header, 'block')
  common.propKeyOnlyToClassName(Header, 'disabled')
  common.propKeyOnlyToClassName(Header, 'dividing')
  common.propKeyOnlyToClassName(Header, 'inverted')
  common.propKeyOnlyToClassName(Header, 'sub')

  common.propKeyOrValueAndKeyToClassName(Header, 'attached', ['top', 'bottom'])

  common.propValueOnlyToClassName(Header, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Header, 'size', _.without(SUI.SIZES, 'big', 'massive', 'mini'))

  describe('icon', () => {
    it('adds an icon class when true', () => {
      const { container } = render(<Header icon />)
      expect(container.firstChild).toHaveClass('icon')
    })
    it('does not add an icon class given a name', () => {
      const { container } = render(<Header icon='user' />)
      expect(container.firstChild).not.toHaveClass('icon')
    })
  })

  describe('image', () => {
    it('adds an image class when true', () => {
      const { container } = render(<Header image />)
      expect(container.firstChild).toHaveClass('image')
    })
    it('does not add an Image when true', () => {
      const { container } = render(<Header image />)
      expect(container.querySelectorAll('img')).toHaveLength(0)
    })
  })

  describe('content', () => {
    it('is wrapped in HeaderContent when there is an image src', () => {
      const { container } = render(
        <Header image='/images/wireframe/image.png' content='Bar' />,
      )
      const headerContent = container.querySelector('.content')
      expect(headerContent).toHaveTextContent('Bar')
    })
    it('is wrapped in HeaderContent when there is an icon name', () => {
      const { container } = render(<Header icon='users' content='Friends' />)
      const headerContent = container.querySelector('.content')
      expect(headerContent).toHaveTextContent('Friends')
    })
    it('is not wrapped in HeaderContent when icon is true', () => {
      const { container } = render(<Header icon content='Friends' />)

      expect(container.firstChild).toHaveTextContent('Friends')
      expect(container.querySelector('.content')).toBeNull()
    })
  })

  describe('subheader', () => {
    it('adds HeaderSubheader as child when there is an icon', () => {
      const text = faker.hacker.phrase()
      const { container } = render(<Header icon='user' subheader={text} />)
      const subheader = container.querySelector('.sub.header')
      expect(subheader).toHaveTextContent(text)
    })
    it('adds HeaderSubheader as child when there is an image', () => {
      const text = faker.hacker.phrase()
      const { container } = render(
        <Header image='/images/wireframe/image.png' subheader={text} />,
      )
      const subheader = container.querySelector('.sub.header')
      expect(subheader).toHaveTextContent(text)
    })
  })
})
