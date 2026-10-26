import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ReplIo } from '../runner/types.ts'
import type { UserInputStore } from './types.ts'
import { createElement } from 'react'
import { createCliRenderer } from '@opentui/core'
import { memoize } from '../../decorators.ts'
import { createOpenTuiRunner } from '../runner.ts'
import { RunAll } from './complete-setup-operations/run-all.ts'
import { userInputStore as sharedUserInputStore } from './interactions/state/config-text.ts'
import { InstallApp } from './views/install-app.tsx'

// The install command's only way into the install TUI. Setup completion is
// wired to the shared installer state here, in a plain module outside the
// views, so no view, hook or keypress ever sees the filesystem or the tasks.
export class InstallTuiRunner {
  private applicationData: ApplicationData
  private io: ReplIo
  private userInputStore: UserInputStore

  constructor(
    applicationData: ApplicationData,
    io: ReplIo,
    userInputStore: UserInputStore,
  ) {
    this.applicationData = applicationData
    this.io = io
    this.userInputStore = userInputStore
  }

  run() {
    this.runAll().subscribe()
    return createOpenTuiRunner(
      this.applicationData,
      this.io,
      this.view.bind(this),
      createCliRenderer,
    )
  }

  view() {
    return createElement(InstallApp, {
      userInputStore: this.userInputStore,
      taskStates: this.runAll().taskStates(),
    })
  }

  @memoize
  private runAll() {
    const { applicationData, userInputStore } = this
    return new RunAll({
      applicationData,
      operationArguments: { userInputStore },
    })
  }
}

export const runInstallTui = (
  applicationData: ApplicationData,
  io: ReplIo,
  userInputStore: UserInputStore = sharedUserInputStore,
) => {
  return new InstallTuiRunner(applicationData, io, userInputStore).run()
}
