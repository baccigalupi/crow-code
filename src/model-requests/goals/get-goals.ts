import type { ApplicationData } from '../../types.ts'
import type { ModelEndpoint, ModelMessages } from '../types.ts'
import { type CallApi, callApi } from '../framework/call-api.ts'
import { chatResponse } from '../framework/chat-response.ts'
import { modelRequestObject } from '../framework/model-request-object.ts'
import type { ChatCompletionJson } from '../types.ts'
import { requestMessages } from './messages.ts'

export class GetGoals {
  messages: ModelMessages[] = []
  requestObject!: Request
  apiRequest!: CallApi
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private requestData: string

  constructor(
    modelEndpoint: ModelEndpoint,
    applicationData: ApplicationData,
    requestData: string,
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
    this.messages = requestMessages(this.requestData)
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

  async performVerbose() {
    // include cost information
  }
}

export const getGoals = (
  modelEndpoint: ModelEndpoint,
  applicationData: ApplicationData,
  requestData: string,
) => {
  new GetGoals(modelEndpoint, applicationData, requestData).perform()
}
