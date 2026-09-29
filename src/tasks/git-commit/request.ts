import { ApiRequest } from '../../api-request.ts'
import type { ApplicationData } from '../../types.ts'
import { modelRequestObject } from '../../model-requests/framework/model-request-object.ts'
import type { ModelEndpoint } from '../../model-requests/types.ts'
import { ExtractModelResponse } from './extract-model-response.ts'
import { modelEndpointInfo } from './endpoint.ts'
import { requestMessages } from './messages.ts'

class CommitSummaryRequest {
  private endpoint!: Awaited<ReturnType<typeof modelEndpointInfo>>
  private diff: string
  private goal: string
  private data: ApplicationData

  constructor(diff: string, goal: string, data: ApplicationData) {
    this.diff = diff
    this.goal = goal
    this.data = data
  }

  async run(): Promise<string> {
    if (await this.endpointIsUnavailable()) return this.unavailable()

    return this.request(this.endpoint.value())
  }

  private unavailable() {
    this.data.logger.error('No usable model endpoint; skipping commit summary')
    return Promise.resolve('')
  }

  private async endpointIsUnavailable() {
    this.endpoint = await modelEndpointInfo(
      this.data.database,
      this.data.environment,
      this.data.logger,
    )
    return !this.endpoint.isAvailable()
  }

  private request(endpoint: ModelEndpoint) {
    return this.runRequest(endpoint, this.parseResponse.bind(this))
  }

  private runRequest(
    endpoint: ModelEndpoint,
    parseResponse: (response: Response) => Promise<string>,
  ) {
    const request = this.requestObject(endpoint)
    return new ApiRequest(
      request,
      this.data.fetchClient,
      parseResponse,
      this.data.logger,
    ).run()
  }

  private requestObject(endpoint: ModelEndpoint) {
    return modelRequestObject(endpoint, requestMessages(this.diff, this.goal))
  }

  private parseResponse(response: Response) {
    return new ExtractModelResponse(response, this.parseSummary).extract()
  }

  private parseSummary(content: string) {
    return content.trim()
  }
}

export const requestCommitSummary = (
  diff: string,
  goal: string,
  data: ApplicationData,
): Promise<string> => {
  return new CommitSummaryRequest(diff, goal, data).run()
}
