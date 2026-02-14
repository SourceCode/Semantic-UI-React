import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableHeaderCell from 'src/collections/Table/TableHeaderCell'

describe('TableHeaderCell', () => {
  common.isConformant(TableHeaderCell)
  common.propKeyAndValueToClassName(TableHeaderCell, 'sorted', ['ascending', 'descending'])

  it('renders as a th by default', () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <TableHeaderCell />
          </tr>
        </thead>
      </table>,
    )
    expect(container.querySelector('th')).toBeInTheDocument()
    expect(container.querySelector('th').tagName).toBe('TH')
  })
})
