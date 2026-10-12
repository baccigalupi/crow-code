import type { AsyncOperation, AsyncOperationWithResult } from '../types.ts'
import type { CrowConfig } from './config.ts'
import { DenoRuntime } from './deno-runtime.ts'
import { loadConfig } from './load-config.ts'

export class AppData {
  config!: CrowConfig
  denoRuntime!: DenoRuntime
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
    this.setDenoRuntime()
    await this.runConfigLoader()
    return this
  }

  result(): AppData {
    return this.appData as AppData
  }

  private setDenoRuntime() {
    this.appData.denoRuntime = new DenoRuntime(Deno)
  }

  private async runConfigLoader() {
    const loader = loadConfig(this.crowRepoPath)
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
