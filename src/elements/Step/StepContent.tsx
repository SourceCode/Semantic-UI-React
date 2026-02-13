import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { StepDescriptionProps } from './StepDescription'
import type { StepTitleProps } from './StepTitle'
import StepDescription from './StepDescription'
import StepTitle from './StepTitle'

export interface StrictStepContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Shorthand for StepDescription. */
  description?: SemanticShorthandItem<StepDescriptionProps>
  /** Shorthand for StepTitle. */
  title?: SemanticShorthandItem<StepTitleProps>
}

export interface StepContentProps extends StrictStepContentProps {
  [key: string]: any
}

/**
 * A step can contain a content.
 */
function StepContent({ ref, ...props }: StepContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, description, title } = props
  const classes = cx('content', className)
  const rest = getUnhandledProps(StepContent, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  if (!childrenUtils.isNil(content)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {content}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {StepTitle.create(title, { autoGenerateKey: false })}
      {StepDescription.create(description, { autoGenerateKey: false })}
    </ElementType>
  )
}

StepContent.displayName = 'StepContent'
StepContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'description',
  'title',
]

StepContent.create = createShorthandFactory(StepContent, (content) => ({ content }))

export default StepContent
