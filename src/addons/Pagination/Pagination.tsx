import _ from 'lodash'
import * as React from 'react'

import type { SemanticShorthandItem } from '../../generic'
import {
  createPaginationItems,
  getUnhandledProps,
  useAutoControlledValue,
} from '../../lib'
import Menu from '../../collections/Menu'
import type { PaginationItemProps } from './PaginationItem'
import PaginationItem from './PaginationItem'

export interface StrictPaginationProps {
  /** A pagination item can have an aria label. */
  'aria-label'?: string

  /** Initial activePage value. */
  defaultActivePage?: number | string

  /** Index of the currently active page. */
  activePage?: number | string

  /** Number of always visible pages at the beginning and end. */
  boundaryRange?: number | string

  /** A pagination can be disabled. */
  disabled?: boolean

  /** A shorthand for PaginationItem. */
  ellipsisItem?: SemanticShorthandItem<PaginationItemProps>

  /** A shorthand for PaginationItem. */
  firstItem?: SemanticShorthandItem<PaginationItemProps>

  /** A shorthand for PaginationItem. */
  lastItem?: SemanticShorthandItem<PaginationItemProps>

  /** A shorthand for PaginationItem. */
  nextItem?: SemanticShorthandItem<PaginationItemProps>

  /** A shorthand for PaginationItem. */
  pageItem?: SemanticShorthandItem<PaginationItemProps>

  /** A shorthand for PaginationItem. */
  prevItem?: SemanticShorthandItem<PaginationItemProps>

  /**
   * Called on change of an active page.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onPageChange?: (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => void

  /** Number of always visible pages before and after the current one. */
  siblingRange?: number | string

  /** Total number of pages. */
  totalPages: number | string
}

export interface PaginationProps extends StrictPaginationProps {
  [key: string]: any
}

/**
 * A component to render a pagination.
 */
function Pagination({ ref, ...props }: PaginationProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    'aria-label': ariaLabel = 'Pagination Navigation',
    boundaryRange = 1,
    disabled,
    ellipsisItem = '...',
    firstItem = {
      'aria-label': 'First item',
      content: '\u00AB',
    },
    lastItem = {
      'aria-label': 'Last item',
      content: '\u00BB',
    },
    nextItem = {
      'aria-label': 'Next item',
      content: '\u27E9',
    },
    pageItem = {},
    prevItem = {
      'aria-label': 'Previous item',
      content: '\u27E8',
    },
    siblingRange = 1,
    totalPages,
  } = props
  const [activePage, setActivePage] = useAutoControlledValue({
    state: props.activePage,
    defaultState: props.defaultActivePage,
    initialState: 1,
  })

  const handleItemClick = (e: any, { value: nextActivePage }: any) => {
    const prevActivePage = activePage

    // Heads up! We need the cast to the "number" type there, as `activePage` can be a string
    if (+prevActivePage === +nextActivePage) {
      return
    }

    setActivePage(nextActivePage)
    _.invoke(props, 'onPageChange', e, { ...props, activePage: nextActivePage })
  }

  const handleItemOverrides = (active: any, type: any, value: any) => (predefinedProps: any) => ({
    active,
    type,
    key: `${type}-${value}`,
    onClick: (e: any, itemProps: any) => {
      _.invoke(predefinedProps, 'onClick', e, itemProps)

      if (itemProps.type !== 'ellipsisItem') {
        handleItemClick(e, itemProps)
      }
    },
  })

  const items = createPaginationItems({
    activePage,
    boundaryRange,
    hideEllipsis: _.isNil(ellipsisItem),
    siblingRange,
    totalPages,
  })
  const rest = getUnhandledProps(Pagination, props)

  const paginationItemTypes: Record<string, any> = {
    firstItem,
    lastItem,
    ellipsisItem,
    nextItem,
    pageItem,
    prevItem,
  }

  return (
    <Menu {...rest} aria-label={ariaLabel} pagination role='navigation' ref={ref}>
      {_.map(items, ({ active, type, value }: any) =>
        PaginationItem.create(paginationItemTypes[type], {
          defaultProps: {
            content: value,
            disabled,
            value,
          },
          overrideProps: handleItemOverrides(active, type, value),
        }),
      )}
    </Menu>
  )
}

Pagination.displayName = 'Pagination'
Pagination.handledProps = [
  'defaultActivePage',
  'activePage',
  'boundaryRange',
  'disabled',
  'ellipsisItem',
  'firstItem',
  'lastItem',
  'nextItem',
  'pageItem',
  'prevItem',
  'onPageChange',
  'siblingRange',
  'totalPages',
]

Pagination.Item = PaginationItem

export default Pagination
