import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'

import Button from '../../src/elements/Button/Button'
import Container from '../../src/elements/Container/Container'
import Dropdown from '../../src/modules/Dropdown/Dropdown'
import Form from '../../src/collections/Form/Form'
import Grid from '../../src/collections/Grid/Grid'
import GridColumn from '../../src/collections/Grid/GridColumn'
import Header from '../../src/elements/Header/Header'
import Menu from '../../src/collections/Menu/Menu'
import MenuItem from '../../src/collections/Menu/MenuItem'
import Modal from '../../src/modules/Modal/Modal'
import Table from '../../src/collections/Table/Table'
import TableBody from '../../src/collections/Table/TableBody'
import TableRow from '../../src/collections/Table/TableRow'
import TableCell from '../../src/collections/Table/TableCell'

const ssrComponents: Array<[string, () => React.ReactElement]> = [
  ['Button', () => <Button primary>Click</Button>],
  ['Dropdown', () => <Dropdown options={[{ key: 1, text: 'A', value: 1 }]} />],
  ['Form', () => <Form><Form.Input label="Name" /></Form>],
  ['Grid', () => <Grid><GridColumn>Col</GridColumn></Grid>],
  ['Menu', () => <Menu><MenuItem>Home</MenuItem></Menu>],
  ['Modal', () => <Modal open={false}>Content</Modal>],
  ['Table', () => <Table><TableBody><TableRow><TableCell>Cell</TableCell></TableRow></TableBody></Table>],
]

describe('Server-Side Rendering', () => {
  ssrComponents.forEach(([name, factory]) => {
    it(`${name} renders to string without errors`, () => {
      expect(() => renderToString(factory())).not.toThrow()
    })

    it(`${name} produces valid HTML string`, () => {
      const html = renderToString(factory())
      expect(html).toContain('<')
      expect(html).not.toContain('undefined')
      expect(html).not.toContain('NaN')
    })
  })

  it('complex page renders to string', () => {
    const App = () => (
      <Container>
        <Header>Test</Header>
        <Button>Click</Button>
        <Form>
          <Form.Input label="Name" />
        </Form>
      </Container>
    )

    const html = renderToString(<App />)
    expect(html).toContain('ui container')
    expect(html).toContain('ui header')
    expect(html).toContain('ui button')
  })
})
