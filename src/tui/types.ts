import type { Key, RenderOptions } from 'ink'
import type { ChatSession } from './interactions/state/chat-session.ts'

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

export type AppProps = {
  readonly session?: ChatSession
}

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
    | 'leftArrow'
    | 'rightArrow'
    | 'home'
    | 'end'
  >
>

export type ReplIo = Pick<RenderOptions, 'stdin' | 'stdout' | 'stderr'>

export type ReplStatus = 'completed' | 'cancelled' | 'interrupted'
