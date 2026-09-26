import type { ChatCompletionJson } from './types.ts'

export class ChatResponse {
  private json: ChatCompletionJson

  constructor(json: ChatCompletionJson) {
    this.json = json
  }

  cost() {
    if (this.json.usage.cost === undefined) return 0
    return this.json.usage.cost
  }

  rawAnswer() {
    return this.json.choices[0].message.content
  }

  answerAsJson() {
    const stripped = this.rawAnswer().trim()
      .replace(/^```[a-zA-Z]*\n?/, '')
      .replace(/```$/, '')
      .trim()
    return JSON.parse(stripped)
  }
}

export const chatResponse = (json: ChatCompletionJson) => {
  return new ChatResponse(json)
}
