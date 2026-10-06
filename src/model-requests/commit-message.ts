import type { ApplicationData } from '../application-data.ts'
import { commitMessageMessages } from './commit-message/messages.ts'
import { ModelApiRequest } from './framework/model-api-request.ts'
import type {
  CommitMessage,
  CommitMessageRequest,
  Json,
  ModelEndpoint,
} from './types.ts'

export class GetCommitMessage
  extends ModelApiRequest<CommitMessageRequest, CommitMessage> {
  protected override errorResponse() {
    return { subject: '', body: '' }
  }

  protected override validateResponse(json: Json) {
    if (typeof json !== 'object' || json === null) return false

    const candidate = json as Record<string, Json>
    return this.presentString(candidate.subject) &&
      this.presentString(candidate.body)
  }

  private presentString(value: unknown) {
    return typeof value === 'string' && value.trim() !== ''
  }

  protected getMessages() {
    return commitMessageMessages(this.requestData)
  }
}

export const getCommitMessage = async (
  modelEndpoint: ModelEndpoint,
  applicationData: ApplicationData,
  requestData: CommitMessageRequest,
) => {
  const request = new GetCommitMessage(
    modelEndpoint,
    applicationData,
    requestData,
  )
  await request.run()
  return request
}
