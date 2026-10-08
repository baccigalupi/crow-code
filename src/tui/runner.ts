import { createElement } from 'react'
import { render } from 'ink'
import type { Instance } from 'ink'
import { App } from './views/app.tsx'
import type { ReplIo, ReplStatus } from './types.ts'

export class Runner {
  private io: ReplIo
  private instance!: Instance
  private signals: Deno.Signal[] = ['SIGINT', 'SIGTERM']

  constructor(io: ReplIo) {
    this.io = io
    this.interrupt = this.interrupt.bind(this)
  }

  async run() {
    Deno.exit(await this.exitCode())
  }

  async status(): Promise<ReplStatus> {
    this.instance = this.render()
    this.listen()
    try {
      return await this.waitForExit()
    } finally {
      this.unlisten()
    }
  }

  private render() {
    return render(createElement(App), {
      ...this.io,
      exitOnCtrlC: false,
      patchConsole: false,
      alternateScreen: true,
    })
  }

  private waitForExit() {
    return this.instance.waitUntilExit().then(
      () => 'completed' as const,
      (error: unknown) => this.failed(error),
    )
  }

  private failed(error: unknown): ReplStatus {
    this.instance.unmount()
    this.writeError(error)
    return 'interrupted'
  }

  private writeError(error: unknown) {
    const message = `${String(error)}\n`
    if (this.io.stderr) {
      this.io.stderr.write(message)
    } else {
      Deno.stderr.writeSync(new TextEncoder().encode(message))
    }
  }

  private listen() {
    this.signals.forEach((signal) =>
      Deno.addSignalListener(signal, this.interrupt)
    )
  }

  private unlisten() {
    this.signals.forEach((signal) =>
      Deno.removeSignalListener(signal, this.interrupt)
    )
  }

  interrupt() {
    this.instance.unmount()
    Deno.exit(1)
  }

  private async exitCode() {
    if ((await this.status()) === 'completed') return 0
    return 1
  }
}

export const createRunner = (io: ReplIo = {}) => new Runner(io)
