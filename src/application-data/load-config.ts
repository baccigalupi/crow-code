import { z } from 'zod'
import type { AsyncOperationWithResult, CrowConfigData } from '../types.ts'
import { CrowConfig } from './config.ts'

export const defaultCrowConfig = (): CrowConfigData => ({
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

const crowConfigSchema = z.object({
  userDirectory: z.string(),
  permissions: z.object({
    ignore: z.array(z.string()),
    additionalRead: z.array(z.string()),
    additionalWrite: z.array(z.string()),
  }),
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
    return new CrowConfig(this.crowRepoPath, this.config)
  }

  private async load() {
    try {
      this.setConfig(JSON.parse(await Deno.readTextFile(this.crowRepoPath)))
    } catch (error) {
      this.handleError(error)
    }
  }

  private setConfig(config: unknown) {
    const parsed = crowConfigSchema.safeParse(config)
    if (parsed.success) this.config = parsed.data
    if (!parsed.success) this.fail('config does not match schema')
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
