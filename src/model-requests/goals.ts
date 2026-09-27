import type { ApplicationData } from '../types.ts'
import { ModelApiRequest } from './framework/model-api-request.ts'
import type { ModelEndpoint, RequestMessages } from './types.ts'

const systemPrompt = `
You are an agent focused on extracting goals from user provided information.

Goals you extract should be:
- individual, simple statements that are as independent as possible
- high level and only including details appropriate for the ask
- formatted as a json array of strings

Respond with only a JSON array of strings. No markdown, no explanation.
`

const requestMessages: RequestMessages<string> = (userText: string) => {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userText },
  ]
}

export class GetGoals extends ModelApiRequest<string, string[]> {
  protected parseAsJson = true

  protected override jsonErrorResponse() {
    return []
  }

  protected getMessages() {
    return requestMessages(this.requestData)
  }
}

export const getGoals = async (
  modelEndpoint: ModelEndpoint,
  applicationData: ApplicationData,
  requestData: string,
) => {
  const request = new GetGoals(modelEndpoint, applicationData, requestData)
  await request.run()
  return request
}
