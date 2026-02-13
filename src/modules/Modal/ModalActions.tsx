import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandCollection, SemanticShorthandContent } from '../../generic'
import type { ButtonProps } from '../../elements/Button'
import Button from '../../elements/Button'

export interface StrictModalActionsProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Array of shorthand buttons. */
  actions?: SemanticShorthandCollection<ButtonProps>

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /**
   * onClick handler for an action. Mutually exclusive with children.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All item props.
   */
  onActionClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: ButtonProps) => void
}

export interface ModalActionsProps extends StrictModalActionsProps {
  [key: string]: any
}

/**
 * A modal can contain a row of actions.
 */
function ModalActions({ ref, ...props }: ModalActionsProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { actions, children, className, content } = props

  const classes = cx('actions', className)
  const rest = getUnhandledProps(ModalActions, props)
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
      <ElementType {...rest} className={classes}>
        {content}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {_.map(actions, (action) =>
        Button.create(action, {
          overrideProps: (predefinedProps: any) => ({
            onClick: (e: React.MouseEvent<HTMLAnchorElement>, buttonProps: ButtonProps) => {
              _.invoke(predefinedProps, 'onClick', e, buttonProps)
              _.invoke(props, 'onActionClick', e, buttonProps)
            },
          }),
        }),
      )}
    </ElementType>
  )
}

ModalActions.displayName = 'ModalActions'
ModalActions.handledProps = [
  'as',
  'actions',
  'children',
  'className',
  'content',
  'onActionClick',
]

ModalActions.create = createShorthandFactory(ModalActions, (actions) => ({ actions }))

export default ModalActions
