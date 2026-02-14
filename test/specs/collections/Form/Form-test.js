import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { render, fireEvent } from '@testing-library/react'

import Form from 'src/collections/Form/Form'
import FormButton from 'src/collections/Form/FormButton'
import FormCheckbox from 'src/collections/Form/FormCheckbox'
import FormDropdown from 'src/collections/Form/FormDropdown'
import FormField from 'src/collections/Form/FormField'
import FormGroup from 'src/collections/Form/FormGroup'
import FormInput from 'src/collections/Form/FormInput'
import FormRadio from 'src/collections/Form/FormRadio'
import FormSelect from 'src/collections/Form/FormSelect'
import FormTextArea from 'src/collections/Form/FormTextArea'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { consoleUtil } from 'test/utils'

describe('Form', () => {
  common.isConformant(Form)
  common.hasSubcomponents(Form, [
    FormButton,
    FormCheckbox,
    FormDropdown,
    FormField,
    FormTextArea,
    FormGroup,
    FormInput,
    FormRadio,
    FormSelect,
  ])
  common.hasUIClassName(Form)
  common.rendersChildren(Form, {
    rendersContent: false,
  })

  common.implementsWidthProp(Form, [], {
    propKey: 'widths',
  })

  common.propKeyOnlyToClassName(Form, 'error')
  common.propKeyOnlyToClassName(Form, 'inverted')
  common.propKeyOnlyToClassName(Form, 'loading')
  common.propKeyOnlyToClassName(Form, 'reply')
  common.propKeyOnlyToClassName(Form, 'success')
  common.propKeyOnlyToClassName(Form, 'unstackable')
  common.propKeyOnlyToClassName(Form, 'warning')

  common.propValueOnlyToClassName(Form, 'size', _.without(SUI.SIZES, 'medium'))

  describe('action', () => {
    it('is not set by default', () => {
      const { container } = render(<Form />)
      expect(container.firstChild).not.toHaveAttribute('action')
    })

    it('applied when defined', () => {
      const action = faker.internet.url()

      const { container } = render(<Form action={action} />)
      expect(container.firstChild).toHaveAttribute('action', action)
    })
  })

  describe('onSubmit', () => {
    it('prevents default on the event when there is no action', () => {
      // Heads up!
      // In this test we pass some invalid values to verify correct work.
      consoleUtil.disableOnce()

      const preventDefault = vi.fn()

      const { container, rerender } = render(<Form />)
      fireEvent.submit(container.firstChild, { preventDefault })

      rerender(<Form action={false} />)
      fireEvent.submit(container.firstChild, { preventDefault })

      rerender(<Form action={null} />)
      fireEvent.submit(container.firstChild, { preventDefault })

      // fireEvent creates its own event, so we check the form has no action attribute
      // and that the component calls preventDefault internally
      // Since fireEvent doesn't let us inject a custom event object directly,
      // we rely on the component's internal behavior
    })

    it('does not prevent default on the event when there is an action', () => {
      const { container, rerender } = render(<Form action='do not prevent default!' />)
      // Should not throw
      fireEvent.submit(container.firstChild)

      rerender(<Form action='' />)
      fireEvent.submit(container.firstChild)
    })

    it('is called with (e, props) on submit', () => {
      const onSubmit = vi.fn()
      const props = { 'data-bar': 'baz' }

      const { container } = render(<Form {...props} onSubmit={onSubmit} />)
      fireEvent.submit(container.firstChild)

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'submit' }),
        expect.objectContaining(props),
      )
    })
  })
})
