import type { AsyncOperationWithResult } from '../types.ts'
import { ApplicationData } from './application-data.ts'
import { DenoRuntime } from './deno-runtime.ts'
import { Io } from './io.ts'
import { loadConfig } from './load-config.ts'
import { gitRepositoryRoot } from './allowed-paths/repository-root.ts'
import { SubOperations } from './sub-operations.ts'
import { verifyDatabase } from './verify-database.ts'

type ApplicationDataBuilderArguments = {
  path?: string
  deno?: typeof Deno
}

export class ApplicationDataBuilder
  implements AsyncOperationWithResult<ApplicationData> {
  readonly configPath: string | undefined
  private deno: typeof Deno
  private configLoaded = false
  private subOperations = new SubOperations()
  appData: Partial<ApplicationData>

  constructor({ path, deno }: ApplicationDataBuilderArguments = {}) {
    this.configPath = path
    this.deno = deno || Deno
    this.appData = new ApplicationData()
  }

  get reason() {
    return this.subOperations.reason
  }

  success() {
    return this.subOperations.success()
  }

  async run() {
    this.setRuntimeAndArgs()
    await this.runConfigLoader()
    await this.setRemainingCollaborators()
    this.subOperations.reportFailures(this.appData.io!.consoleError())
    return this
  }

  result(): ApplicationData {
    return this.appData as ApplicationData
  }

  private setRuntimeAndArgs() {
    const deno = new DenoRuntime(this.deno)
    this.appData.denoRuntime = deno
    this.appData.parsedArguments = deno.parsedArguments()
  }

  private async runConfigLoader() {
    const configPath = this.configPath ||
      this.appData.parsedArguments!.configPath()
    const loader = loadConfig(configPath)
    const action = `load the config from '${loader.configPath}'`
    await this.subOperations.run(loader, action)
    this.configLoaded = loader.success()
    this.appData.config = loader.result()
  }

  private async setRemainingCollaborators() {
    const { denoRuntime, config } = this.appData
    this.appData.denoRuntime = await denoRuntime!.withEnvironmentFile(
      config!.envFile,
    )
    this.appData.io = new Io(this.appData.config!.crowRepoDirectory)
    await this.openDatabase()
    this.appData.repositoryRoot = await this.repositoryRoot()
  }

  private async openDatabase() {
    if (!this.configLoaded) return
    const verification = verifyDatabase({
      database: () => this.appData.database!(),
      logger: this.appData.io!.logger(),
    })
    await this.subOperations.run(verification, 'open the database')
  }

  private async repositoryRoot() {
    const root = gitRepositoryRoot({
      denoCommand: this.appData.denoRuntime!.denoCommand(),
      logger: this.appData.io!.logger(),
    })
    await this.subOperations.run(root, 'find the repository root')
    return root.result()
  }
}

export const buildApplicationData = (
  args: ApplicationDataBuilderArguments = {},
) => {
  return new ApplicationDataBuilder(args)
}
