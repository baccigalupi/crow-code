import type { ApplicationData } from '../../application-data.ts'
import type {
  ChatCompletionJson,
  ModelEndpoint,
  ModelMessages,
} from '../types.ts'
import { type ModelAnswer, modelAnswer } from './model-answer.ts'
import { OpenAiRequest } from './openai-request.ts'

export abstract class ModelApiRequest<TRequest, TResponse> {
  messages: ModelMessages[] = []
  apiRequest!: OpenAiRequest
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private succeeded: boolean
  private answer!: ModelAnswer
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

  metaData() {
    return this.answer.metaData()
  }

  protected abstract parseAsJson: boolean
  protected abstract jsonErrorResponse(): TResponse
  protected abstract getMessages(): ModelMessages[]

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
    this.succeeded = this.apiRequest.success()
  }

  private async parseResponse(): Promise<TResponse> {
    if (this.parseAsJson) {
      return await this.parseJsonResponse()
    } else {
      return await this.parseRawResponse()
    }
  }

  private async parseJsonResponse(): Promise<TResponse> {
    if (!this.apiRequest.success()) return this.jsonErrorResponse()
    return await this.parseJsonAnswer()
  }

  private async parseJsonAnswer(): Promise<TResponse> {
    const json = await this.apiRequest.json() as ChatCompletionJson
    this.answer = modelAnswer(json, this.apiRequest.benchmark())
    return this.answer.answerAsJson() as TResponse
  }

  private async parseRawResponse(): Promise<TResponse> {
    if (!this.apiRequest.success()) return '' as TResponse
    const json = await this.apiRequest.json() as ChatCompletionJson
    this.answer = modelAnswer(json, this.apiRequest.benchmark())
    return this.answer.rawAnswer() as TResponse
  }
}
