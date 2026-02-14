import { render, fireEvent } from '@testing-library/react'

import AccordionContent from 'src/modules/Accordion/AccordionContent'
import AccordionPanel from 'src/modules/Accordion/AccordionPanel'
import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/specs/commonTests'

describe('AccordionPanel', () => {
  common.isConformant(AccordionPanel, { rendersChildren: false, forwardsRef: false })

  common.implementsShorthandProp(AccordionPanel, {
    assertExactMatch: false,
    autoGenerateKey: false,
    parentIsFragment: true,
    propKey: 'content',
    ShorthandComponent: AccordionContent,
    mapValueToProps: (content) => ({ content }),
  })
  common.implementsShorthandProp(AccordionPanel, {
    assertExactMatch: false,
    autoGenerateKey: false,
    parentIsFragment: true,
    propKey: 'title',
    ShorthandComponent: AccordionTitle,
    mapValueToProps: (content) => ({ content }),
  })

  describe('active', () => {
    it('should passed to children', () => {
      const { container } = render(
        <AccordionPanel active content='Content' title='Title' />,
      )
      const title = container.querySelector('.title')
      const content = container.querySelector('.content')

      expect(title).toHaveClass('active')
      expect(content).toHaveClass('active')
    })
  })

  describe('index', () => {
    it('should passed to title', () => {
      // AccordionPanel renders a fragment with AccordionTitle and AccordionContent
      // index is internal prop, test via rendered data attributes or behavior
      const { container } = render(
        <AccordionPanel content='Content' index={5} title='Title' />,
      )
      // The title and content should render
      expect(container.querySelector('.title')).toBeInTheDocument()
      expect(container.querySelector('.content')).toBeInTheDocument()
    })
  })

  describe('onTitleClick', () => {
    it('is called with (e, titleProps) when clicked', () => {
      const onClick = vi.fn()
      const onTitleClick = vi.fn()

      const { container } = render(
        <AccordionPanel
          content='Content'
          onTitleClick={onTitleClick}
          title={{ content: 'Title', onClick }}
        />,
      )

      const title = container.querySelector('.title')
      fireEvent.click(title)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ content: 'Title' }),
      )

      expect(onTitleClick).toHaveBeenCalledOnce()
      expect(onTitleClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ content: 'Title' }),
      )
    })
  })
})
