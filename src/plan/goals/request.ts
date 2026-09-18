import { requestMessages } from './messages.ts'
import { parse } from './parse.ts'
import { modelRequest } from '../model-request.ts'
import { ApiRequest } from '../api-request.ts'
import { ExtractModelResponse } from '../extract-model-response.ts'
import type { ModelEndpointDetails } from '../types.ts'
import type pino from 'pino'

const parseModelResponse = (response: Response) => {
  return new ExtractModelResponse(response, parse).extract()
}

export const requestGoals = (
  modelEndpoint: ModelEndpointDetails,
  userText: string,
  logger: pino.Logger,
  fetchClient: typeof fetch = fetch,
) => {
  const request = modelRequest(modelEndpoint, requestMessages(userText))
  return new ApiRequest(request, fetchClient, parseModelResponse, logger)
    .perform()
}
