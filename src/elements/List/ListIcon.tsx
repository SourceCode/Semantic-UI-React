import cx from 'clsx'
import * as React from 'react'

import { createShorthandFactory, getUnhandledProps, getVerticalAlignProp } from '../../lib'
import type { SemanticVERTICALALIGNMENTS } from '../../generic'
import type { StrictIconProps } from '../Icon'
import Icon from '../Icon/Icon'

export interface StrictListIconProps extends StrictIconProps {
  /** Additional classes. */
  className?: string
  /** An element inside a list can be vertically aligned. */
  verticalAlign?: SemanticVERTICALALIGNMENTS
}

export interface ListIconProps extends StrictListIconProps {
  [key: string]: any
}

/**
 * A list item can contain an icon.
 */
function ListIcon({ ref, ...props }: ListIconProps & { ref?: React.Ref<HTMLElement> }) {
  const { className, verticalAlign } = props
  const classes = cx(getVerticalAlignProp(verticalAlign), className)
  const rest = getUnhandledProps(ListIcon, props)

  return <Icon {...rest} className={classes} ref={ref} />
}

ListIcon.displayName = 'ListIcon'
ListIcon.handledProps = [
  'className',
  'verticalAlign',
]

ListIcon.create = createShorthandFactory(ListIcon, (name) => ({ name }))

export default ListIcon
