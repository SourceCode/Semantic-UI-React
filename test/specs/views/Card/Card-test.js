import { faker } from '@faker-js/faker'
import { render, fireEvent } from '@testing-library/react'

import { SUI } from 'src/lib'
import Card from 'src/views/Card/Card'
import CardContent from 'src/views/Card/CardContent'
import CardDescription from 'src/views/Card/CardDescription'
import CardGroup from 'src/views/Card/CardGroup'
import CardHeader from 'src/views/Card/CardHeader'
import CardMeta from 'src/views/Card/CardMeta'
import * as common from 'test/specs/commonTests'

describe('Card', () => {
  common.isConformant(Card)

  common.hasSubcomponents(Card, [CardContent, CardDescription, CardGroup, CardHeader, CardMeta])
  common.hasUIClassName(Card)
  common.rendersChildren(Card)

  common.propKeyOnlyToClassName(Card, 'centered')
  common.propKeyOnlyToClassName(Card, 'fluid')
  common.propKeyOnlyToClassName(Card, 'link')
  common.propKeyOnlyToClassName(Card, 'raised')

  common.propValueOnlyToClassName(Card, 'color', SUI.COLORS)

  it('renders a <div> by default', () => {
    const { container } = render(<Card />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  describe('href', () => {
    it('renders an <a> with an href attr', () => {
      const url = faker.internet.url()
      const { container } = render(<Card href={url} />)

      expect(container.firstChild.tagName).toBe('A')
      expect(container.firstChild).toHaveAttribute('href', url)
    })
  })

  describe('onClick', () => {
    it('renders <a> instead of <div>', () => {
      const handleClick = vi.fn()
      const { container } = render(<Card onClick={handleClick} />)

      expect(container.firstChild.tagName).toBe('A')
    })

    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const { container } = render(<Card onClick={onClick} />)

      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ onClick }),
      )
    })
  })

  describe('extra', () => {
    it('renders a CardContent', () => {
      const { container } = render(<Card extra={faker.hacker.phrase()} />)

      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })
})
