import * as React from 'react'

import { getUnhandledProps } from '../../lib'

export interface ThemeContextValue {
  /** The current theme name. */
  theme: string
  /** Function to change the current theme. */
  setTheme: (theme: string) => void
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'default',
  setTheme: () => {},
})

export interface StrictThemeProviderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** The theme name to apply. Sets the data-sui-theme attribute. */
  theme?: string

  /**
   * CSS custom property overrides as an object.
   * Keys can be full custom property names (e.g. '--sui-primary')
   * or shorthand names (e.g. 'primary' which becomes '--sui-primary').
   */
  tokens?: Record<string, string>
}

export interface ThemeProviderProps extends StrictThemeProviderProps {
  [key: string]: any
}

/**
 * A ThemeProvider sets CSS custom properties for theming on a wrapper element.
 * It also provides theme context to descendant components via React 19 Context.
 */
function ThemeProvider({
  ref,
  ...props
}: ThemeProviderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    as: ElementType = 'div',
    children,
    theme = 'default',
    tokens = {},
  } = props

  const rest = getUnhandledProps(ThemeProvider, props)

  const [currentTheme, setCurrentTheme] = React.useState(theme)

  React.useEffect(() => {
    setCurrentTheme(theme)
  }, [theme])

  const style = React.useMemo(() => {
    const customProperties: Record<string, string> = {}
    for (const [key, value] of Object.entries(tokens)) {
      const propName = key.startsWith('--') ? key : `--sui-${key}`
      customProperties[propName] = value
    }
    return customProperties
  }, [tokens])

  const contextValue = React.useMemo(
    () => ({ theme: currentTheme, setTheme: setCurrentTheme }),
    [currentTheme],
  )

  return (
    <ThemeContext value={contextValue}>
      <ElementType {...rest} ref={ref} data-sui-theme={currentTheme} style={style}>
        {children}
      </ElementType>
    </ThemeContext>
  )
}

ThemeProvider.displayName = 'ThemeProvider'
ThemeProvider.handledProps = [
  'as',
  'children',
  'className',
  'theme',
  'tokens',
]

export default ThemeProvider
