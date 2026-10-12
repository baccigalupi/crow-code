import type { AsyncOperation, AsyncOperationWithResult } from '../types.ts'
import { AppData } from './app-data.ts'
import { DenoRuntime } from './deno-runtime.ts'
import { Io } from './io.ts'
import { loadConfig } from './load-config.ts'
import { gitRepositoryRoot } from './repository-root.ts'

type ApplicationDataBuilderArguments = {
  path?: string
  deno?: typeof Deno
}

export class ApplicationDataBuilder
  implements AsyncOperationWithResult<AppData> {
  readonly configPath: string | undefined
  reason = ''
  private deno: typeof Deno
  private succeeded = true
  appData: Partial<AppData>

  constructor({ path, deno }: ApplicationDataBuilderArguments = {}) {
    this.configPath = path
    this.deno = deno || Deno
    this.appData = new AppData()
  }

  success() {
    return this.succeeded
  }

  async run() {
    this.setRuntimeAndArgs()
    await this.runConfigLoader()
    await this.setRemainingCollaborators()
    return this
  }

  result(): AppData {
    return this.appData as AppData
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
    await this.runSubOperation(loader)
    this.appData.config = loader.result()
  }

  private async setRemainingCollaborators() {
    this.appData.io = new Io(this.appData.config!.crowRepoDirectory)
    this.appData.repositoryRoot = await this.repositoryRoot()
  }

  private async repositoryRoot() {
    const root = gitRepositoryRoot({
      denoCommand: this.result().denoCommand(),
      logger: this.result().logger(),
    })
    await this.runSubOperation(root)
    return root.result()
  }

  private async runSubOperation<T extends AsyncOperation>(operation: T) {
    await operation.run()
    if (!operation.success()) this.fail(operation.reason)
    return operation
  }

  private fail(reason: string) {
    this.succeeded = false
    this.reason = reason
  }
}

export const buildApplicationData = (
  args: ApplicationDataBuilderArguments = {},
) => {
  return new ApplicationDataBuilder(args)
}
