import { ApiRequest } from '../../api-request.ts'
import type { Logger } from '../../model-info/types.ts'
import { ExtractModelResponse } from '../../plan/extract-model-response.ts'
import { modelRequest } from '../../plan/model-request.ts'
import type { ModelEndpointDetails } from '../../plan/types.ts'
import { isModelEndpointAvailable, resolveModelEndpoint } from './endpoint.ts'
import { requestMessages } from './messages.ts'

const parseSummary = (content: string) => content.trim()
const parseModelResponse = (response: Response) => {
  return new ExtractModelResponse(response, parseSummary).extract()
}

const performRequest = (
  endpoint: ModelEndpointDetails,
  diff: string,
  goal: string,
  logger: Logger,
  fetchClient: typeof fetch,
) => {
  const request = modelRequest(endpoint, requestMessages(diff, goal))
  return new ApiRequest(request, fetchClient, parseModelResponse, logger)
    .perform()
}

export const requestCommitSummary = (
  crowDirectory: string,
  diff: string,
  goal: string,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<string> => {
  const endpoint = resolveModelEndpoint(crowDirectory, logger)
  if (!isModelEndpointAvailable(endpoint)) return Promise.resolve('')
  return performRequest(endpoint, diff, goal, logger, fetchClient)
}
