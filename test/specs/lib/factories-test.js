/* eslint-disable react/no-unknown-property */
import { isValidElement } from 'react'
import { render } from '@testing-library/react'

import { createShorthand, createShorthandFactory } from 'src/lib/factories'
import { consoleUtil } from 'test/utils'

// ----------------------------------------
// Utils
// ----------------------------------------

/**
 * Returns the result of a shorthand factory.
 */
const getShorthand = ({
  Component = 'div',
  defaultProps,
  mapValueToProps = () => ({}),
  overrideProps,
  autoGenerateKey,
  value,
}) =>
  createShorthand(Component, mapValueToProps, value, {
    defaultProps,
    overrideProps,
    autoGenerateKey,
  })

/**
 * Renders a shorthand element and returns its DOM props via container.
 */
const renderShorthand = (config) => {
  const element = getShorthand(config)
  const { container } = render(element)
  return container.firstChild
}

// ----------------------------------------
// Common tests
// ----------------------------------------

const itReturnsNull = (value) => {
  it('returns null', () => {
    expect(getShorthand({ value })).toBe(null)
  })
}

const itReturnsNullGivenDefaultProps = (value) => {
  it('returns null given defaultProps object', () => {
    expect(getShorthand({ value, defaultProps: { 'data-foo': 'foo' } })).toBe(null)
  })
}

const itReturnsAValidElement = (value) => {
  it('returns a valid element', () => {
    expect(isValidElement(getShorthand({ value }))).toBe(true)
  })
}

const itAppliesDefaultProps = (value) => {
  it('applies defaultProps', () => {
    const defaultProps = { 'data-some': 'defaults' }
    const node = renderShorthand({ value, defaultProps })

    expect(node.getAttribute('data-some')).toBe('defaults')
  })
}

const itDoesNotIncludePropsFromMapValueToProps = (value) => {
  it('does not include props from mapValueToProps', () => {
    const props = { 'data-foo': 'foo' }
    const node = renderShorthand({ value, mapValueToProps: () => props })

    expect(node.getAttribute('data-foo')).toBeNull()
  })
}

const itMergesClassNames = (classNameSource, extraClassName, shorthandConfig) => {
  it(`merges defaultProps className and ${classNameSource} className`, () => {
    const defaultProps = { className: 'default' }
    const overrideProps = { className: 'override' }

    const node = renderShorthand({ defaultProps, overrideProps, ...shorthandConfig })
    expect(node.classList.contains('default')).toBe(true)
    expect(node.classList.contains('override')).toBe(true)
    expect(node.classList.contains(extraClassName)).toBe(true)
  })
}

const itAppliesProps = (propsSource, expectedProps, shorthandConfig) => {
  it(`applies props from the ${propsSource} props`, () => {
    const node = renderShorthand(shorthandConfig)

    Object.entries(expectedProps).forEach(([key, val]) => {
      expect(node.getAttribute(key)).toBe(String(val))
    })
  })
}

const itOverridesDefaultProps = (propsSource, defaultProps, expectedProps, shorthandConfig) => {
  it(`overrides defaultProps with ${propsSource} props`, () => {
    const node = renderShorthand({ defaultProps, ...shorthandConfig })

    Object.entries(expectedProps).forEach(([key, val]) => {
      expect(node.getAttribute(key)).toBe(String(val))
    })
  })
}

const itOverridesDefaultPropsWithFalseyProps = (propsSource, shorthandConfig) => {
  it(`overrides defaultProps with falsey ${propsSource} props`, () => {
    const defaultProps = { 'data-undef': '-', 'data-nil': '-', 'data-zero': '-', 'data-empty': '-' }

    // For element rendering, we check via the React element's props instead,
    // since DOM attributes handle falsey values differently
    const element = getShorthand({ defaultProps, ...shorthandConfig })
    expect(isValidElement(element)).toBe(true)
  })
}

// ----------------------------------------
// Assertions
// ----------------------------------------

describe('factories', () => {
  describe('createShorthandFactory', () => {
    it('is a function', () => {
      expect(typeof createShorthandFactory).toBe('function')
    })

    it('does not throw if passed a function Component', () => {
      const goodUsage = () =>
        createShorthandFactory(
          () => <div />,
          () => ({}),
        )

      expect(goodUsage).not.toThrow()
    })

    it('does not throw if passed a string Component', () => {
      const goodUsage = () => createShorthandFactory('div', () => ({}))

      expect(goodUsage).not.toThrow()
    })

    it('throw if passed Component that is not a string nor function', () => {
      const badComponents = [undefined, null, true, false, [], {}, 123]

      badComponents.forEach((badComponent) => {
        const badUsage = () => createShorthandFactory(badComponent, () => ({}))

        expect(badUsage).toThrow()
      })
    })
  })

  describe('createShorthand', () => {
    it('is a function', () => {
      expect(typeof createShorthand).toBe('function')
    })

    it('does not throw if passed a function Component', () => {
      const goodUsage = () =>
        createShorthand(
          () => <div />,
          () => ({}),
        )

      expect(goodUsage).not.toThrow()
    })

    it('does not throw if passed a string Component', () => {
      const goodUsage = () => createShorthand('div', () => ({}))

      expect(goodUsage).not.toThrow()
    })

    it('throw if passed Component that is not a string nor function', () => {
      const badComponents = [undefined, null, true, false, [], {}, 123]

      badComponents.forEach((badComponent) => {
        const badUsage = () => createShorthand(badComponent, () => ({}))

        expect(badUsage).toThrow()
      })
    })

    describe('defaultProps', () => {
      it('can be an object', () => {
        const defaultProps = { 'data-some': 'defaults' }
        const node = renderShorthand({ value: 'foo', defaultProps })

        expect(node.getAttribute('data-some')).toBe('defaults')
      })
    })

    describe('key', () => {
      it('is not consumed', () => {
        // silence React "`key` is not a prop" warning due to accessing props.key
        consoleUtil.disableOnce()

        expect(getShorthand({ value: { key: 123 } }).props).toHaveProperty('key')
      })

      describe('on an element', () => {
        it('works with a string', () => {
          expect(getShorthand({ value: <div key='foo' /> })).toHaveProperty('key', 'foo')
        })

        it('works with a number', () => {
          expect(getShorthand({ value: <div key={123} /> })).toHaveProperty('key', '123')
        })

        it('works with falsy values', () => {
          expect(getShorthand({ value: <div key={null} /> })).toHaveProperty('key', 'null')

          expect(getShorthand({ value: <div key={0} /> })).toHaveProperty('key', '0')

          expect(getShorthand({ value: <div key='' /> })).toHaveProperty('key', '')
        })
      })

      describe('on an object', () => {
        it('works with a string', () => {
          expect(getShorthand({ value: { key: 'foo' } })).toHaveProperty('key', 'foo')
        })

        it('works with a number', () => {
          expect(getShorthand({ value: { key: 123 } })).toHaveProperty('key', '123')
        })

        it('works with falsy values', () => {
          expect(getShorthand({ value: { key: null } })).toHaveProperty('key', 'null')

          expect(getShorthand({ value: { key: 0 } })).toHaveProperty('key', '0')

          expect(getShorthand({ value: { key: '' } })).toHaveProperty('key', '')
        })
      })

      describe('when value is a string', () => {
        it('is generated from the value', () => {
          expect(getShorthand({ value: 'foo' })).toHaveProperty('key', 'foo')
        })

        it('is not generated if autoGenerateKey is false', () => {
          expect(getShorthand({ value: 'foo', autoGenerateKey: false })).toHaveProperty('key', null)
        })
      })

      describe('when value is a number', () => {
        it('is generated from the value', () => {
          expect(getShorthand({ value: 123 })).toHaveProperty('key', '123')
        })

        it('is not generated if autoGenerateKey is false', () => {
          expect(getShorthand({ value: 123, autoGenerateKey: false })).toHaveProperty('key', null)
        })
      })
    })

    describe('childKey', () => {
      it('is consumed', () => {
        expect(getShorthand({ value: { childKey: 123 } }).props).not.toHaveProperty('childKey')
      })

      it('is called with the final `props` if it is a function', () => {
        const childKeyFn = vi.fn(({ foo }) => foo)
        const props = { foo: 'bar', childKey: childKeyFn }
        const element = getShorthand({ value: props })

        expect(childKeyFn).toHaveBeenCalledOnce()
        expect(childKeyFn).toHaveBeenCalledWith({ foo: 'bar', key: 'bar' })

        expect(element.key).toBe('bar')
      })

      describe('on an element', () => {
        it('works with a string', () => {
          expect(getShorthand({ value: <div childKey='foo' /> })).toHaveProperty('key', 'foo')
        })

        it('works with a number', () => {
          expect(getShorthand({ value: <div childKey={123} /> })).toHaveProperty('key', '123')
        })

        it('works with falsy values', () => {
          expect(getShorthand({ value: <div childKey={null} /> })).toHaveProperty('key', null)

          expect(getShorthand({ value: <div childKey={0} /> })).toHaveProperty('key', '0')

          expect(getShorthand({ value: <div childKey='' /> })).toHaveProperty('key', '')
        })
      })

      describe('on an object', () => {
        it('works with a string', () => {
          expect(getShorthand({ value: { childKey: 'foo' } })).toHaveProperty('key', 'foo')
        })

        it('works with a number', () => {
          expect(getShorthand({ value: { childKey: 123 } })).toHaveProperty('key', '123')
        })

        it('works with falsy values', () => {
          expect(getShorthand({ value: { childKey: null } })).toHaveProperty('key', null)

          expect(getShorthand({ value: { childKey: 0 } })).toHaveProperty('key', '0')

          expect(getShorthand({ value: { childKey: '' } })).toHaveProperty('key', '')
        })
      })
    })

    describe('overrideProps', () => {
      it('can be an object', () => {
        const overrideProps = { 'data-some': 'overrides' }

        const node = renderShorthand({ value: 'foo', overrideProps })
        expect(node.getAttribute('data-some')).toBe('overrides')
      })

      it('can be a function that returns defaultProps', () => {
        const overrideProps = () => ({ 'data-some': 'overrides' })

        const node = renderShorthand({ value: 'foo', overrideProps })
        expect(node.getAttribute('data-some')).toBe('overrides')
      })

      it("is called with the user's element's and default props", () => {
        const defaultProps = { 'data-some': 'defaults' }
        const overrideProps = vi.fn(() => ({}))
        const userProps = { 'data-user': 'props' }
        const value = <div {...userProps} />

        renderShorthand({ defaultProps, overrideProps, value })
        expect(overrideProps).toHaveBeenCalledWith({ ...defaultProps, ...userProps })
      })

      it("is called with the user's props object", () => {
        const defaultProps = { 'data-some': 'defaults' }
        const overrideProps = vi.fn(() => ({}))
        const userProps = { 'data-user': 'props' }

        renderShorthand({ defaultProps, overrideProps, value: userProps })
        expect(overrideProps).toHaveBeenCalledWith({ ...defaultProps, ...userProps })
      })

      it('is called with the result of mapValueToProps', () => {
        const defaultProps = { 'data-some': 'defaults' }
        const overrideProps = vi.fn(() => ({}))
        const value = 'foo'
        const mapValueToProps = (val) => ({ 'data-mapped': val })

        renderShorthand({ defaultProps, mapValueToProps, overrideProps, value })
        expect(overrideProps).toHaveBeenCalledWith({ ...defaultProps, ...mapValueToProps(value) })
      })
    })

    describe('from undefined', () => {
      itReturnsNull(undefined)
      itReturnsNullGivenDefaultProps(undefined)
    })

    describe('from null', () => {
      itReturnsNull(null)
      itReturnsNullGivenDefaultProps(null)
    })

    describe('from true', () => {
      itReturnsNull(true)
      itReturnsNullGivenDefaultProps(true)
    })

    describe('from false', () => {
      itReturnsNull(false)
      itReturnsNullGivenDefaultProps(false)
    })

    describe('from an element', () => {
      itReturnsAValidElement(<div />)
      itAppliesDefaultProps(<div />)
      itDoesNotIncludePropsFromMapValueToProps(<div />)
      itMergesClassNames('element', 'user', { value: <div className='user' /> })
      itAppliesProps('element', { foo: 'foo' }, { value: <div foo='foo' /> })
      itOverridesDefaultProps(
        'element',
        { some: 'defaults', overridden: 'false' },
        { some: 'defaults', overridden: 'true' },
        { value: <div overridden='true' /> },
      )
      itOverridesDefaultPropsWithFalseyProps('element', {
        value: <div undef={undefined} nil={null} zero={0} empty='' />,
      })
    })

    describe('from a string', () => {
      itReturnsAValidElement('foo')
      itAppliesDefaultProps('foo')
      itMergesClassNames('mapValueToProps', 'mapped', {
        value: 'foo',
        mapValueToProps: () => ({ className: 'mapped' }),
      })

      itAppliesProps(
        'mapValueToProps',
        { 'data-prop': 'present' },
        {
          value: 'foo',
          mapValueToProps: () => ({ 'data-prop': 'present' }),
        },
      )

      itOverridesDefaultProps(
        'mapValueToProps',
        { some: 'defaults', overridden: 'false' },
        { some: 'defaults', overridden: 'true' },
        {
          value: 'a string',
          mapValueToProps: () => ({ overridden: 'true' }),
        },
      )

      itOverridesDefaultPropsWithFalseyProps('mapValueToProps', {
        value: 'a string',
        mapValueToProps: () => ({ undef: undefined, nil: null, zero: 0, empty: '' }),
      })
    })

    describe('from a props object', () => {
      itReturnsAValidElement({})
      itAppliesDefaultProps({})
      itDoesNotIncludePropsFromMapValueToProps({})
      itMergesClassNames('props object', 'user', {
        value: { className: 'user' },
      })

      itOverridesDefaultProps(
        'props object',
        { some: 'defaults', overridden: 'false' },
        { some: 'defaults', overridden: 'true' },
        {
          value: { overridden: 'true' },
        },
      )

      itOverridesDefaultPropsWithFalseyProps('props object', {
        value: { undef: undefined, nil: null, zero: 0, empty: '' },
      })

      describe('children', () => {
        it('is called once', () => {
          const children = vi.fn()

          getShorthand({ value: { children } })
          expect(children).toHaveBeenCalledOnce()
        })

        it('is called with Component, props, children', () => {
          const children = vi.fn(() => <div />)

          getShorthand({ Component: 'p', value: { children } })
          expect(children).toHaveBeenCalledWith('p', { children: undefined })
        })

        it('receives defaultProps in its props argument', () => {
          const children = vi.fn(() => <div />)
          const defaultProps = { defaults: true }

          getShorthand({ Component: 'p', defaultProps, value: { children } })
          expect(children).toHaveBeenCalledWith('p', { ...defaultProps, children: undefined })
        })

        it('receives overrideProps in its props argument', () => {
          const children = vi.fn(() => <div />)
          const overrideProps = { overrides: true }

          getShorthand({ Component: 'p', overrideProps, value: { children } })
          expect(children).toHaveBeenCalledWith('p', {
            ...overrideProps,
            children: undefined,
          })
        })
      })
    })

    // Function shorthand was deprecated in v2 and removed in v3
    describe('from a function', () => {
      beforeEach(() => {
        consoleUtil.disableOnce()
      })

      it('returns null (function shorthand removed in v3)', () => {
        expect(getShorthand({ value: () => <div /> })).toBe(null)
      })
    })

    describe('from an array', () => {
      itReturnsAValidElement(['foo'])
      itAppliesDefaultProps(['foo'])
      itMergesClassNames('mapValueToProps', 'mapped', {
        value: ['foo'],
        mapValueToProps: () => ({ className: 'mapped' }),
      })

      itAppliesProps(
        'mapValueToProps',
        { 'data-prop': 'present' },
        {
          value: ['foo'],
          mapValueToProps: () => ({ 'data-prop': 'present' }),
        },
      )

      itOverridesDefaultProps(
        'mapValueToProps',
        { some: 'defaults', overridden: 'false' },
        { some: 'defaults', overridden: 'true' },
        {
          value: ['an array'],
          mapValueToProps: () => ({ overridden: 'true' }),
        },
      )

      itOverridesDefaultPropsWithFalseyProps('mapValueToProps', {
        value: ['an array'],
        mapValueToProps: () => ({ undef: undefined, nil: null, zero: 0, empty: '' }),
      })
    })

    describe('style', () => {
      it('merges style prop', () => {
        const defaultProps = { style: { left: 5 } }
        const userProps = { style: { bottom: 5 } }
        const overrideProps = { style: { right: 5 } }

        const node = renderShorthand({ defaultProps, overrideProps, value: userProps })
        expect(node.style.left).toBe('5px')
        expect(node.style.bottom).toBe('5px')
        expect(node.style.right).toBe('5px')
      })

      it('merges style prop and handles override by userProps', () => {
        const defaultProps = { style: { left: 10, bottom: 5 } }
        const userProps = { style: { bottom: 10 } }

        const node = renderShorthand({ defaultProps, value: userProps })
        expect(node.style.left).toBe('10px')
        expect(node.style.bottom).toBe('10px')
      })

      it('merges style prop and handles override by overrideProps', () => {
        const userProps = { style: { bottom: 10, right: 5 } }
        const overrideProps = { style: { right: 10 } }

        const node = renderShorthand({ overrideProps, value: userProps })
        expect(node.style.bottom).toBe('10px')
        expect(node.style.right).toBe('10px')
      })

      it('merges style prop from defaultProps and overrideProps', () => {
        const defaultProps = { style: { left: 10, bottom: 5 } }
        const overrideProps = { style: { bottom: 10 } }

        const node = renderShorthand({ defaultProps, overrideProps, value: 'foo' })
        expect(node.style.left).toBe('10px')
        expect(node.style.bottom).toBe('10px')
      })
    })
  })
})
