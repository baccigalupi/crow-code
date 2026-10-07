import type {
  Json,
  ModelApiRequestArguments,
  ModelMessages,
  ModelRequestFailureReason,
} from '../types.ts'
import type { ModelAnswer } from './model-answer.ts'
import { OpenAiRequest } from './openai-request.ts'
import { RequestParser } from './request-parser.ts'
import { OperationWithResult } from '../../operation.ts'

export abstract class ModelApiRequest<TRequest, TResponse>
  extends OperationWithResult<ModelApiRequestArguments<TRequest>, TResponse> {
  protected override succeeded = false
  messages: ModelMessages[] = []
  apiRequest!: OpenAiRequest
  private failureReasonValue: ModelRequestFailureReason = ''
  private answer!: ModelAnswer
  private validatedResponse!: TResponse

  protected get requestData() {
    return this.operationArguments.requestData
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

  failureReason() {
    return this.failureReasonValue
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
      this.operationArguments.modelEndpoint,
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
    this.failureReasonValue = parser.reason as ModelRequestFailureReason
  }

  private parserResult(response: TResponse | undefined) {
    if (!this.succeeded) return this.errorResponse()
    return response as TResponse
  }
}
