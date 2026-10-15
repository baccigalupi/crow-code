import type { Runtime } from '../../application-data/runtime.ts'
import { createRunner } from '../runner.ts'
import type { ReplIo } from '../types.ts'
import { writeCrowConfig } from './crow-config/write.ts'
import { installState } from './interactions/state/config-buffer.ts'
import { InstallApp } from './views/install-app.tsx'

// The install command's only way into the install TUI. The writer is wired
// to the shared wizard signals here, in a plain module outside the views, so
// no view, hook or keypress ever sees the runtime or the writer.
export const runInstalltTui = (runtime: Runtime, io: ReplIo = {}) => {
  writeCrowConfig({ signals: installState, runtime }).subscribe()
  return createRunner(io, InstallApp)
}
