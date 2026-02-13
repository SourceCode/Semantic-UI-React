/**
 * Gets a proper `displayName` for a component.
 *
 * @param {React.ElementType} Component
 * @return {String}
 */
export default function getComponentName(Component) {
  if (Component.displayName) {
    return Component.displayName
  }

  if (Component.name) {
    return Component.name
  }

  return Component.prototype?.constructor?.name
}
