import type { AsyncOperation, AsyncOperationWithResult } from '../types.ts'
import type { CrowConfig } from './config.ts'
import { loadConfig } from './load-config.ts'

export class AppData {
  config: CrowConfig

  constructor(config: CrowConfig) {
    this.config = config
  }
}

export class ApplicationDataBuilder
  implements AsyncOperationWithResult<AppData> {
  readonly crowRepoPath: string | undefined
  reason = ''
  private config!: CrowConfig
  private succeeded = true

  constructor(crowRepoPath?: string) {
    this.crowRepoPath = crowRepoPath
  }

  success() {
    return this.succeeded
  }

  async run() {
    await this.runConfigLoader()
    return this
  }

  result() {
    return new AppData(this.config)
  }

  private async runConfigLoader() {
    const operation = await this.runSubOperation(loadConfig(this.crowRepoPath))
    this.config = operation.result()
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
