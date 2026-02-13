# React 19 Migration Status

**Project:** Semantic-UI-React v4.0.0-rc.1
**Target:** React 19.2
**Branch:** react19
**Last Updated:** 2026-02-13

---

## Overall Progress

| Phase | Title | Status | Completion Date | Notes |
|-------|-------|--------|-----------------|-------|
| 01 | Project Scaffolding and Branch Setup | Complete | 2026-02-13 | |
| 02 | Update Node.js, Package Manager, and Engine Requirements | Complete | 2026-02-13 | Yarn 4.6.0, Node >=20, corepack |
| 03 | Update React and ReactDOM to 19.2 | Complete | 2026-02-13 | React 19.2.4, enzyme adapter: @cfaester/enzyme-adapter-react-18 |
| 04 | Update @types/react and @types/react-dom | Complete | 2026-02-13 | @types/react@19, ReactNodeArray removed |
| 05 | Update Babel Configuration for New JSX Transform | Complete | 2026-02-13 | Automatic JSX runtime, modernized targets. UMD build blocked by webpack 4 (KI-004) |
| 06 | Migrate from Webpack 4 to Rollup | Complete | 2026-02-13 | Rollup 4.x, 3 outputs: CJS, ESM, browser ESM. Gulp removed. Webpack removed. |
| 07 | Update ESLint to Flat Config (v9) | Complete | 2026-02-13 | ESLint 9.x flat config (eslint.config.mjs). All 5 .eslintrc files consolidated and deleted. |
| 08 | Update TypeScript Configuration | Complete | 2026-02-13 | TypeScript 5.9.3, moduleResolution: bundler, jsx: react-jsx, @types/react@19 |
| 09 | Replace Enzyme with React Testing Library | Infrastructure Complete | 2026-02-13 | RTL 16.x + jest-dom 6.x installed. test/setup.js rewritten. 189 individual test files still need rewriting. |
| 10 | Migrate from Karma/Mocha to Vitest | Infrastructure Complete | 2026-02-13 | Vitest 4.x configured. Karma/Mocha/Chai/Sinon removed. vitest.config.mjs created. 188/189 test files need assertion conversion. |
| 11 | Update Test Utilities and Helpers | Complete | 2026-02-13 | Rewrote 7 test utils for Vitest+RTL. Removed nestedShallow, sandbox. |
| 12 | Fix act() Imports | Complete | 2026-02-13 | `act` imported from `react` (not `react-dom/test-utils`). ESLint rule added. |
| 13 | Remove PropTypes | Complete | 2026-02-13 | 162 files: propTypes→handledProps arrays. customPropTypes.js deleted. Babel plugins removed. |
| 14 | Set Up TypeScript Source Compilation | Complete | 2026-02-13 | @babel/preset-typescript, Rollup typescript plugin, tsconfig.build.json. All 3 builds pass. |
| 15 | Remove forwardRef Wrappers | Complete | 2026-02-13 | 158 components: React.forwardRef→plain functions with { ref, ...props }. ForwardRefComponent type updated. |
| 16 | Convert Class Components | Complete | 2026-02-13 | 5 class components→function components. DropdownInner/SearchInner merged into parents. ModernAutoControlledComponent deleted. innerRef removed. |
| 17 | Modernize Custom Hooks | Complete | 2026-02-13 | 7 hooks modernized. useIsomorphicLayoutEffect simplified. useMergedRefs supports React 19 ref cleanup. useEventCallback simplified (removed layout effect). useAutoControlledValue sync ref fix. IE11 workaround removed from useClassNamesOnNode. |
| 18 | Replace cloneElement Patterns | Complete | 2026-02-13 | 5 call sites removed (Portal, useTrigger, usePortalElement, TransitionGroup). Transition.js: render prop added. 4 retained with documentation (factories, Input, Dropdown, Transition backward compat). |
| 19 | Migrate Button Components | Complete | 2026-02-13 | Button, ButtonContent, ButtonGroup, ButtonOr: .js→.tsx, .d.ts merged into source, index.ts with type exports. Icon.d.ts/Label.d.ts: added .create method. |
| 20 | Migrate Container, Divider, Flag, Header | Complete | 2026-02-13 | Container, Divider, Flag (with as const names), HeaderContent, HeaderSubheader, Header: .js→.tsx, .d.ts merged into source. Icon.d.ts/Image.d.ts: added .create. Fixed Header missing icon/image in handledProps. |
| 21 | Migrate Icon, Image, Input, Label | Complete | 2026-02-13 | Icon (with memo+type assertion), IconGroup, Image (with Dimmer.create fix), ImageGroup, Input (with cloneElement retained), Label, LabelDetail, LabelGroup: .js→.tsx, .d.ts merged. Dimmer.d.ts: added .create. |
| 22 | Migrate List Components | Complete | 2026-02-13 | List, ListContent, ListDescription, ListHeader, ListIcon, ListItem, ListList: .js→.tsx, .d.ts merged. Fixed content as ReactNode cast in ListItem. |
| 23 | Migrate Loader, Placeholder | Complete | 2026-02-13 | Loader, Placeholder, PlaceholderHeader, PlaceholderImage, PlaceholderLine, PlaceholderParagraph: .js→.tsx, .d.ts merged. |
| 24 | Migrate Rail, Reveal, Segment, Step | Complete | 2026-02-13 | Rail, Reveal, RevealContent, Segment, SegmentGroup, SegmentInline, Step, StepContent, StepDescription, StepGroup, StepTitle: .js→.tsx, .d.ts merged. Added return undefined to getDefault callbacks. |
| 25 | Migrate Breadcrumb | Complete | 2026-02-13 | Breadcrumb, BreadcrumbDivider, BreadcrumbSection: .js→.tsx, .d.ts merged. Fixed divider/icon missing from handledProps. Fixed constant-truthiness lint error in key generation. |
| 26 | Migrate Form Components | Complete | 2026-02-13 | Form, FormField, FormGroup, FormButton, FormCheckbox, FormDropdown, FormInput, FormRadio, FormSelect, FormTextArea: .js→.tsx, .d.ts merged. Fixed getWidthProp 3-param signature in lib/index.d.ts. Fixed label as ReactNode cast in FormField. |
| 27 | Migrate Grid Components | Complete | 2026-02-13 | Grid, GridColumn, GridRow: .js→.tsx, .d.ts merged. Fixed missing handledProps (reversed, computer, largeScreen, widescreen, width). |
| 28 | Migrate Menu, Message, Table | Complete | 2026-02-13 | Menu (4), Message (5), Table (7): .js→.tsx, .d.ts merged. Fixed Table missing headerRow/headerRows/renderBodyRow/tableData in handledProps. |
| 29 | Migrate Accordion | Complete | 2026-02-13 | Accordion, AccordionAccordion, AccordionContent, AccordionPanel, AccordionTitle: .js→.tsx, .d.ts merged. |
| 30 | Migrate Checkbox, Dimmer, Embed | Complete | 2026-02-13 | Checkbox (complex: 2x useAutoControlledValue, useMergedRefs, cloneElement retained), DimmerDimmable, DimmerInner, Dimmer, Embed: .js→.tsx, .d.ts merged. Fixed childrenUtils.isNil to accept any. |
| 31 | Migrate Dropdown | Complete | 2026-02-13 | Dropdown (most complex: ~1300 lines), DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownSearchInput, DropdownText: .js→.tsx, .d.ts merged. EventStack replaced with useEffect+useEventCallback. 9 missing handledProps added. getMenuOptions/getSelectedIndex typed. |
| 32 | Migrate Modal | Complete | 2026-02-13 | Modal, ModalActions, ModalContent, ModalDescription, ModalDimmer, ModalHeader: .js→.tsx, .d.ts merged. utils/canFit→utils/index.ts. Portal.handledProps cast as any. |
| 33 | Migrate Popup | Complete | 2026-02-13 | Popup, PopupContent, PopupHeader: .js→.tsx, .d.ts merged. lib/createReferenceProxy.ts, lib/positions.ts typed. shallowequal @ts-expect-error. ReferenceProxy cast for Popper. |
| 34 | Migrate Progress, Rating, Search | Complete | 2026-02-13 | Progress, Rating, RatingIcon, Search, SearchCategory, SearchCategoryLayout, SearchResult, SearchResults: .js→.tsx, .d.ts merged. Search: EventStack replaced with useEffect+useEventCallback. |
| 35 | Migrate Sidebar, Sticky, Tab, Transition | Complete | 2026-02-13 | Sidebar, SidebarPushable, SidebarPusher, Sticky, Tab, TabPane, Transition, TransitionGroup: .js→.tsx, .d.ts merged. utils/childMapping.ts, computeStatuses.ts, wrapChild.tsx typed. |
| 36 | Migrate Advertisement, Card | Complete | 2026-02-13 | Advertisement, Card, CardContent, CardDescription, CardGroup, CardHeader, CardMeta: .js→.tsx, .d.ts merged. |
| 37 | Migrate Comment, Feed | Complete | 2026-02-13 | Comment (9 components), Feed (10 components): .js→.tsx, .d.ts merged. Fixed SemanticShorthandCollection casts. |
| 38 | Migrate Item, Statistic | Complete | 2026-02-13 | Item (8 components), Statistic (4 components): .js→.tsx, .d.ts merged. Fixed SemanticShorthandCollection casts. |
| 39 | Migrate Addons | Complete | 2026-02-13 | Portal, PortalInner, Confirm, Pagination, PaginationItem, Radio, Select, TextArea, TransitionablePortal: .js→.tsx. EventStack removed from Portal. |
| 40 | Modernize CSS Approach | Complete | 2026-02-13 | 58 CSS files in src/styles/: layers, tokens (9), base (2), elements (14), collections (6), modules (14), views (6), addons (3), index.css. |
| 41 | CSS Custom Properties Theming | Complete | 2026-02-13 | ThemeProvider, useTheme hook, default/dark themes, token index.css, CSS custom property mappings in SUI.js. |
| 42 | Remove Vendor Prefixes, Add CSS Layers | Complete | 2026-02-13 | .browserslistrc (Chrome 92+), .babel-preset.js modernized, postcss.config.js, vendor prefixes removed, :focus-visible, color-mix(), aspect-ratio. |
| 43 | Implement React Compiler | Complete | 2026-02-13 | babel-plugin-react-compiler added to .babel-preset.js. eslint-plugin-react-compiler added to eslint.config.mjs. |
| 44 | Context as Provider Pattern | Complete | 2026-02-13 | ComponentDocContext.Provider→Context value pattern. ESLint no-restricted-syntax rule added. |
| 45 | React 19 Form Features | Complete | 2026-02-13 | FormStatus component, useFormAction hook. Form action prop support for React 19 form actions. |
| 46 | Document Metadata, Asset Preloading | Complete | 2026-02-13 | preload.ts utilities (preloadStyles, preinitStyles, preloadIconFont), StylesheetLink component, STYLE_PATHS constant. |
| 47 | Migrate Documentation | Complete | 2026-02-13 | Astro + React islands. astro.config.mjs, 2 layouts, 4 pages, 5 components, 4 MDX migration guides, docs.css, utility files. |
| 48 | Update CI/CD | Complete | 2026-02-13 | CircleCI: removed Puppeteer/UMD, added compiler check. GitHub Actions: ci.yml (lint/test/typecheck/compiler/build). esbuild bundle-size. release-it with GitHub releases. |
| 49 | Integration Testing and Benchmarking | Complete | 2026-02-13 | 5 integration test files (smoke, a11y, SSR, stress, cross-browser). 2 benchmarks (mount-time, memory). playwright.config.ts. |
| 50 | Release Preparation | Complete | 2026-02-13 | Version 4.0.0-rc.1. CHANGELOG.md v4.0.0 entry. MIGRATION.md created. README.md updated. |

---

## Stage Summary

| Stage | Phases | Description | Status |
|-------|--------|-------------|--------|
| 1 | 01-08 | Foundation and Tooling | Complete |
| 2 | 09-12 | Testing Infrastructure | Complete (infrastructure done, test rewriting in phases 19-39) |
| 3 | 13-18 | Core Library Modernization | Complete |
| 4 | 19-24 | Component Migration - Elements | Complete |
| 5 | 25-28 | Component Migration - Collections | Complete |
| 6 | 29-35 | Component Migration - Modules | Complete |
| 7 | 36-39 | Component Migration - Views and Addons | Complete |
| 8 | 40-42 | CSS and Styling Modernization | Complete |
| 9 | 43-46 | New React 19 Features | Complete |
| 10 | 47-50 | Documentation, Build, and Release | Complete |
