import cx from 'clsx'
import * as React from 'react'

import { getUnhandledProps, getKeyOnly } from '../../lib'
import type { StrictAccordionAccordionProps } from './AccordionAccordion'
import AccordionAccordion from './AccordionAccordion'
import AccordionContent from './AccordionContent'
import AccordionPanel from './AccordionPanel'
import AccordionTitle from './AccordionTitle'

export interface StrictAccordionProps extends StrictAccordionAccordionProps {
  /** Additional classes. */
  className?: string

  /** Format to take up the width of its container. */
  fluid?: boolean

  /** Format for dark backgrounds. */
  inverted?: boolean

  /** Adds some basic styling to accordion panels. */
  styled?: boolean
}

export interface AccordionProps extends StrictAccordionProps {
  [key: string]: any
}

/**
 * An accordion allows users to toggle the display of sections of content.
 */
function Accordion({ ref, ...props }: AccordionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, fluid, inverted, styled } = props

  const classes = cx(
    'ui',
    getKeyOnly(fluid, 'fluid'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(styled, 'styled'),
    className,
  )
  const rest = getUnhandledProps(Accordion, props)

  return <AccordionAccordion {...rest} className={classes} ref={ref} />
}

Accordion.displayName = 'Accordion'
Accordion.handledProps = [
  'className',
  'fluid',
  'inverted',
  'styled',
]

Accordion.Accordion = AccordionAccordion
Accordion.Content = AccordionContent
Accordion.Panel = AccordionPanel
Accordion.Title = AccordionTitle

export default Accordion
