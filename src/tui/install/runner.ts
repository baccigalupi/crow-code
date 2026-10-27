import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ReplIo } from '../runner/types.ts'
import { createElement } from 'react'
import { createCliRenderer } from '@opentui/core'
import { memoize } from '../../decorators.ts'
import { createOpenTuiRunner } from '../runner.ts'
import { DataStore } from './data-store.ts'
import { InstallApp } from './views/install-app.tsx'

// The install command's only way into the install TUI. The data store is
// built here, before the view mounts, so setup completion is listening from
// the start and no view, hook or keypress ever sees the filesystem.
export class InstallTuiRunner {
  private applicationData: ApplicationData
  private io: ReplIo

  constructor(applicationData: ApplicationData, io: ReplIo) {
    this.applicationData = applicationData
    this.io = io
  }

  run() {
    this.model().listen()
    return createOpenTuiRunner(
      this.applicationData,
      this.io,
      this.view.bind(this),
      createCliRenderer,
    )
  }

  view() {
    return createElement(InstallApp, { model: this.model() })
  }

  @memoize
  model() {
    return new DataStore({ applicationData: this.applicationData })
  }
}

export const runInstallTui = (applicationData: ApplicationData, io: ReplIo) => {
  return new InstallTuiRunner(applicationData, io).run()
}
