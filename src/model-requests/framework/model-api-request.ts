import type { ApplicationData } from '../../application-data.ts'
import type {
  ChatCompletionJson,
  ModelEndpoint,
  ModelMessages,
  ModelRequestFailureReason,
} from '../types.ts'
import { type ModelAnswer, modelAnswer } from './model-answer.ts'
import { OpenAiRequest } from './openai-request.ts'

export abstract class ModelApiRequest<TRequest, TResponse> {
  messages: ModelMessages[] = []
  apiRequest!: OpenAiRequest
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private succeeded: boolean
  private reason: ModelRequestFailureReason = ''
  private answer!: ModelAnswer
  protected parsedResponse: unknown
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
    this.constructMessages()
    await this.fetchRequest()

    return await this.parseResponse()
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

  protected validateResponse() {
    return true
  }

  constructMessages() {
    this.messages = this.getMessages()
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
    if (!this.apiRequest.success()) return this.fail('api-error')

    const json = await this.apiRequest.json() as ChatCompletionJson
    this.answer = modelAnswer(json, this.apiRequest.benchmark())
    this.parsedResponse = this.answer.answerAsJson()
    return this.validateJson()
  }

  private validateJson() {
    if (!this.parsedResponse) return this.fail('invalid-json')

    return this.validateSchema()
  }

  private validateSchema() {
    if (!this.validateResponse()) return this.fail('invalid-schema')

    this.succeeded = true
    return this.parsedResponse as TResponse
  }

  private fail(reason: ModelRequestFailureReason) {
    this.succeeded = false
    this.reason = reason
    return this.errorResponse()
  }
}
