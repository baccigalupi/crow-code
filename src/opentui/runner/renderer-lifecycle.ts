import type { CliRenderer } from '@opentui/core'
import type { Teardown } from './types.ts'

export class RendererLifecycle {
  private renderer: Teardown = { destroy() {}, closed: Promise.resolve() }
  private interrupted = false
  private exiting = false

  attach(renderer: CliRenderer) {
    this.renderer = renderer
    if (this.exiting) {
      renderer.destroy()
    }
  }

  async close() {
    this.renderer.destroy()
    await this.renderer.closed
  }

  exit = () => {
    this.exiting = true
    this.renderer.destroy()
  }

  interrupt = () => {
    this.interrupted = true
    this.exit()
  }

  status() {
    if (this.interrupted) return 'interrupted'
    return 'completed'
  }
}
