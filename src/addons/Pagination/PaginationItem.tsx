import keyboardKey from 'keyboard-key'
import _ from 'lodash'
import * as React from 'react'

import { createShorthandFactory } from '../../lib'
import MenuItem from '../../collections/Menu/MenuItem'

export interface StrictPaginationItemProps {
  /** A pagination item can be active. */
  active?: boolean

  /** A pagination item can be disabled. */
  disabled?: boolean

  /**
   * Called on click.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationItemProps) => void

  /**
   * Called on key down.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onKeyDown?: (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationItemProps) => void

  /** A pagination should have a type. */
  type?: 'ellipsisItem' | 'firstItem' | 'prevItem' | 'pageItem' | 'nextItem' | 'lastItem'
}

export interface PaginationItemProps extends StrictPaginationItemProps {
  [key: string]: any
}

/**
 * An item of a pagination.
 */
function PaginationItem({ ref, ...props }: PaginationItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, type } = props
  const disabled = props.disabled || type === 'ellipsisItem'

  const handleClick = (e: any) => {
    _.invoke(props, 'onClick', e, props)
  }

  const handleKeyDown = (e: any) => {
    _.invoke(props, 'onKeyDown', e, props)

    if (keyboardKey.getCode(e) === keyboardKey.Enter) {
      _.invoke(props, 'onClick', e, props)
    }
  }

  return MenuItem.create(props, {
    defaultProps: {
      active,
      'aria-current': active,
      'aria-disabled': disabled,
      disabled,
      tabIndex: disabled ? -1 : 0,
    },
    overrideProps: () => ({
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      ref,
    }),
  })
}

PaginationItem.displayName = 'PaginationItem'
PaginationItem.handledProps = [
  'active',
  'disabled',
  'onClick',
  'onKeyDown',
]

PaginationItem.create = createShorthandFactory(PaginationItem, (content: any) => ({ content }))

export default PaginationItem
