import type { APIError } from 'openai'
import type { Logger } from '../../types.ts'

export class RequestLogger {
  private logger: Logger
  private url: string
  private error: Error

  constructor(logger: Logger, url: string, error: Error) {
    this.logger = logger
    this.url = url
    this.error = error
  }

  apiError() {
    const error = this.error as APIError
    this.logError(
      `returned ${error.status} \n${JSON.stringify(error.error)}`,
    )
  }

  networkError() {
    this.logError(`failed to connect: \n${this.error.message}`)
  }

  private logError(message: string) {
    this.logger.error(`Error: ${this.url} ${message}`)
  }
}

export const requestLogger = (logger: Logger, url: string, error: Error) => {
  return new RequestLogger(logger, url, error)
}
