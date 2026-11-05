export interface InputText {
  readonly text: string
  readonly cursor: number
}

export type CursorMove = 'left' | 'right' | 'home' | 'end'

export type NavigatorArguments<Name extends string> = {
  readonly initial: Name
  entered(name: Name): unknown
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
