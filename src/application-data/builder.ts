import type { AsyncOperation, AsyncOperationWithResult } from '../types.ts'
import type { CrowConfig } from './config.ts'
import { DenoRuntime } from './deno-runtime.ts'
import { loadConfig } from './load-config.ts'
import type { ParsedArguments } from './arguments.ts'

export class AppData {
  config!: CrowConfig
  denoRuntime!: DenoRuntime
  parsedArguments!: ParsedArguments
}

export class ApplicationDataBuilder
  implements AsyncOperationWithResult<AppData> {
  readonly crowRepoPath: string | undefined
  reason = ''
  private succeeded = true
  appData: Partial<AppData>

  constructor(crowRepoPath?: string) {
    this.crowRepoPath = crowRepoPath
    this.appData = new AppData()
  }

  success() {
    return this.succeeded
  }

  async run() {
    this.setRuntimeAndArgs()
    await this.runConfigLoader()
    return this
  }

  result(): AppData {
    return this.appData as AppData
  }

  private setRuntimeAndArgs() {
    const deno = new DenoRuntime(Deno)
    this.appData.denoRuntime = deno
    this.appData.parsedArguments = deno.parsedArguments()
  }

  private async runConfigLoader() {
    const configPath = this.crowRepoPath ||
      this.appData.parsedArguments!.configPath()
    const loader = loadConfig(configPath)
    await this.runSubOperation(loader)
    this.appData.config = loader.result()
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

export const buildApplicationData = (path?: string) => {
  return new ApplicationDataBuilder(path)
}
