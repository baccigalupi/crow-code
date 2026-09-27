import type { ApplicationData } from '../../types.ts'
import type {
  ChatCompletionJson,
  ModelEndpoint,
  ModelMessages,
} from '../types.ts'
import { type FetchRequest, fetchRequest } from './fetch-request.ts'
import { type ModelAnswer, modelAnswer } from './model-answer.ts'
import { modelRequestObject } from './model-request-object.ts'

export abstract class ModelApiRequest<TRequest, TResponse> {
  messages: ModelMessages[] = []
  requestObject!: Request
  apiRequest!: FetchRequest
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
    this.makeModelRequestObject()
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

  private makeModelRequestObject() {
    this.requestObject = modelRequestObject(this.modelEndpoint, this.messages)
  }

  private async fetchRequest() {
    this.apiRequest = await fetchRequest(
      this.requestObject,
      this.applicationData.fetchClient,
      this.applicationData.logger,
    )
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
