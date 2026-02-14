import * as React from 'react'

// childrenUtils
export declare const childrenUtils: {
  isNil(children: any): boolean
  [key: string]: any
}

// classNameBuilders
export declare function getKeyOnly(val: any, key: string): string | undefined
export declare function getKeyOrValueAndKey(val: any, key: string): string | undefined
export declare function getValueAndKey(val: any, key: string): string | undefined
export declare function getMultipleProp(val: any, key: string): string | undefined
export declare function getTextAlignProp(val: any): string | undefined
export declare function getVerticalAlignProp(val: any): string | undefined
export declare function getWidthProp(val: any, widthClass?: string | null, canEqual?: boolean): string | undefined

// factories
export declare function createShorthand(
  Component: any,
  mapValueToProps: (val: any) => Record<string, any>,
  val: any,
  options?: Record<string, any>,
): React.ReactElement | null
export declare function createShorthandFactory(
  Component: any,
  mapValueToProps: (val: any) => Record<string, any>,
): (val: any, options?: Record<string, any>) => React.ReactElement | null
export declare function createHTMLDivision(...args: any[]): React.ReactElement | null
export declare function createHTMLIframe(...args: any[]): React.ReactElement | null
export declare function createHTMLImage(...args: any[]): React.ReactElement | null
export declare function createHTMLInput(...args: any[]): React.ReactElement | null
export declare function createHTMLLabel(...args: any[]): React.ReactElement | null
export declare function createHTMLParagraph(...args: any[]): React.ReactElement | null

// getComponentType
export declare function getComponentType(props: Record<string, any>, options?: Record<string, any>): React.ElementType

// getUnhandledProps
export declare function getUnhandledProps(Component: any, props: Record<string, any>): Record<string, any>

// htmlPropsUtils
export declare const htmlInputAttrs: string[]
export declare const htmlInputEvents: string[]
export declare const htmlInputProps: string[]
export declare const htmlImageProps: string[]
export declare function partitionHTMLProps(props: Record<string, any>, options?: Record<string, any>): [Record<string, any>, Record<string, any>]

// Other utilities
export declare function isBrowser(): boolean
export declare function doesNodeContainClick(node: any, e: any): boolean
export declare function leven(a: string, b: string): number
export declare function createPaginationItems(options: any): any
export declare const SUI: {
  COLORS: string[]
  FLOATS: string[]
  SIZES: string[]
  TEXT_ALIGNMENTS: string[]
  VERTICAL_ALIGNMENTS: string[]
  WIDTHS: number[]
  DIRECTIONAL_TRANSITIONS: string[]
  [key: string]: any
}
export declare const numberToWordMap: Record<number, string>
export declare function numberToWord(num: number): string
export declare function normalizeTransitionDuration(duration: any, type?: string): number
export declare function objectDiff(a: Record<string, any>, b: Record<string, any>): Record<string, any>
export declare function isRefObject(obj: any): boolean

// makeDebugger
export declare function makeDebugger(name: string): (...args: any[]) => void

// Hooks
export declare function useAutoControlledValue(options: {
  state?: any
  defaultState?: any
  initialState?: any
}): [any, (value: any) => void]
export declare function useClassNamesOnNode(node: any, className: string): void
export declare function useEventCallback<T extends (...args: any[]) => any>(fn: T): T
export declare function useForceUpdate(): () => void
export declare const useIsomorphicLayoutEffect: typeof React.useEffect
export declare function useMergedRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> & { current: T | null }
export declare function setRef<T>(ref: React.Ref<T> | undefined, value: T): void
export declare function usePrevious<T>(value: T): T | undefined
