import { render, fireEvent } from '@testing-library/react'

import Button from 'src/elements/Button/Button'
import ButtonContent from 'src/elements/Button/ButtonContent'
import ButtonGroup from 'src/elements/Button/ButtonGroup'
import ButtonOr from 'src/elements/Button/ButtonOr'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'

describe('Button', () => {
  common.isConformant(Button)
  common.hasSubcomponents(Button, [ButtonContent, ButtonGroup, ButtonOr])
  common.hasUIClassName(Button)
  common.rendersChildren(Button)

  common.implementsCreateMethod(Button)
  common.implementsIconProp(Button, { autoGenerateKey: false })
  common.implementsLabelProp(Button, {
    autoGenerateKey: false,
    shorthandDefaultProps: {
      basic: true,
      pointing: 'left',
    },
  })

  common.propKeyAndValueToClassName(Button, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Button, 'active')
  common.propKeyOnlyToClassName(Button, 'basic')
  common.propKeyOnlyToClassName(Button, 'circular')
  common.propKeyOnlyToClassName(Button, 'compact')
  common.propKeyOnlyToClassName(Button, 'disabled')
  common.propKeyOnlyToClassName(Button, 'fluid')
  common.propKeyOnlyToClassName(Button, 'inverted')
  common.propKeyOnlyToClassName(Button, 'loading')
  common.propKeyOnlyToClassName(Button, 'primary')
  common.propKeyOnlyToClassName(Button, 'negative')
  common.propKeyOnlyToClassName(Button, 'positive')
  common.propKeyOnlyToClassName(Button, 'secondary')

  common.propKeyOrValueAndKeyToClassName(Button, 'animated', ['fade', 'vertical'])
  common.propKeyOrValueAndKeyToClassName(Button, 'attached', ['left', 'right', 'top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Button, 'labelPosition', ['right', 'left'], {
    className: 'labeled',
  })

  common.propValueOnlyToClassName(Button, 'color', [
    ...SUI.COLORS,
    'facebook',
    'twitter',
    'google plus',
    'vk',
    'linkedin',
    'instagram',
    'youtube',
  ])
  common.propValueOnlyToClassName(Button, 'size', SUI.SIZES)

  it('renders a button by default', () => {
    const { container } = render(<Button />)
    expect(container.firstChild.tagName).toBe('BUTTON')
  })

  describe('attached', () => {
    it('renders a div', () => {
      const { container } = render(<Button attached />)
      expect(container.firstChild.tagName).toBe('DIV')
    })
  })

  describe('disabled', () => {
    it('is not set by default', () => {
      const { container } = render(<Button />)
      expect(container.querySelector('button')).not.toHaveAttribute('disabled')
    })

    it('applied when defined', () => {
      const { container } = render(<Button disabled />)
      expect(container.querySelector('button')).toHaveAttribute('disabled')
    })

    it("don't apply when the element's type isn't button", () => {
      const { container } = render(<Button as='div' disabled />)
      expect(container.firstChild).not.toHaveAttribute('disabled')
    })

    it('is not set by default when has a label', () => {
      const { container } = render(<Button label='foo' />)
      expect(container.querySelector('button')).not.toHaveAttribute('disabled')
    })

    it('applied when defined and has a label', () => {
      const { container } = render(<Button disabled label='foo' />)
      expect(container.querySelector('button')).toHaveAttribute('disabled')
    })
  })

  describe('toggle', () => {
    it('is not set by default', () => {
      const { container } = render(<Button />)
      expect(container.querySelector('button')).not.toHaveAttribute('toggle')
    })

    it('should have aria-pressed', () => {
      const { container } = render(<Button toggle />)
      expect(container.querySelector('button')).toHaveAttribute('aria-pressed')
    })

    it('aria-pressed should be true when active', () => {
      const { container } = render(<Button toggle active />)
      expect(container.querySelector('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('aria-pressed should be false when inactive', () => {
      const { container } = render(<Button toggle />)
      expect(container.querySelector('button')).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('icon', () => {
    it('adds className icon', () => {
      const { container } = render(<Button icon='user' />)
      expect(container.firstChild).toHaveClass('icon')
    })

    it('adds className icon when true', () => {
      const { container } = render(<Button icon />)
      expect(container.firstChild).toHaveClass('icon')
    })

    it('does not add className icon when there is content', () => {
      const { container: c1 } = render(<Button icon='user' content={0} />)
      expect(c1.firstChild).not.toHaveClass('icon')

      const { container: c2 } = render(<Button icon='user' content='Yo' />)
      expect(c2.firstChild).not.toHaveClass('icon')
    })

    it('adds className icon given labelPosition and content', () => {
      const { container: c1 } = render(
        <Button labelPosition='left' icon='user' content='My Account' />,
      )
      expect(c1.firstChild).toHaveClass('icon')

      const { container: c2 } = render(
        <Button labelPosition='right' icon='user' content='My Account' />,
      )
      expect(c2.firstChild).toHaveClass('icon')
    })
  })

  describe('label', () => {
    it('renders as a div', () => {
      const { container } = render(<Button label='http' />)
      expect(container.firstChild.tagName).toBe('DIV')
    })

    it('renders a div with a button and Label child', () => {
      const { container } = render(<Button label='hi' />)

      expect(container.firstChild.tagName).toBe('DIV')
      expect(container.querySelectorAll('button')).toHaveLength(1)
      expect(container.querySelectorAll('.label')).toHaveLength(1)
    })

    it('adds the labeled className to the root element', () => {
      const { container } = render(<Button label='hi' />)
      expect(container.firstChild).toHaveClass('labeled')
    })

    it('contains children without disabled class when disabled attribute is set', () => {
      const { container } = render(<Button label='hi' disabled />)

      expect(container.firstChild).toHaveClass('disabled')
      expect(container.querySelector('.label')).not.toHaveClass('disabled')
      expect(container.querySelector('button')).not.toHaveClass('disabled')
    })

    it('contains children without floated class when floated attribute is set', () => {
      const { container } = render(<Button label='hi' floated='left' />)

      expect(container.firstChild).toHaveClass('floated')
      expect(container.querySelector('.label')).not.toHaveClass('floated')
      expect(container.querySelector('button')).not.toHaveClass('floated')
    })

    it('creates a basic pointing label', () => {
      const { container } = render(<Button label='foo' />)
      expect(container.querySelectorAll('.label.basic.pointing')).toHaveLength(1)
    })

    it('is before the button and pointing="right" when labelPosition="left"', () => {
      const { container } = render(<Button labelPosition='left' label='foo' />)

      expect(container.querySelectorAll('.label.pointing.right')).toHaveLength(1)

      expect(container.firstChild.children[0]).toHaveClass('label')
      expect(container.firstChild.children[1].tagName).toBe('BUTTON')
    })

    it('is after the button and pointing="left" when labelPosition="right"', () => {
      const { container } = render(<Button labelPosition='right' label='foo' />)

      expect(container.querySelectorAll('.label.pointing.left')).toHaveLength(1)

      expect(container.firstChild.children[0].tagName).toBe('BUTTON')
      expect(container.firstChild.children[1]).toHaveClass('label')
    })

    it('is after the button and pointing="left" by default', () => {
      const { container } = render(<Button label='foo' />)

      expect(container.querySelectorAll('.label.pointing.left')).toHaveLength(1)

      expect(container.firstChild.children[0].tagName).toBe('BUTTON')
      expect(container.firstChild.children[1]).toHaveClass('label')
    })
  })

  describe('labelPosition', () => {
    it('renders as a button when given an icon', () => {
      const { container: c1 } = render(<Button labelPosition='left' icon='user' />)
      expect(c1.firstChild.tagName).toBe('BUTTON')

      const { container: c2 } = render(<Button labelPosition='right' icon='user' />)
      expect(c2.firstChild.tagName).toBe('BUTTON')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const { container } = render(<Button onClick={onClick} />)

      fireEvent.click(container.querySelector('button'))

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ onClick }),
      )
    })

    it('is not called when is disabled', () => {
      const onClick = vi.fn()
      const { container } = render(<Button disabled onClick={onClick} />)

      fireEvent.click(container.querySelector('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('role', () => {
    it('is not set by default', () => {
      const { container } = render(<Button />)
      expect(container.querySelector('button')).not.toHaveAttribute('role')
    })
    it('defaults to "button" when rendered as not "button" element', () => {
      const { container } = render(<Button as='label' />)
      expect(container.firstChild).toHaveAttribute('role', 'button')
    })
    it('is configurable', () => {
      const { container: c1 } = render(<Button role='link' />)
      expect(c1.querySelector('button')).toHaveAttribute('role', 'link')

      const { container: c2 } = render(<Button role='button' />)
      expect(c2.querySelector('button')).toHaveAttribute('role', 'button')
    })
  })

  describe('type', () => {
    it('is not set by default', () => {
      const { container } = render(<Button />)
      expect(container.querySelector('button')).not.toHaveAttribute('type')
    })

    it('is passed to <button />', () => {
      const { container } = render(<Button type='submit' />)
      expect(container.querySelector('button')).toHaveAttribute('type', 'submit')
    })

    it('is passed to <button /> when "label" is defined', () => {
      const { container } = render(<Button label='Foo' type='submit' />)
      expect(container.querySelector('button')).toHaveAttribute('type', 'submit')
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      const { container } = render(<Button />)
      expect(container.querySelector('button')).not.toHaveAttribute('tabindex')
    })
    it('defaults to 0 as div', () => {
      const { container } = render(<Button as='div' />)
      expect(container.firstChild).toHaveAttribute('tabindex', '0')
    })
    it('defaults to -1 when disabled', () => {
      const { container } = render(<Button disabled />)
      expect(container.querySelector('button')).toHaveAttribute('tabindex', '-1')
    })
    it('can be set explicitly', () => {
      const { container } = render(<Button tabIndex={123} />)
      expect(container.querySelector('button')).toHaveAttribute('tabindex', '123')
    })
    it('can be set explicitly when disabled', () => {
      const { container } = render(<Button tabIndex={123} disabled />)
      expect(container.querySelector('button')).toHaveAttribute('tabindex', '123')
    })
  })
})
