/**
 * Gets proper props for a component.
 *
 * @param {React.ElementType} Component
 * @return {Object}
 */
export default function getComponentProps(Component) {
  return {
    autoControlledProps: Component.autoControlledProps,
    handledProps: Component.handledProps,
    propTypes: Component.propTypes,
  }
}
