import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictAccordionContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Whether or not the content is visible. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface AccordionContentProps extends StrictAccordionContentProps {
  [key: string]: any
}

/**
 * A content sub-component for Accordion component.
 */
function AccordionContent({ ref, ...props }: AccordionContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, children, className, content } = props

  const classes = cx('content', getKeyOnly(active, 'active'), className)
  const rest = getUnhandledProps(AccordionContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

AccordionContent.displayName = 'AccordionContent'
AccordionContent.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
]

AccordionContent.create = createShorthandFactory(AccordionContent, (content) => ({ content }))

export default AccordionContent
