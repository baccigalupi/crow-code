import { parseGoals } from './parse-goals.ts'
import { goalSystemPrompt } from './system-prompt.ts'
import type { ModelEndpointDetails } from '../types.ts'

type GoalMessage = { content?: string }
type GoalChoice = { message?: GoalMessage }
type GoalResponse = { choices?: GoalChoice[] }

const goalRequestTimeoutMs = 20000

const requestBody = (modelEndpoint: ModelEndpointDetails, userText: string) => {
  return JSON.stringify({
    model: modelEndpoint.model,
    messages: [
      { role: 'system', content: goalSystemPrompt },
      { role: 'user', content: userText },
    ],
  })
}

const requestHeaders = (modelEndpoint: ModelEndpointDetails) => {
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${modelEndpoint.apiKey}`,
  }
}

const buildRequest = (modelEndpoint: ModelEndpointDetails, userText: string) => {
  return new Request(`${modelEndpoint.baseURL}/chat/completions`, {
    method: 'POST',
    headers: requestHeaders(modelEndpoint),
    body: requestBody(modelEndpoint, userText),
    signal: AbortSignal.timeout(goalRequestTimeoutMs),
  })
}

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
    const response = await fetchClient(buildRequest(modelEndpoint, userText))
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
