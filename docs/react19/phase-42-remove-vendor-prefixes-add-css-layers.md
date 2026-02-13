# Phase 42: Remove Vendor Prefixes and Legacy CSS, Add CSS Layers

| Field            | Value                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Phase ID**     | PHASE-42                                                                 |
| **Title**        | Remove Vendor Prefixes and Legacy CSS, Add CSS Layers                    |
| **Stage**        | 8 -- CSS & Styling Modernization                                         |
| **Dependencies** | Phase 40 (CSS created), Phase 41 (theming custom properties in place)    |
| **Complexity**   | Medium                                                                   |
| **Scope**        | CSS cleanup, browserslist, Babel browser targets, modern CSS features     |

---

## Objective

Audit all CSS files created in Phase 40 and modified in Phase 41 to remove unnecessary vendor prefixes, IE11-targeted rules, and legacy layout patterns. Ensure all CSS files consistently use `@layer` declarations. Adopt modern CSS features (container queries, logical properties, `gap`, `aspect-ratio`) where they improve the code. Update the project's browser target configuration to modern browsers only, removing IE11 from all target lists. This phase is the final cleanup pass before the CSS architecture is considered stable.

---

## Background

### Current Browser Targets

The browser targets are defined in `J:\code\semantic\Semantic-UI-React\.babel-preset.js` (lines 8-16):

```js
const browsers = [
  'last 8 versions',
  'safari > 8',
  'firefox > 23',
  'chrome > 24',
  'opera > 15',
  'not ie < 11',
  'not ie_mob <= 11',
]
```

This target list is extremely broad -- it includes browsers from 2013 and explicitly supports IE 11. The `'last 8 versions'` query alone encompasses many outdated browsers. This forces the Babel output to include polyfills and syntax transforms that are unnecessary for React 19, which itself requires ES2020+ features.

React 19 minimum browser requirements are approximately:
- Chrome 92+ (ES2021 support)
- Firefox 90+
- Safari 15.4+
- Edge 92+

There is no IE 11 support in React 19. The `not ie < 11` exclusion is therefore meaningless -- all IE versions are unsupported.

There is no `.browserslistrc` file in the project root. The browserslist is embedded only in the Babel preset.

### Current Vendor Prefix Situation

Since the CSS is being built from scratch in Phase 40, vendor prefixes are not inherited from `semantic-ui-css`. However, this phase ensures:
1. No vendor prefixes are introduced during Phase 40 development
2. PostCSS `autoprefixer` is configured with modern targets only
3. Any CSS contributed by future developers is automatically checked for unnecessary prefixes

### CSS `@layer` Status After Phase 40

Phase 40 creates `src/styles/layers.css` declaring the layer order:
```css
@layer sui.reset, sui.tokens, sui.base, sui.components, sui.utilities, sui.theme;
```

This phase verifies that EVERY CSS rule in EVERY file is wrapped in the appropriate `@layer` declaration and that no rules exist outside of layers (which would have highest specificity and break the cascade ordering).

---

## Detailed Tasks

### 1. Create `.browserslistrc` file

Create `J:\code\semantic\Semantic-UI-React\.browserslistrc`:

```
# Aligned with React 19 minimum browser support
chrome >= 92
firefox >= 90
safari >= 15.4
edge >= 92
not dead
not ie 11
not ie_mob 11
not op_mini all
```

### 2. Update Babel browser targets in `.babel-preset.js`

Modify `J:\code\semantic\Semantic-UI-React\.babel-preset.js` to reference the browserslist configuration instead of inline targets. Replace lines 8-16:

**Before:**
```js
const browsers = [
  'last 8 versions',
  'safari > 8',
  'firefox > 23',
  'chrome > 24',
  'opera > 15',
  'not ie < 11',
  'not ie_mob <= 11',
]
```

**After:**
```js
// Browser targets are defined in .browserslistrc
// This aligns with React 19 minimum requirements
```

Update the `@babel/env` preset configuration (lines 74-80) to remove the inline `targets` and let Babel read from `.browserslistrc`:

**Before:**
```js
['@babel/env', {
  modules: isESBuild || isUMDBuild ? false : 'commonjs',
  loose: true,
  targets: { browsers },
}]
```

**After:**
```js
['@babel/env', {
  modules: isESBuild || isUMDBuild ? false : 'commonjs',
  bugfixes: true,
}]
```

Note: `loose: true` is removed because it generates non-spec-compliant output and is unnecessary for modern browser targets. The `bugfixes: true` option produces smaller output for modern targets.

### 3. Audit all component CSS files for vendor prefixes

Scan every CSS file in `J:\code\semantic\Semantic-UI-React\src\styles\` for vendor prefixes that are unnecessary for the modern browser targets. Properties that NO LONGER need prefixes (baseline support in all target browsers):

| Property | Unprefixed Support |
|----------|-------------------|
| `display: flex` | Chrome 29+, Firefox 28+, Safari 9+ |
| `display: grid` | Chrome 57+, Firefox 52+, Safari 10.1+ |
| `gap` (in flex/grid) | Chrome 84+, Firefox 63+, Safari 14.1+ |
| `position: sticky` | Chrome 56+, Firefox 32+, Safari 13+ |
| `appearance: none` | Chrome 84+, Firefox 80+, Safari 15.4+ |
| `user-select: none` | Chrome 54+, Firefox 69+, Safari 16.4+ (needs prefix for Safari < 16.4) |
| CSS custom properties | Chrome 49+, Firefox 31+, Safari 9.1+ |
| CSS Grid | Chrome 57+, Firefox 52+, Safari 10.1+ |
| `transform` | Chrome 36+, Firefox 16+, Safari 9+ |
| `transition` | Chrome 26+, Firefox 16+, Safari 9+ |
| `animation` | Chrome 43+, Firefox 16+, Safari 9+ |
| `object-fit` | Chrome 32+, Firefox 36+, Safari 10+ |
| `filter` | Chrome 53+, Firefox 35+, Safari 9.1+ |
| `backdrop-filter` | Chrome 76+, Firefox 103+, Safari 9+ (with -webkit-) |

**Action**: Remove ALL `-webkit-`, `-moz-`, `-ms-` prefixes except:
- `-webkit-backdrop-filter` (needed for Safari < 18)
- `-webkit-line-clamp` (no unprefixed equivalent exists)

### 4. Replace legacy layout patterns with modern CSS

Audit the Grid, Menu, and other layout-heavy component CSS files and replace:

| Legacy Pattern | Modern Replacement |
|---------------|-------------------|
| `float: left` + `clearfix` | `display: flex` or `display: grid` |
| `margin-left` / `margin-right` for spacing between items | `gap` on the flex/grid container |
| `width: calc(100% / N)` for columns | `grid-template-columns: repeat(N, 1fr)` |
| `margin-left: auto; margin-right: auto` for centering | `margin-inline: auto` |
| `padding-left` / `padding-right` | `padding-inline` (logical properties) |
| `text-align: left` / `text-align: right` | `text-align: start` / `text-align: end` (where RTL support matters) |
| `@media` for container-relative responsive behavior | `@container` queries |

**Note**: The class names like `.left.floated` and `.right.floated` MUST still work. The CSS selector remains the same; only the property values change (e.g., `.left.floated` might use `margin-inline-end: auto` instead of `float: left`).

### 5. Implement CSS container queries for responsive components

Identify components that currently use viewport-based responsive behavior but would benefit from container-based responsive behavior:

- **Card.Group**: Number of columns based on container width, not viewport
- **Grid.Column**: Column width adjustments based on grid container width
- **Menu**: Compact mode based on menu container width
- **Button.Group**: Stacking based on container width, not viewport
- **Statistic.Group**: Layout adjustment based on container width

For each, add a `container-type: inline-size` declaration to the container element's CSS and use `@container` queries for responsive rules:

```css
.ui.cards {
  container-type: inline-size;
}

@container (max-width: 500px) {
  .ui.cards > .card {
    width: 100%;
  }
}
```

The existing `@media`-based responsive behavior for the `VISIBILITY` breakpoint system (`.mobile.only`, `.tablet.only`, etc.) MUST remain as `@media` queries because those are viewport-relative by design.

### 6. Add CSS `:focus-visible` for keyboard focus indicators

Replace all `:focus` selectors in component CSS with `:focus-visible` where appropriate:

**Before:**
```css
.ui.button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--sui-blue);
}
```

**After:**
```css
.ui.button:focus-visible {
  outline: 2px solid var(--sui-blue);
  outline-offset: 2px;
}

.ui.button:focus:not(:focus-visible) {
  outline: none;
}
```

This ensures keyboard users see focus indicators while mouse/touch users do not see distracting outlines. The `:focus:not(:focus-visible)` fallback handles browsers that support `:focus-visible`.

Components that need `:focus-visible` updates:
- Button (`J:\code\semantic\Semantic-UI-React\src\styles\elements\button.css`)
- Input (`J:\code\semantic\Semantic-UI-React\src\styles\elements\input.css`)
- Checkbox (`J:\code\semantic\Semantic-UI-React\src\styles\modules\checkbox.css`)
- Dropdown (`J:\code\semantic\Semantic-UI-React\src\styles\modules\dropdown.css`)
- Search (`J:\code\semantic\Semantic-UI-React\src\styles\modules\search.css`)
- Rating (`J:\code\semantic\Semantic-UI-React\src\styles\modules\rating.css`)
- Tab (`J:\code\semantic\Semantic-UI-React\src\styles\modules\tab.css`)
- Menu items (`J:\code\semantic\Semantic-UI-React\src\styles\collections\menu.css`)
- Pagination (`J:\code\semantic\Semantic-UI-React\src\styles\addons\pagination.css`)
- All form field elements

### 7. Use `color-mix()` for interactive state color calculations

Verify that all hover, active, and focus color variations use `color-mix()` (established in Phase 40-41) rather than hardcoded color values:

```css
.ui.red.button:hover {
  background-color: color-mix(in srgb, var(--sui-red) 85%, black);
}
.ui.red.button:active {
  background-color: color-mix(in srgb, var(--sui-red) 78%, black);
}
```

This must be applied to all 13 `SUI.COLORS` variants across all components that have color variants (Button, Label, Segment, Message, Header, etc.).

### 8. Add modern `aspect-ratio` where applicable

Replace padding-hack aspect ratio implementations with the `aspect-ratio` property:

- `Embed` component: video/iframe aspect ratio
- `Image` component: placeholder aspect ratio
- `Placeholder.Image`: skeleton loading aspect ratio

```css
.ui.embed {
  aspect-ratio: 16 / 9;
}
.ui.embed[data-aspect="4:3"] {
  aspect-ratio: 4 / 3;
}
```

### 9. Verify `@layer` coverage across all CSS files

Run a systematic audit of every CSS file in `src/styles/`:

- Every CSS rule must be inside an `@layer` declaration
- `tokens/` files use `@layer sui.tokens`
- `base/` files use `@layer sui.base`
- `collections/`, `elements/`, `modules/`, `views/`, `addons/` use `@layer sui.components`
- `themes/` files use `@layer sui.theme`

Create a linting rule or build-time check that fails if any CSS rule is found outside of a layer.

### 10. Configure PostCSS with modern-only autoprefixer

Create or update `J:\code\semantic\Semantic-UI-React\postcss.config.js`:

```js
module.exports = {
  plugins: [
    require('autoprefixer'),  // reads from .browserslistrc
    require('postcss-import'),
    require('cssnano')({ preset: 'default' }),
  ],
}
```

The `autoprefixer` plugin will only add prefixes for the browsers defined in `.browserslistrc`, which excludes IE 11 and all legacy browsers.

### 11. Remove IE11 conditional rules from build scripts

Verify that no build scripts, configuration files, or utility code contains IE11-specific logic:

- Check `J:\code\semantic\Semantic-UI-React\src\lib\isBrowser.js` for IE-specific user agent sniffing
- Check `J:\code\semantic\Semantic-UI-React\src\lib\doesNodeContainClick.js` for IE fallbacks
- Check `J:\code\semantic\Semantic-UI-React\src\lib\eventStack\` for IE event handling workarounds
- Remove any `@supports` queries that test for CSS features universally supported in the target browsers

---

## Files Affected

| File | Action |
|------|--------|
| `.browserslistrc` | CREATE |
| `.babel-preset.js` | MODIFY (remove inline browser targets, remove `loose: true`) |
| `postcss.config.js` | CREATE or MODIFY |
| `src/styles/**/*.css` (~60+ files) | MODIFY (remove vendor prefixes, add modern features) |
| `src/lib/isBrowser.js` | AUDIT (remove IE-specific code if found) |
| `src/lib/doesNodeContainClick.js` | AUDIT (remove IE fallbacks if found) |
| `src/lib/eventStack/**` | AUDIT (remove IE workarounds if found) |

**Total: ~2 files created, ~60+ files modified**

---

## Acceptance Criteria

- [ ] `.browserslistrc` exists with modern browser targets (Chrome 92+, Firefox 90+, Safari 15.4+, Edge 92+)
- [ ] `.babel-preset.js` no longer contains inline browser targets or `'not ie < 11'`
- [ ] `.babel-preset.js` no longer uses `loose: true`
- [ ] No CSS file contains `-webkit-flex`, `-ms-flexbox`, `-webkit-transform`, `-webkit-transition`, `-webkit-animation`, or `-ms-` prefixes
- [ ] `-webkit-backdrop-filter` is the ONLY vendor prefix retained (for Safari < 18)
- [ ] Every CSS rule in `src/styles/` is inside an `@layer` declaration
- [ ] `:focus-visible` is used instead of `:focus` for keyboard focus indicators on all interactive elements
- [ ] `color-mix()` is used for all interactive state color calculations (hover, active, focus)
- [ ] `gap` is used instead of margin-based spacing in flex and grid containers
- [ ] `aspect-ratio` is used for Embed and placeholder aspect ratios
- [ ] Container queries (`@container`) are used for at least Card.Group and Statistic.Group
- [ ] Logical properties (`margin-inline`, `padding-inline`) are used where RTL support is relevant
- [ ] PostCSS `autoprefixer` is configured and reads from `.browserslistrc`
- [ ] No IE11-specific JavaScript remains in `src/lib/`
- [ ] All existing visual tests pass (no visual regression)
- [ ] Babel output size is smaller than before (fewer transforms for modern targets)

---

## Rollback Strategy

1. Delete `.browserslistrc` and revert `.babel-preset.js` to restore the original inline browser targets.
2. Revert CSS file changes: `git checkout HEAD -- src/styles/`.
3. Revert `postcss.config.js`.
4. The browser target change in `.babel-preset.js` is the highest-risk item. If the production build breaks for a consumer on an older browser, the browserslist can be quickly widened.

---

## Notes for AI Agents

1. **The browserslist change has the broadest impact.** It affects both CSS (via PostCSS autoprefixer) and JavaScript (via Babel `@babel/preset-env`). Changing the targets alters the Babel transform output -- fewer polyfills and syntax transforms will be included. This is intentional and desired, but verify the output still works in the target browsers.

2. **Do not remove ALL vendor prefixes blindly.** `-webkit-backdrop-filter` is still needed for Safari versions < 18 (Safari 15.4-17.x). Check the caniuse data for each property before removing its prefix.

3. **The `loose: true` removal in `@babel/preset-env`** changes how class properties, destructuring, and for-of loops are compiled. With modern browser targets (Chrome 92+), most of these features are natively supported and will not be transformed at all, making `loose` mode irrelevant. However, verify that no test or consumer code depends on the `loose` mode output format.

4. **Container queries (`@container`) require `container-type` on the parent.** This adds a new CSS property to container elements. Verify that `container-type: inline-size` does not break any existing layout (it establishes a new containing block for some properties).

5. **Logical properties** (`margin-inline`, `padding-inline`, `border-inline`) improve RTL support but change the behavior slightly -- they respond to `direction: rtl` on the element or ancestor. If the project does not officially support RTL, document this as a future benefit and use logical properties where they are a simple replacement.

6. **The `:focus-visible` pattern** requires two rules: `:focus-visible` for keyboard focus and `:focus:not(:focus-visible)` to suppress mouse focus. Some older components might rely on `:focus` for visual feedback -- test interactive components thoroughly.

7. **This phase should be the last CSS-only phase before integration testing.** After this phase, the CSS architecture is considered stable, and subsequent phases (43-46) focus on React-layer features.

8. **When auditing `src/lib/` for IE11 code**, look for patterns like `document.documentMode`, `window.MSInputMethodContext`, `navigator.userAgent.indexOf('MSIE')`, or `Event` constructor polyfills. The `eventStack` module (`J:\code\semantic\Semantic-UI-React\src\lib\eventStack\`) is a likely location for browser-specific workarounds.
