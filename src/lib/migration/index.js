/**
 * Checks whether the React 19 migration feature flag is enabled.
 * Used during the transitional period when both old and new code paths may coexist.
 *
 * @returns {boolean} True if REACT_19_MIGRATION is set to "true".
 */
export const isMigrationEnabled = () => process.env.REACT_19_MIGRATION === 'true'
