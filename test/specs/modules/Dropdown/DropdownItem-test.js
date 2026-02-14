import { faker } from '@faker-js/faker'
import { render, fireEvent } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import DropdownItem from 'src/modules/Dropdown/DropdownItem'
import Flag from 'src/elements/Flag'

describe('DropdownItem', () => {
  common.isConformant(DropdownItem)
  common.rendersChildren(DropdownItem, {
    rendersContent: false,
  })

  common.propKeyOnlyToClassName(DropdownItem, 'selected')
  common.propKeyOnlyToClassName(DropdownItem, 'active')

  common.implementsCreateMethod(DropdownItem)
  common.implementsIconProp(DropdownItem, { autoGenerateKey: false })
  common.implementsLabelProp(DropdownItem, { autoGenerateKey: false })
  common.implementsImageProp(DropdownItem, { autoGenerateKey: false })

  common.implementsShorthandProp(DropdownItem, {
    assertExactMatch: false,
    autoGenerateKey: false,
    propKey: 'flag',
    ShorthandComponent: Flag,
    mapValueToProps: (name) => ({ name }),
  })

  common.implementsShorthandProp(DropdownItem, {
    autoGenerateKey: false,
    propKey: 'description',
    ShorthandComponent: 'span',
    mapValueToProps: (children) => ({ children }),
    shorthandDefaultProps: { className: 'description' },
  })

  common.implementsShorthandProp(DropdownItem, {
    autoGenerateKey: false,
    propKey: 'text',
    ShorthandComponent: 'span',
    mapValueToProps: (children) => ({ children }),
    shorthandDefaultProps: { className: 'text' },
  })

  describe('aria', () => {
    it('should render DropdownItem as role=option', () => {
      const { container } = render(<DropdownItem />)
      expect(container.firstChild).toHaveAttribute('role', 'option')
    })
    it('should render DropdownItem with children as role=option', () => {
      const { container } = render(<DropdownItem>Text</DropdownItem>)
      expect(container.firstChild).toHaveAttribute('role', 'option')
    })
    it('should render DropdownItem with description as role=option', () => {
      const { container } = render(<DropdownItem description='Text' />)
      expect(container.firstChild).toHaveAttribute('role', 'option')
    })
    it('should render disabled DropdownItem with aria-disabled', () => {
      const { container } = render(<DropdownItem disabled />)
      expect(container.firstChild).toHaveAttribute('aria-disabled', 'true')
    })
    it('should render normal DropdownItem without aria-disabled', () => {
      const { container } = render(<DropdownItem />)
      expect(container.firstChild).not.toHaveAttribute('aria-disabled')
    })
    it('should render active DropdownItem with aria-checked', () => {
      const { container } = render(<DropdownItem active />)
      expect(container.firstChild).toHaveAttribute('aria-checked', 'true')
    })
    it('should render normal DropdownItem without aria-checked', () => {
      const { container } = render(<DropdownItem />)
      expect(container.firstChild).not.toHaveAttribute('aria-checked')
    })
    it('should render selected DropdownItem with aria-selected', () => {
      const { container } = render(<DropdownItem selected />)
      expect(container.firstChild).toHaveAttribute('aria-selected', 'true')
    })
    it('should render normal DropdownItem without aria-selected', () => {
      const { container } = render(<DropdownItem />)
      expect(container.firstChild).not.toHaveAttribute('aria-selected')
    })
  })

  describe('description', () => {
    it('adds className="description" to element shorthand', () => {
      const { container } = render(<DropdownItem description={<strong />} />)
      expect(container.querySelector('strong.description')).toBeInTheDocument()
    })
  })

  describe('text', () => {
    it('adds className="text" to element shorthand', () => {
      const { container } = render(<DropdownItem text={<strong />} />)
      expect(container.querySelector('strong.text')).toBeInTheDocument()
    })
  })

  describe('content', () => {
    it('renders text if no content', () => {
      const { container } = render(<DropdownItem text='hey' />)
      expect(container.textContent).toContain('hey')
    })

    it('renders content if present', () => {
      const { container } = render(<DropdownItem text='hey' content='you' />)
      expect(container.textContent).not.toContain('hey')
      expect(container.textContent).toContain('you')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', () => {
      const onClick = vi.fn()

      const value = faker.hacker.phrase()
      const props = { value, 'data-foo': 'bar' }

      const { container } = render(<DropdownItem onClick={onClick} {...props} />)
      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining(props),
      )
    })
  })
})
