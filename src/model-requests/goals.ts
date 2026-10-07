import type { ApplicationData } from '../application-data.ts'
import type { ModelFilterOptions } from '../domain/models/types.ts'
import { ModelApiRequest } from './framework/model-api-request.ts'
import { Runner } from './framework/runner.ts'
import type { Json, ModelMessages } from './types.ts'

const systemPrompt = `
You are an agent focused on extracting goals from user provided information.

Goals you extract should be:
- individual, simple statements that are as independent as possible
- high level and only including details appropriate for the ask
- formatted as a json array of strings

Respond with only a JSON array of strings. No markdown, no explanation.
`

export class GetGoals extends ModelApiRequest<string, string[]> {
  protected override logPrefix = 'Get goals: '

  protected override errorResponse() {
    return []
  }

  protected override validateResponse(json: Json) {
    return Array.isArray(json) &&
      json.every((goal) => typeof goal === 'string')
  }

  protected getMessages() {
    return this.requestMessages()
  }

  private requestMessages(): ModelMessages[] {
    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: this.requestData },
    ]
  }
}

export const getGoals = (
  applicationData: ApplicationData,
  requestData: string,
  options: ModelFilterOptions = { type: 'chat', costTier: 'free', limit: 3 },
) =>
  new Runner({
    applicationData,
    operationArguments: {
      modelFilters: options,
      modelApiRequest: GetGoals,
      requestData,
    },
  }).run()
