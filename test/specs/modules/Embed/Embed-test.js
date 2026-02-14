import { render, fireEvent } from '@testing-library/react'

import Embed from 'src/modules/Embed/Embed'
import * as common from 'test/specs/commonTests'

const assertIframeSrc = (props, srcPart) => {
  const { id = 'default-test-id', source = 'youtube', ...rest } = props

  const { container } = render(<Embed active id={id} source={source} {...rest} />)
  const iframe = container.querySelector('iframe')

  expect(iframe.getAttribute('src')).toContain(srcPart)
}

describe('Embed', () => {
  common.isConformant(Embed)
  common.hasUIClassName(Embed)
  common.rendersChildren(Embed, { requiredProps: { active: true } })

  common.implementsHTMLIFrameProp(Embed, {
    alwaysPresent: true,
    assertExactMatch: false,
    autoGenerateKey: false,
    requiredProps: {
      active: true,
      id: 'default-test-id',
      source: 'youtube',
    },
    shorthandDefaultProps: {
      allowFullScreen: false,
      frameBorder: 0,
      height: '100%',
      scrolling: 'no',
      title: 'Embedded content from youtube.',
      width: '100%',
    },
  })
  common.implementsIconProp(Embed, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  common.propKeyOnlyToClassName(Embed, 'active')

  common.propValueOnlyToClassName(Embed, 'aspectRatio', ['4:3', '16:9', '21:9'])

  describe('active', () => {
    it('defaults to false', () => {
      const { container } = render(<Embed />)
      expect(container.firstChild).not.toHaveClass('active')
    })

    it('applies className', () => {
      const { container } = render(<Embed active />)
      expect(container.firstChild).toHaveClass('active')
    })

    it('renders nothing when false', () => {
      const { container } = render(
        <Embed>
          <p id='foo' />
        </Embed>,
      )

      expect(container.querySelector('#foo')).not.toBeInTheDocument()
    })
  })

  describe('autoplay', () => {
    it('generates url part for source', () => {
      assertIframeSrc({ autoplay: true }, '&amp;autoplay=true')
      assertIframeSrc({ autoplay: false }, '&amp;autoplay=false')
    })
  })

  describe('brandedUI', () => {
    it('generates "modestbranding" url parameter', () => {
      assertIframeSrc({ brandedUI: true }, '&amp;modestbranding=true')
      assertIframeSrc({ brandedUI: false }, '&amp;modestbranding=false')
    })

    it('generates "rel" url parameter', () => {
      assertIframeSrc({ brandedUI: true }, '&amp;rel=0')
      assertIframeSrc({ brandedUI: false }, '&amp;rel=1')
    })
  })

  describe('color', () => {
    it('generates url part for source', () => {
      const color = 'red'
      assertIframeSrc({ color }, `&amp;color=${encodeURIComponent(color)}`)
    })
  })

  describe('defaultActive', () => {
    it('sets the initial active state', () => {
      const { container: c1 } = render(<Embed defaultActive />)
      expect(c1.firstChild).toHaveClass('active')

      const { container: c2 } = render(<Embed defaultActive={false} />)
      expect(c2.firstChild).not.toHaveClass('active')
    })
  })

  describe('hd', () => {
    it('generates url part for source', () => {
      assertIframeSrc({ hd: true }, '&amp;hq=true')
      assertIframeSrc({ hd: false }, '&amp;hq=false')
    })
  })

  describe('placeholder', () => {
    it('omitted by default', () => {
      const { container } = render(<Embed />)
      expect(container.querySelectorAll('img.placeholder')).toHaveLength(0)
    })

    it('renders img when defined', () => {
      const url = '/images/wireframe/image.png'
      const { container } = render(<Embed placeholder={url} />)
      const img = container.querySelector('img.placeholder')

      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', url)
    })
  })

  describe('onClick', () => {
    it('sets to active state', () => {
      const { container } = render(<Embed />)

      fireEvent.click(container.firstChild)
      expect(container.firstChild).toHaveClass('active')
    })

    it('skips state update if active', () => {
      const { container } = render(<Embed active />)

      fireEvent.click(container.firstChild)
      expect(container.firstChild).toHaveClass('active')
    })
  })

  describe('source', () => {
    it('generates url for YouTube', () => {
      const id = 'foo'
      assertIframeSrc({ id }, `//www.youtube.com/embed/${id}`)
    })

    it('generates url for Vimeo', () => {
      const id = 'foo'
      assertIframeSrc({ source: 'vimeo', id }, `//player.vimeo.com/video/${id}`)
    })

    it('sets the iframe title', () => {
      const sources = ['youtube', 'vimeo']

      sources.forEach((source) => {
        const { container } = render(<Embed active id='foo' source={source} />)
        const iframe = container.querySelector('iframe')

        expect(iframe).toHaveAttribute('title', `Embedded content from ${source}.`)
      })
    })
  })

  describe('url', () => {
    it('passes url to iframe', () => {
      const url = 'https://example.com'

      const { container } = render(<Embed active url={url} />)
      const iframe = container.querySelector('iframe')

      expect(iframe).toHaveAttribute('src', url)
    })
  })
})
