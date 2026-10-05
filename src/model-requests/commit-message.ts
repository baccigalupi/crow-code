import type { ApplicationData } from '../application-data.ts'
import { commitMessageMessages } from './commit-message/messages.ts'
import { ModelApiRequest } from './framework/model-api-request.ts'
import type {
  CommitMessage,
  CommitMessageRequest,
  ModelEndpoint,
} from './types.ts'

export class GetCommitMessage
  extends ModelApiRequest<CommitMessageRequest, CommitMessage> {
  protected parseAsJson = true

  protected override jsonErrorResponse() {
    return { success: false, subject: '', body: '' }
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
