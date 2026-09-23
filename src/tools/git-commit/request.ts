import { ApiRequest } from '../../api-request.ts'
import type { Logger } from '../../types.ts'
import { ExtractModelResponse } from '../../plan/extract-model-response.ts'
import { modelRequest } from '../../plan/model-request.ts'
import type { ModelEndpointDetails } from '../../plan/types.ts'
import { modelEndpointInfo } from './endpoint.ts'
import { requestMessages } from './messages.ts'

class CommitSummaryRequest {
  private crowDirectory: string
  private endpoint!: ReturnType<typeof modelEndpointInfo>
  private diff: string
  private goal: string
  private logger: Logger
  private fetchClient: typeof fetch

  constructor(
    crowDirectory: string,
    diff: string,
    goal: string,
    logger: Logger,
    fetchClient: typeof fetch,
  ) {
    this.crowDirectory = crowDirectory
    this.diff = diff
    this.goal = goal
    this.logger = logger
    this.fetchClient = fetchClient
  }

  perform(): Promise<string> {
    if (this.endpointIsUnavailable()) return Promise.resolve('')

    return this.request(this.endpoint.value())
  }

  private endpointIsUnavailable() {
    this.endpoint = modelEndpointInfo(this.crowDirectory)
    return !this.endpoint.isAvailable()
  }

  private request(endpoint: ModelEndpointDetails) {
    const request = modelRequest(
      endpoint,
      requestMessages(this.diff, this.goal),
    )
    const parseResponse = this.parseResponse.bind(this)
    return new ApiRequest(request, this.fetchClient, parseResponse, this.logger)
      .perform()
  }

  private parseResponse(response: Response) {
    return new ExtractModelResponse(response, this.parseSummary).extract()
  }

  private parseSummary(content: string) {
    return content.trim()
  }
}

export const requestCommitSummary = (
  crowDirectory: string,
  diff: string,
  goal: string,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<string> => {
  return new CommitSummaryRequest(
    crowDirectory,
    diff,
    goal,
    logger,
    fetchClient,
  ).perform()
}
