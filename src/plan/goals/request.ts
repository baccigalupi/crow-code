import { parseGoals } from './parse-goals.ts'
import { goalSystemPrompt } from './system-prompt.ts'
import type { GoalTarget } from '../types.ts'

type GoalMessage = { content?: string }
type GoalChoice = { message?: GoalMessage }
type GoalResponse = { choices?: GoalChoice[] }

const goalRequestTimeoutMs = 20000

const requestBody = (target: GoalTarget, userText: string): string => {
  return JSON.stringify({
    model: target.model,
    messages: [
      { role: 'system', content: goalSystemPrompt },
      { role: 'user', content: userText },
    ],
  })
}

const requestHeaders = (target: GoalTarget) => {
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${target.apiKey}`,
  }
}

const buildRequest = (target: GoalTarget, userText: string): Request => {
  return new Request(`${target.baseURL}/chat/completions`, {
    method: 'POST',
    headers: requestHeaders(target),
    body: requestBody(target, userText),
    signal: AbortSignal.timeout(goalRequestTimeoutMs),
  })
}

const messageContent = (message: GoalMessage | undefined): string | null => {
  if (message === undefined || message.content === undefined) {
    return null
  }
  return message.content
}

const firstContent = (body: GoalResponse): string | null => {
  if (body.choices === undefined || body.choices.length === 0) {
    return null
  }
  return messageContent(body.choices[0].message)
}

const goalsFrom = async (response: Response): Promise<string[]> => {
  const content = firstContent(await response.json())
  if (content === null) {
    console.error('Goal response had no message content')
    return []
  }
  return parseGoals(content)
}

export const requestGoals = async (
  target: GoalTarget,
  userText: string,
  fetchClient: typeof fetch = fetch,
): Promise<string[]> => {
  try {
    const response = await fetchClient(buildRequest(target, userText))
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
