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
}

export const chatResponse = (json: ChatCompletionJson) => {
  return new ChatResponse(json)
}
