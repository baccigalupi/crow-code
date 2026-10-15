import type { AsyncOperationWithResult } from '../types.ts'
import { ApplicationData } from './application-data.ts'
import { defaultRuntime, type Runtime } from './runtime.ts'
import { Io } from './io.ts'
import { loadConfig } from './load-config.ts'
import { gitRepositoryRoot } from './allowed-paths/repository-root.ts'
import { SubOperations } from './sub-operations.ts'
import { verifyDatabase } from './verify-database.ts'

type ApplicationDataBuilderArguments = {
  path?: string
  runtime?: Runtime
}

export class ApplicationDataBuilder
  implements AsyncOperationWithResult<ApplicationData> {
  readonly configPath: string | undefined
  private runtime: Runtime
  private configLoaded = false
  private subOperations = new SubOperations()
  appData: Partial<ApplicationData>

  constructor(
    { path, runtime = defaultRuntime() }: ApplicationDataBuilderArguments = {},
  ) {
    this.configPath = path
    this.runtime = runtime
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
    this.appData.runtime = this.runtime
    this.appData.parsedArguments = this.runtime.parsedArguments()
  }

  private async runConfigLoader() {
    const loader = loadConfig({ path: this.loadPath(), runtime: this.runtime })
    const action = `load the config from '${loader.configPath}'`
    await this.subOperations.run(loader, action)
    this.configLoaded = loader.success()
    this.appData.config = loader.result()
  }

  private loadPath() {
    return this.configPath || this.appData.parsedArguments!.configPath()
  }

  private async setRemainingCollaborators() {
    const { runtime, config } = this.appData
    this.appData.runtime = await runtime!.withEnvironmentFile(config!.envFile)
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
      denoCommand: this.appData.runtime!.denoCommand(),
      logger: this.appData.io!.logger(),
      cwd: this.appData.runtime!.cwd(),
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
