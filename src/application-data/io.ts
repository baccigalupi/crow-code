import { memoize } from '../decorators.ts'
import { createLogger } from './logger.ts'

export class Io {
  repoCrowDirectory: string

  constructor(repoCrowDirectory: string) {
    this.repoCrowDirectory = repoCrowDirectory
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
    return createLogger(this.repoCrowDirectory, 'debug')
  }
}
