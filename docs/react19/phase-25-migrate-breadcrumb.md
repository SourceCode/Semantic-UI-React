# Phase 25: Migrate Breadcrumb and Subcomponents

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Phase ID**   | 25                                           |
| **Title**      | Migrate Breadcrumb and Subcomponents          |
| **Stage**      | 5 - Component Migration: Collections          |
| **Dependencies** | Phase 15 (Shared Infrastructure & TypeScript Config) |
| **Complexity** | Low                                          |
| **Scope**      | 3 components, 3 type definition files, 1 barrel index |

---

## Objective

Convert the Breadcrumb collection (Breadcrumb, BreadcrumbDivider, BreadcrumbSection) from JavaScript with PropTypes and `React.forwardRef` to native TypeScript with React 19.2 ref-as-prop semantics. Remove all runtime type checking, replace `.d.ts` declaration files with types co-located in `.tsx` source, and write comprehensive RTL test suites.

---

## Background

The Breadcrumb collection is the simplest collection group in the library and makes an ideal starting point for Stage 5 migration. All three components are presentational functional components wrapped in `React.forwardRef`. They use a consistent set of library utilities:

- **Breadcrumb** (`src/collections/Breadcrumb/Breadcrumb.js`): Root component that renders a hierarchy trail. Supports a `sections` shorthand prop that auto-generates BreadcrumbSection and BreadcrumbDivider children via `_.each` iteration and shorthand factory methods (`BreadcrumbSection.create`, `BreadcrumbDivider.create`). Uses `childrenUtils.isNil` for children-vs-shorthand branching. Accepts `size` prop filtered through `SUI.SIZES`. Uses `clsx` (`cx`) for className building, `getUnhandledProps`, `getComponentType`, and lodash `_.each` / `_.without`.

- **BreadcrumbDivider** (`src/collections/Breadcrumb/BreadcrumbDivider.js`): Renders either an Icon (via `Icon.create` shorthand factory) or text content as a divider between sections. Has a `createShorthandFactory` static method. Uses lodash `_.isNil` for icon/content null checks.

- **BreadcrumbSection** (`src/collections/Breadcrumb/BreadcrumbSection.js`): Renders an individual breadcrumb section that can be active, a link, or clickable. Uses `getKeyOnly` for active class, `useEventCallback` for click handling, `getComponentType` with `getDefault` callback to render as `<a>` when `link` or `onClick` is provided, `createShorthandFactory`, and `customPropTypes.disallow` for mutually exclusive `href`/`link` props.

Current type definitions in `Breadcrumb.d.ts` use `ForwardRefComponent<BreadcrumbProps, HTMLDivElement>` with subcomponent statics, `SemanticShorthandCollection`, `SemanticShorthandContent`, and `SemanticShorthandItem` generics. These will be replaced by native TypeScript interfaces in the `.tsx` files.

---

## Detailed Tasks

### 1. Convert BreadcrumbSection to TypeScript

**File**: `src/collections/Breadcrumb/BreadcrumbSection.js` -> `BreadcrumbSection.tsx`

1.1. Create `BreadcrumbSectionProps` interface with all props typed from the current PropTypes definition and existing `BreadcrumbSection.d.ts`. Include `as`, `active`, `children`, `className`, `content`, `href`, `link`, `onClick`. Type `onClick` as `(event: React.MouseEvent<HTMLAnchorElement>, data: BreadcrumbSectionProps) => void`.

1.2. Remove `React.forwardRef` wrapper. Accept `ref` as a regular prop in the function signature per React 19.2 semantics: `function BreadcrumbSection(props: BreadcrumbSectionProps & { ref?: React.Ref<HTMLElement> })`.

1.3. Remove the `PropTypes` assignment block entirely.

1.4. Replace `_.invoke(props, 'onClick', e, props)` with a direct null-safe call: `props.onClick?.(e, props)`. Remove lodash import if no other lodash usage remains.

1.5. Replace `customPropTypes.disallow` mutual exclusion logic with a TypeScript discriminated union or JSDoc comment noting the constraint (runtime enforcement of `disallow` is removed with PropTypes).

1.6. Retain `useEventCallback` import from `../../lib`.

1.7. Retain `createShorthandFactory` static assignment: `BreadcrumbSection.create = createShorthandFactory(...)`. Ensure the factory generic types are correct.

1.8. Delete `src/collections/Breadcrumb/BreadcrumbSection.d.ts`.

### 2. Convert BreadcrumbDivider to TypeScript

**File**: `src/collections/Breadcrumb/BreadcrumbDivider.js` -> `BreadcrumbDivider.tsx`

2.1. Create `BreadcrumbDividerProps` interface with `as`, `children`, `className`, `content`, `icon`. Type `icon` using the shared `SemanticShorthandItem<IconProps>` generic or an equivalent from the migrated type system.

2.2. Remove `React.forwardRef`. Accept `ref` as a standard prop.

2.3. Remove PropTypes block.

2.4. Replace `_.isNil(icon)` and `_.isNil(content)` with idiomatic TypeScript null checks (`icon != null`, `content != null`).

2.5. Retain `Icon.create` shorthand factory call and `createShorthandFactory` static.

2.6. Delete `src/collections/Breadcrumb/BreadcrumbDivider.d.ts`.

### 3. Convert Breadcrumb to TypeScript

**File**: `src/collections/Breadcrumb/Breadcrumb.js` -> `Breadcrumb.tsx`

3.1. Create `BreadcrumbProps` interface. Type `sections` as `SemanticShorthandCollection<BreadcrumbSectionProps>` or equivalent. Type `size` as a union literal excluding `'medium'` from the SUI sizes. Type `divider` and `icon` per the existing `.d.ts`.

3.2. Remove `React.forwardRef`. Accept `ref` as a standard prop.

3.3. Remove PropTypes block.

3.4. Replace `_.each(sections, ...)` with `sections?.forEach(...)` or `sections?.map(...)`. Remove lodash import.

3.5. Replace `_.without(SUI.SIZES, 'medium')` with a TypeScript type literal union: `'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'`.

3.6. Attach subcomponent statics with proper typing:
```typescript
Breadcrumb.Divider = BreadcrumbDivider
Breadcrumb.Section = BreadcrumbSection
```

3.7. Delete `src/collections/Breadcrumb/Breadcrumb.d.ts`.

### 4. Update Barrel Index

**File**: `src/collections/Breadcrumb/index.js` -> `index.ts`

4.1. Change `export default from './Breadcrumb'` to `export { default } from './Breadcrumb'`.

4.2. Add named exports for all subcomponents and their prop interfaces:
```typescript
export { default as Breadcrumb } from './Breadcrumb'
export type { BreadcrumbProps } from './Breadcrumb'
export type { BreadcrumbDividerProps } from './BreadcrumbDivider'
export type { BreadcrumbSectionProps } from './BreadcrumbSection'
```

4.3. Delete `src/collections/Breadcrumb/index.d.ts`.

### 5. Write RTL Tests

**File**: Create `test/specs/collections/Breadcrumb/Breadcrumb-test.tsx` (or follow the project's existing test structure)

5.1. Test Breadcrumb renders with correct `ui breadcrumb` className.

5.2. Test `size` prop applies correct size class.

5.3. Test `sections` shorthand generates BreadcrumbSection and BreadcrumbDivider children with correct count (n sections, n-1 dividers).

5.4. Test `divider` prop is passed through to generated BreadcrumbDivider components.

5.5. Test `icon` prop creates Icon dividers instead of text dividers.

5.6. Test `as` prop changes the rendered element type.

5.7. Test `children` rendering takes precedence over `sections` shorthand.

5.8. Test ref forwarding: pass a ref and verify it attaches to the root DOM element.

**File**: Create `test/specs/collections/Breadcrumb/BreadcrumbDivider-test.tsx`

5.9. Test default divider renders `/` text.

5.10. Test `icon` prop renders an Icon component with `divider` class.

5.11. Test `content` prop renders custom text content.

5.12. Test `children` override default `/` content.

5.13. Test ref attachment.

**File**: Create `test/specs/collections/Breadcrumb/BreadcrumbSection-test.tsx`

5.14. Test `active` prop adds `active` class.

5.15. Test `link` prop renders as `<a>` tag.

5.16. Test `href` prop renders as `<a>` tag with href attribute.

5.17. Test `onClick` renders as `<a>` by default and fires callback with `(event, props)`.

5.18. Test `content` shorthand renders text content.

5.19. Test `children` takes precedence over `content`.

5.20. Test ref attachment.

### 6. Remove Obsolete Files

6.1. Delete `src/collections/Breadcrumb/Breadcrumb.d.ts`
6.2. Delete `src/collections/Breadcrumb/BreadcrumbDivider.d.ts`
6.3. Delete `src/collections/Breadcrumb/BreadcrumbSection.d.ts`
6.4. Delete `src/collections/Breadcrumb/index.d.ts`

---

## Files Affected

| Action   | File Path                                                    |
| -------- | ------------------------------------------------------------ |
| Rename   | `src/collections/Breadcrumb/Breadcrumb.js` -> `.tsx`         |
| Rename   | `src/collections/Breadcrumb/BreadcrumbDivider.js` -> `.tsx`  |
| Rename   | `src/collections/Breadcrumb/BreadcrumbSection.js` -> `.tsx`  |
| Rename   | `src/collections/Breadcrumb/index.js` -> `.ts`               |
| Delete   | `src/collections/Breadcrumb/Breadcrumb.d.ts`                 |
| Delete   | `src/collections/Breadcrumb/BreadcrumbDivider.d.ts`          |
| Delete   | `src/collections/Breadcrumb/BreadcrumbSection.d.ts`          |
| Delete   | `src/collections/Breadcrumb/index.d.ts`                      |
| Create   | `test/specs/collections/Breadcrumb/Breadcrumb-test.tsx`      |
| Create   | `test/specs/collections/Breadcrumb/BreadcrumbDivider-test.tsx` |
| Create   | `test/specs/collections/Breadcrumb/BreadcrumbSection-test.tsx` |

---

## Acceptance Criteria

- [ ] `Breadcrumb.tsx` compiles with zero TypeScript errors
- [ ] `BreadcrumbDivider.tsx` compiles with zero TypeScript errors
- [ ] `BreadcrumbSection.tsx` compiles with zero TypeScript errors
- [ ] No `React.forwardRef` wrappers remain -- ref is accepted as a regular prop
- [ ] No `PropTypes` imports or runtime type-checking assignments remain
- [ ] No `.d.ts` declaration files remain in `src/collections/Breadcrumb/`
- [ ] All three components export their props interfaces as named exports
- [ ] `BreadcrumbProps`, `BreadcrumbDividerProps`, `BreadcrumbSectionProps` are importable from the barrel index
- [ ] `Breadcrumb.Divider` and `Breadcrumb.Section` statics are correctly typed
- [ ] `BreadcrumbDivider.create` and `BreadcrumbSection.create` shorthand factories work correctly
- [ ] Lodash usage is removed or minimized (replaced with native JS where feasible)
- [ ] RTL tests pass for all three components covering className building, shorthand rendering, event callbacks, ref attachment, and `as` prop polymorphism
- [ ] Existing consumers that import `Breadcrumb` from the package entry point continue to work
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run lint` passes

---

## Rollback Strategy

This phase is self-contained within the `src/collections/Breadcrumb/` directory. To rollback:

1. Revert the renamed `.tsx` files back to their original `.js` versions from version control.
2. Restore the deleted `.d.ts` files from version control.
3. Restore `index.js` from version control.
4. Delete any newly created test files.
5. No other components depend on Breadcrumb internals, so rollback has zero cross-component impact.

---

## Notes for AI Agents

- **Start with BreadcrumbSection**, then BreadcrumbDivider, then Breadcrumb. The root component imports the subcomponents, so subcomponents must compile first.
- The `createShorthandFactory` static method pattern (`Component.create = createShorthandFactory(...)`) must be preserved. It is used by the parent Breadcrumb component to generate children from shorthand props. Verify the factory function's TypeScript generics match the component's props interface.
- The `getComponentType` utility returns the element type to render. Its `getDefault` callback in BreadcrumbSection should remain -- it enables the `<a>` default when `link` or `onClick` is passed.
- The `useEventCallback` hook from `../../lib` is a stable-reference callback wrapper. Continue using it for `onClick` handlers that are passed to child elements.
- The `childrenUtils.isNil(children)` check is the standard SUIR pattern for children-vs-shorthand branching. Preserve this pattern.
- When replacing `_.each` with native iteration, ensure the key generation logic for dividers (`${breadcrumbElement.key}_divider`) is preserved exactly, as it affects React reconciliation.
- The `size` prop excludes `'medium'` from SUI sizes. In TypeScript, model this as a literal union type directly rather than computing it at runtime.
- Watch for the `customPropTypes.disallow` / `customPropTypes.every` patterns in BreadcrumbSection's `href` and `link` props. These enforce mutual exclusivity at runtime. In TypeScript, consider a discriminated union type or simply document the constraint, as runtime enforcement is being removed with PropTypes.
