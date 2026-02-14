/**
 * Shallow comparison of two values.
 * Returns true if both values are strictly equal, or if both are objects/arrays
 * with the same own enumerable keys and strictly equal values.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export default function shallowEqual(a, b) {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (!Object.hasOwn(b, keysA[i]) || !Object.is(a[keysA[i]], b[keysA[i]])) return false
  }

  return true
}
