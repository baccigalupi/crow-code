import type { CommandApplicationData } from '../../types.ts'
import type { ModelEndpoint, ModelMessages } from '../types.ts'
import { requestMessages } from './messages.ts'

export class GetGoals {
  messages: ModelMessages[] = []
  private modelEndpoint: ModelEndpoint
  private applicationData: CommandApplicationData
  private goalText: string

  constructor(
    modelEndpoint: ModelEndpoint,
    applicationData: CommandApplicationData,
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
  }

  private callApi() {
    return Promise.resolve()
  }

  private parseResponseAsJson() {
  }

  async performVerbose() {
    // include cost information
  }
}

export const getGoals = (
  modelEndpoint: ModelEndpoint,
  applicationData: CommandApplicationData,
  goalText: string,
) => {
  new GetGoals(modelEndpoint, applicationData, goalText).perform()
}
