import { render, fireEvent } from '@testing-library/react'

import ModalActions from 'src/modules/Modal/ModalActions'
import * as common from 'test/specs/commonTests'

describe('ModalActions', () => {
  common.isConformant(ModalActions)
  common.rendersChildren(ModalActions)

  common.implementsCreateMethod(ModalActions)

  const actions = [
    { key: 'cancel', content: 'Cancel', 'data-foo': 'something' },
    { key: 'ok', content: 'OK', 'data-foo': 'something' },
  ]

  describe('actions', () => {
    it('renders children', () => {
      const { container } = render(<ModalActions actions={actions} />)
      const buttons = container.querySelectorAll('.button')

      expect(buttons[0].textContent).toContain('Cancel')
      expect(buttons[1].textContent).toContain('OK')
    })

    it('passes arbitrary props', () => {
      const { container } = render(<ModalActions actions={actions} />)
      const buttons = container.querySelectorAll('.button')

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('data-foo', 'something')
      })
    })
  })

  describe('onActionClick', () => {
    it('can be omitted', () => {
      const { container } = render(<ModalActions actions={actions} />)
      const buttons = container.querySelectorAll('.button')

      expect(() => fireEvent.click(buttons[0])).not.toThrow()
    })

    it('is called with (e, actionProps) when clicked', () => {
      const onActionClick = vi.fn()
      const onButtonClick = vi.fn()

      const action = { key: 'users', content: 'Disable', onClick: onButtonClick }

      const { container } = render(
        <ModalActions actions={[...actions, action]} onActionClick={onActionClick} />,
      )
      const buttons = container.querySelectorAll('.button')

      fireEvent.click(buttons[buttons.length - 1])

      expect(onActionClick).toHaveBeenCalledOnce()
      expect(onActionClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ content: 'Disable' }),
      )
      expect(onButtonClick).toHaveBeenCalledOnce()
      expect(onButtonClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ content: 'Disable' }),
      )
    })
  })
})
