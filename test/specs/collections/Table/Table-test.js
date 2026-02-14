import { render } from '@testing-library/react'

import Table from 'src/collections/Table/Table'
import TableBody from 'src/collections/Table/TableBody'
import TableCell from 'src/collections/Table/TableCell'
import TableFooter from 'src/collections/Table/TableFooter'
import TableHeader from 'src/collections/Table/TableHeader'
import TableHeaderCell from 'src/collections/Table/TableHeaderCell'
import TableRow from 'src/collections/Table/TableRow'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import * as _ from 'lodash'

describe('Table', () => {
  common.isConformant(Table)
  common.hasSubcomponents(Table, [
    TableBody,
    TableCell,
    TableFooter,
    TableHeader,
    TableHeaderCell,
    TableRow,
  ])
  common.hasUIClassName(Table)
  common.rendersChildren(Table, {
    rendersContent: false,
  })

  common.implementsWidthProp(Table, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'columns',
    widthClass: 'column',
  })

  common.implementsTextAlignProp(Table, ['left', 'center', 'right'])
  common.implementsVerticalAlignProp(Table)

  common.propKeyOnlyToClassName(Table, 'celled')
  common.propKeyOnlyToClassName(Table, 'collapsing')
  common.propKeyOnlyToClassName(Table, 'definition')
  common.propKeyOnlyToClassName(Table, 'fixed')
  common.propKeyOnlyToClassName(Table, 'inverted')
  common.propKeyOnlyToClassName(Table, 'selectable')
  common.propKeyOnlyToClassName(Table, 'singleLine', {
    className: 'single line',
  })
  common.propKeyOnlyToClassName(Table, 'stackable')
  common.propKeyOnlyToClassName(Table, 'sortable')
  common.propKeyOnlyToClassName(Table, 'striped')
  common.propKeyOnlyToClassName(Table, 'structured')
  common.propKeyOnlyToClassName(Table, 'unstackable')

  common.propKeyOrValueAndKeyToClassName(Table, 'attached', ['top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Table, 'basic', ['very'])
  common.propKeyOrValueAndKeyToClassName(Table, 'compact', ['very'])
  common.propKeyOrValueAndKeyToClassName(Table, 'padded', ['very'])

  common.propValueOnlyToClassName(Table, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(
    Table,
    'size',
    _.without(SUI.SIZES, 'mini', 'tiny', 'medium', 'big', 'huge', 'massive'),
  )

  describe('as', () => {
    it('renders as a table by default', () => {
      const { container } = render(<Table />)
      expect(container.firstChild.tagName).toBe('TABLE')
    })
  })

  describe('shorthand', () => {
    const headerRow = ['Name', 'Status', 'Notes']

    const renderBodyRow = ({ name, status, notes }, index) => ({
      key: index,
      cells: [name || { key: 0 }, status || { key: 1 }, notes || { key: 2 }],
    })

    const footerRow = [{ colSpan: 3, content: 'Total', key: 'total' }]

    const tableData = [
      { name: undefined, status: undefined, notes: undefined },
      { name: 'Jimmy', lastName: 'Hendrix', status: 'Requires Action', notes: undefined },
      { name: 'Jamie', lastName: 'Lannister', status: undefined, notes: 'Hostile' },
      { name: 'Jill', lastName: undefined, status: undefined, notes: undefined },
    ]

    const renderBodyRowWithSpan = ({ name, lastName, status, notes }, index) => ({
      key: index,
      cells: [
        name || { key: 0 },
        lastName || { key: 1 },
        status || { key: 2 },
        notes || { key: 3 },
      ],
    })

    const headerRows = [
      {
        key: 0,
        cells: [
          { key: 'fullname', colSpan: 2, content: 'Full Name' },
          { key: 'status', rowSpan: 2, content: 'Status' },
          { key: 'notes', rowSpan: 2, content: 'Notes' },
        ],
      },
      { key: 1, cells: ['First Name', 'Last Name'] },
    ]

    it('renders empty tbody with no shorthand', () => {
      const { container } = render(<Table />)

      expect(container.querySelectorAll('thead')).toHaveLength(0)

      expect(container.querySelectorAll('tbody')).toHaveLength(1)
      expect(container.querySelectorAll('tbody tr')).toHaveLength(0)

      expect(container.querySelectorAll('tfoot')).toHaveLength(0)
    })

    it('renders the table', () => {
      const { container } = render(
        <Table headerRow={headerRow} renderBodyRow={renderBodyRow} footerRow={footerRow} tableData={tableData} />,
      )

      expect(container.querySelectorAll('thead')).toHaveLength(1)
      expect(container.querySelectorAll('thead tr')).toHaveLength(1)
      expect(container.querySelectorAll('thead tr th')).toHaveLength(headerRow.length)

      expect(container.querySelectorAll('tbody')).toHaveLength(1)
      expect(container.querySelectorAll('tbody tr')).toHaveLength(tableData.length)
      expect(container.querySelectorAll('tbody tr:first-child td')).toHaveLength(3)

      expect(container.querySelectorAll('tfoot')).toHaveLength(1)
      expect(container.querySelectorAll('tfoot tr')).toHaveLength(1)
      expect(container.querySelectorAll('tfoot tr td')).toHaveLength(footerRow.length)
    })

    it('renders the table with 2 lines header', () => {
      const { container } = render(
        <Table
          renderBodyRow={renderBodyRowWithSpan}
          footerRow={footerRow}
          tableData={tableData}
          headerRows={headerRows}
        />,
      )

      expect(container.querySelectorAll('thead')).toHaveLength(1)
      expect(container.querySelectorAll('thead tr')).toHaveLength(2)
      expect(container.querySelectorAll('thead tr:first-child th')).toHaveLength(3)
      expect(container.querySelectorAll('thead tr:nth-child(2) th')).toHaveLength(2)

      expect(container.querySelectorAll('tbody')).toHaveLength(1)
      expect(container.querySelectorAll('tbody tr')).toHaveLength(tableData.length)
      expect(container.querySelectorAll('tbody tr:first-child td')).toHaveLength(4)

      expect(container.querySelectorAll('tfoot')).toHaveLength(1)
      expect(container.querySelectorAll('tfoot tr')).toHaveLength(1)
      expect(container.querySelectorAll('tfoot tr td')).toHaveLength(footerRow.length)
    })
  })
})
