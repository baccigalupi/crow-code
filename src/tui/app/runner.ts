import type { ApplicationData } from '../../application-data/application-data.ts'
import { createRunner } from '../runner.ts'
import type { ReplIo } from '../types.ts'

// The repl command's only way into the chat TUI, mirroring the install
// runner: the application data stays here, and only the runtime reaches Ink.
export const runReplTui = (
  applicationData: ApplicationData,
  io: ReplIo = {},
) => {
  return createRunner(applicationData.runtime, io)
}
