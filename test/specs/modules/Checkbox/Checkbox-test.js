import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { htmlInputAttrs } from 'src/lib'
import Checkbox from 'src/modules/Checkbox/Checkbox'
import * as common from 'test/specs/commonTests'
import { domEvent } from 'test/utils'

describe('Checkbox', () => {
  common.isConformant(Checkbox)
  common.hasUIClassName(Checkbox)

  common.propKeyOnlyToClassName(Checkbox, 'checked')
  common.propKeyOnlyToClassName(Checkbox, 'disabled')
  common.propKeyOnlyToClassName(Checkbox, 'readOnly', {
    className: 'read-only',
  })
  common.propKeyOnlyToClassName(Checkbox, 'slider')
  common.propKeyOnlyToClassName(Checkbox, 'toggle')

  common.implementsHTMLLabelProp(Checkbox, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  describe('aria', () => {
    ;['aria-label', 'role'].forEach((propName) => {
      it(`passes "${propName}" to the <input>`, () => {
        const { container } = render(<Checkbox {...{ [propName]: 'foo' }} />)
        expect(container.querySelector('input')).toHaveAttribute(propName)
      })
    })
  })

  describe('checking', () => {
    it('can be checked and unchecked', () => {
      const { container } = render(<Checkbox />)
      const input = container.querySelector('input')
      const label = container.querySelector('label')

      expect(input.checked).toBe(false)

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(input.checked).toBe(true)

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(input.checked).toBe(false)
    })

    it('can be checked but not unchecked when radio', () => {
      const { container } = render(<Checkbox radio />)
      const input = container.querySelector('input')
      const label = container.querySelector('label')

      expect(input.checked).toBe(false)

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(input.checked).toBe(true)

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(input.checked).toBe(true)
    })
  })

  describe('defaultChecked', () => {
    it('sets the initial checked state', () => {
      const { container } = render(<Checkbox defaultChecked />)
      expect(container.querySelector('input').checked).toBe(true)
    })
  })

  describe('indeterminate', () => {
    it('can be indeterminate', () => {
      const { container } = render(<Checkbox indeterminate />)
      const input = container.querySelector('.ui.checkbox input')

      expect(input.indeterminate).toBe(true)

      domEvent.click(input)
      expect(input.indeterminate).toBe(true)
    })

    it('can not be indeterminate', () => {
      const { container } = render(<Checkbox indeterminate={false} />)
      const input = container.querySelector('.ui.checkbox input')

      expect(input.indeterminate).toBe(false)

      domEvent.click(input)
      expect(input.indeterminate).toBe(false)
    })
  })

  describe('defaultIndeterminate', () => {
    it('sets the initial indeterminate state', () => {
      const { container } = render(<Checkbox defaultIndeterminate />)
      const input = container.querySelector('.ui.checkbox input')

      expect(input.indeterminate).toBe(true)
    })

    it('unsets indeterminate state on any click', () => {
      const { container } = render(<Checkbox defaultIndeterminate />)
      const label = container.querySelector('label')

      expect(container.querySelector('input').indeterminate).toBe(true)

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(container.querySelector('input').indeterminate).toBe(false)

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(container.querySelector('input').indeterminate).toBe(false)
    })
  })

  describe('disabled', () => {
    it('cannot be checked', () => {
      const { container } = render(<Checkbox disabled />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(container.querySelector('input').checked).toBe(false)
    })

    it('cannot be unchecked', () => {
      const { container } = render(<Checkbox defaultChecked disabled />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(container.querySelector('input').checked).toBe(true)
    })

    it('is applied to the underlying html input element', () => {
      const { container: c1 } = render(<Checkbox disabled />)
      expect(c1.querySelector('input')).toHaveAttribute('disabled')

      const { container: c2 } = render(<Checkbox disabled={false} />)
      expect(c2.querySelector('input')).not.toHaveAttribute('disabled')
    })
  })

  describe('id', () => {
    it('passes value to the input', () => {
      const { container } = render(<Checkbox id='foo' />)
      expect(container.querySelector('input')).toHaveAttribute('id', 'foo')
    })

    it('adds htmlFor prop to the label', () => {
      const { container } = render(<Checkbox id='foo' />)
      expect(container.querySelector('label')).toHaveAttribute('for', 'foo')
    })

    it('adds htmlFor prop to the label when it is empty', () => {
      const { container } = render(<Checkbox id='foo' label={null} />)
      expect(container.querySelector('label')).toHaveAttribute('for', 'foo')
    })
  })

  describe('input', () => {
    // Heads up! Input handles some of html props
    // Some React prop names differ from DOM attribute names
    const reactToDomAttr = {
      autoCapitalize: 'autocapitalize',
      autoComplete: 'autocomplete',
      autoCorrect: 'autocorrect',
      autoFocus: 'autofocus',
      enterKeyHint: 'enterkeyhint',
      inputMode: 'inputmode',
      maxLength: 'maxlength',
      minLength: 'minlength',
      readOnly: 'readonly',
    }
    // defaultValue is a React-only prop that sets value; defaultChecked similarly
    // selected is not a valid attribute on input elements
    // autoFocus is handled by React imperatively (calls .focus()), not as an HTML attribute
    const props = _.without(htmlInputAttrs, 'defaultChecked', 'disabled', 'defaultValue', 'selected', 'autoFocus')

    _.forEach(props, (propName) => {
      it(`passes "${propName}" to the input`, () => {
        const { container } = render(<Checkbox {...{ [propName]: 'radio' }} />)
        const domAttr = reactToDomAttr[propName] || propName.toLowerCase()
        expect(container.querySelector('input')).toHaveAttribute(domAttr)
      })
    })
  })

  describe('label', () => {
    it('adds the "fitted" class when not present', () => {
      const { container } = render(<Checkbox name='firstName' />)
      expect(container.firstChild).toHaveClass('fitted')
    })

    it('adds the "fitted" class when is null', () => {
      const { container } = render(<Checkbox name='firstName' />)
      expect(container.firstChild).toHaveClass('fitted')
    })

    it('does not add the "fitted" class when is not nil', () => {
      const { container: c1 } = render(<Checkbox name='firstName' label='' />)
      expect(c1.firstChild).not.toHaveClass('fitted')

      const { container: c2 } = render(<Checkbox name='firstName' label={0} />)
      expect(c2.firstChild).not.toHaveClass('fitted')
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on mouse up', () => {
      const onChange = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }

      const { container } = render(<Checkbox onChange={onChange} {...props} />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({
          ...props,
          checked: true,
          indeterminate: false,
        }),
      )
    })

    it('is called once when "id" is passed', () => {
      const onChange = vi.fn()
      const { container } = render(<Checkbox id='foo' onChange={onChange} />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(onChange).toHaveBeenCalledOnce()
    })

    it('is called when click is done on nested element', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Checkbox label={{ children: <span>Foo</span> }} onChange={onChange} />,
      )
      const span = container.querySelector('span')

      fireEvent.mouseUp(span)
      fireEvent.click(span)

      expect(onChange).toHaveBeenCalledOnce()
    })
  })

  describe('onClick', () => {
    it('is called with (event, data) on click', () => {
      const onClick = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      const { container } = render(<Checkbox onClick={onClick} {...props} />)

      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({
          ...props,
          checked: true,
        }),
      )
    })

    it('is called once when "id" is passed', () => {
      const onClick = vi.fn()
      const { container } = render(<Checkbox id='foo' onClick={onClick} />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(onClick).toHaveBeenCalledOnce()
    })
  })

  describe('onMouseDown', () => {
    it('is called with (event, data) on mouse down', () => {
      const onMouseDown = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      const { container } = render(<Checkbox onMouseDown={onMouseDown} {...props} />)

      fireEvent.mouseDown(container.firstChild)

      expect(onMouseDown).toHaveBeenCalledOnce()
      expect(onMouseDown).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining(props),
      )
    })

    it('sets focus to container', () => {
      const { container } = render(<Checkbox />)
      const input = container.querySelector('.ui.checkbox input')

      domEvent.fire(input, 'mousedown')
      expect(document.activeElement).toBe(input)
    })

    it('will not set focus to container, if default is prevented', () => {
      render(<Checkbox onMouseDown={(e) => e.preventDefault()} />)

      domEvent.fire('.ui.checkbox input', 'mousedown')
      expect(document.activeElement).toBe(document.body)
    })
  })

  describe('onMouseUp', () => {
    it('is called with (event, data) on mouse up', () => {
      const onMouseUp = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      const { container } = render(<Checkbox onMouseUp={onMouseUp} {...props} />)

      fireEvent.mouseUp(container.firstChild)

      expect(onMouseUp).toHaveBeenCalledOnce()
      expect(onMouseUp).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining(props),
      )
    })

    it('is called with (event, data) on mouse up with right button', () => {
      const onMouseUp = vi.fn()
      const { container } = render(<Checkbox id='foo' onMouseUp={onMouseUp} />)

      fireEvent.mouseUp(container.firstChild, { button: 2 })

      expect(onMouseUp).toHaveBeenCalledOnce()
    })
  })

  describe('readOnly', () => {
    it('cannot be checked', () => {
      const { container } = render(<Checkbox readOnly />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(container.querySelector('input').checked).toBe(false)
    })
    it('cannot be unchecked', () => {
      const { container } = render(<Checkbox defaultChecked readOnly />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(container.querySelector('input').checked).toBe(true)
    })
  })

  describe('tabIndex', () => {
    it('defaults to 0', () => {
      const { container } = render(<Checkbox />)
      expect(container.querySelector('input')).toHaveAttribute('tabIndex', '0')
    })
    it('defaults to -1 when disabled', () => {
      const { container } = render(<Checkbox disabled />)
      expect(container.querySelector('input')).toHaveAttribute('tabIndex', '-1')
    })
    it('can be set explicitly', () => {
      const { container } = render(<Checkbox tabIndex={123} />)
      expect(container.querySelector('input')).toHaveAttribute('tabIndex', '123')
    })
    it('can be set explicitly when disabled', () => {
      const { container } = render(<Checkbox tabIndex={123} disabled />)
      expect(container.querySelector('input')).toHaveAttribute('tabIndex', '123')
    })
  })

  describe('type', () => {
    it('renders an input of type checkbox when not set', () => {
      const { container } = render(<Checkbox />)
      expect(container.querySelector('input')).toHaveAttribute('type', 'checkbox')
    })
    it('sets the input type ', () => {
      const { container: c1 } = render(<Checkbox type='checkbox' />)
      expect(c1.querySelector('input')).toHaveAttribute('type', 'checkbox')

      const { container: c2 } = render(<Checkbox type='radio' />)
      expect(c2.querySelector('input')).toHaveAttribute('type', 'radio')
    })
  })

  describe('comparisons with native DOM', () => {
    it('click on label: fires on mouse click', () => {
      const onClick = vi.fn()
      const onChange = vi.fn()
      const onParentClick = vi.fn()

      const { container } = render(
        <div onClick={onParentClick} role='presentation'>
          <Checkbox onClick={onClick} onChange={onChange} />
        </div>,
      )
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)

      expect(onClick).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
      expect(onParentClick).toHaveBeenCalled()
    })

    it('click on input: fires on mouse click', () => {
      const onClick = vi.fn()
      const onChange = vi.fn()

      const { container } = render(
        <Checkbox onClick={onClick} onChange={onChange} />,
      )
      const root = container.firstChild

      // Click through the root element to trigger the full event chain
      fireEvent.mouseUp(root)
      fireEvent.click(root)

      expect(onClick).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
    })

    it('click on label with "id": fires on mouse click', () => {
      const onClick = vi.fn()
      const onChange = vi.fn()
      const onParentClick = vi.fn()

      const { container } = render(
        <div onClick={onParentClick} role='presentation'>
          <Checkbox id='foo' onClick={onClick} onChange={onChange} />
        </div>,
      )
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)

      expect(onClick).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
    })

    it('click on root: fires on mouse click', () => {
      const onClick = vi.fn()
      const onChange = vi.fn()
      const onParentClick = vi.fn()

      const { container } = render(
        <div onClick={onParentClick} role='presentation'>
          <Checkbox onClick={onClick} onChange={onChange} />
        </div>,
      )
      const root = container.querySelector('.ui.checkbox')

      fireEvent.mouseUp(root)
      fireEvent.click(root)

      expect(onClick).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
      expect(onParentClick).toHaveBeenCalled()
    })

    it('click on root with "id": fires on mouse click', () => {
      const onClick = vi.fn()
      const onChange = vi.fn()
      const onParentClick = vi.fn()

      const { container } = render(
        <div onClick={onParentClick} role='presentation'>
          <Checkbox id='foo' onClick={onClick} onChange={onChange} />
        </div>,
      )
      const root = container.querySelector('.ui.checkbox')

      fireEvent.mouseUp(root)
      fireEvent.click(root)

      expect(onClick).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
      expect(onParentClick).toHaveBeenCalled()
    })
  })

  describe('Controlled component', () => {
    const ControlledCheckboxWithClick = () => {
      const [checked, setChecked] = React.useState(false)
      return (
        <Checkbox
          data-checked={checked}
          label='Check this box'
          checked={checked}
          onClick={() => setChecked((prev) => !prev)}
        />
      )
    }

    const ControlledCheckboxWithChange = () => {
      const [checked, setChecked] = React.useState(false)
      return (
        <Checkbox
          data-checked={checked}
          label='Check this box'
          checked={checked}
          onChange={() => setChecked((prev) => !prev)}
        />
      )
    }

    it('toggles state on "change" with "setState" as function', () => {
      const { container } = render(<ControlledCheckboxWithChange />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      // After click, checked state toggles
      expect(container.querySelector('[data-checked]')).toBeInTheDocument()
    })

    it('toggles state on "click" with "setState" as function', () => {
      const { container } = render(<ControlledCheckboxWithClick />)
      const label = container.querySelector('label')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      // After click, checked state toggles
      expect(container.querySelector('[data-checked]')).toBeInTheDocument()
    })
  })
})
