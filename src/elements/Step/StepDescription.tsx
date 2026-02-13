import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictStepDescriptionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface StepDescriptionProps extends StrictStepDescriptionProps {
  [key: string]: any
}

function StepDescription({ ref, ...props }: StepDescriptionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('description', className)
  const rest = getUnhandledProps(StepDescription, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

StepDescription.displayName = 'StepDescription'
StepDescription.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

StepDescription.create = createShorthandFactory(StepDescription, (content) => ({ content }))

export default StepDescription
