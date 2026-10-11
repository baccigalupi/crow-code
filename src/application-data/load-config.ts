import type { AsyncOperationWithResult } from '../types.ts'

type CrowPermissionsConfig = {
  ignore: string[]
  additionalRead: string[]
  additionalWrite: string[]
}

type CrowConfig = {
  userDirectory: string
  permissions: CrowPermissionsConfig
}

export const defaultCrowConfig = (): CrowConfig => ({
  userDirectory: '~/.crow',
  permissions: {
    ignore: [
      'node_modules',
      '.git',
    ],
    additionalRead: [],
    additionalWrite: [],
  },
})

export const defaultRepoPath = () => '.crow'

export class LoadConfig implements AsyncOperationWithResult<CrowConfig> {
  readonly crowRepoPath: string
  reason = ''
  private config = defaultCrowConfig()
  private succeeded = true

  constructor(crowRepoPath: string) {
    this.crowRepoPath = crowRepoPath
  }

  success() {
    return this.succeeded
  }

  async run() {
    await this.load()
    return this
  }

  result() {
    return this.config
  }

  private async load() {
    try {
      this.setConfig(JSON.parse(await Deno.readTextFile(this.crowRepoPath)))
    } catch (error) {
      this.handleError(error)
    }
  }

  private setConfig(config: unknown) {
    if (!this.isConfig(config)) return this.fail('config does not match schema')
    this.config = config
  }

  private isConfig(value: unknown): value is CrowConfig {
    if (!value || typeof value !== 'object') return false
    const config = value as Record<string, unknown>
    return typeof config.userDirectory === 'string' &&
      this.isPermissionsConfig(config.permissions)
  }

  private isPermissionsConfig(value: unknown) {
    if (!value || typeof value !== 'object') return false
    const permissions = value as Record<string, unknown>
    return this.isStringArray(permissions.ignore) &&
      this.isStringArray(permissions.additionalRead) &&
      this.isStringArray(permissions.additionalWrite)
  }

  private isStringArray(value: unknown) {
    return Array.isArray(value) &&
      value.every((item) => typeof item === 'string')
  }

  private handleError(error: unknown) {
    this.fail((error as Error).message)
  }

  private fail(reason: string) {
    this.succeeded = false
    this.reason = reason
    return false
  }
}

export const loadConfig = (path: string = defaultRepoPath()) => {
  return new LoadConfig(path)
}
