import type { Key, RenderOptions } from 'ink'

export interface InputBuffer {
  readonly text: string
  readonly cursor: number
}

export type CursorMove = 'left' | 'right' | 'home' | 'end'

export type ExitApp = () => void

export type KeyFlags = Partial<
  Pick<
    Key,
    | 'ctrl'
    | 'shift'
    | 'meta'
    | 'return'
    | 'backspace'
    | 'delete'
    | 'escape'
    | 'leftArrow'
    | 'rightArrow'
    | 'home'
    | 'end'
  >
>

export type ReplIo = Pick<RenderOptions, 'stdin' | 'stdout' | 'stderr'>

export type ReplStatus = 'completed' | 'cancelled' | 'interrupted'
