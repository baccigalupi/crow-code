import type { ApplicationData } from '../../types.ts'
import { ModelApiRequest } from '../framework/model-api-request.ts'
import type { ModelEndpoint } from '../types.ts'
import { requestMessages } from './messages.ts'

export class GetGoals extends ModelApiRequest<string, string[]> {
  protected getMessages() {
    return requestMessages(this.requestData)
  }
}

export const getGoals = (
  modelEndpoint: ModelEndpoint,
  applicationData: ApplicationData,
  requestData: string,
) => {
  return new GetGoals(
    modelEndpoint,
    applicationData,
    requestData,
  ).perform()
}
