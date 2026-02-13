import * as React from 'react'
import { render, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import Dropdown from '../../src/modules/Dropdown/Dropdown'
import Table from '../../src/collections/Table/Table'
import TableBody from '../../src/collections/Table/TableBody'
import TableRow from '../../src/collections/Table/TableRow'
import TableCell from '../../src/collections/Table/TableCell'
import Button from '../../src/elements/Button/Button'
import Modal from '../../src/modules/Modal/Modal'
import ModalContent from '../../src/modules/Modal/ModalContent'

describe('Stress Tests', () => {
  it('Dropdown handles 1000 options without crashing', () => {
    const options = Array.from({ length: 1000 }, (_, i) => ({
      key: i,
      text: `Option ${i}`,
      value: i,
    }))
    expect(() => render(<Dropdown options={options} search selection />)).not.toThrow()
  })

  it('Table renders 500 rows within reasonable time', () => {
    const start = performance.now()
    render(
      <Table>
        <TableBody>
          {Array.from({ length: 500 }, (_, i) => (
            <TableRow key={i}>
              <TableCell>Cell {i}</TableCell>
              <TableCell>Data {i}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>,
    )
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(10000) // Should render within 10 seconds
  })

  it('Modal handles rapid open/close without crashing', () => {
    const TestModal = () => {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <Button data-testid="trigger" onClick={() => setOpen(true)}>Open</Button>
          <Modal open={open} onClose={() => setOpen(false)}>
            <ModalContent>Content</ModalContent>
          </Modal>
        </>
      )
    }

    const { getByTestId } = render(<TestModal />)

    for (let i = 0; i < 50; i++) {
      act(() => {
        getByTestId('trigger').click()
      })
      act(() => {
        const dimmer = document.querySelector('.ui.dimmer')
        if (dimmer) (dimmer as HTMLElement).click()
      })
    }
    // If we get here without crashing, the test passes
  })

  it('Multiple simultaneous components render without conflict', () => {
    expect(() =>
      render(
        <div>
          {Array.from({ length: 20 }, (_, i) => (
            <Dropdown key={i} options={[{ key: 1, text: 'A', value: 1 }]} />
          ))}
        </div>,
      ),
    ).not.toThrow()
  })
})
