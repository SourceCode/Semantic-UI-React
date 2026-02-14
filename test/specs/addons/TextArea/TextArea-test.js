import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import TextArea from 'src/addons/TextArea/TextArea'
import * as common from 'test/specs/commonTests'

describe('TextArea', () => {
  common.isConformant(TextArea)

  describe('focus', () => {
    it('can be set via a ref', () => {
      const ref = React.createRef()

      render(<TextArea ref={ref} />)
      const element = document.querySelector('textarea')

      ref.current.focus()
      expect(document.activeElement).toBe(element)
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', () => {
      const onChange = vi.fn()
      const props = { 'data-foo': 'bar', onChange }

      const { container } = render(<TextArea {...props} />)
      const textarea = container.querySelector('textarea')

      fireEvent.change(textarea, { target: { value: 'name' } })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ target: expect.objectContaining({ value: 'name' }) }),
        expect.objectContaining({ ...props, value: 'name' }),
      )
    })
  })

  describe('onInput', () => {
    it('is called with (e, data) on input', () => {
      const onInput = vi.fn()
      const props = { 'data-foo': 'bar', onInput }

      const { container } = render(<TextArea {...props} />)
      const textarea = container.querySelector('textarea')

      fireEvent.input(textarea, { target: { value: 'name' } })

      expect(onInput).toHaveBeenCalledOnce()
      expect(onInput).toHaveBeenCalledWith(
        expect.objectContaining({ target: expect.objectContaining({ value: 'name' }) }),
        expect.objectContaining({ ...props, value: 'name' }),
      )
    })
  })

  describe('rows', () => {
    it('has default value', () => {
      const { container } = render(<TextArea />)
      expect(container.querySelector('textarea')).toHaveAttribute('rows', '3')
    })

    it('sets prop', () => {
      const { container } = render(<TextArea rows={1} />)
      expect(container.querySelector('textarea')).toHaveAttribute('rows', '1')
    })
  })
})
