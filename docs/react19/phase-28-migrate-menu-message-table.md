# Phase 28: Migrate Menu, Message, Table and All Subcomponents

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| **Phase ID**   | 28                                           |
| **Title**      | Migrate Menu, Message, Table and All Subcomponents |
| **Stage**      | 5 - Component Migration: Collections          |
| **Dependencies** | Phase 15 (Shared Infrastructure), Phase 31 (Dropdown -- for MenuItem integration) |
| **Complexity** | High                                         |
| **Scope**      | ~16 components, ~16 type definition files, 3 barrel indexes |

---

## Objective

Convert three remaining collection groups -- Menu (4 components), Message (5 components), Table (7 components) -- from JavaScript with PropTypes and `React.forwardRef` to native TypeScript with React 19.2 ref-as-prop semantics. These are grouped into a single phase because individually they are medium complexity, but together they represent the final batch of collection migrations. Special attention is needed for Menu's `useAutoControlledValue` usage and MenuItem's integration point with Dropdown.

---

## Background

### Menu Collection (4 components)

**Menu** (`src/collections/Menu/Menu.js`): Navigation component with controlled/uncontrolled active item tracking. Key characteristics:
- Uses `useAutoControlledValue` hook for `activeIndex` state (controlled/uncontrolled pattern)
- Supports `items` shorthand array that generates MenuItem children via `MenuItem.create`
- The `overrideProps` callback on `MenuItem.create` wires `onClick` to update `activeIndex` and invoke `onItemClick`
- Uses `parseInt(activeIndex, 10) === index` for active comparison (handles string/number activeIndex)
- Heavy className building with `getKeyOnly`, `getKeyOrValueAndKey`, `getValueAndKey`, `getWidthProp`
- Has `createShorthandFactory` static for shorthand creation

**MenuItem** (`src/collections/Menu/MenuItem.js`): Individual menu item. Key characteristics:
- Complex `icon` class logic: `getKeyOnly(icon === true || (icon && !(name || content)), 'icon')`
- Uses `getComponentType` with `getDefault` callback to render as `<a>` when `onClick` is present
- Uses `useEventCallback` for click handler with `disabled` guard
- Uses `Icon.create` for icon shorthand rendering
- Falls back to `_.startCase(name)` for display text when `content` is nil
- Has `createShorthandFactory` static
- **Dropdown integration**: MenuItem historically supports rendering as a Dropdown in certain menu configurations. The current source does not directly import Dropdown, but consumers may pass Dropdown content as children. Ensure this pattern continues to work.

**MenuHeader** (`src/collections/Menu/MenuHeader.js`): Simple presentational subcomponent with `children`/`content` shorthand.

**MenuMenu** (`src/collections/Menu/MenuMenu.js`): Sub-menu container with `position` prop (`'left'` | `'right'`).

### Message Collection (5 components)

**Message** (`src/collections/Message/Message.js`): Information display component. Key characteristics:
- `onDismiss` callback adds a close Icon and wires click handler via `useEventCallback`
- Shorthand rendering for `header` (via `MessageHeader.create`), `list` (via `MessageList.create`), and `content` (via `createHTMLParagraph`)
- `Icon.create(icon)` for icon rendering (when `icon` is not just a boolean for the class)
- Wraps shorthand content in `<MessageContent>` when header, content, or list is present
- Many boolean state classes: `compact`, `error`, `floating`, `hidden`, `icon`, `info`, `negative`, `positive`, `success`, `visible`, `warning`

**MessageContent** (`src/collections/Message/MessageContent.js`): Simple wrapper with `content` class.

**MessageHeader** (`src/collections/Message/MessageHeader.js`): Header with `createShorthandFactory`.

**MessageItem** (`src/collections/Message/MessageItem.js`): List item defaulting to `<li>` element. Has `createShorthandFactory`.

**MessageList** (`src/collections/Message/MessageList.js`): List container defaulting to `<ul>`. Renders items via `_.map(items, MessageItem.create)`. Has `createShorthandFactory`.

### Table Collection (7 components)

**Table** (`src/collections/Table/Table.js`): Data table component. Key characteristics:
- Defaults to `<table>` element via `getComponentType(props, { defaultAs: 'table' })`
- Supports both `children` rendering and shorthand rendering via `headerRow`/`headerRows`/`footerRow`/`renderBodyRow`/`tableData`
- `headerRow` and `headerRows` are mutually exclusive (single header row vs. multiple)
- `renderBodyRow` is a render prop: `(data, index) => TableRow shorthand`
- Complex className with many boolean/variant props
- Uses `getWidthProp(columns, 'column')` (without number-to-word) for column count

**TableBody** (`src/collections/Table/TableBody.js`): Minimal wrapper defaulting to `<tbody>`.

**TableCell** (`src/collections/Table/TableCell.js`): Cell component defaulting to `<td>`. Has `Icon.create`, `createShorthandFactory`, and many state classes.

**TableFooter** (`src/collections/Table/TableFooter.js`): Thin wrapper around TableHeader that defaults `as='tfoot'`. Only 3 lines of logic.

**TableHeader** (`src/collections/Table/TableHeader.js`): Header wrapper defaulting to `<thead>` with `fullWidth` prop.

**TableHeaderCell** (`src/collections/Table/TableHeaderCell.js`): Extends TableCell with `as='th'` default and `sorted` prop (`'ascending'` | `'descending'`).

**TableRow** (`src/collections/Table/TableRow.js`): Row component defaulting to `<tr>`. Supports `cells` shorthand array via `TableCell.create` with `cellAs` prop for overriding cell element type. Has `createShorthandFactory`.

---

## Detailed Tasks

### Menu Collection

#### 1. Convert MenuHeader to TypeScript

**File**: `src/collections/Menu/MenuHeader.js` -> `MenuHeader.tsx`

1.1. Create `MenuHeaderProps` interface with `as`, `children`, `className`, `content`.
1.2. Remove `React.forwardRef`. Accept `ref` as prop.
1.3. Remove PropTypes.
1.4. Delete `src/collections/Menu/MenuHeader.d.ts`.

#### 2. Convert MenuMenu to TypeScript

**File**: `src/collections/Menu/MenuMenu.js` -> `MenuMenu.tsx`

2.1. Create `MenuMenuProps` with `as`, `children`, `className`, `content`, `position`.
2.2. Remove `React.forwardRef`. Accept `ref` as prop.
2.3. Remove PropTypes.
2.4. Delete `src/collections/Menu/MenuMenu.d.ts`.

#### 3. Convert MenuItem to TypeScript

**File**: `src/collections/Menu/MenuItem.js` -> `MenuItem.tsx`

3.1. Create `MenuItemProps` interface with all current props. Type `onClick` as `(event: React.MouseEvent<HTMLAnchorElement>, data: MenuItemProps) => void`.
3.2. Remove `React.forwardRef`. Accept `ref` as prop.
3.3. Remove PropTypes.
3.4. Replace `_.invoke(props, 'onClick', e, props)` with `props.onClick?.(e, props)`.
3.5. Replace `_.startCase(name)` with a native implementation or keep lodash for this one utility. (`_.startCase` has complex Unicode handling that is non-trivial to replicate.)
3.6. Retain `Icon.create`, `createShorthandFactory`, `useEventCallback`.
3.7. Delete `src/collections/Menu/MenuItem.d.ts`.

#### 4. Convert Menu to TypeScript

**File**: `src/collections/Menu/Menu.js` -> `Menu.tsx`

4.1. Create `MenuProps` interface. Type `activeIndex` as `number | string`. Type `items` as `SemanticShorthandCollection<MenuItemProps>`. Type `onItemClick`.
4.2. Remove `React.forwardRef`. Accept `ref` as prop.
4.3. Remove PropTypes.
4.4. Retain `useAutoControlledValue` for `activeIndex`.
4.5. Replace `_.map(items, ...)` with `items?.map(...)` using the MenuItem factory.
4.6. Replace `_.invoke(predefinedProps, 'onClick', ...)` and `_.invoke(props, 'onItemClick', ...)` with null-safe calls.
4.7. Attach statics: `Menu.Header`, `Menu.Item`, `Menu.Menu`.
4.8. Retain `createShorthandFactory` static.
4.9. Delete `src/collections/Menu/Menu.d.ts`.

#### 5. Update Menu Barrel Index

**File**: `src/collections/Menu/index.js` -> `index.ts`
5.1. Export Menu default and all named exports with type exports.
5.2. Delete `src/collections/Menu/index.d.ts`.

### Message Collection

#### 6. Convert MessageContent to TypeScript

**File**: `src/collections/Message/MessageContent.js` -> `MessageContent.tsx`

6.1. Create `MessageContentProps` with `as`, `children`, `className`, `content`.
6.2. Standard migration (remove forwardRef, PropTypes).
6.3. Delete `src/collections/Message/MessageContent.d.ts`.

#### 7. Convert MessageHeader to TypeScript

**File**: `src/collections/Message/MessageHeader.js` -> `MessageHeader.tsx`

7.1. Create `MessageHeaderProps`. Retain `createShorthandFactory`.
7.2. Standard migration.
7.3. Delete `src/collections/Message/MessageHeader.d.ts`.

#### 8. Convert MessageItem to TypeScript

**File**: `src/collections/Message/MessageItem.js` -> `MessageItem.tsx`

8.1. Create `MessageItemProps`. Default `as` to `'li'`. Retain `createShorthandFactory`.
8.2. Standard migration.
8.3. Delete `src/collections/Message/MessageItem.d.ts`.

#### 9. Convert MessageList to TypeScript

**File**: `src/collections/Message/MessageList.js` -> `MessageList.tsx`

9.1. Create `MessageListProps` with `items` typed as collection shorthand.
9.2. Replace `_.map(items, MessageItem.create)` with `items?.map(item => MessageItem.create(item))` or retain lodash map.
9.3. Standard migration. Retain `createShorthandFactory`.
9.4. Delete `src/collections/Message/MessageList.d.ts`.

#### 10. Convert Message to TypeScript

**File**: `src/collections/Message/Message.js` -> `Message.tsx`

10.1. Create `MessageProps` interface with all props. Type `onDismiss` as `(event: React.MouseEvent<HTMLElement>, data: MessageProps) => void`.
10.2. Remove `React.forwardRef`. Accept `ref` as prop.
10.3. Remove PropTypes.
10.4. Replace `_.invoke(props, 'onDismiss', ...)` with null-safe call.
10.5. Replace `_.isNil(header)`, `_.isNil(content)`, `_.isNil(list)` with native null checks.
10.6. Retain `Icon.create`, `MessageHeader.create`, `MessageList.create`, `createHTMLParagraph`.
10.7. Attach statics: `Message.Content`, `Message.Header`, `Message.List`, `Message.Item`.
10.8. Delete `src/collections/Message/Message.d.ts`.

#### 11. Update Message Barrel Index

**File**: `src/collections/Message/index.js` -> `index.ts`
11.1. Export all. Delete `index.d.ts`.

### Table Collection

#### 12. Convert TableBody to TypeScript

**File**: `src/collections/Table/TableBody.js` -> `TableBody.tsx`

12.1. Create `TableBodyProps` with `as`, `children`, `className`. Default `as` to `'tbody'`.
12.2. Standard migration.
12.3. Delete `src/collections/Table/TableBody.d.ts`.

#### 13. Convert TableCell to TypeScript

**File**: `src/collections/Table/TableCell.js` -> `TableCell.tsx`

13.1. Create `TableCellProps` with all current props. Default `as` to `'td'`.
13.2. Retain `Icon.create` and `createShorthandFactory`.
13.3. Standard migration.
13.4. Delete `src/collections/Table/TableCell.d.ts`.

#### 14. Convert TableHeader to TypeScript

**File**: `src/collections/Table/TableHeader.js` -> `TableHeader.tsx`

14.1. Create `TableHeaderProps` with `as`, `children`, `className`, `content`, `fullWidth`. Default `as` to `'thead'`.
14.2. Standard migration.
14.3. Delete `src/collections/Table/TableHeader.d.ts`.

#### 15. Convert TableHeaderCell to TypeScript

**File**: `src/collections/Table/TableHeaderCell.js` -> `TableHeaderCell.tsx`

15.1. Create `TableHeaderCellProps` with `as`, `className`, `sorted`. Default `as` to `'th'`.
15.2. Note: This component renders a `<TableCell>` with overridden `as` prop -- it delegates to TableCell.
15.3. Standard migration.
15.4. Delete `src/collections/Table/TableHeaderCell.d.ts`.

#### 16. Convert TableFooter to TypeScript

**File**: `src/collections/Table/TableFooter.js` -> `TableFooter.tsx`

16.1. Create `TableFooterProps` with `as`. Default `as` to `'tfoot'`.
16.2. Note: This renders `<TableHeader>` with `as='tfoot'` -- extremely thin wrapper.
16.3. Standard migration.
16.4. Delete `src/collections/Table/TableFooter.d.ts`.

#### 17. Convert TableRow to TypeScript

**File**: `src/collections/Table/TableRow.js` -> `TableRow.tsx`

17.1. Create `TableRowProps` with all current props. Type `cells` as collection shorthand. Type `cellAs` as `React.ElementType`. Default `cellAs` to `'td'`.
17.2. Replace `_.map(cells, ...)` with native map.
17.3. Retain `createShorthandFactory`.
17.4. Standard migration.
17.5. Delete `src/collections/Table/TableRow.d.ts`.

#### 18. Convert Table to TypeScript

**File**: `src/collections/Table/Table.js` -> `Table.tsx`

18.1. Create `TableProps` interface with all current props. Type `renderBodyRow` as `(data: any, index: number) => any`. Type `tableData` as `any[]`. Type `headerRow` and `headerRows` with their mutual exclusion documented.
18.2. Remove `React.forwardRef`. Accept `ref` as prop.
18.3. Remove PropTypes.
18.4. Replace `_.map(headerRows, ...)` and `_.map(tableData, ...)` with native map.
18.5. Retain all shorthand factory usage: `TableRow.create(headerRow, ...)`, `TableRow.create(renderBodyRow(data, index))`.
18.6. Attach statics: `Table.Body`, `Table.Cell`, `Table.Footer`, `Table.Header`, `Table.HeaderCell`, `Table.Row`.
18.7. Delete `src/collections/Table/Table.d.ts`.

#### 19. Update Table Barrel Index

**File**: `src/collections/Table/index.js` -> `index.ts`
19.1. Export all. Delete `index.d.ts`.

### 20. Write RTL Tests

Create test files covering:

20.1. **Menu tests**: `activeIndex` controlled/uncontrolled behavior, `items` shorthand rendering, `onItemClick` callback, MenuItem active state, MenuItem disabled click prevention, MenuItem icon class logic, MenuItem `as='a'` when onClick present, ref attachment.

20.2. **Message tests**: Boolean state classes, `onDismiss` renders close icon and fires callback, `header`/`list`/`content` shorthand rendering wrapped in MessageContent, icon rendering (boolean vs shorthand), ref attachment.

20.3. **Table tests**: Default `<table>` element, `headerRow`/`headerRows` shorthand rendering in TableHeader, `renderBodyRow` + `tableData` rendering in TableBody, `footerRow` rendering in TableFooter, TableCell default `<td>`, TableHeaderCell default `<th>` with `sorted` class, TableRow `cells` shorthand, `cellAs` override, boolean state classes on cells and rows, ref attachment.

---

## Files Affected

| Action   | File Path                                                  |
| -------- | ---------------------------------------------------------- |
| Rename   | `src/collections/Menu/Menu.js` -> `.tsx`                   |
| Rename   | `src/collections/Menu/MenuHeader.js` -> `.tsx`             |
| Rename   | `src/collections/Menu/MenuItem.js` -> `.tsx`               |
| Rename   | `src/collections/Menu/MenuMenu.js` -> `.tsx`               |
| Rename   | `src/collections/Menu/index.js` -> `.ts`                   |
| Rename   | `src/collections/Message/Message.js` -> `.tsx`             |
| Rename   | `src/collections/Message/MessageContent.js` -> `.tsx`      |
| Rename   | `src/collections/Message/MessageHeader.js` -> `.tsx`       |
| Rename   | `src/collections/Message/MessageItem.js` -> `.tsx`         |
| Rename   | `src/collections/Message/MessageList.js` -> `.tsx`         |
| Rename   | `src/collections/Message/index.js` -> `.ts`                |
| Rename   | `src/collections/Table/Table.js` -> `.tsx`                 |
| Rename   | `src/collections/Table/TableBody.js` -> `.tsx`             |
| Rename   | `src/collections/Table/TableCell.js` -> `.tsx`             |
| Rename   | `src/collections/Table/TableFooter.js` -> `.tsx`           |
| Rename   | `src/collections/Table/TableHeader.js` -> `.tsx`           |
| Rename   | `src/collections/Table/TableHeaderCell.js` -> `.tsx`       |
| Rename   | `src/collections/Table/TableRow.js` -> `.tsx`              |
| Rename   | `src/collections/Table/index.js` -> `.ts`                  |
| Delete   | All 16 `.d.ts` files across Menu/, Message/, Table/        |
| Delete   | 3 `index.d.ts` files                                       |
| Create   | Test files for all 16 components                           |

---

## Acceptance Criteria

- [ ] All ~16 components compile with zero TypeScript errors
- [ ] No `React.forwardRef` wrappers remain
- [ ] No `PropTypes` imports remain
- [ ] No `.d.ts` declaration files remain in Menu/, Message/, or Table/
- [ ] All components export props interfaces as named type exports
- [ ] Menu `useAutoControlledValue` correctly manages activeIndex state
- [ ] Menu `items` shorthand generates MenuItem children with correct active state and click handling
- [ ] MenuItem icon class logic handles all cases: `icon={true}`, `icon='name'`, icon with/without name/content
- [ ] Message `onDismiss` renders close icon and fires callback
- [ ] Message shorthand rendering (header, list, content) wraps in MessageContent correctly
- [ ] Table shorthand rendering handles headerRow, headerRows (multiple), footerRow, renderBodyRow + tableData
- [ ] TableHeaderCell delegates to TableCell with `as='th'` and adds `sorted` class
- [ ] TableFooter delegates to TableHeader with `as='tfoot'`
- [ ] All `createShorthandFactory` statics work correctly
- [ ] RTL tests pass for all components
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

---

## Rollback Strategy

1. Revert all renamed `.tsx` files across all three directories.
2. Restore all deleted `.d.ts` files.
3. Delete new test files.
4. These three collection groups are largely independent of each other and of other collections. The only cross-dependency is Menu's consumption of `useAutoControlledValue` from lib (which should be stable from Phase 15) and the potential MenuItem-Dropdown integration (consumers passing Dropdown as children).

If needed, each sub-collection (Menu, Message, Table) can be rolled back independently since they do not import from each other.

---

## Notes for AI Agents

- **Migration order recommendation**: Start with the simplest subcomponents in each group (MenuHeader, MenuMenu, MessageContent, MessageItem, TableBody, TableFooter), then work up to the root components (Menu, Message, Table). This minimizes forward reference issues.

- **Menu's `useAutoControlledValue`**: This hook follows the controlled/uncontrolled pattern. It accepts `state` (controlled), `defaultState` (uncontrolled initial), and `initialState` (fallback). The hook is already migrated in Phase 15. The return type is `[value, setValue]` similar to `useState`.

- **MenuItem's icon class logic** is subtle: `getKeyOnly(icon === true || (icon && !(name || content)), 'icon')`. This means the `icon` CSS class is applied when: (a) `icon` is literally `true`, OR (b) `icon` is truthy AND neither `name` nor `content` is provided. This handles the "icon-only menu item" case.

- **MenuItem's text fallback**: `childrenUtils.isNil(content) ? _.startCase(name) : content`. The `_.startCase` converts `'aboutUs'` to `'About Us'`. Consider keeping lodash for this specific usage or extracting a simple `startCase` utility.

- **Table's shorthand rendering** is the most complex in this phase. The `headerShorthandOptions = { defaultProps: { cellAs: 'th' } }` pattern passes through to TableRow.create, which then passes `cellAs` to each TableCell. This chain must be preserved.

- **TableFooter is a delegation component**: It renders `<TableHeader {...rest} as={as} ref={ref} />`, not its own markup. After migration, it simply passes all unhandled props to the migrated TableHeader with a default `as='tfoot'`.

- **TableHeaderCell is also a delegation component**: It renders `<TableCell {...rest} as={as} className={classes} ref={ref} />` -- all actual cell logic is in TableCell. It only adds the `sorted` class.

- **Message's `icon` prop has dual behavior**: As a boolean (`icon={true}`), it only adds the `'icon'` CSS class. As shorthand (`icon='checkmark'`), it adds the class AND renders an Icon component. The render logic `Icon.create(icon, { autoGenerateKey: false })` handles this because `Icon.create` returns null for boolean `true`.

- **`createHTMLParagraph`**: Used by Message for the `content` prop. This is a lib utility that wraps string content in a `<p>` tag. Ensure it is available from the migrated lib.

- **Approximately 16 components**: Menu (4) + Message (5: Message, MessageContent, MessageHeader, MessageItem, MessageList) + Table (7: Table, TableBody, TableCell, TableFooter, TableHeader, TableHeaderCell, TableRow) = 16 total. This is a large phase -- consider splitting into sub-PRs if needed.
