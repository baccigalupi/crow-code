import {
  createLogHistory,
  createScrollState,
  createTextAreaState,
} from '@ismail-elkorchi/terminal-ui/behavior'
import type { ScrollableLogViewerState } from '@ismail-elkorchi/terminal-ui/behavior'
import { createTextAreaRowOffsetMap } from '@ismail-elkorchi/terminal-ui'
import type { TextDocument } from '@ismail-elkorchi/terminal-ui/text'
import type { ReplState } from './types.ts'

export const inputRowCap = 8

export const measureInputRows = (
  document: TextDocument,
  columns: number,
): number => {
  const rows = createTextAreaRowOffsetMap({
    document,
    terminalWidth: columns,
    terminalRows: inputRowCap,
    wrap: { mode: 'soft' },
  }).rowCount
  return Math.max(1, Math.min(inputRowCap, rows))
}

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
