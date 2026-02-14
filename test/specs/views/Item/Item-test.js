import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'

import Item from 'src/views/Item/Item'
import ItemContent from 'src/views/Item/ItemContent'
import ItemDescription from 'src/views/Item/ItemDescription'
import ItemExtra from 'src/views/Item/ItemExtra'
import ItemGroup from 'src/views/Item/ItemGroup'
import ItemHeader from 'src/views/Item/ItemHeader'
import ItemImage from 'src/views/Item/ItemImage'
import ItemMeta from 'src/views/Item/ItemMeta'
import * as common from 'test/specs/commonTests'

describe('Item', () => {
  common.isConformant(Item)
  common.hasSubcomponents(Item, [
    ItemContent,
    ItemDescription,
    ItemExtra,
    ItemGroup,
    ItemHeader,
    ItemImage,
    ItemMeta,
  ])
  common.rendersChildren(Item, {
    rendersContent: false,
  })

  common.implementsShorthandProp(Item, {
    autoGenerateKey: false,
    propKey: 'image',
    ShorthandComponent: ItemImage,
    mapValueToProps: (val) => ({ src: val }),
  })

  describe('content prop', () => {
    it('renders ItemContent component', () => {
      const { container } = render(<Item content={faker.hacker.phrase()} />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })

  describe('description prop', () => {
    it('renders ItemContent component', () => {
      const { container } = render(<Item description={faker.hacker.phrase()} />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })

  describe('extra prop', () => {
    it('renders ItemContent component', () => {
      const { container } = render(<Item extra={faker.hacker.phrase()} />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })

  describe('header prop', () => {
    it('renders ItemContent component', () => {
      const { container } = render(<Item header={faker.hacker.phrase()} />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })

  describe('image prop', () => {
    it('renders ItemImage component', () => {
      const { container } = render(<Item image={faker.image.url()} />)
      expect(container.querySelector('img')).toBeInTheDocument()
    })
  })

  describe('meta prop', () => {
    it('renders ItemContent component', () => {
      const { container } = render(<Item meta={faker.hacker.phrase()} />)
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })
})
