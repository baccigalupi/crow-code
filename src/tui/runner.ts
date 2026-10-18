import { createElement, type FunctionComponent } from 'react'
import { render } from 'ink'
import type { Instance } from 'ink'
import type { Runtime } from '../application-data/runtime.ts'
import type { Signal } from '../types.ts'
import { App } from './app/views/app.tsx'
import type { ReplIo, ReplStatus } from './types.ts'

export class Runner {
  private runtime: Runtime
  private io: ReplIo
  private view: FunctionComponent
  private instance!: Instance
  private interrupted = false
  private signals: Signal[] = ['SIGINT', 'SIGTERM']

  constructor(
    runtime: Runtime,
    io: ReplIo,
    view: FunctionComponent = App,
  ) {
    this.runtime = runtime
    this.io = io
    this.view = view
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
    return render(createElement(this.view), {
      ...this.io,
      exitOnCtrlC: false,
      patchConsole: false,
      alternateScreen: true,
    })
  }

  private waitForExit() {
    return this.instance.waitUntilExit().then(
      () => this.completedStatus(),
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
      this.runtime.writeStderr(message)
    }
  }

  private listen() {
    this.signals.forEach((signal) =>
      this.runtime.addSignalListener(signal, this.interrupt)
    )
  }

  private unlisten() {
    this.signals.forEach((signal) =>
      this.runtime.removeSignalListener(signal, this.interrupt)
    )
  }

  interrupt = () => {
    this.interrupted = true
    this.instance.unmount()
  }

  private completedStatus(): ReplStatus {
    if (this.interrupted) return 'interrupted'
    return 'completed'
  }
}

export const createRunner = (
  runtime: Runtime,
  io: ReplIo = {},
  view?: FunctionComponent,
) => new Runner(runtime, io, view)
