import { requestMessages } from './messages.ts'
import { parseModelResponse } from './model-response-parser.ts'
import { modelRequest } from '../model-request.ts'
import { ApiRequest } from '../api-request.ts'
import type { ModelEndpointDetails } from '../types.ts'

export const requestGoals = (
  modelEndpoint: ModelEndpointDetails,
  userText: string,
  fetchClient: typeof fetch = fetch,
) => {
  const request = modelRequest(modelEndpoint, requestMessages(userText))
  return new ApiRequest(request, fetchClient, parseModelResponse).perform()
}
