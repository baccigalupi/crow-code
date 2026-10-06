import type { ChatCompletionJson, Json, Timespan } from '../types.ts'

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

  tokenEffort() {
    return this.completionTokens() + this.reasoningTokens()
  }

  requestDuration() {
    return this.benchmark.endTime - this.benchmark.startTime
  }

  metaData() {
    return {
      cost: this.cost(),
      requestDuration: this.requestDuration(),
      tokenEffort: this.tokenEffort(),
    }
  }

  rawAnswer() {
    return this.json.choices[0].message.content
  }

  answerAsJson(): Json | undefined {
    try {
      return JSON.parse(this.strippedAnswer())
    } catch {
      // fall through: a parse failure yields undefined
    }
  }

  private strippedAnswer() {
    return this.rawAnswer().trim()
      .replace(/^```[a-zA-Z]*\n?/, '')
      .replace(/```$/, '')
      .trim()
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
