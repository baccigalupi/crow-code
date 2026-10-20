import { createElement } from 'react'
import type { ApplicationData } from '../../application-data/application-data.ts'
import { createTuiRunner } from '../tui-runner.ts'
import type { ReplIo } from '../types.ts'
import { chatSession } from './interactions/state.ts'
import type { ChatSession } from './interactions/state/chat-session.ts'
import { Agent } from './views/agent.tsx'

// The repl command's only way into the chat TUI, mirroring the install
// runner: the application data and chat state are wired here, and only the
// runtime reaches Ink.
export const runAgentTui = (
  applicationData: ApplicationData,
  io: ReplIo = {},
  state: ChatSession = chatSession,
) => {
  const { runtime } = applicationData
  return createTuiRunner(
    runtime,
    io,
    () => createElement(Agent, { session: state }),
  )
}
