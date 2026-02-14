import { computeClassNames } from 'src/lib/hooks/useClassNamesOnNode'

describe('computeClassNames', () => {
  it('accepts Set as value', () => {
    const classNames = computeClassNames(new Set())

    expect(Array.isArray(classNames)).toBe(true)
    expect(classNames).toHaveLength(0)
  })

  it('combines classNames', () => {
    const map = new Set([{ current: 'foo' }, { current: 'bar' }])

    expect(computeClassNames(map)).toEqual(expect.arrayContaining(['foo', 'bar']))
  })

  it('combines only unique classNames', () => {
    const map = new Set([{ current: 'foo' }, { current: 'bar' }, { current: 'foo bar baz' }])

    const result = computeClassNames(map)
    expect(result).toEqual(expect.arrayContaining(['foo', 'bar', 'baz']))
    expect(result).toHaveLength(3)
  })

  it('omits false, undefined and null classNames', () => {
    const map = new Set([
      { current: 'foo' },
      {},
      { current: false },
      { current: null },
      { current: undefined },
      { current: '0' },
      { current: 'false' },
    ])

    const result = computeClassNames(map)
    expect(result).toEqual(expect.arrayContaining(['foo', '0', 'false']))
    expect(result).toHaveLength(3)
  })

  it('trims classNames', () => {
    const map = new Set([{ current: ' foo     bar ' }, { current: '    baz qux' }])

    const result = computeClassNames(map)
    expect(result).toEqual(expect.arrayContaining(['foo', 'bar', 'baz', 'qux']))
    expect(result).toHaveLength(4)
  })

  it('skips "undefined" as input', () => {
    expect(computeClassNames([])).toHaveLength(0)
  })
})
