import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ReplIo } from '../runner/types.ts'
import { createCliRenderer, type CliRenderer } from '@opentui/core'
import { memoize } from '../../decorators.ts'
import { createOpenTuiRunner } from '../runner.ts'
import { DataStore } from './data-store.ts'
import { KeyboardListener } from './interactions/keyboard-listener.ts'
import { Layout } from './layout.ts'
import { Panels } from './panels.ts'
import { Subscriptions } from './subscriptions.ts'

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

  view(renderer: CliRenderer) {
    const layout = new Layout(renderer, new Panels())
    const listeners = this.listeners(renderer, layout)
    layout.mount()
    listeners.forEach((listener) => listener.listen())
    renderer.once('destroy', () => this.dispose(listeners))
  }

  @memoize
  model() {
    return new DataStore({ applicationData: this.applicationData })
  }

  private listeners(renderer: CliRenderer, layout: Layout) {
    return [
      new Subscriptions(this.model(), layout, new Panels()),
      new KeyboardListener(renderer, this.model()),
    ]
  }

  // Once the renderer is gone nothing may redraw or read keys.
  private dispose(listeners: readonly { dispose(): void }[]) {
    listeners.forEach((listener) => listener.dispose())
  }
}

export const runInstallTui = (applicationData: ApplicationData, io: ReplIo) => {
  return new InstallTuiRunner(applicationData, io).run()
}
