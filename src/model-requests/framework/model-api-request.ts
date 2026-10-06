import type { ApplicationData } from '../../application-data.ts'
import type {
  Json,
  ModelEndpoint,
  ModelMessages,
  ModelRequestFailureReason,
} from '../types.ts'
import type { ModelAnswer } from './model-answer.ts'
import { OpenAiRequest } from './openai-request.ts'
import { RequestParser } from './request-parser.ts'

export abstract class ModelApiRequest<TRequest, TResponse> {
  messages: ModelMessages[] = []
  apiRequest!: OpenAiRequest
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private succeeded: boolean
  private reason: ModelRequestFailureReason = ''
  private answer!: ModelAnswer
  private validatedResponse!: TResponse
  protected requestData: TRequest

  constructor(
    modelEndpoint: ModelEndpoint,
    applicationData: ApplicationData,
    requestData: TRequest,
  ) {
    this.modelEndpoint = modelEndpoint
    this.applicationData = applicationData
    this.requestData = requestData
    this.succeeded = false
  }

  async run() {
    this.messages = this.getMessages()
    await this.fetchRequest()
    this.validatedResponse = await this.parseResponse()

    return this
  }

  result() {
    return this.validatedResponse
  }

  success() {
    return this.succeeded
  }

  failureReason() {
    return this.reason
  }

  metaData() {
    return this.answer.metaData()
  }

  protected abstract errorResponse(): TResponse
  protected abstract getMessages(): ModelMessages[]

  protected validateResponse(_json: Json) {
    return true
  }

  private async fetchRequest() {
    this.apiRequest = new OpenAiRequest(
      this.modelEndpoint,
      this.messages,
      this.applicationData,
    )
    await this.apiRequest.run()
  }

  private async parseResponse() {
    const parser = this.requestParser()
    const response = await parser.run()
    this.recordParserResult(parser)
    return this.parserResult(response)
  }

  private requestParser() {
    const validator = (json: Json) => this.validateResponse(json)
    return new RequestParser<TResponse>(this.apiRequest, validator)
  }

  private recordParserResult(parser: RequestParser<TResponse>) {
    this.answer = parser.answer
    this.succeeded = parser.succeeded
    this.reason = parser.reason as ModelRequestFailureReason
  }

  private parserResult(response: TResponse | undefined) {
    if (!this.succeeded) return this.errorResponse()
    return response as TResponse
  }
}
