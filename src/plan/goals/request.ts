import { requestMessages } from './messages.ts'
import { parse } from './parse.ts'
import { modelRequestObject } from '../../model-requests/framework/model-request-object.ts'
import { ApiRequest } from '../../api-request.ts'
import { ExtractModelResponse } from '../extract-model-response.ts'
import type { Logger } from '../../types.ts'
import type { ModelEndpointDetails } from '../types.ts'

const parseModelResponse = (response: Response) => {
  return new ExtractModelResponse(response, parse).extract()
}

export const requestGoals = (
  modelEndpoint: ModelEndpointDetails,
  userText: string,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  const request = modelRequestObject(modelEndpoint, requestMessages(userText))
  return new ApiRequest(request, fetchClient, parseModelResponse, logger)
    .run()
}
