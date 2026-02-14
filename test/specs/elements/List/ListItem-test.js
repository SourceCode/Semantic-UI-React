import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { render, fireEvent } from '@testing-library/react'

import ListItem from 'src/elements/List/ListItem'
import ListContent from 'src/elements/List/ListContent'
import * as common from 'test/specs/commonTests'

describe('ListItem', () => {
  common.isConformant(ListItem)
  common.rendersChildren(ListItem)

  common.propKeyOnlyToClassName(ListItem, 'active')
  common.propKeyOnlyToClassName(ListItem, 'disabled')

  describe('as', () => {
    it('omits className `list` when rendered as `li`', () => {
      const { container } = render(<ListItem as='li' />)
      expect(container.firstChild).not.toHaveClass('item')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const props = { onClick, 'data-foo': 'bar' }

      const { container } = render(<ListItem {...props} />)

      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(props),
      )
    })

    it('is not called when is disabled', () => {
      const onClick = vi.fn()
      const { container } = render(<ListItem disabled onClick={onClick} />)

      fireEvent.click(container.firstChild)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('value', () => {
    it('adds data attribute by default', () => {
      const value = faker.hacker.phrase()
      const { container } = render(<ListItem value={value} />)
      expect(container.firstChild).toHaveAttribute('data-value', value)
    })

    it('adds attribute when rendered as `li`', () => {
      const value = faker.hacker.phrase()
      const { container } = render(<ListItem as='li' value={value} />)
      expect(container.firstChild).toHaveAttribute('value', value)
    })
  })

  describe('shorthand', () => {
    const baseProps = {
      content: faker.hacker.phrase(),
      description: faker.hacker.phrase(),
      header: faker.hacker.phrase(),
    }

    it('renders without wrapping ListContent', () => {
      const { container } = render(<ListItem {...baseProps} />)
      expect(container.querySelectorAll('.content')).toHaveLength(0)
    })

    it('renders without wrapping ListContent when content passed as element', () => {
      const spy = vi.spyOn(ListContent, 'create')
      render(<ListItem {...baseProps} content={<div />} />)
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('renders wrapping ListContent when content passed as props', () => {
      const { container } = render(<ListItem content={baseProps} />)
      expect(container.querySelectorAll('.content')).toHaveLength(1)
    })

    _.each(baseProps, (value, key) => {
      it(`renders wrapping ListContent when icon and ${key} present`, () => {
        const { container } = render(<ListItem {..._.pick(baseProps, key)} icon='user' />)

        expect(container.querySelectorAll('i.icon')).toHaveLength(1)
        expect(container.querySelectorAll('.content')).toHaveLength(1)
      })

      it(`renders wrapping ListContent when image and ${key} present`, () => {
        const { container } = render(
          <ListItem {..._.pick(baseProps, key)} image='/images/wireframe/image.png' />,
        )

        expect(container.querySelectorAll('img')).toHaveLength(1)
        expect(container.querySelectorAll('.content')).toHaveLength(1)
      })
    })
  })

  describe('role', () => {
    it('adds role=listitem', () => {
      const { container } = render(<ListItem />)
      expect(container.firstChild).toHaveAttribute('role', 'listitem')
    })

    it('adds role=listitem with children', () => {
      const { container } = render(
        <ListItem>
          <div>Test</div>
        </ListItem>,
      )
      expect(container.firstChild).toHaveAttribute('role', 'listitem')
    })

    it('adds role=listitem with content', () => {
      const { container } = render(<ListItem content={<div />} />)
      expect(container.firstChild).toHaveAttribute('role', 'listitem')
    })

    it('adds role=listitem with icon', () => {
      const { container } = render(<ListItem icon='user' />)
      expect(container.firstChild).toHaveAttribute('role', 'listitem')
    })

    it('allows role override without children', () => {
      const { container } = render(<ListItem role='option' />)
      expect(container.firstChild).toHaveAttribute('role', 'option')
    })

    it('allows role override with children', () => {
      const { container } = render(
        <ListItem role='option'>
          <div>Test</div>
        </ListItem>,
      )
      expect(container.firstChild).toHaveAttribute('role', 'option')
    })

    it('allows role override with content', () => {
      const { container } = render(<ListItem role='option' content={<div />} />)
      expect(container.firstChild).toHaveAttribute('role', 'option')
    })

    it('allows role override with icon', () => {
      const { container } = render(<ListItem role='option' icon='user' />)
      expect(container.firstChild).toHaveAttribute('role', 'option')
    })
  })
})
