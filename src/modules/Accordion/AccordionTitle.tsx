import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  useEventCallback,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictAccordionTitleProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Whether or not the title is in the open state. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Shorthand for Icon. */
  icon?: SemanticShorthandItem<IconProps>

  /** AccordionTitle index inside Accordion. */
  index?: number | string

  /**
   * Called on click.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: AccordionTitleProps) => void
}

export interface AccordionTitleProps extends StrictAccordionTitleProps {
  [key: string]: any
}

/**
 * A title sub-component for Accordion component.
 */
function AccordionTitle({ ref, ...props }: AccordionTitleProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, children, className, content, icon } = props

  const classes = cx(getKeyOnly(active, 'active'), 'title', className)
  const rest = getUnhandledProps(AccordionTitle, props)
  const ElementType = getComponentType(props)
  const iconValue = _.isNil(icon) ? 'dropdown' : icon

  const handleClick = useEventCallback((e: React.MouseEvent<HTMLDivElement>) => {
    _.invoke(props, 'onClick', e, props)
  })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
        {children}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
      {Icon.create(iconValue, { autoGenerateKey: false })}
      {content}
    </ElementType>
  )
}

AccordionTitle.displayName = 'AccordionTitle'
AccordionTitle.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
  'icon',
  'index',
  'onClick',
]
AccordionTitle.create = createShorthandFactory(AccordionTitle, (content) => ({ content }))

export default AccordionTitle
