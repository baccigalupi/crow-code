import type { ApplicationData } from '../../application-data/application-data.ts'
import { createTuiRunner } from '../tui-runner.ts'
import type { ReplIo } from '../types.ts'
import { writeCrowConfig } from './crow-config/write.ts'
import { installState } from './interactions/state/config-buffer.ts'
import type { InstallState } from './types.ts'
import { InstallApp } from './views/install-app.tsx'

// The install command's only way into the install TUI. The writer is wired
// to the shared installer state here, in a plain module outside the views, so
// no view, hook or keypress ever sees the filesystem or the writer.
export const runInstalltTui = (
  applicationData: ApplicationData,
  io: ReplIo = {},
  state: InstallState = installState,
) => {
  const { filesystem } = applicationData
  writeCrowConfig({ installData: state, filesystem }).subscribe()
  return createTuiRunner(applicationData, io, InstallApp)
}
