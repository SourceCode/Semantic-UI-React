import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  useAutoControlledValue,
} from '../../lib'
import RatingIcon from './RatingIcon'

export interface StrictRatingProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Additional classes. */
  className?: string

  /**
   * You can clear the rating by clicking on the current start rating.
   * By default a rating will be only clearable if there is 1 icon.
   * Setting to `true`/`false` will allow or disallow a user to clear their rating.
   */
  clearable?: boolean | 'auto'

  /** The initial rating value. */
  defaultRating?: number | string

  /** You can disable or enable interactive rating.  Makes a read-only rating. */
  disabled?: boolean

  /** A rating can use a set of star or heart icons. */
  icon?: 'star' | 'heart'

  /** The total number of icons. */
  maxRating?: number | string

  /**
   * Called after user selects a new rating.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and proposed rating.
   */
  onRate?: (event: React.MouseEvent<HTMLDivElement>, data: RatingProps) => void

  /** The current number of active icons. */
  rating?: number | string

  /** A progress bar can vary in size. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'huge' | 'massive'
}

export interface RatingProps extends StrictRatingProps {
  [key: string]: any
}

/**
 * A rating indicates user interest in content.
 */
function Rating({ ref, ...props }: RatingProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, clearable = 'auto', disabled, icon, maxRating = 1, size } = props

  const [rating, setRating] = useAutoControlledValue({
    state: props.rating,
    defaultState: props.defaultRating,
    initialState: 0,
  })
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const [isSelecting, setIsSelecting] = React.useState(false)

  const classes = cx(
    'ui',
    icon,
    size,
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(isSelecting && !disabled && selectedIndex >= 0, 'selected'),
    'rating',
    className,
  )
  const rest = getUnhandledProps(Rating, props)
  const ElementType = getComponentType(props)

  const handleIconClick = (e: React.MouseEvent<HTMLElement>, { index }: any) => {
    if (disabled) {
      return
    }

    // default newRating is the clicked icon
    // allow toggling a binary rating
    // allow clearing ratings
    let newRating = index + 1

    if (clearable === 'auto' && maxRating === 1) {
      newRating = +!rating
    } else if (clearable === true && newRating === rating) {
      newRating = 0
    }

    // set rating
    setRating(newRating)
    setIsSelecting(false)

    _.invoke(props, 'onRate', e, { ...props, rating: newRating })
  }

  const handleIconMouseEnter = (_e: React.MouseEvent<HTMLElement>, { index }: any) => {
    if (disabled) {
      return
    }

    setSelectedIndex(index)
    setIsSelecting(true)
  }

  const handleMouseLeave = (...args: any[]) => {
    _.invoke(props, 'onMouseLeave', ...args)

    if (disabled) {
      return
    }

    setSelectedIndex(-1)
    setIsSelecting(false)
  }

  return (
    <ElementType
      role='radiogroup'
      {...rest}
      className={classes}
      onMouseLeave={handleMouseLeave}
      ref={ref}
      tabIndex={disabled ? 0 : -1}
    >
      {_.times(maxRating as number, (i) => (
        /* TODO: use .create() factory */
        <RatingIcon
          tabIndex={disabled ? -1 : 0}
          active={rating >= i + 1}
          aria-checked={rating === i + 1}
          aria-posinset={i + 1}
          aria-setsize={maxRating}
          index={i}
          key={i}
          onClick={handleIconClick}
          onMouseEnter={handleIconMouseEnter}
          selected={selectedIndex >= i && isSelecting}
        />
      ))}
    </ElementType>
  )
}

Rating.displayName = 'Rating'
Rating.handledProps = [
  'as',
  'className',
  'clearable',
  'defaultRating',
  'disabled',
  'icon',
  'maxRating',
  'onRate',
  'rating',
  'size',
]

Rating.Icon = RatingIcon

export default Rating
