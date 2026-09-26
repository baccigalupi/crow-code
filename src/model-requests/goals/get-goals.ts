import type { ApplicationData } from '../../types.ts'
import type { ModelEndpoint, ModelMessages } from '../types.ts'
import { type CallApi, callApi } from '../framework/call-api.ts'
import { modelRequestObject } from '../framework/model-request-object.ts'
import { requestMessages } from './messages.ts'

export class GetGoals {
  messages: ModelMessages[] = []
  requestObject!: Request
  apiRequest!: CallApi
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private goalText: string

  constructor(
    modelEndpoint: ModelEndpoint,
    applicationData: ApplicationData,
    goalText: string,
  ) {
    this.modelEndpoint = modelEndpoint
    this.applicationData = applicationData
    this.goalText = goalText
  }

  async perform() {
    this.constructMessages()
    this.makeModelRequestObject()
    await this.callApi()

    this.parseResponseAsJson()
  }

  private constructMessages() {
    this.messages = requestMessages(this.goalText)
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

  private parseResponseAsJson() {
  }

  async performVerbose() {
    // include cost information
  }
}

export const getGoals = (
  modelEndpoint: ModelEndpoint,
  applicationData: ApplicationData,
  goalText: string,
) => {
  new GetGoals(modelEndpoint, applicationData, goalText).perform()
}
