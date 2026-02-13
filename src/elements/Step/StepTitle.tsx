import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictStepTitleProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface StepTitleProps extends StrictStepTitleProps {
  [key: string]: any
}

/**
 * A step can contain a title.
 */
function StepTitle({ ref, ...props }: StepTitleProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('title', className)
  const rest = getUnhandledProps(StepTitle, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

StepTitle.displayName = 'StepTitle'
StepTitle.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

StepTitle.create = createShorthandFactory(StepTitle, (content) => ({ content }))

export default StepTitle
