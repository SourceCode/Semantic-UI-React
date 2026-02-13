import * as React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Import components individually to avoid any barrel export issues
import Accordion from '../../src/modules/Accordion/Accordion'
import Breadcrumb from '../../src/collections/Breadcrumb/Breadcrumb'
import Button from '../../src/elements/Button/Button'
import Card from '../../src/views/Card/Card'
import Checkbox from '../../src/modules/Checkbox/Checkbox'
import Comment from '../../src/views/Comment/Comment'
import Confirm from '../../src/addons/Confirm/Confirm'
import Container from '../../src/elements/Container/Container'
import Dimmer from '../../src/modules/Dimmer/Dimmer'
import Divider from '../../src/elements/Divider/Divider'
import Dropdown from '../../src/modules/Dropdown/Dropdown'
import Embed from '../../src/modules/Embed/Embed'
import Feed from '../../src/views/Feed/Feed'
import Flag from '../../src/elements/Flag/Flag'
import Form from '../../src/collections/Form/Form'
import Grid from '../../src/collections/Grid/Grid'
import Header from '../../src/elements/Header/Header'
import Icon from '../../src/elements/Icon/Icon'
import Image from '../../src/elements/Image/Image'
import Input from '../../src/elements/Input/Input'
import Item from '../../src/views/Item/Item'
import Label from '../../src/elements/Label/Label'
import List from '../../src/elements/List/List'
import Loader from '../../src/elements/Loader/Loader'
import Menu from '../../src/collections/Menu/Menu'
import Message from '../../src/collections/Message/Message'
import Modal from '../../src/modules/Modal/Modal'
import ModalHeader from '../../src/modules/Modal/ModalHeader'
import ModalContent from '../../src/modules/Modal/ModalContent'
import Pagination from '../../src/addons/Pagination/Pagination'
import Placeholder from '../../src/elements/Placeholder/Placeholder'
import Popup from '../../src/modules/Popup/Popup'
import Progress from '../../src/modules/Progress/Progress'
import Rail from '../../src/elements/Rail/Rail'
import Rating from '../../src/modules/Rating/Rating'
import Reveal from '../../src/elements/Reveal/Reveal'
import RevealContent from '../../src/elements/Reveal/RevealContent'
import Search from '../../src/modules/Search/Search'
import Segment from '../../src/elements/Segment/Segment'
import Sidebar from '../../src/modules/Sidebar/Sidebar'
import Statistic from '../../src/views/Statistic/Statistic'
import Step from '../../src/elements/Step/Step'
import StepGroup from '../../src/elements/Step/StepGroup'
import Tab from '../../src/modules/Tab/Tab'
import Table from '../../src/collections/Table/Table'
import TableBody from '../../src/collections/Table/TableBody'
import TableRow from '../../src/collections/Table/TableRow'
import TableCell from '../../src/collections/Table/TableCell'
import Advertisement from '../../src/views/Advertisement/Advertisement'

const components: Array<[string, () => React.ReactElement]> = [
  ['Accordion', () => <Accordion panels={[]} />],
  ['Breadcrumb', () => <Breadcrumb sections={[{ key: 'home', content: 'Home' }]} />],
  ['Button', () => <Button>Click</Button>],
  ['Card', () => <Card />],
  ['Checkbox', () => <Checkbox />],
  ['Comment', () => <Comment />],
  ['Confirm', () => <Confirm open={false} />],
  ['Container', () => <Container>Content</Container>],
  ['Dimmer', () => <Dimmer active={false} />],
  ['Divider', () => <Divider />],
  ['Dropdown', () => <Dropdown options={[]} />],
  ['Embed', () => <Embed id="test" source="youtube" active={false} />],
  ['Feed', () => <Feed />],
  ['Flag', () => <Flag name="us" />],
  ['Form', () => <Form />],
  ['Grid', () => <Grid />],
  ['Header', () => <Header>Title</Header>],
  ['Icon', () => <Icon name="home" />],
  ['Image', () => <Image src="test.png" />],
  ['Input', () => <Input />],
  ['Item', () => <Item />],
  ['Label', () => <Label>Tag</Label>],
  ['List', () => <List />],
  ['Loader', () => <Loader />],
  ['Menu', () => <Menu />],
  ['Message', () => <Message>Info</Message>],
  ['Modal', () => <Modal open={false}><ModalHeader>Title</ModalHeader><ModalContent>Content</ModalContent></Modal>],
  ['Pagination', () => <Pagination totalPages={10} activePage={1} />],
  ['Placeholder', () => <Placeholder />],
  ['Popup', () => <Popup trigger={<Button>Open</Button>} content="Info" />],
  ['Progress', () => <Progress percent={50} />],
  ['Rail', () => <Rail position="left">Rail</Rail>],
  ['Rating', () => <Rating />],
  ['Reveal', () => <Reveal animated="fade"><RevealContent visible>A</RevealContent><RevealContent hidden>B</RevealContent></Reveal>],
  ['Search', () => <Search />],
  ['Segment', () => <Segment>Content</Segment>],
  ['Sidebar', () => <Sidebar visible={false}>Side</Sidebar>],
  ['Statistic', () => <Statistic />],
  ['Step', () => <StepGroup><Step>One</Step></StepGroup>],
  ['Tab', () => <Tab panes={[{ menuItem: 'Tab 1', render: () => <div>Content</div> }]} />],
  ['Table', () => <Table><TableBody><TableRow><TableCell>Cell</TableCell></TableRow></TableBody></Table>],
  ['Advertisement', () => <Advertisement unit="medium rectangle" />],
]

describe('All components render without errors', () => {
  components.forEach(([name, renderFn]) => {
    it(`${name} renders without throwing`, () => {
      expect(() => render(renderFn())).not.toThrow()
    })
  })
})
