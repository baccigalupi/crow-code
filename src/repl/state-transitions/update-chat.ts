import {
  extractLogViewerSelectionText,
  logViewerReducer,
} from '@ismail-elkorchi/terminal-ui/behavior'
import type {
  LogHistory,
  LogViewerTransition,
  ScrollableLogViewerState,
} from '@ismail-elkorchi/terminal-ui/behavior'
import type { TuiUpdateResult } from '@ismail-elkorchi/terminal-ui'
import type {
  TuiEffect,
  TuiEffectContext,
} from '@ismail-elkorchi/terminal-ui/tui'
import type { ReplMessage, ReplState } from '../types.ts'

type ChatResult = TuiUpdateResult<ReplState, ReplMessage>

export const applyChatTransition = (
  state: ReplState,
  transition: LogViewerTransition,
): ChatResult => {
  const chat = logViewerReducer(state.chat, transition, {
    history: state.history,
  })
  return chatResult(state, chat, copyEffectFor(state.history, chat, transition))
}

const chatResult = (
  state: ReplState,
  chat: ScrollableLogViewerState,
  effect: TuiEffect<ReplMessage> | undefined,
): ChatResult => {
  if (effect === undefined) return { state: { ...state, chat } }
  else return { state: { ...state, chat }, effects: [effect] }
}

const copyEffectFor = (
  history: LogHistory,
  chat: ScrollableLogViewerState,
  transition: LogViewerTransition,
): TuiEffect<ReplMessage> | undefined => {
  if (transition.kind !== 'pointer') return undefined
  else if (transition.transition.kind !== 'endSelection') return undefined
  else return selectedCopyEffect(history, chat)
}

const selectedCopyEffect = (
  history: LogHistory,
  chat: ScrollableLogViewerState,
): TuiEffect<ReplMessage> | undefined => {
  const text = extractLogViewerSelectionText({
    history,
    selection: chat.selection,
  })
  if (text === undefined || text.length === 0) return undefined
  else return copyEffect(text)
}

const copyEffect = (text: string): TuiEffect<ReplMessage> => ({
  id: 'chat-selection-copy',
  concurrency: 'replace',
  run: (context) => copyText(context, text),
})

const copyText = async (
  context: TuiEffectContext,
  text: string,
): Promise<{ readonly kind: 'none' }> => {
  await context.copySelectedText({
    policy: { allowed: true },
    selection: { sourceId: 'chat', text },
  })
  return { kind: 'none' }
}
