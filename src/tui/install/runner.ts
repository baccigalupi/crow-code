import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ReplIo } from '../runner/types.ts'
import { createCliRenderer, type CliRenderer } from '@opentui/core'
import { memoize } from '../../decorators.ts'
import { createOpenTuiRunner } from '../runner.ts'
import { DataStore } from './data-store.ts'
import { KeyboardListener } from './interactions/keyboard-listener.ts'
import { Subscriptions } from './subscriptions.ts'
import { InstallViewModels } from './view-models/install-view-models.ts'
import { InstallScreen } from './views/install-screen-view.ts'

// The install command's only way into the install TUI. The data store is
// built here, before the view mounts, so setup completion is listening from
// the start and no view or keypress ever sees the filesystem.
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

  view(renderer: CliRenderer) {
    const screen = new InstallScreen(renderer)
    const listeners = this.listeners(renderer, screen)
    screen.mount()
    listeners.forEach((listener) => listener.listen())
    renderer.once('destroy', () => this.dispose(listeners))
  }

  @memoize
  model() {
    return new DataStore({ applicationData: this.applicationData })
  }

  private viewModels() {
    return new InstallViewModels(this.model())
  }

  private listeners(renderer: CliRenderer, screen: InstallScreen) {
    return [
      new Subscriptions(this.model(), screen, this.viewModels()),
      new KeyboardListener(renderer, this.model()),
    ]
  }

  // Once the renderer is gone nothing may redraw, read keys or start setup.
  private dispose(listeners: readonly { dispose(): void }[]) {
    listeners.forEach((listener) => listener.dispose())
    this.model().dispose()
  }
}

export const runInstallTui = (applicationData: ApplicationData, io: ReplIo) => {
  return new InstallTuiRunner(applicationData, io).run()
}
