# Phase 27: Migrate Grid, GridColumn, GridRow

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Phase ID**   | 27                                           |
| **Title**      | Migrate Grid, GridColumn, GridRow             |
| **Stage**      | 5 - Component Migration: Collections          |
| **Dependencies** | Phase 15 (Shared Infrastructure & TypeScript Config) |
| **Complexity** | Medium                                       |
| **Scope**      | 3 components, 3 type definition files, 1 barrel index |

---

## Objective

Convert the Grid collection (Grid, GridColumn, GridRow) from JavaScript with PropTypes and `React.forwardRef` to native TypeScript with React 19.2 ref-as-prop semantics. These components rely heavily on the library's className utility functions for responsive breakpoints, width calculations, and alignment -- all of which must be correctly typed. Remove all runtime type checking, replace `.d.ts` declaration files with types co-located in `.tsx` source, and write RTL test suites covering the responsive className logic.

---

## Background

The Grid collection provides a responsive grid layout system and is one of the most heavily used collections in the library. All three components are presentational -- they build complex className strings and render children.

**Grid** (`src/collections/Grid/Grid.js`): Root grid container. Uses the widest variety of className utilities in the library:
- `getKeyOnly(centered, 'centered')` -- simple boolean-to-class mapping
- `getKeyOrValueAndKey(celled, 'celled')` -- handles `true` (just `'celled'`) or string value (`'internally celled'`)
- `getMultipleProp(reversed, 'reversed')` -- handles space-separated multiple values like `'computer mobile vertically'`
- `getTextAlignProp(textAlign)` -- maps text alignment to Semantic UI classes
- `getVerticalAlignProp(verticalAlign)` -- maps vertical alignment to classes
- `getWidthProp(columns, 'column', true)` -- converts number to word (`'three column'`) with the third param enabling number-to-word conversion

**GridColumn** (`src/collections/Grid/GridColumn.js`): Individual column with responsive width props. The most complex className building in the collection:
- 5 breakpoint-specific width props: `computer`, `largeScreen`, `mobile`, `tablet`, `widescreen` -- each uses `getWidthProp(value, 'wide <breakpoint>')` to generate classes like `'three wide computer'`
- General `width` prop uses `getWidthProp(width, 'wide')`
- `getMultipleProp(only, 'only')` for responsive visibility (`'mobile only'`, `'tablet only'`)
- `getValueAndKey(floated, 'floated')` for float positioning
- `color` prop renders as a bare class (no utility needed)
- Has `createShorthandFactory` static

**GridRow** (`src/collections/Grid/GridRow.js`): Row container with alignment, responsive visibility, and column count:
- `getMultipleProp(only, 'only')` and `getMultipleProp(reversed, 'reversed')` for responsive props
- `getWidthProp(columns, 'column', true)` for column count
- `getTextAlignProp` and `getVerticalAlignProp` for alignment
- `color` prop as bare class

**Width system**: The `SUI.WIDTHS` constant is `[1, 2, 3, ..., 16, '1', '2', ..., '16', 'one', 'two', ..., 'sixteen']`. Width props accept numbers, numeric strings, or word strings. `getWidthProp` internally calls `numberToWord` to convert numeric values to word strings for CSS class generation. This must be precisely typed.

**Responsive multipleProp**: The `customPropTypes.multipleProp` validator accepts a space-separated string of values from a defined set. For example, `reversed` can be `'computer'`, `'mobile vertically'`, `'computer tablet'`, etc. In TypeScript, this becomes a string type that is difficult to model precisely -- a `string` type with documentation is acceptable.

---

## Detailed Tasks

### 1. Define Shared Grid Types

**File**: Create types inline or in a shared location within the Grid directory.

1.1. Define `SemanticWIDTHS` type alias from the migrated lib types (should exist from Phase 15):
```typescript
type SemanticWIDTHS = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16
  | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16'
  | 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten'
  | 'eleven' | 'twelve' | 'thirteen' | 'fourteen' | 'fifteen' | 'sixteen'
```

1.2. Define `SemanticCOLORS`, `SemanticTEXT_ALIGNMENTS`, `SemanticVERTICAL_ALIGNMENTS`, `SemanticFLOATS`, `SemanticVISIBILITY` type aliases from the migrated SUI constants.

### 2. Convert GridColumn to TypeScript

**File**: `src/collections/Grid/GridColumn.js` -> `GridColumn.tsx`

2.1. Create `GridColumnProps` interface:
```typescript
interface GridColumnProps {
  as?: React.ElementType
  children?: React.ReactNode
  className?: string
  color?: SemanticCOLORS
  computer?: SemanticWIDTHS
  floated?: 'left' | 'right'
  largeScreen?: SemanticWIDTHS
  mobile?: SemanticWIDTHS
  only?: string  // space-separated: 'mobile', 'tablet', 'computer', 'large screen', 'widescreen'
  stretched?: boolean
  tablet?: SemanticWIDTHS
  textAlign?: SemanticTEXT_ALIGNMENTS
  verticalAlign?: SemanticVERTICAL_ALIGNMENTS
  widescreen?: SemanticWIDTHS
  width?: SemanticWIDTHS
}
```

2.2. Remove `React.forwardRef`. Accept `ref` as a regular prop.

2.3. Remove PropTypes block. The `customPropTypes.disallow(['width'])` constraints on breakpoint props and vice versa are runtime-only -- document with TSDoc comments.

2.4. Retain all `getWidthProp`, `getMultipleProp`, `getTextAlignProp`, `getVerticalAlignProp`, `getValueAndKey`, `getKeyOnly` calls unchanged.

2.5. Retain `createShorthandFactory` static.

2.6. Delete `src/collections/Grid/GridColumn.d.ts`.

### 3. Convert GridRow to TypeScript

**File**: `src/collections/Grid/GridRow.js` -> `GridRow.tsx`

3.1. Create `GridRowProps` interface:
```typescript
interface GridRowProps {
  as?: React.ElementType
  centered?: boolean
  children?: React.ReactNode
  className?: string
  color?: SemanticCOLORS
  columns?: SemanticWIDTHS | 'equal'
  divided?: boolean
  only?: string  // space-separated visibility values
  reversed?: string  // space-separated: 'computer', 'computer vertically', 'mobile', etc.
  stretched?: boolean
  textAlign?: SemanticTEXT_ALIGNMENTS
  verticalAlign?: SemanticVERTICAL_ALIGNMENTS
}
```

3.2. Remove `React.forwardRef`. Accept `ref` as a regular prop.

3.3. Remove PropTypes block.

3.4. Delete `src/collections/Grid/GridRow.d.ts`.

### 4. Convert Grid to TypeScript

**File**: `src/collections/Grid/Grid.js` -> `Grid.tsx`

4.1. Create `GridProps` interface:
```typescript
interface GridProps {
  as?: React.ElementType
  celled?: boolean | 'internally'
  centered?: boolean
  children?: React.ReactNode
  className?: string
  columns?: SemanticWIDTHS | 'equal'
  container?: boolean
  divided?: boolean | 'vertically'
  doubling?: boolean
  inverted?: boolean
  padded?: boolean | 'horizontally' | 'vertically'
  relaxed?: boolean | 'very'
  reversed?: string  // space-separated responsive reversed values
  stackable?: boolean
  stretched?: boolean
  textAlign?: SemanticTEXT_ALIGNMENTS
  verticalAlign?: SemanticVERTICAL_ALIGNMENTS
}
```

4.2. Remove `React.forwardRef`. Accept `ref` as a regular prop.

4.3. Remove PropTypes block. Remove `customPropTypes.multipleProp` usage -- replace with string type and TSDoc.

4.4. Attach subcomponent statics:
```typescript
Grid.Column = GridColumn
Grid.Row = GridRow
```

4.5. Delete `src/collections/Grid/Grid.d.ts`.

### 5. Update Barrel Index

**File**: `src/collections/Grid/index.js` -> `index.ts`

5.1. Export Grid as default and all subcomponents as named exports.
5.2. Export all prop interfaces as type-only exports.
5.3. Delete `src/collections/Grid/index.d.ts`.

### 6. Write RTL Tests

**File**: Create test files in `test/specs/collections/Grid/`

6.1. **Grid-test.tsx**:
- Test `ui grid` base className
- Test `centered`, `container`, `doubling`, `inverted`, `stackable`, `stretched` boolean classes
- Test `celled` as boolean (`'celled'`) and string (`'internally celled'`)
- Test `divided` as boolean and `'vertically'`
- Test `padded` as boolean and `'horizontally'`/`'vertically'`
- Test `relaxed` as boolean and `'very'`
- Test `reversed` with single and multiple values (`'computer'`, `'mobile tablet'`)
- Test `textAlign` generates correct alignment classes
- Test `verticalAlign` generates correct alignment classes
- Test `columns` generates number-word column classes (`columns={3}` -> `'three column'`)
- Test `as` prop, ref attachment

6.2. **GridColumn-test.tsx**:
- Test `column` base className
- Test `width` prop generates correct word-width class (`width={4}` -> `'four wide'`)
- Test `computer`, `mobile`, `tablet`, `largeScreen`, `widescreen` breakpoint props generate correct classes (e.g., `computer={8}` -> `'eight wide computer'`)
- Test `color` prop as bare class
- Test `floated` generates `'left floated'`/`'right floated'`
- Test `only` with single and multiple values (`'mobile'`, `'mobile tablet'`)
- Test `stretched`, `textAlign`, `verticalAlign`
- Test `as` prop, ref attachment, shorthand factory

6.3. **GridRow-test.tsx**:
- Test `row` base className
- Test `centered`, `divided`, `stretched` boolean classes
- Test `color` as bare class
- Test `columns` with number-to-word conversion
- Test `only` and `reversed` with multiple values
- Test `textAlign`, `verticalAlign`
- Test `as` prop, ref attachment

### 7. Remove Obsolete Files

7.1. Delete `src/collections/Grid/Grid.d.ts`
7.2. Delete `src/collections/Grid/GridColumn.d.ts`
7.3. Delete `src/collections/Grid/GridRow.d.ts`
7.4. Delete `src/collections/Grid/index.d.ts`

---

## Files Affected

| Action   | File Path                                            |
| -------- | ---------------------------------------------------- |
| Rename   | `src/collections/Grid/Grid.js` -> `.tsx`             |
| Rename   | `src/collections/Grid/GridColumn.js` -> `.tsx`       |
| Rename   | `src/collections/Grid/GridRow.js` -> `.tsx`          |
| Rename   | `src/collections/Grid/index.js` -> `.ts`             |
| Delete   | `src/collections/Grid/Grid.d.ts`                     |
| Delete   | `src/collections/Grid/GridColumn.d.ts`               |
| Delete   | `src/collections/Grid/GridRow.d.ts`                  |
| Delete   | `src/collections/Grid/index.d.ts`                    |
| Create   | `test/specs/collections/Grid/Grid-test.tsx`          |
| Create   | `test/specs/collections/Grid/GridColumn-test.tsx`    |
| Create   | `test/specs/collections/Grid/GridRow-test.tsx`       |

---

## Acceptance Criteria

- [ ] All 3 Grid components compile with zero TypeScript errors
- [ ] No `React.forwardRef` wrappers remain -- ref is accepted as a regular prop
- [ ] No `PropTypes` imports or runtime type-checking remain
- [ ] No `.d.ts` declaration files remain in `src/collections/Grid/`
- [ ] All 3 components export their props interfaces as named type exports
- [ ] `Grid.Column` and `Grid.Row` statics are correctly typed
- [ ] `GridColumn.create` shorthand factory works correctly with TypeScript types
- [ ] `getWidthProp` calls correctly generate number-word classes for all width values (1-16)
- [ ] Responsive breakpoint props on GridColumn generate correct compound classes (e.g., `'eight wide computer'`)
- [ ] `getMultipleProp` correctly handles space-separated values for `reversed` and `only`
- [ ] `getKeyOrValueAndKey` correctly handles boolean and string variants of `celled`, `divided`, `padded`, `relaxed`
- [ ] RTL tests pass covering all className combinations
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

---

## Rollback Strategy

1. Revert the renamed `.tsx` files back to `.js` from version control.
2. Restore deleted `.d.ts` files from version control.
3. Delete newly created test files.
4. The Grid collection is standalone -- no other collections import Grid internals. Rollback is fully self-contained.

---

## Notes for AI Agents

- **The className utility functions are the core complexity here.** These components are pure className builders. Ensure every utility call is preserved exactly:
  - `getKeyOnly(bool, 'class')` -- simple bool -> class
  - `getKeyOrValueAndKey(val, 'class')` -- `true` -> `'class'`, `'internally'` -> `'internally class'`
  - `getMultipleProp(val, 'class')` -- `'mobile tablet'` -> `'mobile class tablet class'` (appends the class name after each space-separated value)
  - `getTextAlignProp(val)` -- `'center'` -> `'center aligned'`
  - `getVerticalAlignProp(val)` -- `'middle'` -> `'middle aligned'`
  - `getValueAndKey(val, 'class')` -- `'left'` -> `'left class'`
  - `getWidthProp(val, 'suffix', useWord)` -- `4` with `'wide'` -> `'four wide'`, `4` with `'column'` and `true` -> `'four column'`

- **Width prop typing is important.** `SemanticWIDTHS` accepts numbers (1-16), numeric strings ('1'-'16'), and word strings ('one'-'sixteen'). The `getWidthProp` utility handles all three forms. The TypeScript type should be a union of all three.

- **`customPropTypes.multipleProp` and `customPropTypes.disallow` disappear.** These were runtime-only validators. For `multipleProp`, the TypeScript type becomes `string` with a TSDoc comment listing valid values. For `disallow`, the mutual exclusivity constraints (e.g., `computer` disallows `width`) should be documented but cannot be enforced at the type level without overly complex discriminated unions.

- **`color` is a bare class.** Unlike most props, `color` is rendered directly into the className string without any prefix/suffix transformation: `cx(color, ...)`. This is correct behavior for Semantic UI.

- **GridColumn has NO lodash usage.** The only lodash in the Grid collection is `_.without` for the SUI.SIZES filter, which only appears in propTypes (being removed). All three Grid components should be lodash-free after migration.

- **Test the number-to-word conversion thoroughly.** The `getWidthProp` utility converts numeric widths to word form. Test boundary values: 1 ('one'), 16 ('sixteen'), and string forms ('4' -> 'four'). This is a common source of regression.
