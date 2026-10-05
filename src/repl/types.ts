import type {
  LogHistory,
  LogViewerTransition,
  ScrollableLogViewerState,
  TextAreaState,
  TextAreaTransition,
} from '@ismail-elkorchi/terminal-ui/behavior'
import type { TuiApp } from '@ismail-elkorchi/terminal-ui'

export interface ReplState {
  readonly input: TextAreaState
  readonly inputRows: number
  readonly history: LogHistory
  readonly chat: ScrollableLogViewerState
}

export type ReplMessage =
  | {
    readonly kind: 'inputTransition'
    readonly transition: TextAreaTransition
  }
  | { readonly kind: 'submit' }
  | { readonly kind: 'insertNewline' }
  | { readonly kind: 'resize' }
  | {
    readonly kind: 'chatTransition'
    readonly transition: LogViewerTransition
  }
  | { readonly kind: 'quit' }

export type ReplApp = TuiApp<ReplState, ReplMessage>

export type ReplStatus = 'completed' | 'cancelled' | 'interrupted'

export type ReplRun = () => Promise<ReplStatus>
