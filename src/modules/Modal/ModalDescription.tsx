import cx from 'clsx'
import * as React from 'react'

import { childrenUtils, getComponentType, getUnhandledProps } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictModalDescriptionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ModalDescriptionProps extends StrictModalDescriptionProps {
  [key: string]: any
}

/**
 * A modal can contain a description with one or more paragraphs.
 */
function ModalDescription({ ref, ...props }: ModalDescriptionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('description', className)
  const rest = getUnhandledProps(ModalDescription, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ModalDescription.displayName = 'ModalDescription'
ModalDescription.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

export default ModalDescription
