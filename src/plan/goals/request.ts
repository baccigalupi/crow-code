import { parseGoals } from './parse-goals.ts'
import { requestMessages } from './messages.ts'
import { modelRequest } from '../model-request.ts'
import type { ModelEndpointDetails } from '../types.ts'

type GoalMessage = { content?: string }
type GoalChoice = { message?: GoalMessage }
type GoalResponse = { choices?: GoalChoice[] }

const messageContent = (message: GoalMessage | undefined) => {
  if (message === undefined || message.content === undefined) {
    return null
  }
  return message.content
}

const firstContent = (body: GoalResponse) => {
  if (body.choices === undefined || body.choices.length === 0) {
    return null
  }
  return messageContent(body.choices[0].message)
}

const goalsFrom = async (response: Response) => {
  const content = firstContent(await response.json())
  if (content === null) {
    console.error('Goal response had no message content')
    return []
  }
  return parseGoals(content)
}

export const requestGoals = async (
  modelEndpoint: ModelEndpointDetails,
  userText: string,
  fetchClient: typeof fetch = fetch,
) => {
  try {
    const response = await fetchClient(
      modelRequest(modelEndpoint, requestMessages(userText)),
    )
    if (!response.ok) {
      console.error(`Goal request failed with status ${response.status}`)
      return []
    }
    return await goalsFrom(response)
  } catch {
    console.error('Goal request failed')
    return []
  }
}
