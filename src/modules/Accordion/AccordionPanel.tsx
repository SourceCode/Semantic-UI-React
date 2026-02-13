import _ from 'lodash'
import * as React from 'react'

import { createShorthandFactory } from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import type { AccordionContentProps } from './AccordionContent'
import type { AccordionTitleProps } from './AccordionTitle'
import AccordionTitle from './AccordionTitle'
import AccordionContent from './AccordionContent'

export interface StrictAccordionPanelProps {
  /** Whether or not the title is in the open state. */
  active?: boolean

  /** A shorthand for Accordion.Content. */
  content?: SemanticShorthandItem<AccordionContentProps>

  /** A panel index. */
  index?: number | string

  /**
   * Called when a panel title is clicked.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {AccordionTitleProps} data - All item props.
   */
  onTitleClick?: (event: React.MouseEvent<HTMLDivElement>, data: AccordionTitleProps) => void

  /** A shorthand for Accordion.Title. */
  title?: SemanticShorthandItem<AccordionTitleProps>
}

export interface AccordionPanelProps extends StrictAccordionPanelProps {
  [key: string]: any
}

/**
 * A panel sub-component for Accordion component.
 */
function AccordionPanel(props: AccordionPanelProps) {
  const { active, content, index, title, onTitleClick } = props

  const handleTitleOverrides = (predefinedProps: any) => ({
    onClick: (e: React.MouseEvent<HTMLDivElement>, titleProps: AccordionTitleProps) => {
      _.invoke(predefinedProps, 'onClick', e, titleProps)
      if (onTitleClick) onTitleClick(e, titleProps)
    },
  })

  return (
    <>
      {AccordionTitle.create(title, {
        autoGenerateKey: false,
        defaultProps: { active, index },
        overrideProps: handleTitleOverrides,
      })}
      {AccordionContent.create(content, {
        autoGenerateKey: false,
        defaultProps: { active },
      })}
    </>
  )
}

AccordionPanel.displayName = 'AccordionPanel'
AccordionPanel.handledProps = [
  'active',
  'content',
  'index',
  'onTitleClick',
  'title',
]

AccordionPanel.create = createShorthandFactory(AccordionPanel, null as any)

export default AccordionPanel
