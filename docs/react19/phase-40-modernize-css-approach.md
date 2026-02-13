# Phase 40: Replace semantic-ui-css Dependency with Modern CSS Approach

| Field            | Value                                                                      |
|------------------|----------------------------------------------------------------------------|
| **Phase ID**     | PHASE-40                                                                   |
| **Title**        | Replace semantic-ui-css Dependency with Modern CSS Approach                |
| **Stage**        | 8 -- CSS & Styling Modernization                                           |
| **Dependencies** | Phase 15 (all components migrated to function components)                  |
| **Complexity**   | High                                                                       |
| **Scope**        | CSS architecture, package dependencies, component styling, build pipeline  |

---

## Objective

Remove the external `semantic-ui-css` ^2.4.1 dependency and replace it with a modern, self-contained CSS architecture built from scratch using CSS3+ features. The new CSS must preserve Semantic UI's class naming conventions (so all existing `className` construction logic in the 7 `classNameBuilders` utilities and `clsx` calls remains valid) while adopting CSS cascade layers (`@layer`), CSS custom properties, modern selectors (`:is()`, `:where()`, `:has()`), container queries, and `color-mix()` for color manipulation. The result is a modular, tree-shakable CSS system where consumers can import only the component styles they need.

---

## Background

### Current CSS Architecture

Semantic-UI-React does not own any CSS. It relies entirely on the external `semantic-ui-css` package (declared as a devDependency at `^2.4.1` in `J:\code\semantic\Semantic-UI-React\package.json` line 167) for all visual styling. The component library generates class names that match the selectors defined in `semantic-ui-css`, and consumers are responsible for importing the CSS themselves:

```js
import 'semantic-ui-css/semantic.min.css'
```

This creates several problems:

1. **Stale upstream**: The `semantic-ui-css` package has not received meaningful updates since 2018. Version 2.4.1 contains IE11-era vendor prefixes, float-based layouts, and no CSS custom properties. The Semantic UI upstream project (https://github.com/Semantic-Org/Semantic-UI) is effectively unmaintained.

2. **No tree-shaking**: The monolithic `semantic.min.css` (approximately 628 KB unminified, 145 KB minified + gzipped) must be loaded in full even when a consumer uses only a few components.

3. **No runtime theming**: Theming in `semantic-ui-css` requires recompiling LESS source files at build time. There is no mechanism for runtime theme switching.

4. **Class naming dependency**: The 7 `classNameBuilder` functions in `J:\code\semantic\Semantic-UI-React\src\lib\classNameBuilders.js` (`getKeyOnly`, `getValueAndKey`, `getKeyOrValueAndKey`, `getMultipleProp`, `getTextAlignProp`, `getVerticalAlignProp`, `getWidthProp`) produce class strings like `"ui big label"`, `"ui left corner label"`, `"mobile only tablet only row"`, and `"equal width"`. These class patterns MUST remain valid selectors in the new CSS.

5. **SUI.js constants**: `J:\code\semantic\Semantic-UI-React\src\lib\SUI.js` defines design tokens as JavaScript arrays: `COLORS` (13 colors), `SIZES` (8 sizes from mini to massive), `VISIBILITY` (5 breakpoints), `FLOATS`, `TEXT_ALIGNMENTS`, `VERTICAL_ALIGNMENTS`, `WIDTHS`, `TRANSITIONS` (directional + static), and extensive icon name catalogs. The new CSS must provide styles matching every value in these arrays.

6. **Inline styles**: Only 5 files in the entire codebase use inline styles (for dynamic values like animation duration in `Transition.js` line 148, and dynamic positioning). All other styling is class-based.

### Why Build Our Own CSS

The available options were evaluated:

| Option | Pros | Cons |
|--------|------|------|
| Keep `semantic-ui-css` | Zero effort | Stale, no tree-shaking, no custom properties, IE11 cruft |
| Fork `semantic-ui-css` LESS source | Familiar class names | LESS toolchain dependency, massive maintenance burden |
| Adopt Tailwind/etc | Modern, well-maintained | Completely different class naming, breaks all classNameBuilder logic |
| **Build new CSS from scratch** | **Full control, modern features, tree-shakable, preserves class naming** | **Significant initial effort** |

The recommended approach is to build new CSS from scratch that matches the existing Semantic UI class selectors. This preserves 100% backward compatibility with all `classNameBuilder` output and consumer code that relies on Semantic UI class names.

---

## Detailed Tasks

### 1. Create the `src/styles/` directory structure

Create the following directory structure at `J:\code\semantic\Semantic-UI-React\src\styles\`:

```
src/styles/
  index.css                    # Main entry point, imports all layers
  layers.css                   # @layer declarations for ordering
  tokens/
    colors.css                 # CSS custom properties for COLORS
    sizes.css                  # CSS custom properties for SIZES
    spacing.css                # Spacing scale
    typography.css             # Font families, sizes, weights, line heights
    shadows.css                # Box shadow tokens
    borders.css                # Border radius, width tokens
    breakpoints.css            # Breakpoint custom properties matching VISIBILITY
    transitions.css            # Transition duration, easing tokens
    z-index.css                # Z-index scale
  base/
    reset.css                  # Minimal CSS reset (modern, no IE11)
    typography.css             # Base typography rules
  collections/
    breadcrumb.css
    form.css
    grid.css
    menu.css
    message.css
    table.css
  elements/
    button.css
    container.css
    divider.css
    flag.css
    header.css
    icon.css
    image.css
    input.css
    label.css
    list.css
    loader.css
    placeholder.css
    rail.css
    reveal.css
    segment.css
    step.css
  modules/
    accordion.css
    checkbox.css
    dimmer.css
    dropdown.css
    embed.css
    modal.css
    popup.css
    progress.css
    rating.css
    search.css
    sidebar.css
    sticky.css
    tab.css
    transition.css
  views/
    advertisement.css
    card.css
    comment.css
    feed.css
    item.css
    statistic.css
  addons/
    confirm.css
    pagination.css
    portal.css
    select.css
    text-area.css
    transitionable-portal.css
```

### 2. Define CSS cascade layers in `src/styles/layers.css`

Create `J:\code\semantic\Semantic-UI-React\src\styles\layers.css`:

```css
@layer sui.reset, sui.tokens, sui.base, sui.components, sui.utilities, sui.theme;
```

This establishes the cascade priority order. Consumer overrides without a layer declaration will automatically win over all library layers.

### 3. Build the design token CSS files

Create CSS custom property definitions in `J:\code\semantic\Semantic-UI-React\src\styles\tokens\colors.css` that map every value in `SUI.COLORS` to a CSS custom property:

```css
@layer sui.tokens {
  :root {
    --sui-red: #db2828;
    --sui-orange: #f2711c;
    --sui-yellow: #fbbd08;
    --sui-olive: #b5cc18;
    --sui-green: #21ba45;
    --sui-teal: #00b5ad;
    --sui-blue: #2185d0;
    --sui-violet: #6435c9;
    --sui-purple: #a333c8;
    --sui-pink: #e03997;
    --sui-brown: #a5673f;
    --sui-grey: #767676;
    --sui-black: #1b1c1d;

    /* Hover variants using color-mix() */
    --sui-red-hover: color-mix(in srgb, var(--sui-red) 85%, black);
    --sui-orange-hover: color-mix(in srgb, var(--sui-orange) 85%, black);
    /* ... pattern repeats for all 13 colors ... */

    /* Focus variants */
    --sui-red-focus: color-mix(in srgb, var(--sui-red) 90%, black);
    /* ... */

    /* Active variants */
    --sui-red-active: color-mix(in srgb, var(--sui-red) 78%, black);
    /* ... */
  }
}
```

Create `J:\code\semantic\Semantic-UI-React\src\styles\tokens\sizes.css` that maps every value in `SUI.SIZES`:

```css
@layer sui.tokens {
  :root {
    --sui-size-mini: 0.4rem;
    --sui-size-tiny: 0.571rem;
    --sui-size-small: 0.857rem;
    --sui-size-medium: 1rem;
    --sui-size-large: 1.143rem;
    --sui-size-big: 1.286rem;
    --sui-size-huge: 1.429rem;
    --sui-size-massive: 1.714rem;
  }
}
```

Create `J:\code\semantic\Semantic-UI-React\src\styles\tokens\breakpoints.css` matching `SUI.VISIBILITY`:

```css
@layer sui.tokens {
  :root {
    --sui-mobile-max: 767px;
    --sui-tablet-min: 768px;
    --sui-tablet-max: 991px;
    --sui-computer-min: 992px;
    --sui-computer-max: 1199px;
    --sui-large-screen-min: 1200px;
    --sui-large-screen-max: 1919px;
    --sui-widescreen-min: 1920px;
  }
}
```

Create the remaining token files (`spacing.css`, `typography.css`, `shadows.css`, `borders.css`, `transitions.css`, `z-index.css`) following the same pattern, extracting values from the corresponding `semantic-ui-css` LESS variables.

### 4. Build component CSS files matching existing class selectors

For each component CSS file, the selectors MUST match the class strings produced by the `classNameBuilders`. For example, `J:\code\semantic\Semantic-UI-React\src\styles\elements\button.css`:

```css
@layer sui.components {
  .ui.button {
    /* Base button styles */
    cursor: pointer;
    display: inline-block;
    min-height: 1em;
    font-family: var(--sui-font-family, inherit);
    font-size: var(--sui-size-medium);
    /* ... */
  }

  /* Size variants -- matches getKeyOrValueAndKey output */
  .ui.mini.button { font-size: var(--sui-size-mini); }
  .ui.tiny.button { font-size: var(--sui-size-tiny); }
  .ui.small.button { font-size: var(--sui-size-small); }
  .ui.large.button { font-size: var(--sui-size-large); }
  .ui.big.button { font-size: var(--sui-size-big); }
  .ui.huge.button { font-size: var(--sui-size-huge); }
  .ui.massive.button { font-size: var(--sui-size-massive); }

  /* Color variants -- matches value-only pattern */
  .ui.red.button {
    background-color: var(--sui-red);
    color: #fff;
    &:hover { background-color: var(--sui-red-hover); }
    &:focus-visible { background-color: var(--sui-red-focus); }
    &:active { background-color: var(--sui-red-active); }
  }
  /* ... repeat for all 13 SUI.COLORS values ... */

  /* Boolean prop variants -- matches getKeyOnly output */
  .ui.loading.button { /* ... */ }
  .ui.disabled.button { /* ... */ }
  .ui.fluid.button { display: block; width: 100%; }
  .ui.circular.button { border-radius: 50%; }
  .ui.compact.button { /* ... */ }
  .ui.basic.button { /* ... */ }
  .ui.inverted.button { /* ... */ }

  /* Float variants -- matches getValueAndKey output */
  .ui.left.floated.button { float: left; }
  .ui.right.floated.button { float: right; }
}
```

Repeat this pattern for ALL 42 component categories (6 collections, 16 elements, 14 modules, 6 views). Every selector must be verified against the `className` construction in the corresponding React component file.

### 5. Build the Grid CSS using modern layout features

The Grid component is the most complex CSS surface. Create `J:\code\semantic\Semantic-UI-React\src\styles\collections\grid.css` using CSS Grid and Flexbox instead of the float-based layout in `semantic-ui-css`. The Grid CSS must support:

- All width values from `SUI.WIDTHS` (1-16 columns via `getWidthProp`)
- `getMultipleProp` output for responsive visibility: `.mobile.only.row`, `.tablet.only.column`, `.mobile.only.tablet.only.row`, etc.
- `getTextAlignProp` output: `.left.aligned`, `.center.aligned`, `.right.aligned`, `.justified`
- `getVerticalAlignProp` output: `.top.aligned`, `.middle.aligned`, `.bottom.aligned`
- `getWidthProp` output with `widthClass`: `.four.column.grid`, `.equal.width.grid`
- `getKeyOnly` output: `.stackable`, `.doubling`, `.padded`, `.relaxed`, `.centered`, `.reversed`

Use container queries (`@container`) for the responsive column behavior where appropriate, while maintaining `@media` query support for the `VISIBILITY` breakpoints.

### 6. Build the Transition CSS

Create `J:\code\semantic\Semantic-UI-React\src\styles\modules\transition.css` providing `@keyframes` definitions for all values in `SUI.DIRECTIONAL_TRANSITIONS` (27 transitions) and `SUI.STATIC_TRANSITIONS` (7 transitions). This is the CSS that makes the `Transition` component (`J:\code\semantic\Semantic-UI-React\src\modules\Transition\Transition.js`) work. The class patterns used are:

- `.transition` (base)
- `.animating` (during animation)
- `.visible` / `.hidden` (visibility state)
- `.in` / `.out` (direction for directional transitions)
- `.[animation-name]` (e.g., `.fade`, `.slide.up`, `.fly.left`)

### 7. Build the Icon CSS

Create `J:\code\semantic\Semantic-UI-React\src\styles\elements\icon.css`. The icon system is the most content-heavy CSS file. `SUI.js` defines `ICONS` (approximately 680 unique icon names across 24 categories), `ICON_ALIASES` (approximately 200 aliases), and `COMPONENT_CONTEXT_SPECIFIC_ICONS`. The current `semantic-ui-css` uses Font Awesome 5 as the icon font.

Decision: Continue using Font Awesome 5 Free as the icon font (it is MIT-licensed) but load it via CSS custom properties for the font-family, allowing consumers to swap icon fonts. Alternatively, consider making the icon font configurable with a default of no bundled font, requiring consumers to bring their own.

### 8. Create the main entry point CSS file

Create `J:\code\semantic\Semantic-UI-React\src\styles\index.css`:

```css
@import './layers.css';
@import './tokens/colors.css';
@import './tokens/sizes.css';
@import './tokens/spacing.css';
@import './tokens/typography.css';
@import './tokens/shadows.css';
@import './tokens/borders.css';
@import './tokens/breakpoints.css';
@import './tokens/transitions.css';
@import './tokens/z-index.css';
@import './base/reset.css';
@import './base/typography.css';
@import './collections/breadcrumb.css';
@import './collections/form.css';
@import './collections/grid.css';
@import './collections/menu.css';
@import './collections/message.css';
@import './collections/table.css';
@import './elements/button.css';
/* ... all component CSS imports ... */
```

### 9. Configure CSS build pipeline for tree-shaking

Update the Rollup configuration (from Phase 06) to process CSS:

- Add `rollup-plugin-postcss` or a custom plugin that copies CSS files to `dist/styles/`
- Preserve the individual CSS files so consumers can import per-component:
  ```js
  import 'semantic-ui-react/dist/styles/elements/button.css'
  ```
- Also produce a concatenated `dist/styles/semantic-ui-react.css` for consumers who want the full bundle
- Add PostCSS with `postcss-import` (to resolve `@import`), `autoprefixer` (modern targets only), and `cssnano` (minification)

### 10. Update `package.json` to remove `semantic-ui-css` dependency

In `J:\code\semantic\Semantic-UI-React\package.json`:

- Remove `"semantic-ui-css": "^2.4.1"` from `devDependencies` (line 167)
- Add CSS entry point to `exports` map:
  ```json
  {
    "exports": {
      "./styles": "./dist/styles/index.css",
      "./styles/*": "./dist/styles/*"
    }
  }
  ```
- Update `"sideEffects"` to include CSS files:
  ```json
  {
    "sideEffects": ["*.css"]
  }
  ```
- Add `"style": "dist/styles/semantic-ui-react.css"` field for bundler CSS resolution

### 11. Update documentation to use the new CSS

Update the documentation site (currently referencing `semantic-ui-css` in `J:\code\semantic\Semantic-UI-React\static.config.js` line 31-35 for version tracking, and imported in docs CSS) to import from the new `src/styles/index.css` instead.

### 12. Create a compatibility migration guide for CSS consumers

Document the migration path for consumers currently using `semantic-ui-css`:

- **Before**: `import 'semantic-ui-css/semantic.min.css'`
- **After (full)**: `import 'semantic-ui-react/styles'`
- **After (tree-shaken)**: `import 'semantic-ui-react/styles/elements/button.css'`

---

## Files Affected

| File | Action |
|------|--------|
| `src/styles/` (entire directory, ~60+ CSS files) | CREATE |
| `package.json` | MODIFY (remove semantic-ui-css, add exports, update sideEffects) |
| `rollup.config.mjs` (from Phase 06) | MODIFY (add CSS processing) |
| `static.config.js` / docs CSS imports | MODIFY (reference new CSS) |
| `docs/src/Style.js` | MODIFY (update CSS import) |

**Total: ~60+ files created, ~4 files modified**

---

## Acceptance Criteria

- [ ] `semantic-ui-css` is no longer in `package.json` dependencies or devDependencies
- [ ] `src/styles/index.css` exists and imports all component CSS files
- [ ] All CSS files use `@layer` declarations for cascade ordering
- [ ] All CSS custom properties for colors match every value in `SUI.COLORS` from `J:\code\semantic\Semantic-UI-React\src\lib\SUI.js`
- [ ] All CSS custom properties for sizes match every value in `SUI.SIZES` from `SUI.js`
- [ ] All CSS selectors match the class strings produced by the 7 `classNameBuilder` functions in `J:\code\semantic\Semantic-UI-React\src\lib\classNameBuilders.js`
- [ ] Every component's visual appearance matches its `semantic-ui-css` equivalent (verified by visual regression screenshots)
- [ ] `@keyframes` exist for all 34 values in `SUI.TRANSITIONS` (27 directional + 7 static)
- [ ] Per-component CSS import works: `import 'semantic-ui-react/dist/styles/elements/button.css'`
- [ ] Full CSS import works: `import 'semantic-ui-react/dist/styles/semantic-ui-react.css'`
- [ ] No vendor prefixes for properties with >95% browser support (flex, grid, custom properties, etc.)
- [ ] CSS uses modern features: `:is()`, `:where()`, `:has()`, `color-mix()`, `@container` where appropriate
- [ ] `:focus-visible` is used for keyboard focus indicators instead of `:focus`
- [ ] Total CSS size is smaller than or equal to `semantic-ui-css/semantic.min.css` (145 KB gzipped)
- [ ] The documentation site renders correctly with the new CSS
- [ ] No inline styles were added to any React component (except the 5 existing files)

---

## Rollback Strategy

1. Re-add `"semantic-ui-css": "^2.4.1"` to `devDependencies` in `package.json`.
2. Revert the docs CSS import to `import 'semantic-ui-css/semantic.min.css'`.
3. Delete the `src/styles/` directory: `git checkout HEAD -- package.json` and `rm -rf src/styles/`.
4. The component JavaScript is completely unaffected -- all `classNameBuilder` logic remains identical regardless of which CSS is loaded.

---

## Notes for AI Agents

1. **The class naming contract is sacred.** Every CSS selector you write must match the exact class strings produced by `getKeyOnly`, `getValueAndKey`, `getKeyOrValueAndKey`, `getMultipleProp`, `getTextAlignProp`, `getVerticalAlignProp`, and `getWidthProp` in `J:\code\semantic\Semantic-UI-React\src\lib\classNameBuilders.js`. If a component calls `getKeyOnly(loading, 'loading')` and the value is truthy, the class `"loading"` is added. Your CSS must have a selector that matches `.ui.loading.[component]`.

2. **Verify selectors against each component.** For every component file (e.g., `J:\code\semantic\Semantic-UI-React\src\collections\Form\Form.js`), read the `cx()` call in the render function to see exactly which classes are produced. Form produces: `'ui'`, `size`, `getKeyOnly(error, 'error')`, `getKeyOnly(inverted, 'inverted')`, `getKeyOnly(loading, 'loading')`, `getKeyOnly(reply, 'reply')`, `getKeyOnly(success, 'success')`, `getKeyOnly(unstackable, 'unstackable')`, `getKeyOnly(warning, 'warning')`, `getWidthProp(widths, null, true)`, `'form'`, `className`. So the CSS needs selectors like `.ui.form`, `.ui.error.form`, `.ui.loading.form`, `.ui.equal.width.form`, etc.

3. **Use the `semantic-ui-css` LESS source as a reference**, not a copy-paste source. The LESS files are at https://github.com/Semantic-Org/Semantic-UI/tree/master/src/definitions. Extract the visual design values (colors, spacing, border-radius, font-size) but rewrite all structural CSS using modern features.

4. **The `color-mix()` function** has excellent browser support (Chrome 111+, Firefox 113+, Safari 16.4+) and eliminates the need for pre-calculated hover/active color variants. Use `color-mix(in srgb, var(--sui-color) 85%, black)` for hover darkening and `color-mix(in srgb, var(--sui-color) 90%, white)` for lightening.

5. **Container queries** (`@container`) can replace some of the responsive behavior currently handled by `getMultipleProp` + `@media` queries, but `@media` queries must still be supported for the `VISIBILITY` breakpoint system (`.mobile.only`, `.tablet.only`, etc.) because those are viewport-relative, not container-relative.

6. **Do NOT add CSS-in-JS.** The project's architectural decision is explicit: CSS is external, class-based, and separate from JavaScript. Do not introduce styled-components, emotion, or any runtime CSS generation.

7. **Do NOT modify any React component files in this phase.** The JavaScript layer is completely untouched. All changes are CSS files, build configuration, and `package.json`.

8. **The icon CSS is the largest single file.** Consider whether to include a default icon font or make it opt-in. If including Font Awesome 5 Free, the WOFF2 font files must be included in the package and referenced with relative paths in the CSS. This significantly increases package size. An alternative is to ship icon CSS that only provides the layout/sizing rules and let consumers provide their own icon font via a CSS custom property for `font-family`.

9. **Order of execution within Stage 8**: This phase (40) must complete before Phase 41 (theming) and Phase 42 (legacy CSS cleanup), as those phases modify the CSS files created here.
