# Phase 37: Migrate Comment, Feed and Subcomponents

| Field          | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Phase ID**   | PHASE-37                                                              |
| **Title**      | Migrate Comment, Feed and Subcomponents                               |
| **Stage**      | 7 -- Component Migration - Views & Addons                             |
| **Dependencies** | Phase 15 (TypeScript Foundation -- shared types and generics)        |
| **Complexity** | Low                                                                   |
| **Scope**      | 2 view families totaling 19 components (9 Comment, 10 Feed), all presentational functional components, TypeScript conversion only |

---

## Objective

Convert the Comment and Feed view components and all their subcomponents from JavaScript to TypeScript. This is the largest batch of components in a single phase by count (19 components), but all are simple presentational functional components following identical patterns. No architectural changes, state management, or hook conversions are needed. This phase is a mechanical TypeScript conversion with type definition consolidation.

---

## Background

### Comment (`src/views/Comment/`)

Comment has 8 subcomponents for a total of 9 components. The root `Comment` component is a minimal wrapper:

```javascript
const Comment = React.forwardRef(function (props, ref) {
  const { className, children, collapsed, content } = props
  const classes = cx(getKeyOnly(collapsed, 'collapsed'), 'comment', className)
  const rest = getUnhandledProps(Comment, props)
  const ElementType = getComponentType(props)
  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
})
```

All 8 subcomponents follow this exact same pattern with minor variations:

1. **Comment** -- root wrapper with `collapsed` prop
2. **CommentAction** -- clickable action link (has `active` prop and `onClick` handler)
3. **CommentActions** -- wrapper for action links
4. **CommentAuthor** -- displays author name (has `as: 'a'` default)
5. **CommentAvatar** -- displays author avatar (uses `createHTMLImage` shorthand for `src` prop)
6. **CommentContent** -- wrapper for comment body
7. **CommentGroup** -- groups comments (has `collapsed`, `minimal`, `threaded` props)
8. **CommentMetadata** -- displays timestamp/metadata
9. **CommentText** -- displays comment text body

All use `React.forwardRef`, `getUnhandledProps`, `getComponentType`, and the `children ?? content` pattern. None have state, effects, or refs beyond the forwarded ref.

### Feed (`src/views/Feed/`)

Feed has 9 subcomponents for a total of 10 components. The root `Feed` component has slightly more logic than Comment because it supports an `events` shorthand array:

```javascript
const eventElements = _.map(events, (eventProps) => {
  const { childKey, date, meta, summary, ...eventData } = eventProps
  const finalKey = childKey ?? [date, meta, summary].join('-')
  return <FeedEvent date={date} key={finalKey} meta={meta} summary={summary} {...eventData} />
})
```

There is a `TODO` comment at line 40: `// TODO: use .create() factory` for the FeedEvent creation.

Feed subcomponents:

1. **Feed** -- root wrapper with `events` shorthand and `size` prop
2. **FeedContent** -- wrapper for event content (has `content`, `date`, `extraImages`, `extraText`, `meta`, `summary` shorthand props)
3. **FeedDate** -- displays date (has `content` shorthand)
4. **FeedEvent** -- displays a single event (has `content`, `date`, `extraImages`, `extraText`, `icon`, `image`, `meta`, `summary` shorthand props)
5. **FeedExtra** -- displays extra content (has `images` array prop for image rendering, `text` prop)
6. **FeedLabel** -- displays an icon or image label (has `content`, `icon`, `image` shorthand)
7. **FeedLike** -- displays like count (has `content`, `icon` shorthand)
8. **FeedMeta** -- displays meta information (has `content`, `like` shorthand)
9. **FeedSummary** -- displays event summary (has `content`, `date`, `user` shorthand)
10. **FeedUser** -- displays user link (default `as: 'a'`)

FeedContent and FeedEvent are the most complex subcomponents because they compose multiple other subcomponents via shorthand. FeedExtra has a unique `images` prop that renders an array of `<img>` elements.

All Feed subcomponents use `React.forwardRef`, `getUnhandledProps`, `getComponentType`, and the standard rendering pattern.

---

## Detailed Tasks

### 1. Convert Comment.js to Comment.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\Comment.js` to `Comment.tsx`:

- Define `CommentProps` interface:
  ```typescript
  export interface CommentProps extends StrictCommentProps {
    [key: string]: any
  }
  export interface StrictCommentProps {
    as?: React.ElementType
    children?: React.ReactNode
    className?: string
    collapsed?: boolean
    content?: React.ReactNode
  }
  ```
- Declare static subcomponent properties

### 2. Convert CommentAction.js to CommentAction.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentAction.js` to `CommentAction.tsx`:

- Define `CommentActionProps` interface with `active` and `onClick` props
- Type the click handler

### 3. Convert CommentActions.js to CommentActions.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentActions.js` to `CommentActions.tsx`:

- Define `CommentActionsProps` interface

### 4. Convert CommentAuthor.js to CommentAuthor.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentAuthor.js` to `CommentAuthor.tsx`:

- Define `CommentAuthorProps` interface

### 5. Convert CommentAvatar.js to CommentAvatar.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentAvatar.js` to `CommentAvatar.tsx`:

- Define `CommentAvatarProps` interface with `src` prop
- Type the `createHTMLImage` shorthand usage

### 6. Convert CommentContent.js to CommentContent.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentContent.js` to `CommentContent.tsx`:

- Define `CommentContentProps` interface

### 7. Convert CommentGroup.js to CommentGroup.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentGroup.js` to `CommentGroup.tsx`:

- Define `CommentGroupProps` interface with `collapsed`, `minimal`, `threaded` props

### 8. Convert CommentMetadata.js to CommentMetadata.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentMetadata.js` to `CommentMetadata.tsx`:

- Define `CommentMetadataProps` interface

### 9. Convert CommentText.js to CommentText.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentText.js` to `CommentText.tsx`:

- Define `CommentTextProps` interface

### 10. Convert Feed.js to Feed.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\Feed.js` to `Feed.tsx`:

- Define `FeedProps` interface:
  ```typescript
  export interface FeedProps extends StrictFeedProps {
    [key: string]: any
  }
  export interface StrictFeedProps {
    as?: React.ElementType
    children?: React.ReactNode
    className?: string
    events?: SemanticShorthandCollection<FeedEventProps>
    size?: 'small' | 'large'
  }
  ```
- Type the `events` mapping with proper `FeedEventProps` type
- Replace `_.map` with `events.map` where applicable
- Declare static subcomponent properties

### 11. Convert FeedContent.js to FeedContent.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedContent.js` to `FeedContent.tsx`:

- Define `FeedContentProps` interface with shorthand props: `content`, `date`, `extraImages`, `extraText`, `meta`, `summary`
- Type shorthand factory calls for sub-components

### 12. Convert FeedDate.js to FeedDate.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedDate.js` to `FeedDate.tsx`:

- Define `FeedDateProps` interface

### 13. Convert FeedEvent.js to FeedEvent.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedEvent.js` to `FeedEvent.tsx`:

- Define `FeedEventProps` interface with all shorthand props
- Type shorthand factory calls

### 14. Convert FeedExtra.js to FeedExtra.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedExtra.js` to `FeedExtra.tsx`:

- Define `FeedExtraProps` interface with `images` (array) and `text` props
- Type the images array rendering: `_.map(images, (image, index) => createHTMLImage(image, ...))`

### 15. Convert FeedLabel.js to FeedLabel.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedLabel.js` to `FeedLabel.tsx`:

- Define `FeedLabelProps` interface with `content`, `icon`, `image` shorthand props

### 16. Convert FeedLike.js to FeedLike.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedLike.js` to `FeedLike.tsx`:

- Define `FeedLikeProps` interface with `content`, `icon` shorthand props

### 17. Convert FeedMeta.js to FeedMeta.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedMeta.js` to `FeedMeta.tsx`:

- Define `FeedMetaProps` interface with `content`, `like` shorthand props

### 18. Convert FeedSummary.js to FeedSummary.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedSummary.js` to `FeedSummary.tsx`:

- Define `FeedSummaryProps` interface with `content`, `date`, `user` shorthand props

### 19. Convert FeedUser.js to FeedUser.tsx

Rename `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedUser.js` to `FeedUser.tsx`:

- Define `FeedUserProps` interface

### 20. Consolidate type definitions

Delete all separate `.d.ts` files for both Comment and Feed:

Comment (10 files to delete):
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\Comment.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentAction.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentActions.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentAuthor.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentAvatar.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentContent.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentGroup.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentMetadata.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\CommentText.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\index.d.ts`

Feed (11 files to delete):
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\Feed.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedContent.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedDate.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedEvent.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedExtra.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedLabel.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedLike.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedMeta.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedSummary.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\FeedUser.d.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\index.d.ts`

Rename index files:
- `J:\code\semantic\Semantic-UI-React\src\views\Comment\index.js` to `index.ts`
- `J:\code\semantic\Semantic-UI-React\src\views\Feed\index.js` to `index.ts`

### 21. Update tests

- Update imports for new file extensions
- Verify all Comment subcomponents render correctly
- Verify Comment `collapsed` prop works
- Verify Feed `events` shorthand rendering
- Verify FeedExtra `images` array rendering
- Verify FeedUser renders as `<a>` by default
- Ensure all TypeScript types are correctly exported

---

## Files Affected

| File | Action |
|------|--------|
| `src/views/Comment/Comment.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentAction.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentActions.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentAuthor.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentAvatar.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentContent.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentGroup.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentMetadata.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/CommentText.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Comment/index.js` | RENAME to `.ts` |
| `src/views/Feed/Feed.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedContent.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedDate.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedEvent.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedExtra.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedLabel.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedLike.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedMeta.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedSummary.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/FeedUser.js` | RENAME to `.tsx`, MODIFY |
| `src/views/Feed/index.js` | RENAME to `.ts` |
| 21 `.d.ts` files | DELETE |

**Total: 21 files renamed/modified, 21 files deleted**

---

## Acceptance Criteria

- [ ] All 9 Comment components compile as TypeScript without errors
- [ ] All 10 Feed components compile as TypeScript without errors
- [ ] Comment `collapsed` prop adds `collapsed` CSS class
- [ ] CommentAction `active` prop adds `active` CSS class
- [ ] CommentAvatar `src` shorthand renders an image
- [ ] CommentGroup `threaded` and `minimal` props add correct classes
- [ ] Feed `events` shorthand array renders FeedEvent components with correct keys
- [ ] Feed `size` prop adds size class
- [ ] FeedExtra `images` array renders `<img>` elements
- [ ] FeedExtra `text` prop adds `text` CSS class
- [ ] FeedLabel `icon` and `image` shorthand render correctly
- [ ] FeedUser renders as `<a>` by default
- [ ] All existing tests pass
- [ ] Types are correctly exported for consumer usage
- [ ] No separate `.d.ts` files remain

---

## Rollback Strategy

1. All changes tracked in git. To rollback: `git checkout HEAD -- src/views/Comment/ src/views/Feed/`
2. Every component in this phase is a pure presentational component. Rollback risk is near zero.
3. Components can be reverted individually since they have no inter-dependencies beyond parent-child composition.

---

## Notes for AI Agents

1. **This phase has the highest component count (19) but the lowest complexity.** Every component follows the same pattern. Create a template transformation and apply it mechanically to all components.

2. **The transformation template for simple presentational components is:**
   - Add TypeScript interface with `StrictXProps` and `XProps extends StrictXProps { [key: string]: any }`
   - Type the `React.forwardRef` generic parameters
   - Type destructured props from the interface
   - Replace `PropTypes` with the interface (retain PropTypes for runtime during migration)
   - Delete the `.d.ts` file

3. **Feed's `events` shorthand** does not use `FeedEvent.create()` factory -- it manually maps and creates JSX elements with `<FeedEvent .../>`. The TODO comment suggests this should use the factory. For this phase, preserve the current behavior and just add types. The factory migration can be a follow-up.

4. **FeedExtra has a unique `images` prop** that accepts an array and renders `<img>` elements via `createHTMLImage`. Type this as `SemanticShorthandCollection<HtmlImageProps>` or `Array<string | HtmlImageProps>`.

5. **CommentAvatar uses `createHTMLImage`** for the `src` prop. This is a shorthand that creates an `<img>` element. Type the `src` prop as `SemanticShorthandItem<HtmlImageProps>`.

6. **The `as` prop default varies per component.** Most default to `'div'`. CommentAuthor defaults to `'a'`. FeedUser defaults to `'a'`. Make sure the default `as` is reflected in the type definition.

7. **Parallelization opportunity:** All 19 component conversions are independent. If working with multiple AI agents, each can convert a different component simultaneously. The only ordering constraint is that parent components (Comment, Feed) should import their typed children, so convert children first.

8. **The `createShorthandFactory` static methods** exist on some subcomponents (e.g., `FeedDate.create`). These need to be preserved and typed. The factory is assigned as: `FeedDate.create = createShorthandFactory(FeedDate, (content) => ({ content }))`.

9. **Lodash usage is minimal in these components.** Most use only `_.invoke` for callbacks and `_.map` for array rendering. Replace with optional chaining (`props.onClick?.(e, props)`) and `Array.map` respectively.

10. **Feed has a `FeedUser` subcomponent** that is not `CommentUser` -- do not confuse the two view families. Each family is self-contained.
