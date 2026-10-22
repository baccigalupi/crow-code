import { createElement, type FunctionComponent } from 'react'
import { render } from 'ink'
import type { Instance } from 'ink'
import type { ApplicationData } from '../application-data/application-data.ts'
import type { ProcessSignal } from '../types.ts'
import type { ReplIo, ReplStatus } from './types.ts'

export class TuiRunner {
  private applicationData: ApplicationData
  private io: ReplIo
  private view: FunctionComponent
  private instance!: Instance
  private interrupted = false
  private signals: ProcessSignal[] = ['SIGINT', 'SIGTERM']

  constructor(
    applicationData: ApplicationData,
    io: ReplIo,
    view: FunctionComponent,
  ) {
    this.applicationData = applicationData
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
    const message = String(error)
    if (this.io.stderr) {
      this.io.stderr.write(`${message}\n`)
    } else {
      this.applicationData.consoleError()(message)
    }
  }

  private listen() {
    const { runtime } = this.applicationData
    this.signals.forEach((signal) =>
      runtime.addSignalListener(signal, this.interrupt),
    )
  }

  private unlisten() {
    const { runtime } = this.applicationData
    this.signals.forEach((signal) =>
      runtime.removeSignalListener(signal, this.interrupt),
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

export const createTuiRunner = (
  applicationData: ApplicationData,
  io: ReplIo,
  view: FunctionComponent,
) => new TuiRunner(applicationData, io, view)
