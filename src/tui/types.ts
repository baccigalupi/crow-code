import type { Keypress } from './keypress.ts'

export interface InputText {
  readonly text: string
  readonly cursor: number
}

export type CursorMove = 'left' | 'right' | 'home' | 'end'

export type ExitApp = () => void

// What a controller says a key meant; the Navigator applies it.
export type Outcome<Name extends string> =
  'stay' | 'next' | 'cancel' | 'exit' | { readonly goTo: Name }

export type Controller<Name extends string> = {
  handle(keypress: Keypress): Outcome<Name>
}

export type PanelFlow<Name extends string> = {
  readonly controller: Controller<Name>
  readonly next?: Name
  readonly cancel?: Name
}

export type NavigatorArguments<Name extends string> = {
  readonly initial: Name
  readonly panels: Readonly<Record<string, PanelFlow<Name>>>
}

export type KeyFlags = {
  readonly ctrl?: boolean
  readonly shift?: boolean
  readonly meta?: boolean
  readonly return?: boolean
  readonly tab?: boolean
  readonly backspace?: boolean
  readonly delete?: boolean
  readonly escape?: boolean
  readonly leftArrow?: boolean
  readonly rightArrow?: boolean
  readonly upArrow?: boolean
  readonly downArrow?: boolean
  readonly home?: boolean
  readonly end?: boolean
}
