import { memoize } from '../decorators.ts'
import { createLogger } from './logger.ts'
import { openAndMigrateDatabase } from '../database/open-and-migrate-database.ts'

export class Io {
  private crowDirectory: string

  constructor(crowDirectory: string) {
    this.crowDirectory = crowDirectory
  }

  consoleLog() {
    return console.log
  }

  consoleError() {
    return console.error
  }

  fetch() {
    return globalThis.fetch
  }

  @memoize
  logger() {
    return createLogger(this.crowDirectory, 'debug')
  }

  @memoize
  database() {
    return openAndMigrateDatabase(this.crowDirectory, this.logger())
  }
}
