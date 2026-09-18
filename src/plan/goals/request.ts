import { requestMessages } from './messages.ts'
import { parseGoals } from './parse-goals.ts'
import { modelRequest } from '../model-request.ts'
import { ApiRequest } from '../api-request.ts'
import { ExtractModelResponse } from '../extract-model-response.ts'
import type { ModelEndpointDetails } from '../types.ts'

const parseModelResponse = (response: Response) => {
  return new ExtractModelResponse(response, parseGoals).extract()
}

export const requestGoals = (
  modelEndpoint: ModelEndpointDetails,
  userText: string,
  fetchClient: typeof fetch = fetch,
) => {
  const request = modelRequest(modelEndpoint, requestMessages(userText))
  return new ApiRequest(request, fetchClient, parseModelResponse).perform()
}
