import { render, fireEvent } from '@testing-library/react'

import AccordionAccordion from 'src/modules/Accordion/AccordionAccordion'
import * as common from 'test/specs/commonTests'

describe('AccordionAccordion', () => {
  common.isConformant(AccordionAccordion)
  common.rendersChildren(AccordionAccordion, {
    rendersContent: false,
  })

  common.implementsCreateMethod(AccordionAccordion)

  describe('activeIndex', () => {
    const panels = [
      { key: 'A', title: 'A', content: 'Something A' },
      { key: 'B', title: 'B', content: 'Something B' },
      { key: 'C', title: 'C', content: 'Something C' },
    ]

    it('there is no active items by default', () => {
      const { container } = render(<AccordionAccordion />)
      expect(container.querySelector('.active')).not.toBeInTheDocument()
    })

    it('there is no active items by default when "exclusive" is false', () => {
      const { container } = render(<AccordionAccordion exclusive={false} />)
      expect(container.querySelector('.active')).not.toBeInTheDocument()
    })

    it('activates an item', () => {
      const { container } = render(<AccordionAccordion activeIndex={0} panels={panels} />)
      const titles = container.querySelectorAll('.title')

      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).not.toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')
    })

    it('items can be toggled by a click', () => {
      const { container } = render(<AccordionAccordion panels={panels} />)
      const titles = container.querySelectorAll('.title')

      fireEvent.click(titles[0])
      expect(titles[0]).toHaveClass('active')

      fireEvent.click(titles[0])
      expect(titles[0]).not.toHaveClass('active')
    })

    it('activates a proper item', () => {
      const { container, rerender } = render(
        <AccordionAccordion activeIndex={0} panels={panels} />,
      )

      rerender(<AccordionAccordion activeIndex={1} panels={panels} />)
      const titles = container.querySelectorAll('.title')

      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')
    })

    it('can activate a single item when "exclusive" is false', () => {
      const { container } = render(
        <AccordionAccordion activeIndex={[0]} exclusive={false} panels={panels} />,
      )
      const titles = container.querySelectorAll('.title')

      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).not.toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')
    })

    it('can activate multiple items when "exclusive" is false', () => {
      const { container, rerender } = render(
        <AccordionAccordion activeIndex={[0, 1]} exclusive={false} panels={panels} />,
      )
      let titles = container.querySelectorAll('.title')

      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')

      rerender(<AccordionAccordion activeIndex={[1, 2]} exclusive={false} panels={panels} />)
      titles = container.querySelectorAll('.title')

      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
      expect(titles[2]).toHaveClass('active')
    })

    it('can be inclusive and can open multiple panels by clicking', () => {
      const { container } = render(<AccordionAccordion exclusive={false} panels={panels} />)
      const titles = container.querySelectorAll('.title')

      fireEvent.click(titles[0])
      expect(titles[0]).toHaveClass('active')

      fireEvent.click(titles[1])
      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
    })

    it('can be inclusive and close multiple panels by clicking', () => {
      const { container } = render(
        <AccordionAccordion defaultActiveIndex={[0, 1]} exclusive={false} panels={panels} />,
      )
      const titles = container.querySelectorAll('.title')

      fireEvent.click(titles[0])
      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')

      fireEvent.click(titles[1])
      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).not.toHaveClass('active')
    })

    it('warns if is `exclusive` and is given an array', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      render(<AccordionAccordion exclusive activeIndex={[1]} />)

      expect(consoleError).toHaveBeenCalledOnce()
      consoleError.mockRestore()
    })

    it('warns if not `exclusive` and is given a number', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      render(<AccordionAccordion exclusive={false} activeIndex={1} />)

      expect(consoleError).toHaveBeenCalledOnce()
      consoleError.mockRestore()
    })
  })

  describe('defaultActiveIndex', () => {
    it('sets the initial activeIndex state', () => {
      const { container } = render(
        <AccordionAccordion
          defaultActiveIndex={1}
          panels={[
            { key: 'A', title: 'A', content: 'Something A' },
            { key: 'B', title: 'B', content: 'Something B' },
          ]}
        />,
      )
      const titles = container.querySelectorAll('.title')

      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
    })
  })

  describe('onTitleClick', () => {
    it('is called with (e, titleProps) when clicked', () => {
      const onClick = vi.fn()
      const onTitleClick = vi.fn()
      const panels = [
        { key: 'A', title: { content: 'A', onClick } },
        { key: 'B', title: 'B' },
      ]

      const { container } = render(
        <AccordionAccordion panels={panels} onTitleClick={onTitleClick} />,
      )
      const titles = container.querySelectorAll('.title')

      fireEvent.click(titles[0])
      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ index: 0, content: 'A' }),
      )
      expect(onTitleClick).toHaveBeenCalledOnce()
      expect(onTitleClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ index: 0, content: 'A' }),
      )
    })
  })

  describe('panels', () => {
    const panels = [
      {
        key: 'A',
        title: { content: 'A' },
        content: { content: 'Content A', 'data-foo': 'something' },
      },
      { key: 'B', title: 'B', content: { content: 'Content B', 'data-foo': 'something' } },
    ]

    it('renders children', () => {
      const { container } = render(<AccordionAccordion panels={panels} />)
      const titles = container.querySelectorAll('.title')
      const contents = container.querySelectorAll('.content')

      expect(titles[0].textContent).toContain('A')
      expect(contents[0].textContent).toContain('Content A')

      expect(titles[1].textContent).toContain('B')
      expect(contents[1].textContent).toContain('Content B')
    })

    it('passes onClick handler', () => {
      const onClick = vi.fn()
      const panelsWithClick = [
        {
          key: 'A',
          title: { content: 'A', onClick },
          content: { content: 'Content A', 'data-foo': 'something' },
        },
        { key: 'B', title: 'B', content: { content: 'Content B', 'data-foo': 'something' } },
      ]

      const { container } = render(<AccordionAccordion panels={panelsWithClick} />)
      const titles = container.querySelectorAll('.title')

      fireEvent.click(titles[0])

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ content: 'A', index: 0 }),
      )
    })

    it('passes arbitrary props', () => {
      const { container } = render(<AccordionAccordion panels={panels} />)
      const contents = container.querySelectorAll('.content')

      contents.forEach((content) => {
        expect(content).toHaveAttribute('data-foo', 'something')
      })
    })
  })
})
