import * as React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe, toHaveNoViolations } from 'jest-axe'

import Button from '../../src/elements/Button/Button'
import Checkbox from '../../src/modules/Checkbox/Checkbox'
import Form from '../../src/collections/Form/Form'
import Input from '../../src/elements/Input/Input'
import Menu from '../../src/collections/Menu/Menu'
import MenuItem from '../../src/collections/Menu/MenuItem'
import Message from '../../src/collections/Message/Message'
import Pagination from '../../src/addons/Pagination/Pagination'
import Progress from '../../src/modules/Progress/Progress'
import Rating from '../../src/modules/Rating/Rating'
import Search from '../../src/modules/Search/Search'
import Table from '../../src/collections/Table/Table'
import TableHeader from '../../src/collections/Table/TableHeader'
import TableBody from '../../src/collections/Table/TableBody'
import TableRow from '../../src/collections/Table/TableRow'
import TableCell from '../../src/collections/Table/TableCell'
import TableHeaderCell from '../../src/collections/Table/TableHeaderCell'

expect.extend(toHaveNoViolations)

const accessibleComponents: Array<[string, React.ReactElement]> = [
  ['Button', <Button>Click me</Button>],
  ['Checkbox', <Checkbox label="Accept terms" />],
  ['Form', (
    <Form>
      <Form.Input label="Name" id="name" />
    </Form>
  )],
  ['Input', <Input placeholder="Search..." />],
  ['Menu', (
    <Menu>
      <MenuItem active>Home</MenuItem>
      <MenuItem>About</MenuItem>
    </Menu>
  )],
  ['Message', <Message header="Info" content="Information message" />],
  ['Pagination', <Pagination totalPages={10} activePage={1} />],
  ['Progress', <Progress percent={50} />],
  ['Rating', <Rating maxRating={5} rating={3} />],
  ['Search', <Search />],
  ['Table', (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )],
]

describe('Accessibility (axe-core)', () => {
  accessibleComponents.forEach(([name, element]) => {
    it(`${name} has no critical accessibility violations`, async () => {
      const { container } = render(element)
      const results = await axe(container, {
        rules: {
          // Disable rules that require full page context
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          region: { enabled: false },
        },
      })
      expect(results).toHaveNoViolations()
    })
  })
})
