import cx from 'clsx'
import keyboardKey from 'keyboard-key'
import _ from 'lodash'
import * as React from 'react'

import { getComponentType, getUnhandledProps, getKeyOnly } from '../../lib'

export interface StrictRatingIconProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Indicates activity of an icon. */
  active?: boolean

  /** Additional classes. */
  className?: string

  /** An index of icon inside Rating. */
  index?: number

  /**
   * Called on click.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and proposed rating.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>, data: RatingIconProps) => void

  /**
   * Called on keyup.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and proposed rating.
   */
  onKeyUp?: (event: React.KeyboardEvent<HTMLElement>, data: RatingIconProps) => void

  /**
   * Called on mouseenter.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and proposed rating.
   */
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>, data: RatingIconProps) => void

  /** Indicates selection of an icon. */
  selected?: boolean
}

export interface RatingIconProps extends StrictRatingIconProps {
  [key: string]: any
}

/**
 * An internal icon sub-component for Rating component
 */
function RatingIcon({ ref, ...props }: RatingIconProps & { ref?: React.Ref<HTMLElement> }) {
  const { active, className, selected } = props

  const classes = cx(
    getKeyOnly(active, 'active'),
    getKeyOnly(selected, 'selected'),
    'icon',
    className,
  )
  const rest = getUnhandledProps(RatingIcon, props)
  const ElementType = getComponentType(props, { defaultAs: 'i' })

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    _.invoke(props, 'onClick', e, props)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    _.invoke(props, 'onKeyUp', e, props)

    switch (keyboardKey.getCode(e)) {
      case keyboardKey.Enter:
      case keyboardKey.Spacebar:
        e.preventDefault()
        _.invoke(props, 'onClick', e, props)
        break
      default:
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    _.invoke(props, 'onMouseEnter', e, props)
  }

  return (
    <ElementType
      role='radio'
      {...rest}
      className={classes}
      onClick={handleClick}
      onKeyUp={handleKeyUp}
      onMouseEnter={handleMouseEnter}
      ref={ref}
    />
  )
}

RatingIcon.displayName = 'RatingIcon'
RatingIcon.handledProps = [
  'as',
  'active',
  'className',
  'index',
  'onClick',
  'onKeyUp',
  'onMouseEnter',
  'selected',
]

export default RatingIcon
