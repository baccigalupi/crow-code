import type { ApplicationData } from '../application-data.ts'
import type { ModelFilterOptions } from '../domain/models/types.ts'
import { commitMessageMessages } from './commit-message/messages.ts'
import { ModelApiRequest } from './framework/model-api-request.ts'
import { Runner } from './framework/runner.ts'
import type { CommitMessage, CommitMessageRequest, Json } from './types.ts'

export class GetCommitMessage
  extends ModelApiRequest<CommitMessageRequest, CommitMessage> {
  protected override logPrefix = 'Get commit message: '

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

export const getCommitMessage = (
  applicationData: ApplicationData,
  requestData: CommitMessageRequest,
  options: ModelFilterOptions = { type: 'chat', costTier: 'budget', limit: 3 },
) =>
  new Runner({
    applicationData,
    operationArguments: {
      modelFilters: options,
      modelApiRequest: GetCommitMessage,
      requestData,
    },
  })
