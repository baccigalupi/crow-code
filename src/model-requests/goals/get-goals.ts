import type { ApplicationData } from '../../types.ts'
import type { ModelEndpoint, ModelMessages, RequestMessages } from '../types.ts'
import { type CallApi, callApi } from '../framework/call-api.ts'
import { chatResponse } from '../framework/chat-response.ts'
import { modelRequestObject } from '../framework/model-request-object.ts'
import type { ChatCompletionJson } from '../types.ts'
import { requestMessages } from './messages.ts'

export class GetGoals<T> {
  messages: ModelMessages[] = []
  requestObject!: Request
  apiRequest!: CallApi
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private requestData: T

  constructor(
    modelEndpoint: ModelEndpoint,
    applicationData: ApplicationData,
    requestData: T,
  ) {
    this.modelEndpoint = modelEndpoint
    this.applicationData = applicationData
    this.requestData = requestData
  }

  async perform() {
    this.constructMessages()
    this.makeModelRequestObject()
    await this.callApi()

    return await this.parseResponse()
  }

  private constructMessages() {
    this.messages = (requestMessages as RequestMessages<T>)(this.requestData)
  }

  private makeModelRequestObject() {
    this.requestObject = modelRequestObject(this.modelEndpoint, this.messages)
  }

  private async callApi() {
    this.apiRequest = await callApi(
      this.requestObject,
      this.applicationData.fetchClient,
      this.applicationData.logger,
    )
  }

  private async parseResponse(): Promise<string[]> {
    if (!this.apiRequest.success()) {
      return []
    }

    const json = await this.apiRequest.json() as ChatCompletionJson
    return chatResponse(json).answerAsJson() as string[]
  }
}

export const getGoals = (
  modelEndpoint: ModelEndpoint,
  applicationData: ApplicationData,
  requestData: string,
) => {
  return new GetGoals<string>(modelEndpoint, applicationData, requestData)
    .perform()
}
