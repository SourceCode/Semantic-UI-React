import _ from 'lodash'
import { faker } from '@faker-js/faker'
import { render, fireEvent } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import { consoleUtil, domEvent } from 'test/utils'
import Dropdown from 'src/modules/Dropdown/Dropdown'
import DropdownDivider from 'src/modules/Dropdown/DropdownDivider'
import DropdownHeader from 'src/modules/Dropdown/DropdownHeader'
import DropdownItem from 'src/modules/Dropdown/DropdownItem'
import DropdownMenu from 'src/modules/Dropdown/DropdownMenu'
import DropdownSearchInput from 'src/modules/Dropdown/DropdownSearchInput'
import DropdownText from 'src/modules/Dropdown/DropdownText'

let attachTo
let options
let wrapper

// ----------------------------------------
// Wrapper
// ----------------------------------------
const wrapperMount = (node) => {
  attachTo = document.createElement('div')
  document.body.appendChild(attachTo)

  const result = render(node, { container: attachTo })
  wrapper = result
  return result
}

// ----------------------------------------
// Options
// ----------------------------------------
const getOptions = (count = 5) =>
  _.times(count, (i) => {
    const text = [i, ..._.times(3, faker.hacker.noun)].join(' ')
    const value = _.snakeCase(text)
    return { text, value }
  })

// -------------------------------
// Common Assertions
// -------------------------------
const dropdownMenuIsClosed = () => {
  const root = attachTo.firstChild
  expect(root).not.toHaveClass('visible')

  const menu = root.querySelector('.menu')
  expect(menu).not.toHaveClass('visible')
}

const dropdownMenuIsOpen = () => {
  const root = attachTo.firstChild
  expect(root).toHaveClass('active')
  expect(root).toHaveClass('visible')

  const menu = root.querySelector('.menu')
  expect(menu).toHaveClass('visible')
}

const nativeEvent = { nativeEvent: { stopImmediatePropagation: _.noop } }

describe('Dropdown', () => {
  beforeEach(() => {
    attachTo = undefined
    wrapper = undefined
    options = getOptions()
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      try {
        wrapper.unmount()
        // eslint-disable-next-line no-empty
      } catch {}
    }
    if (attachTo && attachTo.parentNode) document.body.removeChild(attachTo)
  })

  common.isConformant(Dropdown)
  common.hasUIClassName(Dropdown)
  common.hasSubcomponents(Dropdown, [
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    DropdownMenu,
    DropdownSearchInput,
    DropdownText,
  ])

  common.implementsIconProp(Dropdown, {
    defaultValue: 'search',
    assertExactMatch: false,
    autoGenerateKey: false,
  })
  common.implementsShorthandProp(Dropdown, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: DropdownHeader,
    mapValueToProps: (val) => ({ content: val }),
  })

  common.propKeyOnlyToClassName(Dropdown, 'disabled')
  common.propKeyOnlyToClassName(Dropdown, 'error')
  common.propKeyOnlyToClassName(Dropdown, 'loading')
  common.propKeyOnlyToClassName(Dropdown, 'basic')
  common.propKeyOnlyToClassName(Dropdown, 'button')
  common.propKeyOnlyToClassName(Dropdown, 'compact')
  common.propKeyOnlyToClassName(Dropdown, 'fluid')
  common.propKeyOnlyToClassName(Dropdown, 'floating')
  common.propKeyOnlyToClassName(Dropdown, 'inline')
  common.propKeyOnlyToClassName(Dropdown, 'labeled')
  common.propKeyOnlyToClassName(Dropdown, 'item')
  common.propKeyOnlyToClassName(Dropdown, 'multiple')
  common.propKeyOnlyToClassName(Dropdown, 'search')
  common.propKeyOnlyToClassName(Dropdown, 'selection')
  common.propKeyOnlyToClassName(Dropdown, 'simple')
  common.propKeyOnlyToClassName(Dropdown, 'scrolling')
  common.propKeyOnlyToClassName(Dropdown, 'upward')

  common.propKeyOrValueAndKeyToClassName(Dropdown, 'pointing', [
    'left',
    'right',
    'top',
    'top left',
    'top right',
    'bottom',
    'bottom left',
    'bottom right',
  ])

  describe('defaultSearchQuery', () => {
    it('changes default value of searchQuery', () => {
      wrapperMount(<Dropdown defaultSearchQuery='foo' search />)
      expect(attachTo.querySelector('input.search').value).toBe('foo')
    })
  })

  it('closes on blur', () => {
    wrapperMount(<Dropdown options={options} />)
    fireEvent.click(attachTo.firstChild)

    dropdownMenuIsOpen()
    fireEvent.blur(attachTo.firstChild)
    dropdownMenuIsClosed()
  })

  it('does not close on blur with closeOnBlur set to false', () => {
    wrapperMount(<Dropdown options={options} closeOnBlur={false} />)
    fireEvent.click(attachTo.firstChild)

    dropdownMenuIsOpen()
    fireEvent.blur(attachTo.firstChild)
    dropdownMenuIsOpen()
  })

  it('opens on focus', () => {
    wrapperMount(<Dropdown options={options} />)

    dropdownMenuIsClosed()
    fireEvent.focus(attachTo.firstChild)
    dropdownMenuIsOpen()
  })

  describe('disabled', () => {
    it('does not open on click', () => {
      wrapperMount(<Dropdown options={options} disabled />)

      dropdownMenuIsClosed()
      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsClosed()
    })

    it('does not open on click with pointer events enabled', () => {
      wrapperMount(<Dropdown options={options} disabled style={{ pointerEvents: 'all' }} />)

      dropdownMenuIsClosed()
      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsClosed()
    })

    it('does not open on focus', () => {
      wrapperMount(<Dropdown options={options} disabled />)

      dropdownMenuIsClosed()
      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsClosed()
    })
  })

  describe('tabIndex', () => {
    it('defaults to 0', () => {
      wrapperMount(<Dropdown options={options} />)
      expect(attachTo.firstChild).toHaveAttribute('tabIndex', '0')
    })

    it('defaults to -1 when disabled', () => {
      wrapperMount(<Dropdown disabled options={options} />)
      expect(attachTo.firstChild).toHaveAttribute('tabIndex', '-1')
    })

    it('applies when defined', () => {
      wrapperMount(<Dropdown options={options} tabIndex={1} />)
      expect(attachTo.firstChild).toHaveAttribute('tabIndex', '1')
    })

    describe('search', () => {
      it('defaults the search input to 0', () => {
        wrapperMount(<Dropdown options={options} selection search />)
        expect(attachTo.querySelector('input.search')).toHaveAttribute('tabIndex', '0')
      })

      it('defaults the disabled search input to -1', () => {
        wrapperMount(<Dropdown disabled options={options} selection search />)
        expect(attachTo.querySelector('input.search')).toHaveAttribute('tabIndex', '-1')
      })

      it('allows explicitly setting the search input value', () => {
        wrapperMount(<Dropdown options={options} selection search tabIndex={123} />)
        expect(attachTo.querySelector('input.search')).toHaveAttribute('tabIndex', '123')
      })

      it('allows explicitly setting the search input value when disabled', () => {
        wrapperMount(<Dropdown disabled options={options} selection search tabIndex={123} />)
        expect(attachTo.querySelector('input.search')).toHaveAttribute('tabIndex', '123')
      })

      it('is not present on the root when is search', () => {
        wrapperMount(<Dropdown options={options} selection search />)
        expect(attachTo.firstChild).not.toHaveAttribute('tabIndex')
      })

      it('is not present on the root when is search and defined', () => {
        wrapperMount(<Dropdown options={options} selection search tabIndex={1} />)
        expect(attachTo.firstChild).not.toHaveAttribute('tabIndex')
      })
    })
  })

  describe('aria', () => {
    it('should label normal dropdown as a listbox', () => {
      wrapperMount(<Dropdown />)
      expect(attachTo.querySelector('div')).toHaveAttribute('role', 'listbox')
    })
    it('should label search dropdown as a combobox', () => {
      wrapperMount(<Dropdown search />)
      expect(attachTo.querySelector('div')).toHaveAttribute('role', 'combobox')
    })
    it('should label search dropdownMenu as a listbox', () => {
      wrapperMount(<Dropdown search />)
      expect(attachTo.querySelector('.menu')).toHaveAttribute('role', 'listbox')
    })
    it('should label search multiple dropdownMenu as aria-multiselectable', () => {
      wrapperMount(<Dropdown search multiple />)
      expect(attachTo.querySelector('.menu')).toHaveAttribute('aria-multiselectable', 'true')
    })
    it('should not label normal dropdownMenu with a role', () => {
      wrapperMount(<Dropdown />)
      expect(attachTo.querySelector('.menu')).not.toHaveAttribute('role')
    })
    it('should label disabled dropdown as aria-disabled', () => {
      wrapperMount(<Dropdown disabled />)
      expect(attachTo.querySelector('div')).toHaveAttribute('aria-disabled', 'true')
    })
    it('should label normal dropdown without aria-disabled', () => {
      wrapperMount(<Dropdown />)
      expect(attachTo.querySelector('div')).not.toHaveAttribute('aria-disabled')
    })
    it('should label multiple dropdown as aria-multiselectable', () => {
      wrapperMount(<Dropdown multiple />)
      expect(attachTo.querySelector('div')).toHaveAttribute('aria-multiselectable', 'true')
    })
    it('should not label multiple search dropdown as aria-multiselectable', () => {
      wrapperMount(<Dropdown search multiple />)
      expect(attachTo.querySelector('div')).not.toHaveAttribute('aria-multiselectable')
    })
    it('should label normal dropdown without aria-multiselectable', () => {
      wrapperMount(<Dropdown />)
      expect(attachTo.querySelector('div')).not.toHaveAttribute('aria-multiselectable')
    })
    it('should label loading dropdown as aria-busy', () => {
      wrapperMount(<Dropdown loading />)
      expect(attachTo.querySelector('div')).toHaveAttribute('aria-busy', 'true')
    })
    it('should label normal dropdown without aria-busy', () => {
      wrapperMount(<Dropdown />)
      expect(attachTo.querySelector('div')).not.toHaveAttribute('aria-busy')
    })
    it('should label search dropdown input aria-autocomplete=list', () => {
      wrapperMount(<Dropdown search />)
      expect(attachTo.querySelector('input')).toHaveAttribute('aria-autocomplete', 'list')
    })
    it('should label search dropdown input type=text', () => {
      wrapperMount(<Dropdown search />)
      expect(attachTo.querySelector('input')).toHaveAttribute('type', 'text')
    })
  })

  describe('clearable', () => {
    it('does not clear when value is empty', () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown clearable onChange={onChange} />)

      fireEvent.click(attachTo.querySelector('i.icon'), { stopPropagation: _.noop })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not clear when is multiple and value is empty', () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown clearable multiple onChange={onChange} />)

      fireEvent.click(attachTo.querySelector('i.icon'), { stopPropagation: _.noop })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('clears when value is not empty', () => {
      const defaultValue = options[1].value
      const onChange = vi.fn()

      wrapperMount(
        <Dropdown defaultValue={defaultValue} clearable onChange={onChange} options={options} />,
      )
      fireEvent.click(attachTo.querySelector('i.clear'), { stopPropagation: _.noop })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: '' }),
      )
      expect(attachTo.querySelectorAll('.selected.item')).toHaveLength(1)
      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('selected')
    })

    it('clears when value is multiple and is not empty', () => {
      const defaultValue = _.map(options, 'value')
      const onChange = vi.fn()

      wrapperMount(
        <Dropdown
          defaultValue={defaultValue}
          clearable
          multiple
          onChange={onChange}
          options={options}
        />,
      )
      fireEvent.click(attachTo.querySelector('i.clear'), { stopPropagation: _.noop })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: [] }),
      )
      expect(attachTo.querySelectorAll('.selected.item')).toHaveLength(1)
      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('selected')
    })
  })

  describe('handleBlur', () => {
    it('passes the event to the onBlur prop', () => {
      const onBlur = vi.fn()

      wrapperMount(<Dropdown onBlur={onBlur} />)
      fireEvent.blur(attachTo.firstChild, { foo: 'bar' })

      expect(onBlur).toHaveBeenCalledOnce()
    })

    it('does not call handleChange if the value has not changed', () => {
      const onChange = vi.fn()

      wrapperMount(<Dropdown onChange={onChange} options={options} selectOnBlur />)

      // focus, open and select an item
      fireEvent.click(attachTo.firstChild)
      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsOpen()

      fireEvent.click(attachTo.querySelectorAll('.item')[2])
      dropdownMenuIsClosed()
      expect(onChange).toHaveBeenCalledOnce()

      fireEvent.click(attachTo.firstChild)
      fireEvent.click(attachTo.querySelectorAll('.item')[2])
      dropdownMenuIsClosed()
      expect(onChange).toHaveBeenCalledOnce()
    })

    it('sets searchQuery state to empty', () => {
      wrapperMount(<Dropdown defaultSearchQuery='foo' search />)

      fireEvent.blur(attachTo.firstChild)
      expect(attachTo.querySelector('input.search').value).toBe('')
    })

    it('does not call onBlur when the mouse is down', () => {
      const onBlur = vi.fn()

      wrapperMount(<Dropdown onBlur={onBlur} selectOnBlur />)

      fireEvent.mouseDown(attachTo.firstChild)
      fireEvent.blur(attachTo.firstChild)

      expect(onBlur).not.toHaveBeenCalled()
    })
  })

  describe('handleClose', () => {
    // TODO: jsdom timing issue - dropdown doesn't close synchronously after item click in RTL
    it.skip('prevents Space from opening a search Dropdown after selecting an item', () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown options={options} selection onChange={onChange} />)

      // open, click an item
      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      fireEvent.click(attachTo.querySelectorAll('.item')[0])

      // verify item was selected (value changed)
      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: options[0].value }),
      )

      // The dropdown should close after selecting an item
      dropdownMenuIsClosed()

      // The dropdown will be still focused after an item will be selected
      if (document.activeElement !== document.body) {
        document.activeElement.blur()
      }

      // doesn't open on space
      fireEvent.keyDown(attachTo.firstChild, { key: ' ', keyCode: 32 })
      dropdownMenuIsClosed()
    })
  })

  describe('closeOnChange', () => {
    it('will close when defined and dropdown is multiple', () => {
      wrapperMount(
        <Dropdown selection multiple search closeOnChange options={options} />,
      )
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()

      fireEvent.click(attachTo.querySelectorAll('.item')[0], nativeEvent)

      dropdownMenuIsClosed()
    })

    it('will remain open when undefined and dropdown is multiple', () => {
      wrapperMount(<Dropdown selection multiple search options={options} />)
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()

      fireEvent.click(attachTo.querySelectorAll('.item')[0], nativeEvent)

      dropdownMenuIsOpen()
    })
  })

  describe('closeOnEscape', () => {
    it('closes the dropdown when Escape key is pressed by default', () => {
      wrapperMount(<Dropdown defaultOpen />)

      dropdownMenuIsOpen()

      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsClosed()
    })

    it('closes the dropdown when is "true" and Escape key is pressed', () => {
      wrapperMount(<Dropdown defaultOpen closeOnEscape />)

      dropdownMenuIsOpen()

      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsClosed()
    })

    it('does not close the dropdown when false and Escape key is pressed', () => {
      wrapperMount(<Dropdown defaultOpen closeOnEscape={false} />)

      dropdownMenuIsOpen()

      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsOpen()
    })
  })

  describe('setSelectedIndex', () => {
    it('will call setSelectedIndex if options change', () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      expect(attachTo.querySelectorAll('.selected.item')).toHaveLength(1)
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')

      wrapper.rerender(<Dropdown options={[]} />)
      expect(attachTo.querySelector('.selected.item')).not.toBeInTheDocument()
    })

    it('will not call setSelectedIndex if options have not changed', () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')

      wrapper.rerender(<Dropdown options={options} />)
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')
    })
  })

  describe('selectedIndex', () => {
    it('sets "selectedIndex" when an item was selected', () => {
      const option = _.last(options)

      wrapperMount(<Dropdown options={options} search selection />)
      const input = attachTo.querySelector('input.search')

      // open, simulate search and select option
      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')

      fireEvent.change(input, { target: { value: option.text } })
      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })
      expect(attachTo.querySelectorAll('.item')[4]).toHaveClass('selected')

      // open again
      fireEvent.click(attachTo.firstChild)
      expect(attachTo.querySelectorAll('.item')[4]).toHaveClass('selected')
    })

    it('keeps "selectedIndex" when the same item was selected', () => {
      const option = _.last(options)

      wrapperMount(<Dropdown options={options} search selection />)
      const input = attachTo.querySelector('input.search')

      // simulate search and select option
      fireEvent.change(input, { target: { value: option.text } })
      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })
      expect(attachTo.querySelectorAll('.item')[4]).toHaveClass('selected')

      // select the same option again
      fireEvent.change(input, { target: { value: option.text } })
      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })
      expect(attachTo.querySelectorAll('.item')[4]).toHaveClass('selected')
    })
  })

  describe('isMouseDown', () => {
    it('tracks when the mouse is down', () => {
      wrapperMount(<Dropdown />)
      dropdownMenuIsClosed()

      fireEvent.mouseDown(attachTo.firstChild)
      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsClosed()

      domEvent.mouseUp(document.body)
      fireEvent.blur(attachTo.firstChild)

      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsOpen()
    })
  })

  describe('icon', () => {
    it('defaults to a dropdown icon', () => {
      wrapperMount(<Dropdown />)
      expect(attachTo.querySelector('.dropdown.icon')).toBeInTheDocument()
    })

    it('always opens a dropdown on click', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(attachTo.querySelector('i.icon'))

      dropdownMenuIsOpen()
    })

    it('passes onClick handler', () => {
      const onClick = vi.fn()
      const props = { name: 'user', onClick }

      wrapperMount(<Dropdown icon={props} options={options} />)
      fireEvent.click(attachTo.querySelector('i.icon'))

      expect(onClick).toHaveBeenCalledOnce()
    })
  })

  describe('searchQuery', () => {
    it('defaults to empty string', () => {
      wrapperMount(<Dropdown search />)
      expect(attachTo.querySelector('input.search').value).toBe('')
    })

    it('passes value to state', () => {
      wrapperMount(<Dropdown search searchQuery='foo' />)
      expect(attachTo.querySelector('input.search').value).toBe('foo')
    })
  })

  describe('selected item', () => {
    it('defaults to the first item', () => {
      wrapperMount(<Dropdown options={options} selection />)
      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('selected')
    })
    it('defaults to the first non-disabled item', () => {
      options[0].disabled = true
      wrapperMount(<Dropdown options={options} selection />)

      expect(attachTo.querySelectorAll('.item')[0]).not.toHaveClass('selected')
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')
    })
    it('defaults to selected item when options are initially empty', () => {
      const randomIndex = 1 + _.random(options.length - 2)
      const value = options[randomIndex].value

      const { rerender } = wrapperMount(<Dropdown options={[]} selection value={value} />)

      rerender(<Dropdown options={options} selection value={value} />)

      expect(attachTo.querySelectorAll('.item')[randomIndex]).toHaveClass('selected')
    })
    it('is null when all options disabled', () => {
      const disabledOptions = options.map((o) => ({ ...o, disabled: true }))

      wrapperMount(<Dropdown options={disabledOptions} selection />)
      expect(attachTo.querySelector('.selected')).not.toBeInTheDocument()
    })
    it('is set when clicking an item', () => {
      const randomIndex = 1 + _.random(options.length - 2)
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(attachTo.querySelectorAll('.item')[randomIndex])
      expect(attachTo.querySelectorAll('.item')[randomIndex]).toHaveClass('selected')
    })
    it('is ignored when clicking a disabled item', () => {
      const randomIndex = 1 + _.random(options.length - 2)

      options[randomIndex].disabled = true

      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(attachTo.firstChild, nativeEvent)
      fireEvent.click(attachTo.querySelectorAll('.item')[randomIndex], nativeEvent)
      expect(attachTo.querySelectorAll('.item')[randomIndex]).not.toHaveClass('selected')

      dropdownMenuIsOpen()
    })
    it('moves down on arrow down when open', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(attachTo.querySelectorAll('.item')[0]).not.toHaveClass('selected')
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')
    })
    it('moves up on arrow up when open', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('selected')

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowUp' })

      expect(attachTo.querySelectorAll('.item')[0]).not.toHaveClass('selected')
      expect(attachTo.querySelectorAll('.item')[options.length - 1]).toHaveClass('selected')
    })
    it('skips over items filtered by search', () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'skip this one', value: 'skip this one' },
        { text: 'a2', value: 'a2' },
      ]
      wrapperMount(<Dropdown options={opts} search selection />)
      fireEvent.click(attachTo.firstChild)
      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: 'a' } })

      expect(attachTo.querySelector('.selected').textContent).toContain('a1')

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(attachTo.querySelector('.selected').textContent).toContain('a2')
    })
    it('filters diacritics on options when using deburr prop', () => {
      const inputText = 'floresti'
      const textToFind = 'FLOREŞTI'

      const opts = [
        { text: textToFind, value: '1' },
        { text: `ŞANŢU ${textToFind}`, value: '2' },
        { text: `${textToFind} Alba`, value: '3' },
      ]

      wrapperMount(<Dropdown options={opts} search deburr selection />)
      fireEvent.click(attachTo.firstChild)
      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: inputText } })

      expect(attachTo.querySelector('.selected').textContent).toContain(textToFind)
    })
    it('still works after encountering "no results"', () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'a2', value: 'a2' },
        { text: 'a3', value: 'a3' },
      ]
      wrapperMount(<Dropdown options={opts} search selection />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: 'a4' } })

      expect(attachTo.querySelectorAll('.message')).toHaveLength(1)

      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: 'a' } })

      expect(attachTo.querySelector('.message')).not.toBeInTheDocument()
      expect(attachTo.querySelector('.selected').textContent).toContain('a1')

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(attachTo.querySelector('.selected').textContent).toContain('a2')
    })
    it('skips over disabled items', () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'skip this one', value: 'skip this one', disabled: true },
        { text: 'a2', value: 'a2' },
      ]

      wrapperMount(<Dropdown options={opts} search selection />)
      fireEvent.click(attachTo.firstChild)

      expect(attachTo.querySelector('.selected').textContent).toContain('a1')

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      expect(attachTo.querySelector('.selected').textContent).toContain('a2')
    })
    it('does not enter an infinite loop when all items are disabled', () => {
      const onChange = vi.fn()
      const opts = [
        { text: '1', value: '1', disabled: true },
        { text: '2', value: '2', disabled: true },
      ]
      wrapperMount(<Dropdown onChange={onChange} options={opts} search selection />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(onChange).not.toHaveBeenCalled()
    })
    it('scrolls the selected item into view', () => {
      const opts = getOptions(20)

      wrapperMount(<Dropdown options={opts} selection />)
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()
      const menu = document.querySelector('.ui.dropdown .menu.visible')

      menu.style.height = '100px'
      menu.style.overflow = 'auto'

      expect(attachTo.querySelector('.selected').textContent).toContain(opts[0].text)

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowUp' })

      expect(attachTo.querySelector('.selected').textContent).toContain(_.last(opts).text)

      const isMenuScrolledToBottom = menu.scrollTop + menu.clientHeight === menu.scrollHeight
      expect(isMenuScrolledToBottom).toBe(true)

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(attachTo.querySelector('.selected').textContent).toContain(opts[0].text)

      const selectedItem = document.querySelector('.ui.dropdown .menu.visible .item.selected')
      const isMenuScrolledToTop = menu.scrollTop === selectedItem.offsetTop
      expect(isMenuScrolledToTop).toBe(true)
    })
    it('becomes active on enter when open', () => {
      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(attachTo.firstChild)

      const items = attachTo.querySelectorAll('.item')
      expect(items[1]).not.toHaveClass('selected')
      expect(items[1]).not.toHaveClass('active')

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })

      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('active')
    })
    it('closes the menu on ENTER key', () => {
      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()

      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })
      dropdownMenuIsClosed()
    })
    it('closes the menu on SPACE key', () => {
      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()

      fireEvent.keyDown(attachTo.firstChild, { key: 'Spacebar' })
      dropdownMenuIsClosed()
    })
    it('closes the Search menu on ENTER key', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()

      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })
      dropdownMenuIsClosed()
    })
    it('does not close the Search menu on SPACE key', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()

      fireEvent.keyDown(attachTo.firstChild, { key: 'Spacebar' })
      dropdownMenuIsOpen()
    })
    it('keeps value of the searchQuery when selection is changed', () => {
      wrapperMount(<Dropdown options={options} selection search />)

      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: 'foo' } })
      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(attachTo.querySelector('input.search').value).toBe('foo')
    })
  })

  describe('value', () => {
    it('sets the corresponding item to active', () => {
      const value = _.sample(options).value

      wrapperMount(<Dropdown options={options} selection value={value} />)
      expect(attachTo.querySelector('.item.active')).toBeInTheDocument()
    })

    it('updates active item when changed', () => {
      const value = _.sample(options).value
      let next
      while (!next || next === value) next = _.sample(options).value

      const { rerender } = wrapperMount(<Dropdown value={value} options={options} selection />)

      expect(attachTo.querySelector('.item.active')).toBeInTheDocument()

      rerender(<Dropdown value={next} options={options} selection />)

      expect(attachTo.querySelector('.item.active')).toBeInTheDocument()
    })

    it('updates text when value changed', () => {
      const initialItem = _.sample(options)
      const nextItem = _.sample(_.without(options, initialItem))

      const { rerender } = wrapperMount(
        <Dropdown options={options} selection value={initialItem.value} />,
      )
      expect(attachTo.querySelector('div.text').textContent).toContain(initialItem.text)

      rerender(<Dropdown options={options} selection value={nextItem.value} />)
      expect(attachTo.querySelector('div.text').textContent).toContain(nextItem.text)
    })

    it('updates value on down arrow', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('active')
    })

    it('updates value on up arrow', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowUp' })
      expect(attachTo.querySelectorAll('.item')[4]).toHaveClass('active')
    })
  })

  describe('text', () => {
    it('defaults to "placeholder"', () => {
      const placeholder = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} placeholder={placeholder} />)
      expect(attachTo.querySelector('div.text').textContent).toContain(placeholder)
    })
    it('sets the display text', () => {
      const text = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} selection text={text} />)
      expect(attachTo.querySelector('div.text').textContent).toContain(text)
    })
    it('prevents updates on item click if defined', () => {
      const text = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} selection text={text} />)
      fireEvent.click(attachTo.firstChild)
      fireEvent.click(attachTo.querySelectorAll('.item')[_.random(options.length - 1)])

      expect(attachTo.querySelector('div.text').textContent).toContain(text)
    })
  })

  describe('trigger', () => {
    it('displays the trigger', () => {
      const text = 'Hey there'
      const trigger = <div className='trigger'>{text}</div>

      wrapperMount(<Dropdown options={options} trigger={trigger} />)
      expect(attachTo.querySelector('.trigger').textContent).toContain(text)
    })
  })

  describe('menu', () => {
    it('opens on dropdown click', () => {
      wrapperMount(<Dropdown options={options} selection />)

      dropdownMenuIsClosed()
      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()
    })

    it('opens on arrow down when focused', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.mouseDown(attachTo.firstChild)
      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsClosed()

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      dropdownMenuIsOpen()
    })

    it('opens on space when focused', () => {
      wrapperMount(<Dropdown options={options} selection openOnFocus={false} />)

      // Focus the dropdown without mouse interaction
      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsClosed()

      // Press space to open the dropdown
      const prevented = !fireEvent.keyDown(attachTo.firstChild, { key: ' ', keyCode: 32, charCode: 32 })
      dropdownMenuIsOpen()
      // fireEvent returns false when preventDefault was called
      expect(prevented).toBe(true)
    })

    it('does not open on arrow down when not focused', () => {
      wrapperMount(<Dropdown options={options} selection />)
      dropdownMenuIsClosed()

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      dropdownMenuIsClosed()
    })

    it('does not open on space when not focused', () => {
      wrapperMount(<Dropdown options={options} selection />)
      dropdownMenuIsClosed()

      fireEvent.keyDown(attachTo.firstChild, { key: 'Spacebar' })
      dropdownMenuIsClosed()
    })

    it('closes on dropdown click', () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen />)

      dropdownMenuIsOpen()
      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsClosed()
    })

    it('closes on menu item click', () => {
      wrapperMount(<Dropdown options={options} selection />)
      const randomIndex = _.random(options.length - 1)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      fireEvent.mouseDown(attachTo.querySelectorAll('.item')[randomIndex])
      fireEvent.click(attachTo.querySelectorAll('.item')[randomIndex])
      dropdownMenuIsClosed()
    })

    it('closes on click outside', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      domEvent.click(document.body)
      dropdownMenuIsClosed()
    })

    it('handles focus correctly', () => {
      wrapperMount(<Dropdown options={options} selection />)
      expect(document.activeElement).toBe(document.body)

      attachTo.firstChild.focus()
      expect(document.activeElement).toBe(attachTo.firstChild)

      // Explicitly blur the dropdown to verify focus is removed
      attachTo.firstChild.blur()
      expect(document.activeElement).toBe(document.body)
    })

    it('closes on esc key', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsClosed()
    })
  })

  describe('onOpen', () => {
    it('called when dropdown would open', () => {
      const onOpen = vi.fn()
      wrapperMount(<Dropdown options={options} selection onOpen={onOpen} />)

      fireEvent.click(attachTo.firstChild)
      expect(onOpen).toHaveBeenCalledOnce()
    })

    it('not called when dropdown would not open', () => {
      const onOpen = vi.fn()
      wrapperMount(<Dropdown options={options} selection onOpen={onOpen} />)

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      expect(onOpen).not.toHaveBeenCalled()
    })
  })

  describe('onClose', () => {
    it('called when dropdown would close', () => {
      const onClose = vi.fn()
      wrapperMount(<Dropdown defaultOpen onClose={onClose} options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('called once even when blurred', () => {
      const onClose = vi.fn()
      wrapperMount(<Dropdown defaultOpen onClose={onClose} options={options} selection />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.blur(attachTo.firstChild)
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('open', () => {
    it('defaultOpen opens the menu when true', () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen />)
      dropdownMenuIsOpen()
    })
    it('defaultOpen opens the menu on search dropdowns', () => {
      wrapperMount(<Dropdown search options={options} selection defaultOpen />)
      dropdownMenuIsOpen()
    })
    it('defaultOpen closes the menu when false', () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen={false} />)
      dropdownMenuIsClosed()
    })
    it('opens the menu when true', () => {
      wrapperMount(<Dropdown options={options} selection open />)
      dropdownMenuIsOpen()
    })
    it('closes the menu when false', () => {
      wrapperMount(<Dropdown options={options} selection open={false} />)
      dropdownMenuIsClosed()
    })
    it('closes the menu when toggled from true to false', () => {
      const { rerender } = wrapperMount(<Dropdown options={options} selection open />)
      rerender(<Dropdown options={options} selection open={false} />)
      dropdownMenuIsClosed()
    })
    it('opens the menu when toggled from false to true', () => {
      const { rerender } = wrapperMount(<Dropdown options={options} selection open={false} />)
      rerender(<Dropdown options={options} selection open />)
      dropdownMenuIsOpen()
    })
  })

  describe('multiple', () => {
    it('does not close the menu on item selection with enter', () => {
      wrapperMount(<Dropdown options={options} selection multiple />)
      fireEvent.click(attachTo.firstChild)

      dropdownMenuIsOpen()

      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })
      dropdownMenuIsOpen()
    })
    it('does not close the menu on clicking on an item', () => {
      wrapperMount(<Dropdown options={options} selection multiple />)
      fireEvent.click(attachTo.firstChild, nativeEvent)
      fireEvent.click(attachTo.querySelectorAll('.item')[_.random(options.length - 1)], nativeEvent)

      dropdownMenuIsOpen()
    })
    it('filters active options out of the list', () => {
      const value = _.map(options, 'value')

      wrapperMount(<Dropdown options={options} selection value={value} multiple />)
      expect(attachTo.querySelector('.item')).not.toBeInTheDocument()
    })
    it('has labels with delete icons', () => {
      const value = [_.head(options).value]
      wrapperMount(<Dropdown options={options} selection value={value} multiple />)
      expect(attachTo.querySelector('.label')).toBeInTheDocument()
      expect(attachTo.querySelector('.label .delete.icon')).toBeInTheDocument()
    })
    it('enables custom rendering', () => {
      const value = [_.head(options).value]
      const renderLabel = () => ({ content: 'My custom text!', as: 'div' })

      wrapperMount(
        <Dropdown options={options} selection value={value} multiple renderLabel={renderLabel} />,
      )
      expect(attachTo.querySelector('.label')).toBeInTheDocument()

      const label = attachTo.querySelector('.label')

      expect(label.textContent).toContain('My custom text!')
      expect(label.tagName).toBe('DIV')
    })

    describe('selecting items', () => {
      it('does not close the menu on clicking on a label', () => {
        const value = _.map(options, 'value')
        const randomIndex = _.random(options.length - 1)

        wrapperMount(<Dropdown options={options} selection multiple value={value} />)
        fireEvent.click(attachTo.firstChild, nativeEvent)
        fireEvent.click(attachTo.querySelectorAll('.label')[randomIndex], nativeEvent)

        dropdownMenuIsOpen()
      })

      it('refocuses search on select', () => {
        const randomIndex = _.random(options.length - 1)

        wrapperMount(<Dropdown options={options} search selection multiple />)
        fireEvent.click(attachTo.firstChild, nativeEvent)
        fireEvent.click(attachTo.querySelectorAll('.item')[randomIndex], nativeEvent)

        expect(document.querySelector('input.search')).toBe(document.activeElement)
      })
    })
    describe('removing items', () => {
      it('calls onChange without the clicked value', () => {
        const value = _.map(options, 'value')
        const randomIndex = _.random(options.length - 1)
        const randomValue = value[randomIndex]
        const expected = _.without(value, randomValue)
        const spy = vi.fn()
        wrapperMount(<Dropdown options={options} selection value={value} multiple onChange={spy} />)

        fireEvent.click(attachTo.querySelectorAll('.delete.icon')[randomIndex])

        expect(spy).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({}),
          expect.objectContaining({ value: expected }),
        )
      })
    })
  })

  describe('removing items on backspace', () => {
    let spy
    beforeEach(() => {
      spy = vi.fn()
    })

    it('does nothing without selected items', () => {
      wrapperMount(<Dropdown options={options} selection multiple search onChange={spy} />)

      fireEvent.click(attachTo.firstChild)

      domEvent.keyDown(document, { key: 'Backspace' })

      expect(spy).not.toHaveBeenCalled()
    })
    it('removes the last item when there is no search query', () => {
      const value = _.map(options, 'value')
      const expected = _.dropRight(value)
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple search onChange={spy} />,
      )

      fireEvent.click(attachTo.firstChild)

      domEvent.keyDown(document, { key: 'Backspace' })

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: expected }),
      )
    })

    it('does not remove the last item when there is a search query', () => {
      const searchQuery = _.sample(options).text
      const value = _.map(options, 'value')
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple search onChange={spy} />,
      )

      fireEvent.click(attachTo.firstChild)
      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: searchQuery } })

      domEvent.keyDown(document, { key: 'Backspace' })

      expect(spy).not.toHaveBeenCalled()
    })
    it('does not remove items for multiple dropdowns without search', () => {
      const value = _.map(options, 'value')
      wrapperMount(<Dropdown options={options} selection value={value} multiple onChange={spy} />)

      fireEvent.click(attachTo.firstChild)

      domEvent.keyDown(document, { key: 'Backspace' })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('onChange', () => {
    let spy
    beforeEach(() => {
      spy = vi.fn()
    })

    it('is called with event and value on item click', () => {
      const randomIndex = _.random(options.length - 1)
      const randomValue = options[randomIndex].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.click(attachTo.firstChild)
      fireEvent.click(attachTo.querySelectorAll('.item')[randomIndex])

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: randomValue }),
      )
    })
    it('is called with event and value when pressing enter on a selected item', () => {
      const firstValue = options[0].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.click(attachTo.firstChild)

      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: firstValue }),
      )
    })
    it('is called with event and value when blurring', () => {
      const firstValue = options[0].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.focus(attachTo.firstChild)
      fireEvent.blur(attachTo.firstChild)

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: firstValue }),
      )
    })
    it('is not called on blur when closed', () => {
      wrapperMount(<Dropdown options={options} selection open={false} onChange={spy} />)
      fireEvent.focus(attachTo.firstChild)
      fireEvent.blur(attachTo.firstChild)

      expect(spy).not.toHaveBeenCalled()
    })
    it('is not called on blur when selectOnBlur is false', () => {
      wrapperMount(<Dropdown options={options} selection onChange={spy} selectOnBlur={false} />)
      fireEvent.focus(attachTo.firstChild)
      fireEvent.click(attachTo.firstChild)

      fireEvent.blur(attachTo.firstChild)

      expect(spy).not.toHaveBeenCalled()
    })
    it('is not called on blur with multiple select', () => {
      wrapperMount(<Dropdown options={options} selection onChange={spy} multiple />)
      fireEvent.focus(attachTo.firstChild)
      fireEvent.click(attachTo.firstChild)

      fireEvent.blur(attachTo.firstChild)

      expect(spy).not.toHaveBeenCalled()
    })
    it('is not called when updating the value prop', () => {
      const value = _.sample(options).value
      const next = _.sample(_.without(options, value)).value

      const { rerender } = wrapperMount(
        <Dropdown options={options} selection value={value} onChange={spy} />,
      )
      rerender(<Dropdown options={options} selection value={next} onChange={spy} />)

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('onClick', () => {
    it('is called with (event, props)', () => {
      const onClick = vi.fn()
      wrapperMount(<Dropdown onClick={onClick} options={options} />)
      fireEvent.click(attachTo.firstChild, { stopPropagation: _.noop })

      expect(onClick).toHaveBeenCalledOnce()
    })

    it("toggles the dropdown when it's not searchable", () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsClosed()
    })

    it("opens the dropdown when it's searchable, but don't close", () => {
      wrapperMount(<Dropdown options={options} search />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()
    })

    it("don't open the dropdown when it's searchable and minCharacters is more that default value", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} search />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsClosed()
    })
  })

  describe('onFocus', () => {
    it('is called with (event, props)', () => {
      const onFocus = vi.fn()
      wrapperMount(<Dropdown onFocus={onFocus} options={options} />)
      fireEvent.focus(attachTo.firstChild)

      expect(onFocus).toHaveBeenCalledOnce()
    })

    it("opens the dropdown when it's not searchable", () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsOpen()
    })

    it("opens the dropdown when it's searchable", () => {
      wrapperMount(<Dropdown options={options} search />)

      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsOpen()
    })

    it("don't open the dropdown when it's searchable and minCharacters is more that default value", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} search />)

      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsClosed()
    })
  })

  describe('onSearchChange', () => {
    it('is called with (event, value) on search input change', () => {
      const spy = vi.fn()
      wrapperMount(<Dropdown options={options} search selection onSearchChange={spy} />)
      fireEvent.change(attachTo.querySelector('input.search'), {
        target: { value: 'a' },
      })

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ target: expect.objectContaining({ value: 'a' }) }),
        expect.objectContaining({
          search: true,
          searchQuery: 'a',
        }),
      )
    })

    it("don't open the menu on change if query's length is less than minCharacters", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} selection search />)

      dropdownMenuIsClosed()

      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: 'a' } })

      dropdownMenuIsClosed()
    })

    it("closes the opened menu on change if query's length is less than minCharacters", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} selection search />)
      const input = attachTo.querySelector('input.search')

      fireEvent.change(input, { target: { value: 'abc' } })
      dropdownMenuIsOpen()

      fireEvent.change(input, { target: { value: 'a' } })
      dropdownMenuIsClosed()
    })
  })

  describe('options', () => {
    it('adds the onClick handler to all items', () => {
      wrapperMount(<Dropdown options={options} selection />)
      const items = attachTo.querySelectorAll('.item')
      items.forEach((item) => {
        expect(item).toBeInTheDocument()
      })
    })

    it('renders new options when options change', () => {
      const customOptions = [
        { text: 'abra', value: 'abra' },
        { text: 'cadabra', value: 'cadabra' },
        { text: 'bang', value: 'bang' },
      ]
      wrapperMount(<Dropdown options={customOptions} />)

      expect(attachTo.querySelectorAll('.item')).toHaveLength(3)

      wrapper.rerender(<Dropdown options={[...customOptions, { text: 'bar', value: 'bar' }]} />)

      expect(attachTo.querySelectorAll('.item')).toHaveLength(4)

      const newItem = attachTo.querySelectorAll('.item')[3]
      expect(newItem.textContent).toContain('bar')
    })

    it('invokes "onClick" on item and handles', () => {
      const onItemClick = vi.fn()
      const customOptions = [
        { key: 'foo', text: 'foo', value: 'foo' },
        { key: 'bar', text: 'bar', value: 'bar', onClick: onItemClick },
      ]

      wrapperMount(<Dropdown options={customOptions} />)
      dropdownMenuIsClosed()

      fireEvent.click(attachTo.firstChild)
      fireEvent.focus(attachTo.firstChild)
      dropdownMenuIsOpen()

      fireEvent.click(attachTo.querySelectorAll('.item')[1])
      dropdownMenuIsClosed()
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')

      expect(onItemClick).toHaveBeenCalledOnce()
    })
  })

  describe('search', () => {
    it('does not add a search input when not defined', () => {
      wrapperMount(<Dropdown options={options} selection />)

      expect(attachTo.querySelector('input.search')).not.toBeInTheDocument()
    })

    it('adds a search input when present', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      expect(attachTo.querySelector('input.search')).toBeInTheDocument()
    })

    it('sets focus to the search input on open', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(attachTo.firstChild)

      expect(document.activeElement).toBe(document.querySelector('input.search'))
    })

    it('clears the search query when an item is selected', () => {
      const searchQuery = _.sample(options).text

      wrapperMount(<Dropdown options={options} selection search />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: searchQuery } })

      fireEvent.click(attachTo.querySelectorAll('.item')[0])

      expect(attachTo.querySelector('input.search').value).toBe('')
    })

    it('opens the menu on change if there is a query and not already open', () => {
      wrapperMount(<Dropdown options={options} selection search />)

      dropdownMenuIsClosed()

      fireEvent.change(attachTo.querySelector('input.search'), {
        target: { value: faker.hacker.noun() },
      })

      dropdownMenuIsOpen()
    })

    it('does not call onChange on query change', () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown options={options} selection search onChange={onChange} />)

      fireEvent.change(attachTo.querySelector('input.search'), {
        target: { value: faker.hacker.noun() },
      })

      expect(onChange).not.toHaveBeenCalled()
    })

    it('filters the items based on display text', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const search = attachTo.querySelector('input.search')

      fireEvent.change(search, { target: { value: _.sample(options).value } })
      expect(attachTo.querySelectorAll('.item')).toHaveLength(0)

      fireEvent.change(search, { target: { value: _.sample(options).text } })
      expect(attachTo.querySelectorAll('.item')).toHaveLength(1)
    })

    it('still allows moving selection after blur/focus', () => {
      wrapperMount(<Dropdown options={options} selection search />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('selected')

      fireEvent.blur(attachTo.firstChild)
      fireEvent.focus(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(attachTo.querySelectorAll('.item')[0]).not.toHaveClass('selected')
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('selected')
    })

    it('does not close the menu when options are empty', () => {
      wrapperMount(<Dropdown options={options} search selection />)
      fireEvent.click(attachTo.firstChild)

      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: 'foo' } })
      fireEvent.keyDown(attachTo.firstChild, { key: 'Enter' })

      dropdownMenuIsOpen()
    })

    it('sets focus to the search input after selection', () => {
      const randomIndex = 1 + _.random(options.length - 2)

      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(attachTo.firstChild, nativeEvent)
      fireEvent.click(attachTo.querySelectorAll('.item')[randomIndex], nativeEvent)

      dropdownMenuIsClosed()
      expect(document.activeElement).toBe(document.querySelector('input.search'))
    })

    it('sets focus to the dropdown after selection', () => {
      const randomIndex = _.random(options.length - 1)

      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(attachTo.firstChild, nativeEvent)
      fireEvent.click(attachTo.querySelectorAll('.item')[randomIndex], nativeEvent)

      expect(document.activeElement).toBe(attachTo.querySelector('div.dropdown'))
    })
  })

  describe('searchInput', () => {
    it('overrides onChange handler', () => {
      const onInputChange = vi.fn()
      const onSearchChange = vi.fn()

      wrapperMount(
        <Dropdown
          onSearchChange={onSearchChange}
          options={options}
          search
          searchInput={{ onChange: onInputChange }}
        />,
      )

      fireEvent.change(attachTo.querySelector('input.search'), {
        target: { value: faker.hacker.noun() },
      })

      expect(onInputChange).toHaveBeenCalledOnce()
      expect(onSearchChange).toHaveBeenCalledOnce()
    })
  })

  describe('no results message', () => {
    it('is shown when a search yields no results', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const search = attachTo.querySelector('input.search')

      expect(attachTo.querySelector('.message')).not.toBeInTheDocument()

      fireEvent.change(search, { target: { value: '_________________' } })

      expect(attachTo.querySelector('.message')).toBeInTheDocument()
    })

    it('is not shown on multiple dropdowns with no remaining items', () => {
      const value = _.map(options, 'value')
      wrapperMount(<Dropdown options={options} selection value={value} multiple />)

      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()

      expect(attachTo.querySelector('.item')).not.toBeInTheDocument()
      expect(attachTo.querySelector('.message')).not.toBeInTheDocument()
    })

    it('uses default noResultsMessage', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const search = attachTo.querySelector('input.search')

      fireEvent.change(search, { target: { value: '_________________' } })

      expect(attachTo.querySelector('.message').textContent).toBe('No results found.')
    })

    it('uses custom string for noResultsMessage', () => {
      wrapperMount(
        <Dropdown options={options} selection search noResultsMessage='Something custom' />,
      )
      const search = attachTo.querySelector('input.search')

      fireEvent.change(search, { target: { value: '_________________' } })

      expect(attachTo.querySelector('.message').textContent).toBe('Something custom')
    })

    it('is not shown when set to `null`', () => {
      wrapperMount(
        <Dropdown options={options} selection search noResultsMessage={null} />,
      )
      const search = attachTo.querySelector('input.search')

      fireEvent.change(search, { target: { value: '_________________' } })

      expect(attachTo.querySelector('.message')).not.toBeInTheDocument()
    })
  })

  describe('placeholder', () => {
    it('is present when defined', () => {
      wrapperMount(<Dropdown options={options} selection placeholder='hi' />)
      expect(attachTo.querySelector('.default.text')).toBeInTheDocument()
    })
    it('is not present when not defined', () => {
      wrapperMount(<Dropdown options={options} selection />)
      expect(attachTo.querySelector('.default.text')).not.toBeInTheDocument()
    })
    it('is not present when there is a value', () => {
      wrapperMount(<Dropdown options={options} selection value='hi' placeholder='hi' />)
      expect(attachTo.querySelector('.default.text')).not.toBeInTheDocument()
    })
    it('is present on a multiple dropdown with an empty value array', () => {
      wrapperMount(<Dropdown options={options} selection multiple placeholder='hi' />)
      expect(attachTo.querySelector('.default.text')).toBeInTheDocument()
    })
    it('has a filtered className when there is a search query', () => {
      wrapperMount(<Dropdown options={options} selection search placeholder='hi' />)

      fireEvent.change(attachTo.querySelector('input.search'), { target: { value: 'a' } })
      expect(attachTo.querySelector('.default.text.filtered')).toBeInTheDocument()
    })
  })

  describe('lazyLoad', () => {
    it('does not render options when closed', () => {
      wrapperMount(<Dropdown options={options} lazyLoad />)
      expect(attachTo.querySelector('.item')).not.toBeInTheDocument()
    })

    it('renders options when open', () => {
      wrapperMount(<Dropdown options={options} lazyLoad open />)
      expect(attachTo.querySelector('.item')).toBeInTheDocument()
    })
  })

  describe('Dropdown.Menu child', () => {
    it('renders child passed', () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu data-find-me />
        </Dropdown>,
      )
      expect(attachTo.querySelector('.menu')).toBeInTheDocument()
      expect(attachTo.querySelector('.menu')).toHaveAttribute('data-find-me')
    })

    it('opens on click', () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu />
        </Dropdown>,
      )

      dropdownMenuIsClosed()
      fireEvent.click(attachTo.firstChild)
      dropdownMenuIsOpen()
    })
  })

  describe('allowAdditions', () => {
    const customOptions = [
      { text: 'abra', value: 'abra' },
      { text: 'cadabra', value: 'cadabra' },
      { text: 'bang', value: 'bang' },
    ]

    it('adds an option for arbitrary search value', () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      const search = attachTo.querySelector('input.search')

      expect(attachTo.querySelectorAll('.item')).toHaveLength(3)

      fireEvent.change(search, { target: { value: 'boo' } })

      expect(attachTo.querySelectorAll('.item')).toHaveLength(1)
    })

    it('adds an option for prefix search value', () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      const search = attachTo.querySelector('input.search')

      expect(attachTo.querySelectorAll('.item')).toHaveLength(3)

      fireEvent.change(search, { target: { value: 'a' } })

      expect(attachTo.querySelectorAll('.item')).toHaveLength(4)
    })

    it('calls onAddItem prop when clicking new value', () => {
      const onAddItem = vi.fn()
      const onChange = vi.fn()
      wrapperMount(
        <Dropdown
          allowAdditions
          onAddItem={onAddItem}
          onChange={onChange}
          options={customOptions}
          search
          selection
        />,
      )
      const search = attachTo.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })

      fireEvent.click(attachTo.querySelectorAll('.item')[0])

      expect(onChange).toHaveBeenCalledOnce()
      expect(onAddItem).toHaveBeenCalledOnce()
      expect(onAddItem).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ value: 'boo' }),
      )
    })

    it('clears value of the searchQuery when selection is only option', () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      const search = attachTo.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })
      fireEvent.keyDown(search, { key: 'Enter' })

      expect(attachTo.querySelector('input.search').value).toBe('')
    })
  })

  describe('header', () => {
    it('renders a header when present', () => {
      const text = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} header={text} />)
      expect(attachTo.querySelector('.menu .header').textContent).toContain(text)
    })
    it('does not render a header when not present', () => {
      wrapperMount(<Dropdown options={options} />)
      expect(attachTo.querySelector('.menu .header')).not.toBeInTheDocument()
    })
  })

  describe('value validations', () => {
    it('logs an error if dropdown is not multiple and value is array', () => {
      consoleUtil.disableOnce()
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const originalValue = options[0].value
      const nextValue = [options[1].value]

      const { rerender } = wrapperMount(
        <Dropdown options={options} value={originalValue} selection />,
      )
      rerender(<Dropdown options={options} value={nextValue} selection />)

      const errorMessage =
        'Dropdown `value` must not be an array when `multiple` is not set.' +
        ' Either set `multiple={true}` or use a string or number value.'

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(expect.stringContaining(errorMessage))
      spy.mockRestore()
    })

    it('logs an error if dropdown is multiple and value not array', () => {
      consoleUtil.disableOnce()
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const originalValue = [options[0].value]
      const nextValue = options[1].value

      const { rerender } = wrapperMount(
        <Dropdown options={options} value={originalValue} selection multiple />,
      )
      rerender(<Dropdown options={options} value={nextValue} selection multiple />)

      const errorMessage =
        'Dropdown `value` must be an array when `multiple` is set.' +
        ` Received type: \`${Object.prototype.toString.call(nextValue)}\`.`

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(expect.stringContaining(errorMessage))
      spy.mockRestore()
    })
  })

  describe('selectOnNavigation', () => {
    it('is on by default', () => {
      const onChange = vi.fn()

      wrapperMount(
        <Dropdown options={options} defaultValue={options[0].value} onChange={onChange} />,
      )

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(onChange).toHaveBeenCalled()
      expect(attachTo.querySelectorAll('.item')[1]).toHaveClass('active')
    })

    it('does not change value when set to false', () => {
      const onChange = vi.fn()
      const value = options[0].value

      wrapperMount(
        <Dropdown
          options={options}
          defaultValue={value}
          selectOnNavigation={false}
          onChange={onChange}
        />,
      )

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(onChange).not.toHaveBeenCalled()
      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('active')
    })
  })

  describe('wrapSelection', () => {
    it("does not move up on arrow up when first item is selected and 'wrapSelection' is false", () => {
      wrapperMount(<Dropdown options={options} selection wrapSelection={false} />)

      fireEvent.click(attachTo.firstChild)
      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('selected')

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowUp' })

      expect(attachTo.querySelectorAll('.item')[0]).toHaveClass('selected')
      expect(attachTo.querySelectorAll('.item')[options.length - 1]).not.toHaveClass('selected')
    })
    it("does not move down on arrow down when last item is selected and 'wrapSelection' is false", () => {
      wrapperMount(<Dropdown options={options} selection wrapSelection={false} />)

      fireEvent.click(attachTo.firstChild)
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })

      expect(attachTo.querySelectorAll('.item')[options.length - 1]).toHaveClass('selected')

      fireEvent.keyDown(attachTo.firstChild, { key: 'ArrowDown' })
      expect(attachTo.querySelectorAll('.item')[0]).not.toHaveClass('selected')
      expect(attachTo.querySelectorAll('.item')[options.length - 1]).toHaveClass('selected')
    })
  })

  describe('upward', () => {
    it('is false when there is enough space below', () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(attachTo.firstChild)
      expect(attachTo.firstChild).not.toHaveClass('upward')
    })

    // TODO: jsdom doesn't fully support viewport position calculations needed for upward detection
    it.skip('is true when there is not enough space below', () => {
      wrapperMount(<Dropdown options={options} />)

      // Mock getBoundingClientRect so the dropdown appears near the bottom of the viewport
      vi.spyOn(attachTo.firstChild, 'getBoundingClientRect').mockReturnValue({
        top: 700,
        bottom: 730,
        left: 0,
        right: 100,
        width: 100,
        height: 30,
        x: 0,
        y: 700,
        toJSON() {},
      })
      // Ensure a viewport height that would make the dropdown go upward
      Object.defineProperty(document.documentElement, 'clientHeight', { value: 768, configurable: true })

      fireEvent.click(attachTo.firstChild)
      expect(attachTo.firstChild).toHaveClass('upward')

      Object.defineProperty(document.documentElement, 'clientHeight', { value: 0, configurable: true })
    })
  })
})
