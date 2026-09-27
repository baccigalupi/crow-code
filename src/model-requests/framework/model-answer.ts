import type { ChatCompletionJson, Timespan } from '../types.ts'

export class ModelAnswer {
  private json: ChatCompletionJson
  private benchmark: Timespan

  constructor(json: ChatCompletionJson, benchmark: Timespan) {
    this.json = json
    this.benchmark = benchmark
  }

  cost() {
    if (this.json.usage.cost === undefined) return 0
    return this.json.usage.cost
  }

  tokenEffortScore() {
    return this.completionTokens() + this.reasoningTokens()
  }

  requestDuration() {
    return this.benchmark.endTime - this.benchmark.startTime
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

export const modelAnswer = (
  json: ChatCompletionJson,
  benchmark: Timespan,
) => {
  return new ModelAnswer(json, benchmark)
}
