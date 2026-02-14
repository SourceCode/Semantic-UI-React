import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableBody from 'src/collections/Table/TableBody'

describe('TableBody', () => {
  common.isConformant(TableBody)
  common.rendersChildren(TableBody, {
    rendersContent: false,
  })

  it('renders as a tbody by default', () => {
    const { container } = render(
      <table>
        <TableBody />
      </table>,
    )
    expect(container.querySelector('tbody')).toBeInTheDocument()
    expect(container.querySelector('tbody').tagName).toBe('TBODY')
  })
})
