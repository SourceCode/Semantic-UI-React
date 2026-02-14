import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'

import Radio from 'src/addons/Radio/Radio'
import FormField from 'src/collections/Form/FormField'
import { SUI } from 'src/lib'
import Button from 'src/elements/Button/Button'
import Checkbox from 'src/modules/Checkbox/Checkbox'
import * as common from 'test/specs/commonTests'

describe('FormField', () => {
  common.isConformant(FormField)
  common.rendersChildren(FormField)

  common.implementsHTMLLabelProp(FormField, { autoGenerateKey: false })
  common.implementsWidthProp(FormField, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'width',
  })

  common.propKeyOnlyToClassName(FormField, 'disabled')
  common.propKeyOnlyToClassName(FormField, 'error')
  common.propKeyOnlyToClassName(FormField, 'inline')
  common.propKeyOnlyToClassName(FormField, 'required', {
    requiredProps: { label: '' },
  })

  describe('control', () => {
    it('adds an HTML element child of the same type', () => {
      const controls = ['button', 'input', 'select', 'textarea']

      controls.forEach((control) => {
        const { container } = render(<FormField control={control} />)
        expect(container.querySelector(control)).toBeInTheDocument()
      })
    })
  })

  describe('error', () => {
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { label: faker.lorem.word() },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: 'radio' },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: Checkbox },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: 'input' },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })

    it('positioned in DOM according to passed "pointing" prop', () => {
      ;[
        { pointing: 'below', inDom: 'before' },
        { pointing: 'right', inDom: 'before' },
        { pointing: 'left', inDom: 'after' },
        { pointing: 'above', inDom: 'after' },
      ].forEach(({ pointing, inDom }) => {
        const { container } = render(
          <FormField
            control='input'
            error={{ content: faker.lorem.word(), pointing }}
            type='text'
          />,
        )

        const field = container.firstChild
        const labelEl = field.querySelector('.ui.label')
        const inputEl = field.querySelector('input')

        if (inDom === 'before') {
          // Label should appear before input in DOM
          expect(
            Array.from(field.children).indexOf(labelEl) <
              Array.from(field.children).indexOf(inputEl),
          ).toBe(true)
        } else {
          // Label should appear after input in DOM
          expect(
            Array.from(field.children).indexOf(labelEl) >
              Array.from(field.children).indexOf(inputEl),
          ).toBe(true)
        }
      })
    })
  })

  describe('label', () => {
    it('wraps html checkbox inputs', () => {
      const text = faker.hacker.phrase()
      const { container } = render(
        <FormField control='input' label={text} type='checkbox' />,
      )
      const label = container.querySelector('label')

      expect(label.querySelector('input')).toBeInTheDocument()
      expect(label).toHaveTextContent(text)
    })

    it('wraps html radio inputs', () => {
      const text = faker.hacker.phrase()
      const { container } = render(
        <FormField control='input' label={text} type='radio' />,
      )
      const label = container.querySelector('label')

      expect(label.querySelector('input')).toBeInTheDocument()
      expect(label).toHaveTextContent(text)
    })

    it('is passed to Checkbox controls', () => {
      const text = faker.hacker.phrase()

      const { container } = render(<FormField control={Checkbox} label={text} />)
      expect(container.querySelector('label')).toHaveTextContent(text)
    })

    it('is passed to Radio controls', () => {
      const text = faker.hacker.phrase()

      const { container } = render(<FormField control={Radio} label={text} />)
      expect(container.querySelector('label')).toHaveTextContent(text)
    })

    it('is sibling to text inputs', () => {
      const text = faker.hacker.phrase()
      const { container } = render(
        <FormField control='input' label={text} type='text' />,
      )

      const field = container.firstChild
      expect(field.children[0].tagName).toBe('LABEL')
      expect(field.children[0]).toHaveTextContent(text)
      expect(field.children[1].tagName).toBe('INPUT')
    })
  })

  describe('disabled', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control='input' />)
      const input = container.querySelector('input')

      expect(input).toBeInTheDocument()
      expect(input).not.toBeDisabled()
    })
    it('is passed to the control', () => {
      const { container } = render(<FormField control='input' disabled />)
      const input = container.querySelector('input')

      expect(input).toBeInTheDocument()
      expect(input).toBeDisabled()
    })
  })

  describe('required', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control='input' />)
      const input = container.querySelector('input')

      expect(input).toBeInTheDocument()
      expect(input).not.toBeRequired()
    })
    it('is passed to the control', () => {
      const { container } = render(<FormField control='input' required />)
      const input = container.querySelector('input')

      expect(input).toBeInTheDocument()
      expect(input).toBeRequired()
    })
  })

  describe('content', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control={Button} />)
      const button = container.querySelector('button')

      expect(button).toBeInTheDocument()
    })
    it('is passed to the control', () => {
      const { container } = render(<FormField control={Button} content='Click Me' />)
      const button = container.querySelector('button')

      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click Me')
    })
  })

  describe('id', () => {
    it('is set when content is provided', () => {
      const { container } = render(<FormField content='content' id='testId' />)
      expect(container.firstChild).toHaveAttribute('id', 'testId')
    })
    it('is set when have child elements', () => {
      const { container } = render(
        <FormField id='testId'>
          <input />
        </FormField>,
      )
      expect(container.firstChild).toHaveAttribute('id', 'testId')
    })
  })

  describe('aria-invalid', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control='input' />)
      expect(container.querySelector('input')).not.toHaveAttribute('aria-invalid')
    })
    it('is not set when error is false', () => {
      const { container } = render(<FormField control='input' error={false} />)
      expect(container.querySelector('input')).not.toHaveAttribute('aria-invalid')
    })
    it('is set when error is true', () => {
      const { container } = render(<FormField control='input' error />)
      expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true')
    })
    it('is is set when error object is provided', () => {
      const { container } = render(
        <FormField
          control='input'
          error={{
            content: 'Error message',
            pointing: 'left',
          }}
        />,
      )
      expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
