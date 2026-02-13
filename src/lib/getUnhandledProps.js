/**
 * Returns an object consisting of props beyond the scope of the Component.
 * Useful for getting and spreading unknown props from the user.
 * @param {function} Component A function or ReactClass.
 * @param {object} props A ReactElement props object
 * @returns {{}} A shallow copy of the prop object
 */
const getUnhandledProps = (Component, props) => {
  // `handledProps` is a static array on each component listing all props the component handles.
  // Props not in this list are passed through to the underlying DOM element.
  const { handledProps = [] } = Component

  return Object.keys(props).reduce((acc, prop) => {
    // "childKey" is an internal prop of Semantic UI React
    // "ref" should not be spread to the DOM element (handled explicitly)
    if (prop === 'childKey' || prop === 'ref') return acc
    if (handledProps.indexOf(prop) === -1) acc[prop] = props[prop]
    return acc
  }, {})
}

export default getUnhandledProps
