import { visibleHistory } from '../interactions/visible-history.ts'
import type { ChatViewModelArguments, HistoryEntry } from '../types.ts'

const entryText = (entry: HistoryEntry) => {
  if (entry.text === '') return ' '

  return entry.text
}

const historyLine = (entry: HistoryEntry) => {
  return { id: entry.id, text: entryText(entry) }
}

export const chatViewModel = (
  { history, height, width }: ChatViewModelArguments,
) => {
  return {
    histories: visibleHistory(history, height, width).map(historyLine),
  }
}
