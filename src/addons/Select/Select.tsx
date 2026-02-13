import * as React from 'react'

import type { StrictDropdownProps } from '../../modules/Dropdown'
import Dropdown from '../../modules/Dropdown'
import type { DropdownItemProps } from '../../modules/Dropdown/DropdownItem'
import DropdownDivider from '../../modules/Dropdown/DropdownDivider'
import DropdownHeader from '../../modules/Dropdown/DropdownHeader'
import DropdownItem from '../../modules/Dropdown/DropdownItem'
import DropdownMenu from '../../modules/Dropdown/DropdownMenu'

export interface StrictSelectProps extends StrictDropdownProps {
  /** Array of Dropdown.Item props e.g. `{ text: '', value: '' }` */
  options: DropdownItemProps[]
}

export interface SelectProps extends StrictSelectProps {
  [key: string]: any
}

/**
 * A Select is sugar for <Dropdown selection />.
 * @see Dropdown
 * @see Form
 */
function Select({ ref, ...props }: SelectProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <Dropdown {...props} selection ref={ref} />
}

Select.displayName = 'Select'
Select.handledProps = [
  'options',
]

Select.Divider = DropdownDivider
Select.Header = DropdownHeader
Select.Item = DropdownItem
Select.Menu = DropdownMenu

export default Select
