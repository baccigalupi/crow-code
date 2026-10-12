import { z } from 'zod'
import { dirname } from '@std/path'
import type { AsyncOperationWithResult, CrowConfigData } from '../types.ts'
import { CrowConfig } from './config.ts'

export const defaultCrowConfig = (): CrowConfigData => ({
  crowGlobalDirectory: '~/.crow',
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
  crowGlobalDirectory: z.string(),
  permissions: z.object({
    ignore: z.array(z.string()),
    additionalRead: z.array(z.string()),
    additionalWrite: z.array(z.string()),
  }),
})

export const defaultConfigPath = () => '.crow/config.json'

export class LoadConfig implements AsyncOperationWithResult<CrowConfig> {
  readonly configPath: string
  readonly crowRepoDirectory: string
  reason = ''
  private config = defaultCrowConfig()
  private succeeded = true

  constructor(configPath: string) {
    this.configPath = configPath
    this.crowRepoDirectory = dirname(configPath)
  }

  success() {
    return this.succeeded
  }

  async run() {
    await this.load()
    return this
  }

  result() {
    return new CrowConfig(this.crowRepoDirectory, this.config)
  }

  private async load() {
    try {
      this.setConfig(JSON.parse(await Deno.readTextFile(this.configPath)))
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

export const loadConfig = (path: string = defaultConfigPath()) => {
  return new LoadConfig(path)
}
