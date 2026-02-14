import _ from 'lodash'
import { render } from '@testing-library/react'

import Image from 'src/elements/Image/Image'
import ImageGroup from 'src/elements/Image/ImageGroup'
import { htmlImageProps, SUI } from 'src/lib'
import Dimmer from 'src/modules/Dimmer/Dimmer'
import * as common from 'test/specs/commonTests'

describe('Image', () => {
  common.isConformant(Image)

  common.hasSubcomponents(Image, [ImageGroup])
  common.hasUIClassName(Image)
  common.rendersChildren(Image, { requiredProps: { wrapped: true } })

  common.implementsCreateMethod(Image)
  common.implementsLabelProp(Image, { autoGenerateKey: false })
  common.implementsShorthandProp(Image, {
    autoGenerateKey: false,
    propKey: 'dimmer',
    ShorthandComponent: Dimmer,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsVerticalAlignProp(Image)

  common.propKeyAndValueToClassName(Image, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Image, 'avatar')
  common.propKeyOnlyToClassName(Image, 'bordered')
  common.propKeyOnlyToClassName(Image, 'centered')
  common.propKeyOnlyToClassName(Image, 'circular')
  common.propKeyOnlyToClassName(Image, 'disabled')
  common.propKeyOnlyToClassName(Image, 'fluid')
  common.propKeyOnlyToClassName(Image, 'hidden')
  common.propKeyOnlyToClassName(Image, 'inline')
  common.propKeyOnlyToClassName(Image, 'rounded')

  common.propKeyOrValueAndKeyToClassName(Image, 'spaced', ['left', 'right'])

  common.propValueOnlyToClassName(Image, 'size', SUI.SIZES)

  describe('as', () => {
    it('renders "img" by default', () => {
      const { container } = render(<Image />)
      expect(container.firstChild.tagName).toBe('IMG')
    })
  })

  describe('href', () => {
    it('renders an a tag', () => {
      const { container } = render(<Image href='http://example.com' />)
      expect(container.firstChild.tagName).toBe('A')
    })
  })

  describe('image props', () => {
    _.forEach(htmlImageProps, (propName) => {
      it(`keeps "${propName}" on root element by default`, () => {
        const { container } = render(<Image {...{ [propName]: 'foo' }} />)

        expect(container.firstChild.tagName).toBe('IMG')
        expect(container.firstChild).toHaveAttribute(propName, 'foo')
      })

      it(`passes "${propName}" to the img tag when wrapped`, () => {
        const { container } = render(<Image wrapped {...{ [propName]: 'foo' }} />)
        expect(container.querySelector('img')).toHaveAttribute(propName, 'foo')
      })
    })
  })

  describe('ui', () => {
    it('is true by default', () => {
      const { container } = render(<Image />)
      expect(container.firstChild).toHaveClass('ui')
    })
    it('adds the "ui" className when true', () => {
      const { container } = render(<Image ui />)
      expect(container.firstChild).toHaveClass('ui')
    })
    it('removes the "ui" className when false', () => {
      const { container } = render(<Image ui={false} />)
      expect(container.firstChild).not.toHaveClass('ui')
    })
  })

  describe('wrapped', () => {
    it('renders an div tag when true', () => {
      const { container } = render(<Image wrapped />)
      expect(container.firstChild.tagName).toBe('DIV')
    })
  })
})
