import { faker } from '@faker-js/faker'
import { render, fireEvent } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import DropdownSearchInput from 'src/modules/Dropdown/DropdownSearchInput'

describe('DropdownSearchInput', () => {
  common.isConformant(DropdownSearchInput)

  describe('aria', () => {
    it('should have aria-autocomplete', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.querySelector('input')).toHaveAttribute('aria-autocomplete', 'list')
    })
  })

  describe('autoComplete', () => {
    it('should have autoComplete by default', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.querySelector('input')).toHaveAttribute('autoComplete', 'off')
    })

    it('should pass a defined value', () => {
      const { container } = render(<DropdownSearchInput autoComplete='on' />)
      expect(container.querySelector('input')).toHaveAttribute('autoComplete', 'on')
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', () => {
      const onChange = vi.fn()

      const { container } = render(<DropdownSearchInput onChange={onChange} />)
      const input = container.querySelector('input')

      fireEvent.change(input, { target: { value: 'value' } })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: 'value' }),
      )
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.querySelector('input')).not.toHaveAttribute('tabIndex')
    })

    it('can be set explicitly', () => {
      const { container } = render(<DropdownSearchInput tabIndex={123} />)
      expect(container.querySelector('input')).toHaveAttribute('tabIndex', '123')
    })
  })

  describe('type', () => {
    it('should have text by default', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.querySelector('input')).toHaveAttribute('type', 'text')
    })

    it('can be set explicitly', () => {
      const type = faker.lorem.word()

      const { container } = render(<DropdownSearchInput type={type} />)
      expect(container.querySelector('input')).toHaveAttribute('type', type)
    })
  })

  describe('value', () => {
    it('is not set by default', () => {
      const { container } = render(<DropdownSearchInput />)
      // value is an empty string by default for input elements
      expect(container.querySelector('input').value).toBeFalsy()
    })

    it('can be set explicitly', () => {
      const value = faker.lorem.word()

      const { container } = render(<DropdownSearchInput value={value} onChange={() => {}} />)
      expect(container.querySelector('input').value).toBe(value)
    })
  })
})
