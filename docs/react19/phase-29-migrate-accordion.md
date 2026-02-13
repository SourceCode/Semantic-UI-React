# Phase 29: Migrate Accordion and Subcomponents

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Phase ID**   | 29                                           |
| **Title**      | Migrate Accordion and Subcomponents           |
| **Stage**      | 6 - Component Migration: Modules              |
| **Dependencies** | Phase 16 (Module Hooks & Infrastructure)     |
| **Complexity** | Medium                                       |
| **Scope**      | 5 components, 5 type definition files, 1 barrel index |

---

## Objective

Convert the Accordion module (Accordion, AccordionAccordion, AccordionContent, AccordionPanel, AccordionTitle) from JavaScript with PropTypes and mixed component patterns to native TypeScript with React 19.2 ref-as-prop semantics. The critical migration target is **AccordionPanel**, which is the only remaining **class component** (`extends Component`) in this group and must be converted to a functional component. Additionally, address the existing TODO comment in Accordion.js about extracting behavior into a `useAccordion()` hook.

---

## Background

The Accordion module has a layered architecture with an unusual inner component pattern:

**Accordion** (`src/modules/Accordion/Accordion.js`): Outer wrapper that adds Semantic UI styling classes (`fluid`, `inverted`, `styled`) and delegates all behavior to `AccordionAccordion`. Contains a TODO comment: `// TODO: extract behavior into useAccordion() hook instead of "AccordionAccordion" component`. This is purely presentational -- it wraps AccordionAccordion with styling.

**AccordionAccordion** (`src/modules/Accordion/AccordionAccordion.js`): The behavioral core. Key characteristics:
- Uses `useAutoControlledValue` for `activeIndex` state (controlled/uncontrolled)
- Supports `exclusive` mode (single panel open, `activeIndex` is a number) and non-exclusive mode (multiple panels open, `activeIndex` is an array of numbers)
- Has local utility functions `isIndexActive(exclusive, activeIndex, itemIndex)` and `computeNewIndex(exclusive, activeIndex, itemIndex)` for toggling
- Renders `panels` shorthand via `AccordionPanel.create` with `active`, `index`, and `onTitleClick` default props
- Has a development-only `useEffect` that validates `activeIndex` type matches `exclusive` setting
- Uses `useEventCallback` for title click handler
- Has `createShorthandFactory` static
- Uses lodash `_.includes`, `_.without`, `_.isArray`, `_.map`

**AccordionContent** (`src/modules/Accordion/AccordionContent.js`): Simple presentational component with `active` prop for visibility class. Has `createShorthandFactory`.

**AccordionTitle** (`src/modules/Accordion/AccordionTitle.js`): Title element with click handler, `active` state class, and icon rendering. Key details:
- Default icon is `'dropdown'` when `icon` is nil: `const iconValue = _.isNil(icon) ? 'dropdown' : icon`
- Uses `Icon.create(iconValue, ...)` for icon rendering
- Uses `useEventCallback` for click handler that invokes `props.onClick` with full props
- Has `createShorthandFactory`

**AccordionPanel** (`src/modules/Accordion/AccordionPanel.js`): **CLASS COMPONENT** -- the primary migration challenge:
```javascript
class AccordionPanel extends Component {
  handleTitleOverrides = (predefinedProps) => ({
    onClick: (e, titleProps) => {
      _.invoke(predefinedProps, 'onClick', e, titleProps)
      _.invoke(this.props, 'onTitleClick', e, titleProps)
    },
  })

  render() {
    const { active, content, index, title } = this.props
    return (
      <>
        {AccordionTitle.create(title, {
          autoGenerateKey: false,
          defaultProps: { active, index },
          overrideProps: this.handleTitleOverrides,
        })}
        {AccordionContent.create(content, {
          autoGenerateKey: false,
          defaultProps: { active },
        })}
      </>
    )
  }
}
```
This component renders a Fragment containing a Title and Content. The `handleTitleOverrides` method merges the panel's `onTitleClick` with the title's own `onClick`. It uses `createShorthandFactory(AccordionPanel, null)` with null mapper (no shorthand creation from primitives).

---

## Detailed Tasks

### 1. Convert AccordionContent to TypeScript

**File**: `src/modules/Accordion/AccordionContent.js` -> `AccordionContent.tsx`

1.1. Create `AccordionContentProps` interface:
```typescript
interface AccordionContentProps {
  as?: React.ElementType
  active?: boolean
  children?: React.ReactNode
  className?: string
  content?: SemanticShorthandContent
}
```

1.2. Remove `React.forwardRef`. Accept `ref` as a regular prop.

1.3. Remove PropTypes.

1.4. Retain `createShorthandFactory` static.

1.5. Delete `src/modules/Accordion/AccordionContent.d.ts`.

### 2. Convert AccordionTitle to TypeScript

**File**: `src/modules/Accordion/AccordionTitle.js` -> `AccordionTitle.tsx`

2.1. Create `AccordionTitleProps` interface:
```typescript
interface AccordionTitleProps {
  as?: React.ElementType
  active?: boolean
  children?: React.ReactNode
  className?: string
  content?: SemanticShorthandContent
  icon?: SemanticShorthandItem<IconProps>
  index?: string | number
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: AccordionTitleProps) => void
}
```

2.2. Remove `React.forwardRef`. Accept `ref` as prop.

2.3. Remove PropTypes.

2.4. Replace `_.isNil(icon)` with `icon == null`.

2.5. Replace `_.invoke(props, 'onClick', e, props)` with `props.onClick?.(e, props)`.

2.6. Retain `Icon.create`, `useEventCallback`, `createShorthandFactory`.

2.7. Delete `src/modules/Accordion/AccordionTitle.d.ts`.

### 3. Convert AccordionPanel from Class to Functional Component (KEY MIGRATION)

**File**: `src/modules/Accordion/AccordionPanel.js` -> `AccordionPanel.tsx`

3.1. Create `AccordionPanelProps` interface:
```typescript
interface AccordionPanelProps {
  active?: boolean
  content?: SemanticShorthandItem<AccordionContentProps>
  index?: number | string
  onTitleClick?: (event: React.MouseEvent<HTMLDivElement>, data: AccordionTitleProps) => void
  title?: SemanticShorthandItem<AccordionTitleProps>
}
```

3.2. **Convert from class component to functional component:**

Before (class):
```javascript
class AccordionPanel extends Component {
  handleTitleOverrides = (predefinedProps) => ({
    onClick: (e, titleProps) => {
      _.invoke(predefinedProps, 'onClick', e, titleProps)
      _.invoke(this.props, 'onTitleClick', e, titleProps)
    },
  })

  render() {
    const { active, content, index, title } = this.props
    return (...)
  }
}
```

After (functional):
```typescript
function AccordionPanel(props: AccordionPanelProps) {
  const { active, content, index, title, onTitleClick } = props

  const handleTitleOverrides = (predefinedProps: AccordionTitleProps) => ({
    onClick: (e: React.MouseEvent<HTMLDivElement>, titleProps: AccordionTitleProps) => {
      predefinedProps.onClick?.(e, titleProps)
      onTitleClick?.(e, titleProps)
    },
  })

  return (
    <>
      {AccordionTitle.create(title, {
        autoGenerateKey: false,
        defaultProps: { active, index },
        overrideProps: handleTitleOverrides,
      })}
      {AccordionContent.create(content, {
        autoGenerateKey: false,
        defaultProps: { active },
      })}
    </>
  )
}
```

3.3. Remove `Component` import. Remove `class` syntax entirely.

3.4. Replace `_.invoke(predefinedProps, 'onClick', ...)` and `_.invoke(this.props, 'onTitleClick', ...)` with null-safe calls.

3.5. Note: AccordionPanel does NOT use `React.forwardRef` in the original (class components don't). It also does not render a DOM element (renders a Fragment), so ref forwarding is not applicable. Do NOT add ref support.

3.6. Retain `createShorthandFactory(AccordionPanel, null)` static. The `null` mapper means this component cannot be created from primitive shorthand.

3.7. Delete `src/modules/Accordion/AccordionPanel.d.ts`.

### 4. Convert AccordionAccordion to TypeScript

**File**: `src/modules/Accordion/AccordionAccordion.js` -> `AccordionAccordion.tsx`

4.1. Create `AccordionAccordionProps` interface:
```typescript
interface AccordionAccordionProps {
  as?: React.ElementType
  activeIndex?: number | number[]
  children?: React.ReactNode
  className?: string
  defaultActiveIndex?: number | number[]
  exclusive?: boolean
  onTitleClick?: (event: React.MouseEvent<HTMLDivElement>, data: AccordionTitleProps) => void
  panels?: Array<{ content?: SemanticShorthandItem<AccordionContentProps>; title?: SemanticShorthandItem<AccordionTitleProps> }>
}
```

4.2. Remove `React.forwardRef`. Accept `ref` as prop.

4.3. Remove PropTypes.

4.4. Retain `useAutoControlledValue` for `activeIndex`.

4.5. Type the local utility functions:
```typescript
function isIndexActive(exclusive: boolean, activeIndex: number | number[], itemIndex: number): boolean
function computeNewIndex(exclusive: boolean, activeIndex: number | number[], itemIndex: number): number | number[]
```

4.6. Replace `_.includes(activeIndex, itemIndex)` with `Array.isArray(activeIndex) && activeIndex.includes(itemIndex)`.

4.7. Replace `_.without(activeIndex, itemIndex)` with `(activeIndex as number[]).filter(i => i !== itemIndex)`.

4.8. Replace `_.isArray(activeIndex)` with `Array.isArray(activeIndex)`.

4.9. Replace `_.map(panels, ...)` with `panels?.map(...)`.

4.10. Retain the development-only `useEffect` for type validation, but update it to use `Array.isArray` instead of `_.isArray`.

4.11. Retain `createShorthandFactory` static.

4.12. Delete `src/modules/Accordion/AccordionAccordion.d.ts`.

### 5. Convert Accordion to TypeScript

**File**: `src/modules/Accordion/Accordion.js` -> `Accordion.tsx`

5.1. Create `AccordionProps` interface:
```typescript
interface AccordionProps extends AccordionAccordionProps {
  className?: string
  fluid?: boolean
  inverted?: boolean
  styled?: boolean
}
```

5.2. Remove `React.forwardRef`. Accept `ref` as prop.

5.3. Remove PropTypes.

5.4. **Address the TODO**: The existing TODO says to extract behavior into a `useAccordion()` hook. For this phase, add a comment noting the hook extraction is deferred to a future enhancement phase. The current AccordionAccordion delegation pattern works correctly and should be preserved as-is for now.

5.5. Attach statics: `Accordion.Accordion`, `Accordion.Content`, `Accordion.Panel`, `Accordion.Title`.

5.6. Delete `src/modules/Accordion/Accordion.d.ts`.

### 6. Update Barrel Index

**File**: `src/modules/Accordion/index.js` -> `index.ts`

6.1. Export Accordion as default and all named + type exports.

6.2. Delete `src/modules/Accordion/index.d.ts`.

### 7. Write RTL Tests

**File**: Create test files in `test/specs/modules/Accordion/`

7.1. **Accordion-test.tsx**: Test `ui accordion` className is NOT present (styling is on the outer only), test `fluid`, `inverted`, `styled` classes, test that props are passed through to AccordionAccordion, ref attachment.

7.2. **AccordionAccordion-test.tsx**: Test `accordion` base className. Test exclusive mode: clicking title opens panel and closes previous. Test non-exclusive mode: clicking title toggles panel without closing others. Test controlled `activeIndex`. Test uncontrolled with `defaultActiveIndex`. Test `onTitleClick` callback. Test `panels` shorthand rendering creates correct number of panels.

7.3. **AccordionContent-test.tsx**: Test `content` base class, `active` class toggle, `children`/`content` rendering.

7.4. **AccordionTitle-test.tsx**: Test `title` base class, `active` class, default dropdown icon when no icon specified, custom icon rendering, `onClick` callback fires with props.

7.5. **AccordionPanel-test.tsx**: Test renders AccordionTitle and AccordionContent, test `active` prop passed to both children, test `onTitleClick` fires when title is clicked, test renders as Fragment (no wrapper element).

### 8. Remove Obsolete Files

8.1. Delete all 5 `.d.ts` files in `src/modules/Accordion/`.
8.2. Delete `src/modules/Accordion/index.d.ts`.

---

## Files Affected

| Action   | File Path                                                      |
| -------- | -------------------------------------------------------------- |
| Rename   | `src/modules/Accordion/Accordion.js` -> `.tsx`                 |
| Rename   | `src/modules/Accordion/AccordionAccordion.js` -> `.tsx`        |
| Rename   | `src/modules/Accordion/AccordionContent.js` -> `.tsx`          |
| Rename   | `src/modules/Accordion/AccordionPanel.js` -> `.tsx`            |
| Rename   | `src/modules/Accordion/AccordionTitle.js` -> `.tsx`            |
| Rename   | `src/modules/Accordion/index.js` -> `.ts`                      |
| Delete   | `src/modules/Accordion/Accordion.d.ts`                         |
| Delete   | `src/modules/Accordion/AccordionAccordion.d.ts`                |
| Delete   | `src/modules/Accordion/AccordionContent.d.ts`                  |
| Delete   | `src/modules/Accordion/AccordionPanel.d.ts`                    |
| Delete   | `src/modules/Accordion/AccordionTitle.d.ts`                    |
| Delete   | `src/modules/Accordion/index.d.ts`                             |
| Create   | `test/specs/modules/Accordion/Accordion-test.tsx`              |
| Create   | `test/specs/modules/Accordion/AccordionAccordion-test.tsx`     |
| Create   | `test/specs/modules/Accordion/AccordionContent-test.tsx`       |
| Create   | `test/specs/modules/Accordion/AccordionPanel-test.tsx`         |
| Create   | `test/specs/modules/Accordion/AccordionTitle-test.tsx`         |

---

## Acceptance Criteria

- [ ] All 5 Accordion components compile with zero TypeScript errors
- [ ] **AccordionPanel is a functional component** -- no class component syntax remains
- [ ] No `React.forwardRef` wrappers remain (except AccordionPanel which never had one)
- [ ] No `PropTypes` imports or `Component` imports remain
- [ ] No `.d.ts` declaration files remain in `src/modules/Accordion/`
- [ ] All components export their props interfaces as named type exports
- [ ] `Accordion.Accordion`, `Accordion.Content`, `Accordion.Panel`, `Accordion.Title` statics are correctly typed
- [ ] `useAutoControlledValue` correctly manages `activeIndex` in exclusive and non-exclusive modes
- [ ] Exclusive mode: activeIndex is a number, toggling opens one panel and closes the previously open one
- [ ] Non-exclusive mode: activeIndex is an array, toggling adds/removes panel indexes independently
- [ ] AccordionPanel correctly merges `onTitleClick` with the title's own `onClick` via `overrideProps`
- [ ] AccordionTitle renders default `'dropdown'` icon when no icon prop is specified
- [ ] Development-only `useEffect` validation of activeIndex type still works in dev mode
- [ ] All `createShorthandFactory` statics work correctly
- [ ] Lodash usage is minimized (replace `_.includes`, `_.without`, `_.isArray`, `_.isNil`, `_.invoke`, `_.map` with native equivalents)
- [ ] RTL tests pass for all 5 components
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

---

## Rollback Strategy

1. Revert all renamed `.tsx` files to `.js` from version control.
2. Restore all deleted `.d.ts` files.
3. Delete new test files.
4. The Accordion module is self-contained -- no other modules depend on its internals. The only external dependency is Icon (from elements). Rollback is clean and isolated.

---

## Notes for AI Agents

- **AccordionPanel class-to-functional conversion is the primary challenge.** The class component has a `handleTitleOverrides` instance method that closes over `this.props`. In the functional version, this becomes a local function that closes over the destructured `onTitleClick` prop. The semantics are identical.

- **AccordionPanel does NOT forward refs.** It renders a Fragment (`<>...</>`), which has no DOM node to attach a ref to. Do not attempt to add ref forwarding.

- **AccordionPanel's `createShorthandFactory(AccordionPanel, null)`**: The `null` mapper means you cannot create an AccordionPanel from a string or number shorthand. You must pass a props object. This is correct -- panels need both `title` and `content`.

- **The `useAutoControlledValue` initialState factory**: AccordionAccordion uses `initialState: () => (exclusive ? -1 : [])`. This is a function form that defers computation. The hook from Phase 16 must support this. Verify.

- **Development-only useEffect with eslint-disable**: The original code has `// eslint-disable-next-line react-hooks/rules-of-hooks` because the `useEffect` is inside a `process.env.NODE_ENV !== 'production'` guard. This pattern is safe because the environment variable does not change at runtime, but ESLint cannot verify this. Preserve the eslint-disable comment.

- **Lodash replacement opportunities**: All lodash usage in this module can be replaced with native JS:
  - `_.includes(arr, item)` -> `arr.includes(item)`
  - `_.without(arr, item)` -> `arr.filter(i => i !== item)`
  - `_.isArray(val)` -> `Array.isArray(val)`
  - `_.isNil(val)` -> `val == null`
  - `_.map(arr, fn)` -> `arr?.map(fn)`
  - `_.invoke(obj, 'method', ...args)` -> `obj.method?.(...args)`

- **The TODO about `useAccordion()` hook**: Do not implement this in Phase 29. The current Accordion -> AccordionAccordion delegation pattern works. A hook extraction would be a behavior refactor, not a migration task. Document it as a future enhancement.

- **`getUnhandledProps` pattern**: Both Accordion and AccordionAccordion use `getUnhandledProps` to filter known props from the spread. After migration to TypeScript, this utility should work with the component function directly (it reads the `propTypes` static or a `handledProps` list). Ensure the migrated utility supports the new pattern.
