import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ReplIo } from '../runner/types.ts'
import type { InstallStore } from './types.ts'
import { createCliRenderer } from '@opentui/core'
import { createOpenTuiRunner } from '../runner.ts'
import { CompleteSetup } from './setup/complete-setup.ts'
import { installStore } from './interactions/state/config-text.ts'
import { InstallApp } from './views/install-app.tsx'

// The install command's only way into the install TUI. Setup completion is
// wired to the shared installer state here, in a plain module outside the
// views, so no view, hook or keypress ever sees the filesystem or the tasks.
export const runInstallTui = (
  applicationData: ApplicationData,
  io: ReplIo,
  store: InstallStore = installStore,
) => {
  new CompleteSetup({ applicationData, installData: store }).subscribe()
  return createOpenTuiRunner(applicationData, io, InstallApp, createCliRenderer)
}
