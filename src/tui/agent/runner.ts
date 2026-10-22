import { createElement } from 'react'
import type { ApplicationData } from '../../application-data/application-data.ts'
import { createTuiRunner } from '../tui-runner.ts'
import type { ReplIo } from '../types.ts'
import { chatSession } from './interactions/state.ts'
import type { ChatSession } from './interactions/state/chat-session.ts'
import { Agent } from './views/agent.tsx'

// The repl command's only way into the chat TUI, mirroring the install
// runner: the application data goes to the TUI runner and the chat state to
// the view, so no view ever sees the application data.
export const runAgentTui = (
  applicationData: ApplicationData,
  io: ReplIo,
  state: ChatSession = chatSession,
) => {
  return createTuiRunner(applicationData, io, () =>
    createElement(Agent, { session: state }),
  )
}
