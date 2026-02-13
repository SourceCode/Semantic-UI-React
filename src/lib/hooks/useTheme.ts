import * as React from 'react'
import { ThemeContext } from '../../addons/ThemeProvider/ThemeProvider'

/**
 * Hook to access the current theme and theme setter from ThemeProvider context.
 * @returns {{ theme: string, setTheme: (theme: string) => void }}
 */
export default function useTheme() {
  return React.useContext(ThemeContext)
}
