import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ReplIo } from '../runner/types.ts'
import { createCliRenderer, type CliRenderer } from '@opentui/core'
import { createRoot, flushSync } from '@opentui/react'
import { createElement } from 'react'
import { memoize } from '../../decorators.ts'
import { createOpenTuiRunner } from '../runner.ts'
import { InstallApp } from './app.tsx'
import { DataStore } from './data-store.ts'
import { KeyboardListener } from './interactions/listeners/keyboard-listener.ts'
import { Router } from './router.ts'

// The install command's only way into the install TUI. The data store is
// built here, before the view mounts, so no view or keypress ever sees the
// filesystem.
export class InstallTuiRunner {
  private applicationData: ApplicationData
  private io: ReplIo

  constructor(applicationData: ApplicationData, io: ReplIo) {
    this.applicationData = applicationData
    this.io = io
  }

  run() {
    return createOpenTuiRunner(
      this.applicationData,
      this.io,
      this.view.bind(this),
      createCliRenderer,
    )
  }

  // Mounts synchronously so the first frame is already drawn when keys
  // start. Destroying the renderer unmounts the app and ends key input.
  view(renderer: CliRenderer) {
    const app = createElement(InstallApp, {
      store: this.store(),
      router: new Router(),
    })
    flushSync(() => createRoot(renderer).render(app))
    new KeyboardListener(renderer, this.store()).listen()
  }

  @memoize
  store() {
    return new DataStore({ applicationData: this.applicationData })
  }
}

export const runInstallTui = (applicationData: ApplicationData, io: ReplIo) => {
  return new InstallTuiRunner(applicationData, io).run()
}
