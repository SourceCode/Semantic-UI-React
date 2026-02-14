import { render } from '@testing-library/react'

import Accordion from 'src/modules/Accordion/Accordion'
import AccordionAccordion from 'src/modules/Accordion/AccordionAccordion'
import AccordionContent from 'src/modules/Accordion/AccordionContent'
import AccordionPanel from 'src/modules/Accordion/AccordionPanel'
import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/specs/commonTests'

describe('Accordion', () => {
  common.isConformant(Accordion)
  common.hasSubcomponents(Accordion, [
    AccordionAccordion,
    AccordionContent,
    AccordionPanel,
    AccordionTitle,
  ])
  common.hasUIClassName(Accordion)

  common.propKeyOnlyToClassName(Accordion, 'fluid')
  common.propKeyOnlyToClassName(Accordion, 'inverted')
  common.propKeyOnlyToClassName(Accordion, 'styled')

  it('renders AccordionAccordion component', () => {
    const { container } = render(<Accordion />)
    expect(container.querySelector('.accordion')).toBeInTheDocument()
  })
})
