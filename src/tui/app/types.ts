import type { ChatSession } from './interactions/state/chat-session.ts'
import type { InputBuffer } from '../types.ts'

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

export type AppProps = {
  readonly session?: ChatSession
}
