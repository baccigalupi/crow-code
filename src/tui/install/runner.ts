import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ReplIo } from '../runner/types.ts'
import type { InstallStore } from './types.ts'
import { createCliRenderer } from '@opentui/core'
import { createOpenTuiRunner } from '../runner.ts'
import { writeCrowConfig } from './crow-config/write.ts'
import { installStore } from './interactions/state/config-text.ts'
import { InstallApp } from './views/install-app.tsx'

// The install command's only way into the install TUI. The writer is wired
// to the shared installer state here, in a plain module outside the views, so
// no view, hook or keypress ever sees the filesystem or the writer.
export const runInstallTui = (
  applicationData: ApplicationData,
  io: ReplIo,
  store: InstallStore = installStore,
) => {
  const { filesystem } = applicationData
  writeCrowConfig({ installData: store, filesystem }).subscribe()
  return createOpenTuiRunner(applicationData, io, InstallApp, createCliRenderer)
}
