# Phase 41: Implement CSS Custom Properties Theming System

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-41                                                                 |
| **Title**        | Implement CSS Custom Properties Theming System                           |
| **Stage**        | 8 -- CSS & Styling Modernization                                         |
| **Dependencies** | Phase 40 (modernize CSS approach -- CSS custom properties must exist)    |
| **Complexity**   | High                                                                     |
| **Scope**        | Theming infrastructure, React context, CSS custom properties, SUI.js     |

---

## Objective

Build a comprehensive theming system on top of the CSS custom properties created in Phase 40. This system must support runtime theme switching without recompilation, ship default and dark themes out of the box, provide a React `ThemeProvider` component for programmatic control, and maintain backward compatibility with the existing className-based approach to styling. The theming system bridges the gap between the JavaScript token constants in `SUI.js` and the CSS custom properties in `src/styles/tokens/`.

---

## Background

### Current Theming Architecture

Semantic-UI-React currently has no theming system of its own. The `SUI.js` constants file (`J:\code\semantic\Semantic-UI-React\src\lib\SUI.js`) defines the design token vocabulary as static JavaScript arrays:

- `COLORS`: 13 named colors (`red`, `orange`, `yellow`, `olive`, `green`, `teal`, `blue`, `violet`, `purple`, `pink`, `brown`, `grey`, `black`)
- `SIZES`: 8 size names (`mini`, `tiny`, `small`, `medium`, `large`, `big`, `huge`, `massive`)
- `VISIBILITY`: 5 responsive breakpoints (`mobile`, `tablet`, `computer`, `large screen`, `widescreen`)
- `FLOATS`, `TEXT_ALIGNMENTS`, `VERTICAL_ALIGNMENTS`, `WIDTHS`
- `TRANSITIONS`: 34 animation names (27 directional + 7 static)

These arrays serve two purposes:
1. PropTypes validation (constraining what values consumers can pass)
2. Documentation generation (listing valid options)

They do NOT currently map to any theming mechanism. The actual color values, sizing values, and spacing values are entirely owned by `semantic-ui-css` LESS variables. Consumers who want a different theme must recompile the LESS source or override CSS selectors.

### Target Architecture

After this phase:
- Every design token (color, size, spacing, typography, shadow, border, transition) is a CSS custom property
- `SUI.js` constants continue to define the vocabulary (prop names), but now reference a corresponding CSS custom property name
- A `ThemeProvider` component allows runtime theme switching by setting CSS custom properties on a DOM element
- Default theme and dark theme ship as pre-built CSS files
- Consumers can create custom themes by overriding CSS custom properties
- className-based theming remains fully functional (`.red.button` still works)

---

## Detailed Tasks

### 1. Define the complete design token taxonomy

Create `J:\code\semantic\Semantic-UI-React\src\styles\tokens\index.css` that imports all token files in the correct order:

```css
@import './colors.css';
@import './sizes.css';
@import './spacing.css';
@import './typography.css';
@import './shadows.css';
@import './borders.css';
@import './breakpoints.css';
@import './transitions.css';
@import './z-index.css';
```

The complete token set must include:

**Colors** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\colors.css`):
- 13 primary colors matching `SUI.COLORS`: `--sui-red` through `--sui-black`
- Hover, focus, active, and disabled variants for each using `color-mix()`
- Semantic colors: `--sui-primary`, `--sui-secondary`, `--sui-positive`, `--sui-negative`, `--sui-info`, `--sui-warning`
- Background colors: `--sui-background`, `--sui-background-subtle`, `--sui-background-muted`
- Text colors: `--sui-text`, `--sui-text-muted`, `--sui-text-subtle`, `--sui-text-disabled`
- Border color: `--sui-border`, `--sui-border-subtle`

**Sizes** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\sizes.css`):
- 8 font size tokens matching `SUI.SIZES`: `--sui-size-mini` through `--sui-size-massive`
- Component height tokens: `--sui-height-mini` through `--sui-height-massive`
- Icon size tokens: `--sui-icon-size-mini` through `--sui-icon-size-massive`

**Spacing** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\spacing.css`):
- Spacing scale: `--sui-space-1` through `--sui-space-12`
- Component-specific spacing: `--sui-padding-input`, `--sui-padding-button`, `--sui-margin-segment`

**Typography** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\typography.css`):
- Font families: `--sui-font-family`, `--sui-font-family-heading`, `--sui-font-family-mono`
- Font weights: `--sui-font-weight-normal`, `--sui-font-weight-bold`
- Line heights: `--sui-line-height`, `--sui-line-height-tight`, `--sui-line-height-relaxed`
- Letter spacing: `--sui-letter-spacing`

**Shadows** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\shadows.css`):
- `--sui-shadow-sm`, `--sui-shadow`, `--sui-shadow-md`, `--sui-shadow-lg`, `--sui-shadow-xl`
- `--sui-shadow-floating` (for dropdowns, modals, popups)

**Borders** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\borders.css`):
- `--sui-border-radius`, `--sui-border-radius-sm`, `--sui-border-radius-lg`, `--sui-border-radius-full`
- `--sui-border-width`

**Transitions** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\transitions.css`):
- `--sui-transition-duration`, `--sui-transition-easing`
- Per-animation duration overrides

**Z-index** (in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\z-index.css`):
- `--sui-z-dropdown`, `--sui-z-modal`, `--sui-z-popup`, `--sui-z-dimmer`, `--sui-z-sidebar`

### 2. Create the default theme CSS file

Create `J:\code\semantic\Semantic-UI-React\src\styles\themes\default.css`:

```css
@layer sui.theme {
  :root {
    /* Map semantic colors to actual values */
    --sui-primary: var(--sui-blue);
    --sui-secondary: var(--sui-black);
    --sui-positive: var(--sui-green);
    --sui-negative: var(--sui-red);
    --sui-info: var(--sui-teal);
    --sui-warning: var(--sui-yellow);

    /* Background */
    --sui-background: #ffffff;
    --sui-background-subtle: #f9fafb;
    --sui-background-muted: #f3f4f6;

    /* Text */
    --sui-text: rgba(0, 0, 0, 0.87);
    --sui-text-muted: rgba(0, 0, 0, 0.6);
    --sui-text-subtle: rgba(0, 0, 0, 0.4);
    --sui-text-disabled: rgba(0, 0, 0, 0.2);

    /* Border */
    --sui-border: rgba(34, 36, 38, 0.15);
    --sui-border-subtle: rgba(34, 36, 38, 0.08);

    color-scheme: light;
  }
}
```

### 3. Create the dark theme CSS file

Create `J:\code\semantic\Semantic-UI-React\src\styles\themes\dark.css`:

```css
@layer sui.theme {
  [data-sui-theme="dark"] {
    --sui-background: #1b1c1d;
    --sui-background-subtle: #27292a;
    --sui-background-muted: #333536;

    --sui-text: rgba(255, 255, 255, 0.9);
    --sui-text-muted: rgba(255, 255, 255, 0.7);
    --sui-text-subtle: rgba(255, 255, 255, 0.45);
    --sui-text-disabled: rgba(255, 255, 255, 0.2);

    --sui-border: rgba(255, 255, 255, 0.15);
    --sui-border-subtle: rgba(255, 255, 255, 0.08);

    /* Adjusted color values for dark backgrounds */
    --sui-red: #ff4a4a;
    --sui-orange: #ff8c42;
    --sui-yellow: #ffd43b;
    --sui-olive: #c5dd2c;
    --sui-green: #36d759;
    --sui-teal: #1cd4cb;
    --sui-blue: #4da3e8;
    --sui-violet: #8b6bd4;
    --sui-purple: #be5cd6;
    --sui-pink: #f05aaf;
    --sui-brown: #c17e5a;
    --sui-grey: #909090;
    --sui-black: #d4d4d4;

    --sui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --sui-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    --sui-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
    --sui-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4);

    color-scheme: dark;
  }
}
```

### 4. Create the `ThemeProvider` React component

Create `J:\code\semantic\Semantic-UI-React\src\addons\ThemeProvider\ThemeProvider.js`:

```js
import * as React from 'react'
import PropTypes from 'prop-types'

const ThemeContext = React.createContext({
  theme: 'default',
  setTheme: () => {},
})

/**
 * A ThemeProvider sets CSS custom properties for theming on a wrapper element.
 * It also provides theme context to descendant components.
 */
const ThemeProvider = React.forwardRef(function ThemeProvider(props, ref) {
  const {
    as: ElementType = 'div',
    children,
    theme = 'default',
    tokens = {},
    ...rest
  } = props

  const [currentTheme, setCurrentTheme] = React.useState(theme)

  React.useEffect(() => {
    setCurrentTheme(theme)
  }, [theme])

  const style = React.useMemo(() => {
    const customProperties = {}
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
      <ElementType
        {...rest}
        ref={ref}
        data-sui-theme={currentTheme}
        style={style}
      >
        {children}
      </ElementType>
    </ThemeContext>
  )
})
```

Also create:
- `J:\code\semantic\Semantic-UI-React\src\addons\ThemeProvider\ThemeProvider.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\addons\ThemeProvider\index.js`
- `J:\code\semantic\Semantic-UI-React\src\addons\ThemeProvider\index.d.ts`

### 5. Create `useTheme` hook

Create `J:\code\semantic\Semantic-UI-React\src\lib\hooks\useTheme.js`:

```js
import * as React from 'react'
import { ThemeContext } from '../../addons/ThemeProvider/ThemeProvider'

/**
 * Hook to access the current theme and theme setter from ThemeProvider context.
 * @returns {{ theme: string, setTheme: (theme: string) => void }}
 */
export default function useTheme() {
  return React.useContext(ThemeContext)
}
```

### 6. Create a token mapping utility in SUI.js

Update `J:\code\semantic\Semantic-UI-React\src\lib\SUI.js` to add CSS custom property name mappings:

```js
// Add after existing COLORS array (line 18):
export const COLOR_CSS_PROPERTIES = Object.fromEntries(
  COLORS.map(color => [color, `--sui-${color}`])
)

// Add after existing SIZES array (line 20):
export const SIZE_CSS_PROPERTIES = Object.fromEntries(
  SIZES.map(size => [size, `--sui-size-${size}`])
)
```

These mappings allow programmatic access to the CSS custom property names from JavaScript, which is useful for components that need to set inline style overrides referencing tokens (like the 5 files that use inline styles).

### 7. Create theme preset files for programmatic use

Create `J:\code\semantic\Semantic-UI-React\src\theme\presets\default.js`:

```js
export default {
  primary: '#2185d0',
  secondary: '#1b1c1d',
  positive: '#21ba45',
  negative: '#db2828',
  info: '#00b5ad',
  warning: '#fbbd08',
  background: '#ffffff',
  text: 'rgba(0, 0, 0, 0.87)',
  // ... all token values
}
```

Create `J:\code\semantic\Semantic-UI-React\src\theme\presets\dark.js` with the dark theme values.

These JavaScript objects contain the same values as the CSS theme files and can be passed to `ThemeProvider` as `tokens` for JavaScript-driven theming.

### 8. Update component CSS files to use CSS custom properties

Audit every CSS file created in Phase 40 and ensure hardcoded color, size, spacing, and shadow values are replaced with CSS custom property references. For example, in `J:\code\semantic\Semantic-UI-React\src\styles\elements\button.css`:

**Before** (hardcoded values from Phase 40):
```css
.ui.button {
  background-color: #e0e1e2;
  color: rgba(0, 0, 0, 0.6);
  border-radius: 0.28571429rem;
}
```

**After** (custom property references):
```css
.ui.button {
  background-color: var(--sui-button-background, #e0e1e2);
  color: var(--sui-text-muted);
  border-radius: var(--sui-border-radius);
}
```

The fallback values in `var()` ensure the component still works without a theme provider or token CSS loaded.

### 9. Document the theming API

Create usage documentation covering:

- Importing theme CSS files
- Using `ThemeProvider` component
- Using `useTheme` hook
- Creating custom themes via CSS custom properties
- Creating custom themes via JavaScript token objects
- Dark mode implementation patterns (CSS-only with `@media (prefers-color-scheme: dark)` vs. JavaScript-controlled)
- Scoped theming (nesting ThemeProviders for sections of the page)

### 10. Ensure backward compatibility with className-based theming

Verify that the existing pattern of applying themes via CSS classes (e.g., `.ui.inverted.segment`, `.ui.red.button`) continues to work alongside the new CSS custom property system. The class-based approach takes precedence within its cascade layer because component-level class selectors are more specific than root-level custom property declarations.

---

## Files Affected

| File | Action |
|------|--------|
| `src/styles/tokens/colors.css` | MODIFY (add semantic colors, dark variants) |
| `src/styles/tokens/sizes.css` | MODIFY (add component height, icon size tokens) |
| `src/styles/tokens/spacing.css` | MODIFY (add component-specific spacing) |
| `src/styles/tokens/typography.css` | MODIFY (add font families, weights) |
| `src/styles/tokens/shadows.css` | MODIFY (ensure full shadow scale) |
| `src/styles/tokens/borders.css` | MODIFY (ensure all border tokens) |
| `src/styles/tokens/transitions.css` | MODIFY (add per-animation tokens) |
| `src/styles/tokens/z-index.css` | MODIFY (ensure all z-index tokens) |
| `src/styles/tokens/index.css` | CREATE |
| `src/styles/themes/default.css` | CREATE |
| `src/styles/themes/dark.css` | CREATE |
| `src/addons/ThemeProvider/ThemeProvider.js` | CREATE |
| `src/addons/ThemeProvider/ThemeProvider.d.ts` | CREATE |
| `src/addons/ThemeProvider/index.js` | CREATE |
| `src/addons/ThemeProvider/index.d.ts` | CREATE |
| `src/lib/hooks/useTheme.js` | CREATE |
| `src/lib/SUI.js` | MODIFY (add CSS property mappings) |
| `src/theme/presets/default.js` | CREATE |
| `src/theme/presets/dark.js` | CREATE |
| `src/index.js` | MODIFY (export ThemeProvider, useTheme) |
| `index.d.ts` | MODIFY (add ThemeProvider, useTheme types) |
| All `src/styles/**/*.css` component files (~42 files) | MODIFY (replace hardcoded values with custom properties) |

**Total: ~10 files created, ~50+ files modified**

---

## Acceptance Criteria

- [ ] All design tokens are defined as CSS custom properties in `src/styles/tokens/`
- [ ] Default theme CSS file exists at `src/styles/themes/default.css`
- [ ] Dark theme CSS file exists at `src/styles/themes/dark.css`
- [ ] `ThemeProvider` component renders a wrapper element with `data-sui-theme` attribute
- [ ] `ThemeProvider` accepts a `tokens` prop to set arbitrary CSS custom properties
- [ ] `useTheme()` hook returns `{ theme, setTheme }` from the nearest `ThemeProvider`
- [ ] Theme switching works at runtime without page reload
- [ ] Dark theme visually inverts all components correctly
- [ ] `SUI.js` exports `COLOR_CSS_PROPERTIES` and `SIZE_CSS_PROPERTIES` mappings
- [ ] All component CSS files reference CSS custom properties instead of hardcoded values
- [ ] Components work without `ThemeProvider` (CSS custom properties have fallback values)
- [ ] Existing className-based theming (`.ui.inverted`, `.ui.red.button`) still works
- [ ] Nested `ThemeProvider` components scope their theme to their subtree
- [ ] `ThemeProvider` uses the React 19 `<Context value={}>` pattern (not `<Context.Provider value={}>`)
- [ ] TypeScript types are provided for `ThemeProvider`, `useTheme`, and theme preset objects

---

## Rollback Strategy

1. Remove the `src/addons/ThemeProvider/` directory and `src/lib/hooks/useTheme.js`.
2. Revert `SUI.js` to remove the CSS property mapping exports.
3. Revert component CSS files to use hardcoded values.
4. Delete `src/styles/themes/` directory.
5. Remove `ThemeProvider` and `useTheme` from `src/index.js` exports.
6. All of these are purely additive changes -- removing them does not break any existing functionality.

---

## Notes for AI Agents

1. **The `ThemeProvider` component is NEW to the library.** It has no predecessor. This is not a migration of existing functionality but the creation of a new feature. It must follow the same patterns as existing addons (see `J:\code\semantic\Semantic-UI-React\src\addons\` directory for examples of addon components like `Confirm`, `Portal`, `Pagination`).

2. **Use the React 19 Context pattern.** The `ThemeProvider` must use `<ThemeContext value={contextValue}>` (React 19's new `Context` as provider pattern), NOT `<ThemeContext.Provider value={contextValue}>`. This aligns with Phase 44. However, note that if this phase is executed before the React 19 upgrade is complete, use a compatibility shim or feature-detect.

3. **CSS custom property fallback values are critical.** Every `var()` usage in component CSS MUST include a fallback value that matches the current default theme appearance. This ensures components look correct even when no theme CSS is loaded. Example: `color: var(--sui-text, rgba(0, 0, 0, 0.87))`.

4. **Do NOT use JavaScript to compute CSS.** The theme switching mechanism is purely CSS-based (changing `data-sui-theme` attribute triggers different custom property values). The `ThemeProvider` sets a data attribute on a DOM element; it does not inject `<style>` tags or use CSS-in-JS.

5. **The `tokens` prop is an escape hatch.** It allows consumers to set arbitrary CSS custom properties via inline styles on the ThemeProvider wrapper. This is for fine-grained overrides, not for defining entire themes (which should be done via CSS files).

6. **The dark theme color adjustments are NOT simple inversions.** Colors on dark backgrounds need to be adjusted for contrast and vibrancy. The dark theme values should be tested for WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text).

7. **Do not modify `classNameBuilders.js`.** The class construction logic is unchanged. Theming via classes (`.red.button`) and theming via custom properties (`--sui-red`) are complementary, not competing approaches.

8. **The `data-sui-theme` attribute** on the ThemeProvider wrapper element is the CSS selector hook. Theme CSS files use `[data-sui-theme="dark"]` as their selector scope. This allows multiple theme scopes on the same page.
