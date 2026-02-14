import { render, fireEvent } from '@testing-library/react'

import List from 'src/elements/List/List'
import ListContent from 'src/elements/List/ListContent'
import ListDescription from 'src/elements/List/ListDescription'
import ListHeader from 'src/elements/List/ListHeader'
import ListIcon from 'src/elements/List/ListIcon'
import ListItem from 'src/elements/List/ListItem'
import ListList from 'src/elements/List/ListList'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('List', () => {
  common.isConformant(List)
  common.hasSubcomponents(List, [
    ListContent,
    ListDescription,
    ListHeader,
    ListIcon,
    ListItem,
    ListList,
  ])
  common.hasUIClassName(List)
  common.rendersChildren(List)

  common.implementsVerticalAlignProp(List)

  common.propKeyAndValueToClassName(List, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(List, 'animated')
  common.propKeyOnlyToClassName(List, 'bulleted')
  common.propKeyOnlyToClassName(List, 'celled')
  common.propKeyOnlyToClassName(List, 'divided')
  common.propKeyOnlyToClassName(List, 'horizontal')
  common.propKeyOnlyToClassName(List, 'inverted')
  common.propKeyOnlyToClassName(List, 'link')
  common.propKeyOnlyToClassName(List, 'ordered')
  common.propKeyOnlyToClassName(List, 'selection')

  common.propKeyOrValueAndKeyToClassName(List, 'relaxed', ['very'])

  common.propValueOnlyToClassName(List, 'size', SUI.SIZES)

  const items = ['Name', 'Status', 'Notes']

  describe('onItemClick', () => {
    it('is called with (e, itemProps) when clicked', () => {
      const onClick = vi.fn()
      const onItemClick = vi.fn()

      const callbackData = { content: 'Notes', 'data-foo': 'bar' }
      const itemProps = { key: 'notes', content: 'Notes', 'data-foo': 'bar', onClick }

      const { container } = render(<List items={[itemProps]} onItemClick={onItemClick} />)

      fireEvent.click(container.querySelector('[role="listitem"]'))

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining(callbackData),
      )

      expect(onItemClick).toHaveBeenCalledOnce()
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining(callbackData),
      )
    })
  })

  describe('role', () => {
    it('is accessibile with no items', () => {
      const { container } = render(<List />)
      expect(container.firstChild).toHaveAttribute('role', 'list')
    })

    it('is accessibile with items', () => {
      const { container } = render(<List items={items} />)
      expect(container.firstChild).toHaveAttribute('role', 'list')
    })

    it('allows overriding with no items', () => {
      const { container } = render(<List role='listbox' />)
      expect(container.firstChild).toHaveAttribute('role', 'listbox')
    })

    it('allows overriding with items', () => {
      const { container } = render(<List role='listbox' items={items} />)
      expect(container.firstChild).toHaveAttribute('role', 'listbox')
    })

    it('allows overriding with children', () => {
      const { container } = render(
        <List role='listbox'>
          <ListItem />
        </List>,
      )
      expect(container.firstChild).toHaveAttribute('role', 'listbox')
    })
  })

  describe('shorthand', () => {
    it('renders empty tr with no shorthand', () => {
      const { container } = render(<List />)
      expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(0)
    })

    it('renders the items', () => {
      const { container } = render(<List items={items} />)
      expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(items.length)
    })
  })
})
