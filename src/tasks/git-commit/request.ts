import { ApiRequest } from '../../api-request.ts'
import type { ApplicationData } from '../../types.ts'
import { ExtractModelResponse } from '../../plan/extract-model-response.ts'
import { modelRequestObject } from '../../model-requests/framework/model-request-object.ts'
import type { ModelEndpointDetails } from '../../plan/types.ts'
import { modelEndpointInfo } from './endpoint.ts'
import { requestMessages } from './messages.ts'

class CommitSummaryRequest {
  private endpoint!: ReturnType<typeof modelEndpointInfo>
  private diff: string
  private goal: string
  private data: ApplicationData

  constructor(diff: string, goal: string, data: ApplicationData) {
    this.diff = diff
    this.goal = goal
    this.data = data
  }

  run(): Promise<string> {
    if (this.endpointIsUnavailable()) return this.unavailable()

    return this.request(this.endpoint.value())
  }

  private unavailable() {
    this.data.logger.error('No usable model endpoint; skipping commit summary')
    return Promise.resolve('')
  }

  private endpointIsUnavailable() {
    this.endpoint = modelEndpointInfo(
      this.data.crowDirectory,
      this.data.environment,
    )
    return !this.endpoint.isAvailable()
  }

  private request(endpoint: ModelEndpointDetails) {
    const request = modelRequestObject(
      endpoint,
      requestMessages(this.diff, this.goal),
    )
    const parseResponse = this.parseResponse.bind(this)
    return new ApiRequest(
      request,
      this.data.fetchClient,
      parseResponse,
      this.data.logger,
    ).run()
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
