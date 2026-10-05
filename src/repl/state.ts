import {
  createLogHistory,
  createScrollState,
  createTextAreaState,
} from '@ismail-elkorchi/terminal-ui/behavior'
import type { ScrollableLogViewerState } from '@ismail-elkorchi/terminal-ui/behavior'
import type { ReplState } from './types.ts'

const initialChat = (): ScrollableLogViewerState => ({
  foldedIds: [],
  followTail: true,
  scroll: createScrollState({ followTail: true }),
})

export const initialReplState = (): ReplState => ({
  input: createTextAreaState({ value: '' }),
  inputRows: 1,
  history: createLogHistory([]),
  chat: initialChat(),
})
