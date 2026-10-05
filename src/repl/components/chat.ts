import { logViewer } from '@ismail-elkorchi/terminal-ui'
import type { Element } from '@ismail-elkorchi/terminal-ui/components'
import type { LogViewerTransition } from '@ismail-elkorchi/terminal-ui/behavior'
import type { ReplMessage, ReplState } from '../types.ts'

export const chatElement = (state: ReplState): Element<ReplMessage> =>
  logViewer<ReplMessage>({
    id: 'chat',
    history: state.history,
    wrap: true,
    scroll: state.chat.scroll,
    selection: state.chat.selection,
    foldedIds: state.chat.foldedIds,
    onTransition: (transition: LogViewerTransition) => ({
      kind: 'chatTransition' as const,
      transition,
    }),
    meta: { focus: { disabled: true } },
  })
