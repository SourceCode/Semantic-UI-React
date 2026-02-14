import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableFooter from 'src/collections/Table/TableFooter'

describe('TableFooter', () => {
  common.isConformant(TableFooter)

  it('renders as a tfoot by default', () => {
    const { container } = render(
      <table>
        <TableFooter />
      </table>,
    )
    expect(container.querySelector('tfoot')).toBeInTheDocument()
    expect(container.querySelector('tfoot').tagName).toBe('TFOOT')
  })
})
