import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableRow from 'src/collections/Table/TableRow'

describe('TableRow', () => {
  common.isConformant(TableRow)
  common.rendersChildren(TableRow, {
    rendersContent: false,
  })

  common.implementsCreateMethod(TableRow)
  common.implementsTextAlignProp(TableRow, ['left', 'center', 'right'])
  common.implementsVerticalAlignProp(TableRow)

  common.propKeyOnlyToClassName(TableRow, 'active')
  common.propKeyOnlyToClassName(TableRow, 'disabled')
  common.propKeyOnlyToClassName(TableRow, 'error')
  common.propKeyOnlyToClassName(TableRow, 'negative')
  common.propKeyOnlyToClassName(TableRow, 'positive')
  common.propKeyOnlyToClassName(TableRow, 'warning')

  it('renders as a tr by default', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRow />
        </tbody>
      </table>,
    )
    expect(container.querySelector('tr')).toBeInTheDocument()
    expect(container.querySelector('tr').tagName).toBe('TR')
  })

  describe('shorthand', () => {
    const cells = ['Name', 'Status', 'Notes']

    it('renders empty tr with no shorthand', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow />
          </tbody>
        </table>,
      )
      expect(container.querySelectorAll('td')).toHaveLength(0)
    })

    it('renders the cells', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow cells={cells} />
          </tbody>
        </table>,
      )
      expect(container.querySelectorAll('td')).toHaveLength(cells.length)
    })

    it('renders the cells using cellAs', () => {
      const { container } = render(
        <table>
          <tbody>
            <TableRow cells={cells} cellAs='th' />
          </tbody>
        </table>,
      )
      const thCells = container.querySelectorAll('th')

      expect(thCells).toHaveLength(cells.length)

      thCells.forEach((cell) => {
        expect(cell.tagName).toBe('TH')
      })
    })
  })
})
