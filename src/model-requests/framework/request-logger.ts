import type { APIError } from 'openai'
import type { Logger } from '../../types.ts'
import type { ModelMessages, RequestContext } from '../types.ts'

export class RequestLogger {
  private logger: Logger
  private url: string
  private error: Error
  private context: RequestContext

  constructor(
    logger: Logger,
    url: string,
    error: Error,
    context: RequestContext,
  ) {
    this.logger = logger
    this.url = url
    this.error = error
    this.context = context
  }

  apiError() {
    const error = this.error as APIError
    this.logError(
      `returned ${error.status} \nrequest: ${this.requestShape()}` +
        `\nresponse: ${JSON.stringify(error.error)}`,
    )
  }

  networkError() {
    this.logError(
      `failed to connect: \nrequest: ${this.requestShape()}` +
        `\nerror: ${this.errorDetail()}`,
    )
  }

  private logError(message: string) {
    this.logger.error(
      `Error: POST ${this.url} ${this.contextPrefix()} ${message}`,
    )
  }

  private contextPrefix() {
    const endpoint = this.context.modelEndpoint
    return `model=${endpoint.model} provider=${endpoint.providerId} ` +
      `duration=${this.durationMs()}ms`
  }

  private durationMs() {
    const { startTime, endTime } = this.context.timespan
    return Math.round(endTime - startTime)
  }

  private requestShape() {
    const messages = this.context.messages.map(messageShape)
    return JSON.stringify({
      model: this.context.modelEndpoint.model,
      messages,
    })
  }

  private errorDetail() {
    if (!('cause' in this.error)) {
      return `${this.error.name}: ${this.error.message}`
    }
    return `${this.error.name}: ${this.error.message} ` +
      `(cause: ${String(this.error.cause)})`
  }
}

const messageShape = (message: ModelMessages) => ({
  role: message.role,
  length: message.content.length,
})

export const requestLogger = (
  logger: Logger,
  url: string,
  error: Error,
  context: RequestContext,
) => {
  return new RequestLogger(logger, url, error, context)
}
