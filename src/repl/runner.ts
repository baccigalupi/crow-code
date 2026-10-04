import { createTerminalApp } from '@ubernaut/exotui/app'
import type { ApplicationData } from '../application-data.ts'
import { ReplOptions } from './repl.ts'
import type { App } from './types.ts'

type CreateApp = (options: ReplOptions) => App

export const createRunner = (
  applicationData: ApplicationData,
  createApp: CreateApp = createTerminalApp,
) => new Runner(applicationData, createApp)

export class Runner {
  private applicationData: ApplicationData
  private createApp: CreateApp
  private quitResolver: PromiseWithResolvers<void>
  private _app?: App
  private cleaned = false
  private signaled = false
  private signals: Deno.Signal[] = ['SIGINT', 'SIGTERM']

  constructor(applicationData: ApplicationData, createApp: CreateApp) {
    this.applicationData = applicationData
    this.createApp = createApp
    this.quitResolver = Promise.withResolvers<void>()
    this.onSignal = this.onSignal.bind(this)
    this.quit = this.quit.bind(this)
  }

  async run() {
    this.listen()
    await this.runAndCleanup()
    if (!this.signaled) Deno.exit(0)
  }

  private async runAndCleanup() {
    try {
      await this.waitForQuit()
    } finally {
      this.cleanup()
    }
  }

  private async waitForQuit() {
    this.app().start()
    await this.quitResolver.promise
  }

  private app() {
    if (this._app) return this._app
    this._app = this.createApp(
      new ReplOptions(this.applicationData.replData(), this.quit),
    )
    return this._app
  }

  quit() {
    this.quitResolver.resolve()
  }

  private listen() {
    this.signals.forEach((signal) =>
      Deno.addSignalListener(signal, this.onSignal)
    )
  }

  private onSignal() {
    this.signaled = true
    this.quitResolver.resolve()
    this.cleanup()
    Deno.exit(1)
  }

  private cleanup() {
    if (this.cleaned) return
    this.cleaned = true
    this.signals.forEach((signal) =>
      Deno.removeSignalListener(signal, this.onSignal)
    )
    this.app().destroy()
  }
}
