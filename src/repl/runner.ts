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

  constructor(applicationData: ApplicationData, createApp: CreateApp) {
    this.applicationData = applicationData
    this.createApp = createApp
    this.quitResolver = Promise.withResolvers<void>()
  }

  async run(): Promise<void> {
    this.app().start()
    await this.quitResolver.promise
    this.cleanup()
  }

  private app() {
    if (this._app) return this._app
    this._app = this.createApp(
      new ReplOptions(this.applicationData.replData(), this.quit()),
    )
    return this._app
  }

  private quit() {
    return () => this.quitResolver.resolve()
  }

  private cleanup() {
    this.app().destroy()
    Deno.exit(0)
  }
}
