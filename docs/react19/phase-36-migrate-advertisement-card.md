# Phase 36: Migrate Advertisement, Card and Subcomponents

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-36                                                              |
| **Title**      | Migrate Advertisement, Card and Subcomponents                         |
| **Stage**      | 7 -- Component Migration - Views & Addons                             |
| **Dependencies** | Phase 15 (TypeScript Foundation -- shared types and generics)        |
| **Complexity** | Low                                                                   |
| **Scope**      | 2 view families totaling 7 components, all presentational functional components, TypeScript conversion only |

---

## Objective

Convert the Advertisement and Card view components from JavaScript to TypeScript. All components in this phase are already functional components using `React.forwardRef`. No architectural changes are needed -- this is a pure TypeScript conversion with type definition consolidation. Card has 5 subcomponents with shorthand factory patterns that need proper generic typing.

---

## Background

### Advertisement (`src/views/Advertisement/Advertisement.js`)

Advertisement is the simplest view component. It is a presentational `React.forwardRef` component that renders an ad container with Semantic UI CSS classes. It has:
- A `unit` prop (required) with 22 possible ad size values
- A `centered` prop for centering
- A `test` prop that displays test text via `data-text` attribute
- Uses `childrenUtils.isNil(children) ? content : children` pattern
- No state, no effects, no refs beyond the forwarded ref
- 2 files total: `Advertisement.js` + `index.js`

### Card (`src/views/Card/Card.js`)

Card is a moderately complex presentational component with 5 subcomponents:

1. **Card** (`Card.js`): The main component. Uses `React.forwardRef` with `useEventCallback` for click handling. The `onClick` prop causes the component to render as an `<a>` tag by default (via `getComponentType`). Uses `Image.create()` shorthand for the image prop. Uses `CardContent` for description/header/meta shorthand assembly.

2. **CardContent** (`CardContent.js`): Renders the content area of a card. Has `extra` prop for secondary content sections. Uses shorthand factories for `CardHeader.create()`, `CardMeta.create()`, `CardDescription.create()`.

3. **CardDescription** (`CardDescription.js`): Simple presentational wrapper for description text.

4. **CardGroup** (`CardGroup.js`): Renders a group of cards. Has `doubling`, `stackable`, `centered` props. Uses `Card.create()` shorthand for the `items` prop. Has `itemsPerRow` prop using `numberToWord` conversion for CSS class.

5. **CardHeader** (`CardHeader.js`): Simple presentational wrapper for header text.

6. **CardMeta** (`CardMeta.js`): Simple presentational wrapper for meta text.

All Card subcomponents follow the same pattern:
- `React.forwardRef`
- `getUnhandledProps` for prop filtering
- `getComponentType` for polymorphic `as` prop
- `childrenUtils.isNil(children) ? content : children` rendering
- `createShorthandFactory` for shorthand creation

The Card component has one interesting TypeScript consideration: the `as` prop default changes based on whether `onClick` is provided (line 56-60). This affects the element type inference.

---

## Detailed Tasks

### 1. Convert Advertisement.js to Advertisement.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Advertisement\Advertisement.js` to `Advertisement.tsx`:

- Define `AdvertisementProps` interface:
  ```typescript
  export interface AdvertisementProps extends StrictAdvertisementProps {
    [key: string]: any
  }

  export interface StrictAdvertisementProps {
    as?: React.ElementType
    centered?: boolean
    children?: React.ReactNode
    className?: string
    content?: React.ReactNode
    test?: boolean | number | string
    unit: 'medium rectangle' | 'large rectangle' | 'vertical rectangle' | ... // all 22 values
  }
  ```
- Type the component as `ForwardRefComponent<AdvertisementProps, HTMLDivElement>`
- Remove the `PropTypes` definition (or retain for runtime validation during migration period)
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Advertisement\Advertisement.d.ts` (if it exists; merge into `.tsx`)
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Advertisement\index.d.ts`
- Rename `J:\code\semantic\Semantic-UI-React\src\views\Advertisement\index.js` to `index.ts`

### 2. Convert Card.js to Card.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Card\Card.js` to `Card.tsx`:

- Define `CardProps` interface:
  ```typescript
  export interface CardProps extends StrictCardProps {
    [key: string]: any
  }

  export interface StrictCardProps {
    as?: React.ElementType
    centered?: boolean
    children?: React.ReactNode
    className?: string
    color?: SemanticCOLORS
    content?: React.ReactNode
    description?: SemanticShorthandItem<CardDescriptionProps>
    extra?: React.ReactNode
    fluid?: boolean
    header?: SemanticShorthandItem<CardHeaderProps>
    href?: string
    image?: SemanticShorthandItem<ImageProps>
    link?: boolean
    meta?: SemanticShorthandItem<CardMetaProps>
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: CardProps) => void
    raised?: boolean
  }
  ```
- Type the `getComponentType` default function that returns `'a'` when `onClick` is present
- Type the `useEventCallback` handler
- Type the `Image.create()` shorthand call
- Declare the static subcomponent properties:
  ```typescript
  declare const Card: ForwardRefComponent<CardProps, HTMLDivElement> & {
    Content: typeof CardContent
    Description: typeof CardDescription
    Group: typeof CardGroup
    Header: typeof CardHeader
    Meta: typeof CardMeta
  }
  ```

### 3. Convert CardContent.js to CardContent.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Card\CardContent.js` to `CardContent.tsx`:

- Define `CardContentProps` interface with `extra`, `description`, `header`, `meta` shorthand props
- Type the `CardHeader.create()`, `CardMeta.create()`, `CardDescription.create()` shorthand calls
- Retain `createShorthandFactory` static

### 4. Convert CardDescription.js to CardDescription.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Card\CardDescription.js` to `CardDescription.tsx`:

- Define `CardDescriptionProps` interface
- Retain `createShorthandFactory` static

### 5. Convert CardGroup.js to CardGroup.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Card\CardGroup.js` to `CardGroup.tsx`:

- Define `CardGroupProps` interface with `items` as `SemanticShorthandCollection<CardProps>`
- Type `itemsPerRow` with the `SemanticWIDTHS` type
- Type the `Card.create()` shorthand for each item in the `items` array
- Type the `numberToWord` utility usage

### 6. Convert CardHeader.js to CardHeader.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Card\CardHeader.js` to `CardHeader.tsx`:

- Define `CardHeaderProps` interface
- Retain `createShorthandFactory` static

### 7. Convert CardMeta.js to CardMeta.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Card\CardMeta.js` to `CardMeta.tsx`:

- Define `CardMetaProps` interface
- Retain `createShorthandFactory` static

### 8. Consolidate type definitions

Delete all separate `.d.ts` files:
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Card\Card.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Card\CardContent.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Card\CardDescription.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Card\CardGroup.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Card\CardHeader.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Card\CardMeta.d.ts`
- Delete `J:\code\semantic\Semantic-UI-React\src\views\Card\index.d.ts`
- Rename `J:\code\semantic\Semantic-UI-React\src\views\Card\index.js` to `index.ts`

### 9. Update tests

- Update import paths if file extensions changed
- Verify Advertisement renders correct CSS classes for all 22 unit types
- Verify Card click handler causes `<a>` tag rendering
- Verify Card shorthand props (image, header, meta, description, extra)
- Verify CardGroup renders items from shorthand array
- Ensure all TypeScript types are correctly exported

---

## Files Affected

| File | Action |
|------|--------|
| `src/views/Advertisement/Advertisement.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Advertisement/index.js` | RENAME to `.ts` |
| `src/views/Advertisement/Advertisement.d.ts` | DELETE |
| `src/views/Advertisement/index.d.ts` | DELETE |
| `src/views/Card/Card.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Card/CardContent.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Card/CardDescription.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Card/CardGroup.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Card/CardHeader.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Card/CardMeta.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Card/Card.d.ts` | DELETE |
| `src/views/Card/CardContent.d.ts` | DELETE |
| `src/views/Card/CardDescription.d.ts` | DELETE |
| `src/views/Card/CardGroup.d.ts` | DELETE |
| `src/views/Card/CardHeader.d.ts` | DELETE |
| `src/views/Card/CardMeta.d.ts` | DELETE |
| `src/views/Card/index.d.ts` | DELETE |
| `src/views/Card/index.js` | RENAME to `.ts` |

**Total: 9 files renamed/modified, 9 files deleted**

---

## Acceptance Criteria

- [ ] Advertisement renders correct CSS class for all 22 `unit` values
- [ ] Advertisement `centered` prop adds `centered` class
- [ ] Advertisement `test` prop sets `data-text` attribute
- [ ] Card renders as `<a>` when `onClick` is provided
- [ ] Card renders as `<div>` by default
- [ ] Card `image` shorthand renders an Image component
- [ ] Card `href` prop is applied to the element
- [ ] CardContent `extra` prop renders secondary content
- [ ] CardContent shorthand props (header, meta, description) render sub-components
- [ ] CardGroup `items` shorthand renders Card components
- [ ] CardGroup `itemsPerRow` applies correct grid class
- [ ] All 7 components compile as TypeScript without errors
- [ ] All existing tests pass
- [ ] Types are correctly exported for consumer usage
- [ ] No separate `.d.ts` files remain in either view directory

---

## Rollback Strategy

1. All changes tracked in git. To rollback: `git checkout HEAD -- src/views/Advertisement/ src/views/Card/`
2. These are all presentational components with no state or side effects. Rollback risk is minimal.
3. If TypeScript type errors block other phases, individual components can be reverted to `.js` without affecting functionality.

---

## Notes for AI Agents

1. **This phase is intentionally low-risk and can serve as a warm-up** for the more complex view/addon phases. All components are already functional and well-structured.

2. **The `[key: string]: any` index signature** on props interfaces maintains backward compatibility with the existing pattern of spreading unhandled props. This is the same pattern used in the existing `.d.ts` files.

3. **Card's dynamic `as` prop default** (rendering as `<a>` when `onClick` is present) needs careful TypeScript typing. The `getComponentType` utility uses a `getDefault` function that returns `'a'` or `undefined`. Type the return as `React.ElementType`.

4. **The `createShorthandFactory` static methods** on subcomponents (`CardContent.create`, `CardDescription.create`, etc.) need to be typed. The factory function signature is: `(val: ShorthandValue<Props>, options?: CreateShorthandOptions<Props>) => React.ReactElement | null`.

5. **All view components follow a near-identical pattern.** Once you convert one (e.g., CardDescription), the same transformation can be applied mechanically to the others. The main differences are:
   - Props specific to each component
   - Whether the component uses shorthand factories
   - Whether the component has conditional rendering logic

6. **Advertisement's `unit` prop has 22 possible values.** Type these as a union type literal. The values contain spaces (e.g., `'medium rectangle'`), which is valid in TypeScript string literal unions.

7. **Do not change the `getComponentType` or `getUnhandledProps` utility signatures** in this phase. These utilities are typed in Phase 16/17. Import and use their types as-is.

8. **The lodash usage in Card components is light:** `_.invoke` for callbacks and `_.map` for items. Replace `_.invoke(props, 'onClick', e, props)` with `props.onClick?.(e, props)` for better TypeScript inference. Replace `_.map` with `Array.map` where applicable.
