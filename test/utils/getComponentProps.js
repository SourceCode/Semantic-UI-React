/**
 * Gets proper props for a component.
 *
 * @param {React.ElementType} Component
 * @return {Object}
 */
export default function getComponentProps(Component) {
  return {
    handledProps: Component.handledProps,
  }
}
