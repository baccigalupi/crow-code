import { ApiRequest } from '../../api-request.ts'
import type { CommandApplicationData } from '../../types.ts'
import { ExtractModelResponse } from '../../plan/extract-model-response.ts'
import { modelRequest } from '../../plan/model-request.ts'
import type { ModelEndpointDetails } from '../../plan/types.ts'
import { modelEndpointInfo } from './endpoint.ts'
import { requestMessages } from './messages.ts'

class CommitSummaryRequest {
  private endpoint!: ReturnType<typeof modelEndpointInfo>
  private diff: string
  private goal: string
  private data: CommandApplicationData

  constructor(diff: string, goal: string, data: CommandApplicationData) {
    this.diff = diff
    this.goal = goal
    this.data = data
  }

  perform(): Promise<string> {
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
    const request = modelRequest(
      endpoint,
      requestMessages(this.diff, this.goal),
    )
    const parseResponse = this.parseResponse.bind(this)
    return new ApiRequest(
      request,
      this.data.fetchClient,
      parseResponse,
      this.data.logger,
    ).perform()
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
  data: CommandApplicationData,
): Promise<string> => {
  return new CommitSummaryRequest(diff, goal, data).perform()
}
