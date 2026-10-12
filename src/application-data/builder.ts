import type { AsyncOperation, AsyncOperationWithResult } from '../types.ts'
import type { CrowConfig } from './config.ts'
import { DenoRuntime } from './deno-runtime.ts'
import { Io } from './io.ts'
import { loadConfig } from './load-config.ts'
import type { ParsedArguments } from './arguments.ts'

export class AppData {
  config!: CrowConfig
  denoRuntime!: DenoRuntime
  io!: Io
  parsedArguments!: ParsedArguments
}

export class ApplicationDataBuilder
  implements AsyncOperationWithResult<AppData> {
  readonly configPath: string | undefined
  reason = ''
  private succeeded = true
  appData: Partial<AppData>

  constructor(configPath?: string) {
    this.configPath = configPath
    this.appData = new AppData()
  }

  success() {
    return this.succeeded
  }

  async run() {
    this.setRuntimeAndArgs()
    await this.runConfigLoader()
    this.setIo()
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
    const configPath = this.configPath ||
      this.appData.parsedArguments!.configPath()
    const loader = loadConfig(configPath)
    await this.runSubOperation(loader)
    this.appData.config = loader.result()
  }

  private setIo() {
    this.appData.io = new Io(this.appData.config!.repoDirectory)
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
