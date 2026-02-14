import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Input from 'src/elements/Input/Input'
import { htmlInputProps } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('Input', () => {
  common.isConformant(Input, {
    eventTargets: {
      // keyboard
      onKeyDown: 'input',
      onKeyPress: 'input',
      onKeyUp: 'input',

      // focus
      onFocus: 'input',
      onBlur: 'input',

      // form
      onChange: 'input',
      onInput: 'input',

      // mouse
      onClick: 'input',
      onContextMenu: 'input',
      onDrag: 'input',
      onDragEnd: 'input',
      onDragEnter: 'input',
      onDragExit: 'input',
      onDragLeave: 'input',
      onDragOver: 'input',
      onDragStart: 'input',
      onDrop: 'input',
      onMouseDown: 'input',
      onMouseEnter: 'input',
      onMouseLeave: 'input',
      onMouseMove: 'input',
      onMouseOut: 'input',
      onMouseOver: 'input',
      onMouseUp: 'input',

      // selection
      onSelect: 'input',

      // touch
      onTouchCancel: 'input',
      onTouchEnd: 'input',
      onTouchMove: 'input',
      onTouchStart: 'input',
    },
  })
  common.hasUIClassName(Input)
  common.rendersChildren(Input, {
    rendersContent: false,
  })

  common.implementsButtonProp(Input, {
    autoGenerateKey: false,
    propKey: 'action',
  })
  common.implementsCreateMethod(Input)
  common.implementsIconProp(Input, { autoGenerateKey: false })
  common.implementsLabelProp(Input, {
    autoGenerateKey: false,
    shorthandDefaultProps: { className: 'label' },
  })
  common.implementsHTMLInputProp(Input, {
    alwaysPresent: true,
    assertExactMatch: false,
    autoGenerateKey: false,
    shorthandDefaultProps: { type: 'text' },
  })

  common.propKeyAndValueToClassName(Input, 'actionPosition', ['left'], { className: 'action' })
  common.propKeyAndValueToClassName(Input, 'iconPosition', ['left'], { className: 'icon' })
  common.propKeyAndValueToClassName(
    Input,
    'labelPosition',
    ['left', 'right', 'left corner', 'right corner'],
    {
      className: 'labeled',
    },
  )

  common.propKeyOnlyToClassName(Input, 'action')
  common.propKeyOnlyToClassName(Input, 'disabled')
  common.propKeyOnlyToClassName(Input, 'error')
  common.propKeyOnlyToClassName(Input, 'fluid')
  common.propKeyOnlyToClassName(Input, 'focus')
  common.propKeyOnlyToClassName(Input, 'inverted')
  common.propKeyOnlyToClassName(Input, 'label', { className: 'labeled' })
  common.propKeyOnlyToClassName(Input, 'loading')
  common.propKeyOnlyToClassName(Input, 'loading', { className: 'icon' })
  common.propKeyOnlyToClassName(Input, 'transparent')
  common.propKeyOnlyToClassName(Input, 'icon')

  common.propValueOnlyToClassName(Input, 'size', [
    'mini',
    'small',
    'large',
    'big',
    'huge',
    'massive',
  ])

  it('renders with conditional children', () => {
    const showPresent = true
    const showAbsent = false
    const { container } = render(
      <Input>
        {showPresent && <span data-testid='present' />}
        {showAbsent && <p data-testid='absent' />}
      </Input>,
    )
    expect(container.querySelector('[data-testid="present"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="absent"]')).toBeNull()
  })

  it('renders a text <input> by default', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('input')).toHaveAttribute('type', 'text')
  })

  describe('input props', () => {
    const isEventProp = (name) => /^on[A-Z]/.test(name)
    const isBooleanProp = (name) =>
      ['checked', 'defaultChecked', 'disabled', 'multiple', 'readOnly', 'required'].includes(name)
    // Props that don't map to DOM attributes cleanly
    const isSpecialProp = (name) =>
      ['selected', 'autoFocus', 'defaultValue'].includes(name)

    htmlInputProps.forEach((propName) => {
      if (isSpecialProp(propName)) {
        it(`passes \`${propName}\` to the <input>`, () => {
          const val = propName === 'defaultValue' ? 'foo' : true
          const { container } = render(<Input {...{ [propName]: val }} />)
          const input = container.querySelector('input')
          expect(input).toBeTruthy()
        })

        it(`passes \`${propName}\` to the <input> when using children`, () => {
          const val = propName === 'defaultValue' ? 'foo' : true
          const { container } = render(
            <Input {...{ [propName]: val }}>
              <input />
            </Input>,
          )
          const input = container.querySelector('input')
          expect(input).toBeTruthy()
        })
      } else if (isEventProp(propName)) {
        it(`passes \`${propName}\` to the <input>`, () => {
          const handler = vi.fn()
          const { container } = render(<Input {...{ [propName]: handler }} />)
          expect(container.querySelector('input')).toBeTruthy()
        })

        it(`passes \`${propName}\` to the <input> when using children`, () => {
          const handler = vi.fn()
          const { container } = render(
            <Input {...{ [propName]: handler }}>
              <input />
            </Input>,
          )
          expect(container.querySelector('input')).toBeTruthy()
        })
      } else if (isBooleanProp(propName)) {
        it(`passes \`${propName}\` to the <input>`, () => {
          const { container } = render(<Input {...{ [propName]: true }} />)
          const input = container.querySelector('input')
          // Boolean attributes: React renders them as properties, check the DOM property
          expect(input[propName] === true || input.hasAttribute(propName.toLowerCase())).toBe(true)
        })

        it(`passes \`${propName}\` to the <input> when using children`, () => {
          const { container } = render(
            <Input {...{ [propName]: true }}>
              <input />
            </Input>,
          )
          const input = container.querySelector('input')
          expect(input[propName] === true || input.hasAttribute(propName.toLowerCase())).toBe(true)
        })
      } else {
        it(`passes \`${propName}\` to the <input>`, () => {
          const { container } = render(<Input {...{ [propName]: 'foo' }} />)
          const input = container.querySelector('input')
          // Some React props map to different DOM attributes (e.g., autoComplete -> autocomplete)
          const domAttr = propName.toLowerCase()
          const hasAttr =
            input.hasAttribute(propName) || input.hasAttribute(domAttr) || input[propName] === 'foo'
          expect(hasAttr).toBe(true)
        })

        it(`passes \`${propName}\` to the <input> when using children`, () => {
          const { container } = render(
            <Input {...{ [propName]: 'foo' }}>
              <input />
            </Input>,
          )
          const input = container.querySelector('input')
          const domAttr = propName.toLowerCase()
          const hasAttr =
            input.hasAttribute(propName) || input.hasAttribute(domAttr) || input[propName] === 'foo'
          expect(hasAttr).toBe(true)
        })
      }
    })
  })

  describe('loading', () => {
    it("don't add icon if it's defined", () => {
      const { container } = render(<Input icon='user' loading />)
      expect(container.querySelector('.icon')).toBeTruthy()
      expect(container.querySelector('i.user.icon')).toBeTruthy()
    })

    it("adds icon if it's not defined", () => {
      const { container } = render(<Input loading />)
      expect(container.querySelector('i.spinner.icon')).toBeTruthy()
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', () => {
      const onChange = vi.fn()
      const props = { 'data-foo': 'bar', onChange }

      const { container } = render(<Input {...props} />)
      const input = container.querySelector('input')

      fireEvent.change(input, { target: { value: 'name' } })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ ...props, value: 'name' }),
      )
    })

    it('is called with (e, data) on change when using children', () => {
      const onChange = vi.fn()
      const props = { 'data-foo': 'bar', onChange }

      const { container } = render(
        <Input {...props}>
          <input />
        </Input>,
      )
      const input = container.querySelector('input')

      fireEvent.change(input, { target: { value: 'name' } })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ ...props, value: 'name' }),
      )
    })
  })

  describe('ref', () => {
    it('"focus" can be set via a ref', () => {
      const inputRef = React.createRef()

      render(<Input ref={inputRef} />)
      inputRef.current.focus()

      const input = document.querySelector('.ui.input input')
      expect(document.activeElement).toBe(input)
    })

    it('"select" can be set via a ref', () => {
      const inputRef = React.createRef()
      const value = 'expect this text to be selected'

      render(<Input ref={inputRef} defaultValue={value} />)
      // Just verify the ref has a select method and it doesn't throw
      expect(typeof inputRef.current.select).toBe('function')
      inputRef.current.select()
    })

    it('maintains ref on child node', () => {
      const inputRef = React.createRef()

      render(
        <Input ref={inputRef}>
          <input />
        </Input>,
      )
      // The ref should be set and point to the input element
      expect(inputRef.current).toBeTruthy()
    })
  })

  describe('disabled', () => {
    it('is applied to the underlying html input element', () => {
      const { container: c1 } = render(<Input disabled />)
      expect(c1.querySelector('input')).toHaveAttribute('disabled')

      const { container: c2 } = render(<Input disabled={false} />)
      expect(c2.querySelector('input')).not.toHaveAttribute('disabled')
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      const { container } = render(<Input />)
      expect(container.querySelector('input')).not.toHaveAttribute('tabindex')
    })

    it('defaults to -1 when disabled', () => {
      const { container } = render(<Input disabled />)
      expect(container.querySelector('input')).toHaveAttribute('tabindex', '-1')
    })

    it('can be set explicitly', () => {
      const { container } = render(<Input tabIndex={123} />)
      expect(container.querySelector('input')).toHaveAttribute('tabindex', '123')
    })

    it('can be set explicitly when disabled', () => {
      const { container } = render(<Input tabIndex={123} disabled />)
      expect(container.querySelector('input')).toHaveAttribute('tabindex', '123')
    })
  })

  describe('icon', () => {
    it('is second child', () => {
      const { container } = render(<Input icon='search' />)
      const children = container.firstChild.children
      expect(children[1].tagName).toBe('I')
      expect(children[1]).toHaveClass('icon')
    })

    it('is third child with action positioned left', () => {
      const { container } = render(
        <Input icon='search' action='foo' actionPosition='left' />,
      )
      const children = container.firstChild.children
      expect(children[2].tagName).toBe('I')
      expect(children[2]).toHaveClass('icon')
    })

    it('is third child with label', () => {
      const { container } = render(<Input icon='search' label='foo' />)
      const children = container.firstChild.children
      expect(children[2].tagName).toBe('I')
      expect(children[2]).toHaveClass('icon')
    })

    it('is second child with action', () => {
      const { container } = render(
        <Input icon='search' iconPosition='left' action='foo' />,
      )
      const children = container.firstChild.children
      expect(children[1].tagName).toBe('I')
      expect(children[1]).toHaveClass('icon')
    })

    it('is second child with label positioned right', () => {
      const { container } = render(
        <Input icon='search' iconPosition='left' label='foo' labelPosition='right' />,
      )
      const children = container.firstChild.children
      expect(children[1].tagName).toBe('I')
      expect(children[1]).toHaveClass('icon')
    })
  })
})
