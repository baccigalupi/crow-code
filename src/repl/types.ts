import type { Dispatch, SetStateAction } from 'react'
import type { Key, RenderOptions } from 'ink'

export interface InputBuffer {
  readonly text: string
  readonly cursor: number
}

export interface HistoryEntry {
  readonly id: string
  readonly text: string
}

export interface ReplState {
  readonly buffer: InputBuffer
  readonly inputRows: number
  readonly history: readonly HistoryEntry[]
}

export type SetReplState = Dispatch<SetStateAction<ReplState>>

export type AppViewModelArguments = {
  readonly stdout: NodeJS.WriteStream
  readonly state: ReplState
}

export type ChatViewModelArguments = {
  readonly history: readonly HistoryEntry[]
  readonly height: number
  readonly width: number
}

export type InputViewModelArguments = {
  readonly buffer: InputBuffer
  readonly height: number
}

export type CursorMove = 'left' | 'right' | 'home' | 'end'

export type ReplAction =
  | { readonly kind: 'insert'; readonly text: string }
  | { readonly kind: 'backspace' }
  | { readonly kind: 'delete' }
  | { readonly kind: 'move'; readonly to: CursorMove }
  | { readonly kind: 'newline' }
  | { readonly kind: 'submit' }
  | { readonly kind: 'resize' }
  | { readonly kind: 'quit' }

export type KeyFlags = Partial<
  Pick<
    Key,
    | 'ctrl'
    | 'shift'
    | 'meta'
    | 'return'
    | 'backspace'
    | 'delete'
    | 'leftArrow'
    | 'rightArrow'
    | 'home'
    | 'end'
  >
>

export type ReplIo = Pick<RenderOptions, 'stdin' | 'stdout' | 'stderr'>

export type ReplStatus = 'completed' | 'cancelled' | 'interrupted'
