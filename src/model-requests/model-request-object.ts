import type { ModelEndpoint, ModelMessages } from './types.ts'

const modelRequestTimeoutMs = 20000

class ModelRequestObject {
  private modelEndpoint: ModelEndpoint
  private messages: ModelMessages[]

  constructor(modelEndpoint: ModelEndpoint, messages: ModelMessages[]) {
    this.modelEndpoint = modelEndpoint
    this.messages = messages
  }

  private body() {
    return JSON.stringify({
      model: this.modelEndpoint.model,
      messages: this.messages,
    })
  }

  private headers() {
    return {
      'content-type': 'application/json',
      authorization: `Bearer ${this.modelEndpoint.apiKey}`,
    }
  }

  build() {
    return new Request(`${this.modelEndpoint.baseURL}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: this.body(),
      signal: AbortSignal.timeout(modelRequestTimeoutMs),
    })
  }
}

export const modelRequestObject = (
  modelEndpoint: ModelEndpoint,
  messages: ModelMessages[],
) => {
  return new ModelRequestObject(modelEndpoint, messages).build()
}
