import _ from 'lodash'
import { render, fireEvent } from '@testing-library/react'

import Label from 'src/elements/Label/Label'
import LabelDetail from 'src/elements/Label/LabelDetail'
import LabelGroup from 'src/elements/Label/LabelGroup'
import * as common from 'test/specs/commonTests'
import { SUI } from 'src/lib'

describe('Label', () => {
  common.isConformant(Label)
  common.hasSubcomponents(Label, [LabelDetail, LabelGroup])
  common.hasUIClassName(Label)
  common.rendersChildren(Label)

  common.implementsCreateMethod(Label)
  common.implementsIconProp(Label, { autoGenerateKey: false })
  common.implementsImageProp(Label, { autoGenerateKey: false })
  common.implementsShorthandProp(Label, {
    autoGenerateKey: false,
    propKey: 'detail',
    ShorthandComponent: LabelDetail,
    mapValueToProps: (val) => ({ content: val }),
  })

  common.propKeyAndValueToClassName(Label, 'attached', [
    'top',
    'bottom',
    'top right',
    'top left',
    'bottom left',
    'bottom right',
  ])

  common.propKeyOnlyToClassName(Label, 'active')
  common.propKeyOnlyToClassName(Label, 'basic')
  common.propKeyOnlyToClassName(Label, 'circular')
  common.propKeyOnlyToClassName(Label, 'empty')
  common.propKeyOnlyToClassName(Label, 'floating')
  common.propKeyOnlyToClassName(Label, 'horizontal')
  common.propKeyOnlyToClassName(Label, 'prompt')
  common.propKeyOnlyToClassName(Label, 'tag')

  common.propKeyOrValueAndKeyToClassName(Label, 'corner', ['left', 'right'])
  common.propKeyOrValueAndKeyToClassName(Label, 'ribbon', ['right'])

  common.propValueOnlyToClassName(Label, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Label, 'size', SUI.SIZES)

  it('is a div by default', () => {
    const { container } = render(<Label />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  describe('removeIcon', () => {
    it('has no icon without onRemove', () => {
      const { container } = render(<Label />)
      expect(container.querySelector('i.icon')).toBeNull()
    })

    it('has delete icon by default', () => {
      const { container } = render(<Label onRemove={_.noop} />)
      expect(container.querySelector('i.icon')).toHaveClass('delete')
    })

    it('uses passed removeIcon string', () => {
      const { container } = render(<Label onRemove={_.noop} removeIcon='foo' />)
      expect(container.querySelector('i.icon')).toHaveClass('foo')
    })

    it('uses passed removeIcon props', () => {
      const { container } = render(
        <Label onRemove={_.noop} removeIcon={{ 'data-foo': true }} />,
      )
      expect(container.querySelector('i.icon')).toHaveAttribute('data-foo', 'true')
    })

    it('handles events on Label and Icon', () => {
      const iconSpy = vi.fn()
      const labelSpy = vi.fn()

      const iconProps = { 'data-foo': true, onClick: iconSpy }
      const labelProps = { onRemove: labelSpy, removeIcon: iconProps }

      const { container } = render(<Label {...labelProps} />)

      fireEvent.click(container.querySelector('i.icon'))

      expect(iconSpy).toHaveBeenCalledOnce()
      expect(labelSpy).toHaveBeenCalledOnce()
      expect(labelSpy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining(labelProps),
      )
    })
  })

  describe('image', () => {
    it('adds an image class when true', () => {
      const { container } = render(<Label image />)
      expect(container.firstChild).toHaveClass('image')
    })
    it('does not add an Image when true', () => {
      const { container } = render(<Label image />)
      expect(container.querySelector('img')).toBeNull()
    })
  })

  describe('onClick', () => {
    it('is called with (e) when clicked', () => {
      const onClick = vi.fn()

      const { container } = render(<Label onClick={onClick} />)

      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      const [event, data] = onClick.mock.calls[0]
      expect(event).toBeTruthy()
      expect(data).toEqual(expect.objectContaining({ onClick }))
    })
  })

  describe('pointing', () => {
    it('adds an poiting class when true', () => {
      const { container } = render(<Label pointing />)
      expect(container.firstChild).toHaveClass('pointing')
    })

    it('does not add any poiting option class when true', () => {
      const options = ['above', 'below', 'left', 'right']
      const { container } = render(<Label pointing />)

      options.forEach((className) => expect(container.firstChild).not.toHaveClass(className))
    })

    it('adds `above` as suffix', () => {
      const { container } = render(<Label pointing='above' />)
      expect(container.firstChild).toHaveClass('pointing')
      expect(container.firstChild).toHaveClass('above')
    })

    it('adds `below` as suffix', () => {
      const { container } = render(<Label pointing='below' />)
      expect(container.firstChild).toHaveClass('pointing')
      expect(container.firstChild).toHaveClass('below')
    })

    it('adds `left` as prefix', () => {
      const { container } = render(<Label pointing='left' />)
      expect(container.firstChild).toHaveClass('left')
      expect(container.firstChild).toHaveClass('pointing')
    })

    it('adds `right` as prefix', () => {
      const { container } = render(<Label pointing='right' />)
      expect(container.firstChild).toHaveClass('right')
      expect(container.firstChild).toHaveClass('pointing')
    })
  })
})
