import type { ChatCompletionJson } from '../types.ts'

export class ModelAnswer {
  private json: ChatCompletionJson

  constructor(json: ChatCompletionJson) {
    this.json = json
  }

  cost() {
    if (this.json.usage.cost === undefined) return 0
    return this.json.usage.cost
  }

  tokenEffortScore() {
    return this.completionTokens() + this.reasoningTokens()
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

  private completionTokens() {
    return this.json.usage.completion_tokens
  }

  private reasoningTokens() {
    if (this.json.usage.completion_tokens_details === undefined) return 0
    return this.json.usage.completion_tokens_details.reasoning_tokens
  }
}

export const modelAnswer = (json: ChatCompletionJson) => {
  return new ModelAnswer(json)
}
