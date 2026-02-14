import _ from 'lodash'
import { faker } from '@faker-js/faker'
import { render, fireEvent } from '@testing-library/react'

import { htmlInputAttrs } from 'src/lib'
import Search from 'src/modules/Search'
import SearchCategory from 'src/modules/Search/SearchCategory'
import SearchResult from 'src/modules/Search/SearchResult'
import SearchResults from 'src/modules/Search/SearchResults'
import * as common from 'test/specs/commonTests'
import { domEvent } from 'test/utils'

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
  _.times(count, (i) => ({
    title: [i, ..._.times(3, faker.hacker.noun)].join(' '),
    description: [i, ..._.times(3, faker.hacker.noun)].join(' '),
    image: '/images/wireframe/image.png',
    price: [i, faker.finance.amount({ min: 0, max: 100, dec: 2, symbol: '$' })].join(' '),
  }))

// -------------------------------
// Common Assertions
// -------------------------------
const searchResultsIsClosed = () => {
  const root = attachTo.firstChild
  expect(root).not.toHaveClass('visible')
  const menu = root.querySelector('.results')
  if (menu) expect(menu).not.toHaveClass('visible')
}

const searchResultsIsOpen = () => {
  const root = attachTo.firstChild
  expect(root).toHaveClass('active')
  expect(root).toHaveClass('visible')
  const menu = root.querySelector('.results')
  expect(menu).toHaveClass('visible')
}

// ----------------------------------------
// Helpers
// ----------------------------------------
const openSearchResults = () => {
  fireEvent.focus(attachTo.firstChild)
}

const nativeEvent = { nativeEvent: { stopImmediatePropagation: _.noop } }

describe('Search', () => {
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

  common.isConformant(Search)
  common.hasSubcomponents(Search, [SearchCategory, SearchResult, SearchResults])
  common.hasUIClassName(Search)

  common.propKeyOnlyToClassName(Search, 'category')
  common.propKeyOnlyToClassName(Search, 'fluid')
  common.propKeyOnlyToClassName(Search, 'loading')

  it('closes on blur', () => {
    wrapperMount(<Search results={options} minCharacters={0} />)

    openSearchResults()

    searchResultsIsOpen()
    fireEvent.blur(attachTo.firstChild)
    searchResultsIsClosed()
  })

  it('opens on focus', () => {
    wrapperMount(<Search results={options} minCharacters={0} />)

    searchResultsIsClosed()
    fireEvent.focus(attachTo.firstChild)
    searchResultsIsOpen()
  })

  describe('isMouseDown', () => {
    it('tracks when the mouse is down', () => {
      wrapperMount(<Search minCharacters={0} />)
      searchResultsIsClosed()

      // When ".isMouseDown === false" a focus event will not open Search results
      fireEvent.mouseDown(attachTo.firstChild)
      fireEvent.focus(attachTo.firstChild)
      searchResultsIsClosed()

      // Reset to default component state
      fireEvent.blur(attachTo.firstChild)
      domEvent.mouseUp(document.body)

      // When ".isMouseDown === true" a focus event will open Search results
      fireEvent.focus(attachTo.firstChild)
      searchResultsIsOpen()
    })
  })

  describe('icon', () => {
    it('defaults to a search icon', () => {
      wrapperMount(<Search />)
      expect(attachTo.querySelector('.search.icon')).toBeInTheDocument()
    })
  })

  describe('active item', () => {
    it('defaults to no result active', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)
      expect(attachTo.querySelector('.result.active')).not.toBeInTheDocument()
    })
    it('defaults to the first item with selectFirstResult', () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)
      const results = attachTo.querySelectorAll('.result')
      expect(results[0]).toHaveClass('active')
    })
    it('moves down on arrow down when open', () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      // arrow to second
      domEvent.keyDown(document, { key: 'ArrowDown' })

      // selection moved to second item
      const results = attachTo.querySelectorAll('.result')
      expect(results[0]).not.toHaveClass('active')
      expect(results[1]).toHaveClass('active')
    })
    it('moves up on arrow up when open', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      // arrow up
      domEvent.keyDown(document, { key: 'ArrowUp' })

      // selection moved to last item
      const results = attachTo.querySelectorAll('.result')
      expect(results[0]).not.toHaveClass('active')
      expect(results[options.length - 1]).toHaveClass('active')
    })
    it('scrolls the selected item into view', () => {
      // get enough options to make the menu scrollable
      const opts = getOptions(20)

      wrapperMount(<Search results={opts} minCharacters={0} selectFirstResult />)

      openSearchResults()
      searchResultsIsOpen()
      const menu = document.querySelector('.ui.search .results.visible')

      // Limit the menu's height and set an overflow so it's scrollable
      menu.style.height = '100px'
      menu.style.overflow = 'auto'

      //
      // Scrolls to bottom
      //

      // make sure first item is selected
      expect(attachTo.querySelector('.result.active').textContent).toContain(opts[0].title)

      // wrap selection to last item
      domEvent.keyDown(document, { key: 'ArrowUp' })

      // make sure last item is selected
      expect(attachTo.querySelector('.result.active').textContent).toContain(_.last(opts).title)

      // menu should be completely scrolled to the bottom
      const isMenuScrolledToBottom = menu.scrollTop + menu.clientHeight === menu.scrollHeight
      expect(isMenuScrolledToBottom).toBe(true)

      //
      // Scrolls back to top
      //

      // wrap selection to first item
      domEvent.keyDown(document, { key: 'ArrowDown' })

      // make sure first item is selected
      expect(attachTo.querySelector('.result.active').textContent).toContain(opts[0].title)

      const selectedItem = document.querySelector('.ui.search .results.visible .result.active')
      const isMenuScrolledToTop = menu.scrollTop === selectedItem.offsetTop
      expect(isMenuScrolledToTop).toBe(true)
    })
    it('closes the menu', () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)

      openSearchResults()
      searchResultsIsOpen()

      // choose an item closes
      domEvent.keyDown(document, { key: 'Enter' })
      searchResultsIsClosed()
    })
    it('uses custom renderer', () => {
      const resultSpy = vi.fn(() => <div className='custom-result' />)
      wrapperMount(<Search results={options} minCharacters={0} resultRenderer={resultSpy} />)

      expect(resultSpy).toHaveBeenCalledTimes(options.length)
      expect(attachTo.querySelectorAll('.result .custom-result')).toHaveLength(options.length)
    })
  })

  describe('category', () => {
    const categoryLength = 3
    const categoryResultsLength = 5
    const categoryOptions = _.range(0, categoryLength).reduce((memo, index) => {
      const category = `${faker.hacker.noun()}-${index}`

      memo[category] = {
        name: category,
        results: getOptions(categoryResultsLength),
      }

      return memo
    }, {})

    it('defaults to the first item with selectFirstResult', () => {
      wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      const categories = attachTo.querySelectorAll('.results .category')
      expect(categories[0]).toHaveClass('active')

      const results = attachTo.querySelectorAll('.results .result')
      expect(results[0]).toHaveClass('active')
    })
    it('moves down on arrow down when open', () => {
      wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      // open
      openSearchResults()
      searchResultsIsOpen()

      // arrow to new category
      _.times(categoryResultsLength, () => domEvent.keyDown(document, { key: 'ArrowDown' }))

      // selection moved to second category
      const categories = attachTo.querySelectorAll('.results .category')
      expect(categories[0]).not.toHaveClass('active')

      const results = attachTo.querySelectorAll('.results .result')
      expect(results[0]).not.toHaveClass('active')

      expect(categories[1]).toHaveClass('active')
      expect(results[categoryResultsLength]).toHaveClass('active')
    })
    it('moves up on arrow up when open', () => {
      wrapperMount(<Search results={categoryOptions} category minCharacters={0} />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      // arrow up
      domEvent.keyDown(document, { key: 'ArrowUp' })

      // selection moved to last item
      const categories = attachTo.querySelectorAll('.results .category')
      expect(categories[0]).not.toHaveClass('active')

      const results = attachTo.querySelectorAll('.results .result')
      expect(results[0]).not.toHaveClass('active')

      expect(categories[categoryLength - 1]).toHaveClass('active')
      expect(results[categoryLength * categoryResultsLength - 1]).toHaveClass('active')
    })
    it('uses custom renderer', () => {
      const categorySpy = vi.fn(() => <div className='custom-category' />)
      const resultSpy = vi.fn(() => <div className='custom-result' />)
      wrapperMount(
        <Search
          results={categoryOptions}
          category
          minCharacters={0}
          categoryRenderer={categorySpy}
          resultRenderer={resultSpy}
        />,
      )

      expect(categorySpy).toHaveBeenCalledTimes(categoryLength)
      expect(resultSpy).toHaveBeenCalledTimes(categoryLength * categoryResultsLength)

      expect(attachTo.querySelectorAll('.category .name .custom-category').length).toBeGreaterThan(0)
      expect(attachTo.querySelectorAll('.result .custom-result').length).toBeGreaterThan(0)
    })
    it('uses default noResultsMessage', () => {
      wrapperMount(<Search results={[]} category minCharacters={0} />)

      expect(attachTo.querySelector('.message.empty').textContent).toContain('No results found.')
    })
    it('closes the menu', () => {
      wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      openSearchResults()
      searchResultsIsOpen()

      // choose an item closes
      domEvent.keyDown(document, { key: 'Enter' })
      searchResultsIsClosed()
    })
  })

  describe('value', () => {
    it('updates text when value changed', () => {
      const initialValue = faker.hacker.noun()
      const nextValue = faker.hacker.noun()

      wrapperMount(<Search results={options} minCharacters={0} value={initialValue} />)
      expect(attachTo.querySelector('.prompt').value).toBe(initialValue)

      wrapper.rerender(<Search results={options} minCharacters={0} value={nextValue} />)
      expect(attachTo.querySelector('.prompt').value).toBe(nextValue)
    })
  })

  describe('results menu', () => {
    it('opens after min characters', () => {
      const title = options[0].title
      wrapperMount(<Search results={options} minCharacters={2} />)
      fireEvent.focus(attachTo.firstChild)

      searchResultsIsClosed()

      fireEvent.change(attachTo.querySelector('input.prompt'), { target: { value: title.slice(0, 1) } })
      searchResultsIsClosed()

      fireEvent.change(attachTo.querySelector('input.prompt'), { target: { value: title.slice(0, 2) } })
      searchResultsIsOpen()
    })

    it('opens (and remains open) when clicking the input', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      const prompt = attachTo.querySelector('input.prompt')

      fireEvent.click(prompt, nativeEvent)
      searchResultsIsOpen()

      // Stays open after multiple clicks on the input
      fireEvent.click(prompt, nativeEvent)
      searchResultsIsOpen()
    })

    it('closes on menu item click', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      // select item
      const results = attachTo.querySelectorAll('.result')
      const randomIndex = _.random(options.length - 1)
      fireEvent.click(results[randomIndex], nativeEvent)
      searchResultsIsClosed()
    })

    it('blurs after menu item click (mousedown)', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      // select item
      const results = attachTo.querySelectorAll('.result')
      const randomIndex = _.random(options.length - 1)
      fireEvent.mouseDown(results[randomIndex])
      searchResultsIsOpen()
      fireEvent.click(results[randomIndex], nativeEvent)
      searchResultsIsClosed()
    })

    it('closes on click outside', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      // click outside
      domEvent.click(document.body)
      searchResultsIsClosed()
    })

    it('closes on esc key', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      // esc
      domEvent.keyDown(document, { key: 'Escape' })
      searchResultsIsClosed()
    })
  })

  describe('open', () => {
    it('defaultOpen opens the menu when true', () => {
      wrapperMount(<Search results={options} minCharacters={0} defaultOpen />)
      searchResultsIsOpen()
    })
    it('defaultOpen stays open on focus', () => {
      wrapperMount(<Search results={options} minCharacters={0} defaultOpen />)
      fireEvent.focus(attachTo.firstChild)
      searchResultsIsOpen()
    })
    it('defaultOpen closes the menu when false', () => {
      wrapperMount(<Search results={options} minCharacters={0} defaultOpen={false} />)
      searchResultsIsClosed()
    })
    it('opens the menu when true', () => {
      wrapperMount(<Search results={options} minCharacters={0} open />)
      searchResultsIsOpen()
    })
    it('closes the menu when false', () => {
      wrapperMount(<Search results={options} minCharacters={0} open={false} />)
      searchResultsIsClosed()
    })
    it('closes the menu when toggled from true to false', () => {
      const { rerender } = wrapperMount(<Search results={options} minCharacters={0} open />)
      rerender(<Search results={options} minCharacters={0} open={false} />)
      searchResultsIsClosed()
    })
    it('opens the menu when toggled from false to true', () => {
      const { rerender } = wrapperMount(
        <Search results={options} minCharacters={0} open={false} />,
      )
      rerender(<Search results={options} minCharacters={0} open />)
      searchResultsIsOpen()
    })
  })

  describe('onBlur', () => {
    it('is called with (event, data) on search input blur', () => {
      const onBlur = vi.fn()
      wrapperMount(<Search results={options} onBlur={onBlur} />)
      fireEvent.blur(attachTo.firstChild, nativeEvent)

      expect(onBlur).toHaveBeenCalledOnce()
      expect(onBlur).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ onBlur, results: options }),
      )
    })

    it('is not called on an item click', () => {
      const onBlur = vi.fn()
      wrapperMount(<Search results={options} onBlur={onBlur} />)

      openSearchResults()
      const results = attachTo.querySelectorAll('.result')
      fireEvent.click(results[0], nativeEvent)
      expect(onBlur).not.toHaveBeenCalled()
    })
  })

  describe('onFocus', () => {
    it('is called with (event, data) on search input focus', () => {
      const onFocus = vi.fn()
      wrapperMount(<Search results={options} onFocus={onFocus} />)
      fireEvent.focus(attachTo.firstChild, nativeEvent)

      expect(onFocus).toHaveBeenCalledOnce()
      expect(onFocus).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ onFocus, results: options }),
      )
    })
  })

  describe('onResultSelect', () => {
    let spy
    beforeEach(() => {
      spy = vi.fn()
    })

    it('is called with event and value on item click', () => {
      const randomIndex = _.random(options.length - 1)
      const randomResult = options[randomIndex]
      wrapperMount(<Search results={options} minCharacters={0} onResultSelect={spy} />)

      // open
      openSearchResults()
      searchResultsIsOpen()

      const results = attachTo.querySelectorAll('.result')
      fireEvent.click(results[randomIndex], nativeEvent)

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({
          minCharacters: 0,
          result: randomResult,
          results: options,
        }),
      )
    })
    it('is called with event and value when pressing enter on a selected item', () => {
      const firstResult = options[0]
      wrapperMount(
        <Search results={options} minCharacters={0} onResultSelect={spy} selectFirstResult />,
      )

      // open
      openSearchResults()
      searchResultsIsOpen()

      domEvent.keyDown(document, { key: 'Enter' })

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ result: firstResult }),
      )
    })
    it('is not called when updating the value prop', () => {
      const value = _.sample(options).title
      const next = _.sample(_.without(options, value)).title

      const { rerender } = wrapperMount(
        <Search results={options} minCharacters={0} value={value} onResultSelect={spy} />,
      )
      rerender(
        <Search results={options} minCharacters={0} value={next} onResultSelect={spy} />,
      )

      expect(spy).not.toHaveBeenCalled()
    })
    it('does not call onResultSelect on query change', () => {
      const onResultSelectSpy = vi.fn()
      wrapperMount(
        <Search results={options} minCharacters={0} onResultSelect={onResultSelectSpy} />,
      )

      // simulate search
      fireEvent.change(attachTo.querySelector('input.prompt'), {
        target: { value: faker.hacker.noun() },
      })

      expect(onResultSelectSpy).not.toHaveBeenCalled()
    })
  })

  describe('onSearchChange', () => {
    it('is called with (event, value) on search input change', () => {
      const spy = vi.fn()
      wrapperMount(<Search results={options} minCharacters={0} onSearchChange={spy} />)
      fireEvent.change(attachTo.querySelector('input.prompt'), {
        target: { value: 'a' },
      })

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ target: expect.objectContaining({ value: 'a' }) }),
        expect.objectContaining({
          minCharacters: 0,
          results: options,
          value: 'a',
        }),
      )
    })
  })

  describe('onSearchChange', () => {
    it('is called with (event, data) when the active selection index is changed', () => {
      const onSelectionChange = vi.fn()

      wrapperMount(
        <Search
          minCharacters={0}
          onSelectionChange={onSelectionChange}
          results={options}
          selectFirstResult
        />,
      )
      openSearchResults()
      domEvent.keyDown(document, { key: 'ArrowDown' })

      expect(onSelectionChange).toHaveBeenCalledOnce()
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({
          minCharacters: 0,
          result: options[1],
          results: options,
        }),
      )
    })
  })

  describe('results prop', () => {
    it('adds the onClick handler to all items', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)
      const results = attachTo.querySelectorAll('.result')
      results.forEach((result) => {
        // Results rendered by Search should be clickable
        expect(result).toBeInTheDocument()
      })
    })

    it('renders new options when options change', () => {
      const customOptions = [
        { title: 'abra', description: 'abra' },
        { title: 'cadabra', description: 'cadabra' },
        { title: 'bang', description: 'bang' },
      ]
      wrapperMount(<Search results={customOptions} />)

      expect(attachTo.querySelectorAll('.result')).toHaveLength(3)

      wrapper.rerender(
        <Search results={[...customOptions, { title: 'bar', description: 'bar' }]} />,
      )

      expect(attachTo.querySelectorAll('.result')).toHaveLength(4)

      const lastItem = attachTo.querySelectorAll('.result')[3]
      expect(lastItem.textContent).toContain('bar')
    })

    it('passes options as props', () => {
      const customOptions = [
        { title: 'abra', description: 'abra', 'data-foo': 'someValue' },
        { title: 'cadabra', description: 'cadabra', 'data-foo': 'someValue' },
        { title: 'bang', description: 'bang', 'data-foo': 'someValue' },
      ]
      wrapperMount(<Search results={customOptions} />)
      const results = attachTo.querySelectorAll('.result')
      results.forEach((result) => {
        expect(result).toHaveAttribute('data-foo', 'someValue')
      })
    })
    it('ignores search value', () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)

      openSearchResults()
      searchResultsIsOpen()

      // search for something we know will not exist
      fireEvent.change(attachTo.querySelector('input.prompt'), {
        target: { value: '_________________' },
      })

      expect(attachTo.querySelectorAll('.result')).toHaveLength(options.length)
    })
  })

  describe('no results message', () => {
    it('is shown when there are no results', () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      expect(attachTo.querySelector('.message.empty')).not.toBeInTheDocument()

      wrapper.rerender(<Search results={[]} minCharacters={0} />)

      expect(attachTo.querySelector('.message.empty')).toBeInTheDocument()
    })
    it('uses default noResultsMessage', () => {
      wrapperMount(<Search results={[]} minCharacters={0} />)

      expect(attachTo.querySelector('.message.empty .header').textContent).toBe('No results found.')
    })
    it('uses custom string for noResultsMessage', () => {
      wrapperMount(<Search results={[]} minCharacters={0} noResultsMessage='Something custom' />)

      expect(attachTo.querySelector('.message.empty .header').textContent).toBe('Something custom')
    })
    it('uses custom component for noResultsMessage', () => {
      wrapperMount(<Search results={[]} minCharacters={0} noResultsMessage={<span>Test</span>} />)

      expect(attachTo.querySelector('.message.empty .header span')).toBeInTheDocument()
    })
    it('uses custom noResultsDescription if present', () => {
      wrapperMount(
        <Search results={[]} minCharacters={0} noResultsDescription='Something custom' />,
      )

      expect(attachTo.querySelector('.message.empty .header').textContent).toBe('No results found.')
      expect(attachTo.querySelector('.message.empty .description').textContent).toBe(
        'Something custom',
      )
    })
    it('uses no noResultsMessage', () => {
      wrapperMount(<Search results={[]} minCharacters={0} noResultsMessage='' />)

      expect(attachTo.querySelector('.message.empty .header').textContent).toBe('')
    })
    it('shows no message with showNoResults=false', () => {
      wrapperMount(<Search results={[]} minCharacters={0} showNoResults={false} />)

      expect(attachTo.querySelector('.message.empty')).not.toBeInTheDocument()
    })
  })

  describe('input', () => {
    it(`merges nested shorthand props for the <input>`, () => {
      wrapperMount(<Search input={{ input: { className: 'foo', tabIndex: '-1' } }} />)
      const input = attachTo.querySelector('input')

      expect(input).toHaveAttribute('tabIndex', '-1')
      expect(input).toHaveClass('foo')
      expect(input).toHaveClass('prompt')
    })

    it(`"placeholder" in passed to an "input"`, () => {
      wrapperMount(<Search placeholder='foo' />)
      const input = attachTo.querySelector('input')

      expect(input).toHaveAttribute('placeholder', 'foo')
    })
  })

  describe('input props', () => {
    // Search handles some of html props
    // Exclude React-only props that don't map to same-name DOM attributes:
    // - defaultValue: React uses it to set initial value, not as an attribute
    // - defaultChecked: React maps to 'checked' property, not a 'defaultChecked' attribute
    // - autoFocus: React maps to 'autofocus' DOM attribute (lowercase)
    // - type: excluded because Search sets its own type
    const props = _.without(htmlInputAttrs, 'defaultValue', 'defaultChecked', 'autoFocus', 'type')
    const booleanProps = ['disabled']

    // Map React prop names to their corresponding DOM attribute names
    const reactToDomAttr = {
      tabIndex: 'tabindex',
    }

    props.forEach((propName) => {
      it(`passes "${propName}" to the <input>`, () => {
        const propValue = _.includes(booleanProps, propName) ? true : 'off'
        const domAttrName = reactToDomAttr[propName] || propName

        wrapperMount(<Search {...{ [propName]: propValue }} />)
        expect(attachTo.querySelector('input')).toHaveAttribute(domAttrName)
      })
    })
  })
})
