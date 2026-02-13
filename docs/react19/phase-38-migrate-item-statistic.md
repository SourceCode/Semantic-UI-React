# Phase 38: Migrate Item, Statistic and Subcomponents

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-38                                                              |
| **Title**      | Migrate Item, Statistic and Subcomponents                             |
| **Stage**      | 7 -- Component Migration - Views & Addons                             |
| **Dependencies** | Phase 15 (TypeScript Foundation -- shared types and generics)        |
| **Complexity** | Low                                                                   |
| **Scope**      | 2 view families totaling 12 components (8 Item, 4 Statistic), all presentational functional components, TypeScript conversion only |

---

## Objective

Convert the Item and Statistic view components and all their subcomponents from JavaScript to TypeScript. All 12 components are presentational functional components using `React.forwardRef`. No architectural changes are needed. This phase completes the Views layer migration, leaving only the Addons layer (Phase 39) to finalize component migration.

---

## Background

### Item (`src/views/Item/`)

Item has 7 subcomponents for a total of 8 components. The root `Item` component renders a content item with optional image:

```javascript
const Item = React.forwardRef(function (props, ref) {
  const { children, className, content, description, extra, header, image, meta } = props
  // ...
  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {ItemImage.create(image, { autoGenerateKey: false })}
      <ItemContent content={content} description={description} extra={extra} header={header} meta={meta} />
    </ElementType>
  )
})
```

Item subcomponents:

1. **Item** -- root container with shorthand for image, header, meta, description, extra, content
2. **ItemContent** -- main content wrapper, composes ItemHeader, ItemMeta, ItemDescription, ItemExtra via shorthand
3. **ItemDescription** -- description text wrapper
4. **ItemExtra** -- extra content wrapper
5. **ItemGroup** -- groups items (has `divided`, `link`, `relaxed`, `unstackable` props)
6. **ItemHeader** -- header text wrapper (default `as` can be `'a'` when `href` is present in some patterns)
7. **ItemImage** -- renders an image via `Image.create()` shorthand (uses `createShorthandFactory` with `size: 'tiny'` default)
8. **ItemMeta** -- meta information wrapper

All Item subcomponents follow the standard presentational pattern: `React.forwardRef`, `getUnhandledProps`, `getComponentType`, `childrenUtils.isNil(children) ? content : children`.

ItemContent is the most complex subcomponent because it composes four child subcomponents via shorthand:
```javascript
{ItemHeader.create(header, { autoGenerateKey: false })}
{ItemMeta.create(meta, { autoGenerateKey: false })}
{ItemDescription.create(description, { autoGenerateKey: false })}
{ItemExtra.create(extra, { autoGenerateKey: false })}
```

ItemImage wraps the Image element component with `ui: false` and `size` defaults:
```javascript
ItemImage.create = createShorthandFactory(ItemImage, (src) => ({ src }))
```

### Statistic (`src/views/Statistic/`)

Statistic has 3 subcomponents for a total of 4 components:

1. **Statistic** -- root container with `value` and `label` shorthand props. Uses `createShorthandFactory`. Has `color`, `floated`, `horizontal`, `inverted`, `size`, `text` props.

2. **StatisticGroup** -- groups statistics. Has `color`, `horizontal`, `inverted`, `size`, `widths` props. Uses `Statistic.create()` for the `items` shorthand array.

3. **StatisticLabel** -- displays the label text. Simple wrapper with `createShorthandFactory`.

4. **StatisticValue** -- displays the value. Has a `text` boolean prop that applies `text` CSS class for text-style values vs. number-style values. Uses `createShorthandFactory`.

All Statistic subcomponents are presentational and follow the standard pattern.

Statistic is notable for having `Statistic.create` defined on the root component itself (line 120):
```javascript
Statistic.create = createShorthandFactory(Statistic, (content) => ({ content }))
```

This is used by `StatisticGroup` to render items from the `items` shorthand array.

---

## Detailed Tasks

### 1. Convert Item.js to Item.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\Item.js` to `Item.tsx`:

- Define `ItemProps` interface:
  ```typescript
  export interface ItemProps extends StrictItemProps {
    [key: string]: any
  }
  export interface StrictItemProps {
    as?: React.ElementType
    children?: React.ReactNode
    className?: string
    content?: React.ReactNode
    description?: SemanticShorthandItem<ItemDescriptionProps>
    extra?: SemanticShorthandItem<ItemExtraProps>
    header?: SemanticShorthandItem<ItemHeaderProps>
    image?: SemanticShorthandItem<ItemImageProps>
    meta?: SemanticShorthandItem<ItemMetaProps>
  }
  ```
- Type the `ItemImage.create()` shorthand call
- Type the `ItemContent` composition
- Declare static subcomponent properties on the component type

### 2. Convert ItemContent.js to ItemContent.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemContent.js` to `ItemContent.tsx`:

- Define `ItemContentProps` interface with `content`, `description`, `extra`, `header`, `meta`, `verticalAlign` props
- Type the four shorthand factory calls: `ItemHeader.create()`, `ItemMeta.create()`, `ItemDescription.create()`, `ItemExtra.create()`
- Type the `verticalAlign` prop as `SemanticVERTICALALIGNMENTS`
- Retain `createShorthandFactory` static

### 3. Convert ItemDescription.js to ItemDescription.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemDescription.js` to `ItemDescription.tsx`:

- Define `ItemDescriptionProps` interface
- Retain `createShorthandFactory` static

### 4. Convert ItemExtra.js to ItemExtra.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemExtra.js` to `ItemExtra.tsx`:

- Define `ItemExtraProps` interface
- Retain `createShorthandFactory` static

### 5. Convert ItemGroup.js to ItemGroup.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemGroup.js` to `ItemGroup.tsx`:

- Define `ItemGroupProps` interface:
  ```typescript
  export interface StrictItemGroupProps {
    as?: React.ElementType
    children?: React.ReactNode
    className?: string
    content?: React.ReactNode
    divided?: boolean
    items?: SemanticShorthandCollection<ItemProps>
    link?: boolean
    relaxed?: boolean | 'very'
    unstackable?: boolean
  }
  ```
- Type the `items` mapping with `Item.create()` shorthand

### 6. Convert ItemHeader.js to ItemHeader.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemHeader.js` to `ItemHeader.tsx`:

- Define `ItemHeaderProps` interface
- Retain `createShorthandFactory` static

### 7. Convert ItemImage.js to ItemImage.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemImage.js` to `ItemImage.tsx`:

- Define `ItemImageProps` interface extending `ImageProps`
- Type the `Image.create()` shorthand usage
- The component uses `size` as a prop passed through to `Image`
- Retain `createShorthandFactory` static with `(src) => ({ src })` pattern

### 8. Convert ItemMeta.js to ItemMeta.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemMeta.js` to `ItemMeta.tsx`:

- Define `ItemMetaProps` interface
- Retain `createShorthandFactory` static

### 9. Convert Statistic.js to Statistic.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Statistic\Statistic.js` to `Statistic.tsx`:

- Define `StatisticProps` interface:
  ```typescript
  export interface StrictStatisticProps {
    as?: React.ElementType
    children?: React.ReactNode
    className?: string
    color?: SemanticCOLORS
    content?: React.ReactNode
    floated?: SemanticFLOATS
    horizontal?: boolean
    inverted?: boolean
    label?: React.ReactNode
    size?: 'mini' | 'tiny' | 'small' | 'large' | 'huge'
    text?: boolean
    value?: React.ReactNode
  }
  ```
- Type `StatisticValue.create()` and `StatisticLabel.create()` shorthand calls
- Type the `Statistic.create` static factory
- Declare static subcomponent properties

### 10. Convert StatisticGroup.js to StatisticGroup.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Statistic\StatisticGroup.js` to `StatisticGroup.tsx`:

- Define `StatisticGroupProps` interface:
  ```typescript
  export interface StrictStatisticGroupProps {
    as?: React.ElementType
    children?: React.ReactNode
    className?: string
    color?: SemanticCOLORS
    content?: React.ReactNode
    horizontal?: boolean
    inverted?: boolean
    items?: SemanticShorthandCollection<StatisticProps>
    size?: 'mini' | 'tiny' | 'small' | 'large' | 'huge'
    widths?: SemanticWIDTHS
  }
  ```
- Type the `Statistic.create()` shorthand for each item in the `items` array
- Type the `widths` prop with `numberToWord` conversion

### 11. Convert StatisticLabel.js to StatisticLabel.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Statistic\StatisticLabel.js` to `StatisticLabel.tsx`:

- Define `StatisticLabelProps` interface
- Retain `createShorthandFactory` static

### 12. Convert StatisticValue.js to StatisticValue.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Statistic\StatisticValue.js` to `StatisticValue.tsx`:

- Define `StatisticValueProps` interface with `text` boolean prop
- Type the `getKeyOnly(text, 'text')` class computation
- Retain `createShorthandFactory` static

### 13. Consolidate type definitions

Delete all separate `.d.ts` files:

Item (9 files to delete):
- `J:\code\semantic\Semantic-UI-React\src\views\Item\Item.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemContent.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemDescription.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemExtra.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemGroup.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemHeader.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemImage.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\ItemMeta.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Item\index.d.ts`

Statistic (5 files to delete):
- `J:\code\semantic\Semantic-UI-React\src\views\Statistic\Statistic.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Statistic\StatisticGroup.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Statistic\StatisticLabel.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Statistic\StatisticValue.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Statistic\index.d.ts`

Rename index files:
- `J:\code\semantic\Semantic-UI-React\src\views\Item\index.js` to `index.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Statistic\index.js` to `index.ts`

### 14. Update tests

- Update imports for new file extensions
- Verify Item shorthand rendering (image, header, meta, description, extra)
- Verify ItemGroup `divided`, `link`, `relaxed`, `unstackable` props
- Verify ItemImage renders with correct defaults
- Verify Statistic `value` and `label` shorthand rendering
- Verify StatisticGroup `items` shorthand rendering
- Verify StatisticGroup `widths` prop
- Verify StatisticValue `text` prop
- Ensure all TypeScript types are correctly exported

---

## Files Affected

| File | Action |
|------|--------|
| `src/views/Item/Item.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/ItemContent.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/ItemDescription.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/ItemExtra.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/ItemGroup.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/ItemHeader.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/ItemImage.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/ItemMeta.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Item/index.js` | RENAME to `.ts` |
| `src/views/Statistic/Statistic.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Statistic/StatisticGroup.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Statistic/StatisticLabel.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Statistic/StatisticValue.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Statistic/index.js` | RENAME to `.ts` |
| 14 `.d.ts` files | DELETE |

**Total: 14 files renamed/modified, 14 files deleted**

---

## Acceptance Criteria

- [ ] All 8 Item components compile as TypeScript without errors
- [ ] All 4 Statistic components compile as TypeScript without errors
- [ ] Item shorthand props (image, header, meta, description, extra) render correctly
- [ ] ItemContent composes child components via shorthand factories
- [ ] ItemImage renders an Image component with correct defaults
- [ ] ItemGroup `divided` prop adds `divided` CSS class
- [ ] ItemGroup `items` shorthand renders Item components
- [ ] ItemGroup `relaxed` prop supports both boolean and `'very'` value
- [ ] Statistic `value` and `label` shorthand render correctly
- [ ] Statistic `horizontal` prop adds `horizontal` CSS class
- [ ] Statistic `color` prop adds color CSS class
- [ ] Statistic `floated` prop adds floated CSS class
- [ ] StatisticGroup `items` shorthand renders Statistic components
- [ ] StatisticGroup `widths` prop applies correct grid class
- [ ] StatisticValue `text` prop adds `text` CSS class
- [ ] `Statistic.create` factory function works correctly
- [ ] All existing tests pass
- [ ] Types are correctly exported for consumer usage
- [ ] No separate `.d.ts` files remain in either view directory

---

## Rollback Strategy

1. All changes tracked in git. To rollback: `git checkout HEAD -- src/views/Item/ src/views/Statistic/`
2. All components are presentational with no state or side effects. Rollback risk is minimal.
3. Individual components can be reverted independently.

---

## Notes for AI Agents

1. **This phase completes the Views layer migration.** After this phase, all 6 view directories (Advertisement, Card, Comment, Feed, Item, Statistic) will be TypeScript.

2. **ItemImage is a thin wrapper around Image.** It does not render its own element -- it delegates entirely to `Image.create()`. The `createShorthandFactory` on `ItemImage` maps a string shorthand to `{ src: string }`. Ensure the typing reflects that ItemImage's props are essentially a subset of ImageProps.

3. **Statistic has `createShorthandFactory` on the root component** (`Statistic.create`), unlike most other view components where factories are only on subcomponents. This is because `StatisticGroup` uses `Statistic.create()` to render items. Type the factory as: `create: ShorthandFactory<StatisticProps>`.

4. **The `widths` prop on StatisticGroup and `itemsPerRow` on other Group components** use `numberToWord` to convert a number to a CSS class (e.g., `2` becomes `'two'`). Ensure the `SemanticWIDTHS` type (1-16 or string equivalents) is used.

5. **All `createShorthandFactory` statics need TypeScript declaration.** The pattern is:
   ```typescript
   const Comp: ForwardRefComponent<Props, HTMLElement> & {
     create: ShorthandFactory<Props>
   }
   Comp.create = createShorthandFactory(Comp, ...)
   ```

6. **These components have minimal lodash usage.** Most use only `_.without` for size prop filtering (in PropTypes). After removing PropTypes in favor of TypeScript, the lodash import may no longer be needed. Check for other lodash usages before removing the import.

7. **ItemContent's `verticalAlign` prop** uses `getValueAndKey(verticalAlign, 'aligned')` to produce classes like `top aligned`. This utility must be typed as: `(value: string | undefined, key: string) => string | undefined`.

8. **Execution order within this phase:** Convert subcomponents first (they have no dependencies on each other), then convert parent components (Item, Statistic) that import the subcomponent types. Specifically:
   - ItemDescription, ItemExtra, ItemHeader, ItemImage, ItemMeta (parallel)
   - Then ItemContent (imports above)
   - Then ItemGroup (imports Item)
   - Then Item (imports all)
   - StatisticLabel, StatisticValue (parallel)
   - Then StatisticGroup (imports Statistic)
   - Then Statistic (imports all)
