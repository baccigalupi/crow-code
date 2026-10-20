import { dirname } from 'node:path'
import type { AsyncOperationWithResult, Logger } from '../types.ts'
import { normalizeConfig } from '../domain/config.ts'
import { parseArguments, type ParsedArguments } from './arguments.ts'
import { CrowConfig } from './config.ts'
import type { Filesystem } from './filesystem.ts'
import { createLogger } from './logger.ts'

type LoadConfigArguments = {
  path?: string
  parsedArguments?: ParsedArguments
  filesystem: Filesystem
  logger?: Logger
}

export const defaultConfigPath = () => '.crow/config.json'

export class LoadConfig implements AsyncOperationWithResult<CrowConfig> {
  readonly configPath: string
  readonly crowRepoDirectory: string
  reason = ''
  private config = normalizeConfig(undefined)
  private succeeded = true
  private logPrefix = 'Load config: '
  private filesystem: Filesystem
  private logger?: Logger

  constructor(configPath: string, filesystem: Filesystem, logger?: Logger) {
    this.configPath = configPath
    this.crowRepoDirectory = dirname(configPath)
    this.filesystem = filesystem
    this.logger = logger
  }

  success() {
    return this.succeeded
  }

  async run() {
    await this.load()
    return this
  }

  result() {
    return new CrowConfig(this.crowRepoDirectory, this.config.result())
  }

  private async load() {
    try {
      this.setConfig(
        JSON.parse(await this.filesystem.readTextFile(this.configPath)),
      )
    } catch (error) {
      this.handleError(error)
    }
  }

  private setConfig(config: unknown) {
    this.config = normalizeConfig(config)
    if (this.config.errorMessage()) this.fail(this.config.errorMessage())
  }

  private handleError(error: unknown) {
    if (this.filesystem.isNotFound(error)) this.fail('')
    else if (error instanceof SyntaxError) {
      this.fail('the file is not valid JSON')
    } else this.fail((error as Error).message)
  }

  private fail(reason: string) {
    this.succeeded = false
    this.reason = reason
    this.log().error(this.message(reason))
    return false
  }

  private log() {
    return this.logger || createLogger(this.crowRepoDirectory, 'debug')
  }

  private message(reason: string) {
    const detail = reason && `: ${reason}`
    return `${this.logPrefix}'${this.configPath}'${detail}`
  }
}

export const loadConfig = (
  { path, parsedArguments = parseArguments([]), filesystem, logger }:
    LoadConfigArguments,
) => {
  const configPath = path || parsedArguments.configPath() ||
    defaultConfigPath()
  return new LoadConfig(configPath, filesystem, logger)
}
