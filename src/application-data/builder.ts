import { OperationWithResult } from '../operation.ts'
import { ApplicationData } from './application-data.ts'
import { parseArguments } from './arguments.ts'
import { defaultRuntime, type Runtime } from './runtime.ts'
import { defaultFilesystem } from './filesystem.ts'
import { Io } from './io.ts'
import { loadEnvironmentalVariables } from './env-vars.ts'
import { loadConfig } from './load-config.ts'
import { gitRepositoryRoot } from './allowed-paths/repository-root.ts'
import { verifyDatabase } from './verify-database.ts'

type ApplicationDataBuilderArguments = {
  path?: string
  runtime?: Runtime
}

export class ApplicationDataBuilder extends OperationWithResult<
  Required<ApplicationDataBuilderArguments>,
  ApplicationData
> {
  protected override logPrefix = 'Build application data: '

  async run() {
    this.setRuntimeAndArgs()
    await this.runConfigLoader()
    await this.setRemainingCollaborators()
    this.failFromSubOperations()
    return this
  }

  result() {
    return this.applicationData
  }

  private setRuntimeAndArgs() {
    const { runtime } = this.operationArguments
    this.applicationData.runtime = runtime
    this.applicationData.filesystem = defaultFilesystem()
    this.applicationData.parsedArguments = parseArguments(runtime.args())
  }

  private async runConfigLoader() {
    const loader = loadConfig({
      path: this.operationArguments.path,
      parsedArguments: this.applicationData.parsedArguments,
      filesystem: this.applicationData.filesystem,
    })
    await this.runNonBlockingOperation(loader)
    this.applicationData.config = loader.result()
  }

  private async setRemainingCollaborators() {
    await this.loadEnvars()
    this.applicationData.io = new Io(
      this.applicationData.config.crowRepoDirectory,
    )
    await this.openDatabase()
    this.applicationData.repositoryRoot = await this.repositoryRoot()
  }

  private async loadEnvars() {
    this.applicationData.envars = await loadEnvironmentalVariables({
      path: this.applicationData.config.envFile,
      runtimeEnvironment: this.operationArguments.runtime.env(),
      filesystem: this.applicationData.filesystem,
    })
  }

  private async openDatabase() {
    await this.runNonBlockingOperation(verifyDatabase({
      database: () => this.applicationData.database(),
      logger: this.logger,
    }))
  }

  private async repositoryRoot() {
    const root = gitRepositoryRoot({
      runtime: this.applicationData.runtime,
      logger: this.logger,
    })
    await this.runNonBlockingOperation(root)
    return root.result()
  }
}

export const buildApplicationData = (
  { path = '', runtime = defaultRuntime() }: ApplicationDataBuilderArguments =
    {},
) => {
  return new ApplicationDataBuilder({
    applicationData: new ApplicationData(),
    operationArguments: { path, runtime },
  })
}
