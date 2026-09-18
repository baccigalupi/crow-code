import { parseGoals } from './parse-goals.ts'
import { requestMessages } from './messages.ts'
import { modelRequest } from '../model-request.ts'
import { ApiRequest } from '../api-request.ts'
import type { ModelEndpointDetails } from '../types.ts'

type GoalMessage = { content?: string }
type GoalChoice = { message?: GoalMessage }
type ModelResponse = { choices?: GoalChoice[] }

class ModelResponseParser {
  private response: Response

  constructor(response: Response) {
    this.response = response
  }

  empty(): string[] {
    return []
  }

  async parse() {
    if (!this.response.ok) {
      return this.empty()
    }
    const content = this.firstContent(await this.response.json())
    if (content === null) {
      console.error('Response had no message content')
      return this.empty()
    }
    return parseGoals(content)
  }

  private firstContent(body: ModelResponse) {
    if (body.choices === undefined || body.choices.length === 0) {
      return null
    }
    return this.messageContent(body.choices[0].message)
  }

  private messageContent(message: GoalMessage | undefined) {
    if (message === undefined || message.content === undefined) {
      return null
    }
    return message.content
  }
}

const parseModelResponse = (response: Response) => {
  return new ModelResponseParser(response).parse()
}

export const requestGoals = (
  modelEndpoint: ModelEndpointDetails,
  userText: string,
  fetchClient: typeof fetch = fetch,
) => {
  const request = modelRequest(modelEndpoint, requestMessages(userText))
  return new ApiRequest(request, fetchClient, parseModelResponse).perform()
}
