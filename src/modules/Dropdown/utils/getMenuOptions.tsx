import _ from 'lodash'
import * as React from 'react'

import type { DropdownItemProps } from '../DropdownItem'

interface GetMenuOptionsConfig {
  additionLabel?: React.ReactNode
  additionPosition?: 'top' | 'bottom'
  allowAdditions?: boolean
  deburr?: boolean
  multiple?: boolean
  options?: DropdownItemProps[]
  search?: boolean | ((options: DropdownItemProps[], value: string) => DropdownItemProps[])
  searchQuery?: string
  value?: any
}

// There are times when we need to calculate the options based on a value
// that hasn't yet been persisted to state.
export default function getMenuOptions(config: GetMenuOptionsConfig) {
  const {
    additionLabel,
    additionPosition,
    allowAdditions,
    deburr,
    multiple,
    options,
    search,
    searchQuery,
    value,
  } = config

  let filteredOptions = options

  // filter out active options
  if (multiple) {
    filteredOptions = _.filter(filteredOptions, (opt) => !_.includes(value, opt.value))
  }

  // filter by search query
  if (search && searchQuery) {
    if (_.isFunction(search)) {
      filteredOptions = search(filteredOptions as DropdownItemProps[], searchQuery)
    } else {
      // remove diacritics on search input and options, if deburr prop is set
      const strippedQuery = deburr ? _.deburr(searchQuery) : searchQuery

      const re = new RegExp(_.escapeRegExp(strippedQuery), 'i')

      filteredOptions = _.filter(filteredOptions, (opt) =>
        re.test(deburr ? _.deburr(opt.text as string) : (opt.text as string)),
      )
    }
  }

  // insert the "add" item
  if (allowAdditions && search && searchQuery && !_.some(filteredOptions, { text: searchQuery })) {
    const additionLabelElement = React.isValidElement(additionLabel)
      ? React.cloneElement(additionLabel as React.ReactElement, { key: 'addition-label' } as any)
      : additionLabel || ''

    const addItem = {
      key: 'addition',
      // by using an array, we can pass multiple elements, but when doing so
      // we must specify a `key` for React to know which one is which
      text: [additionLabelElement, <b key='addition-query'>{searchQuery}</b>],
      value: searchQuery,
      className: 'addition',
      'data-additional': true,
    }
    if (additionPosition === 'top') filteredOptions!.unshift(addItem as any)
    else filteredOptions!.push(addItem as any)
  }

  return filteredOptions
}
