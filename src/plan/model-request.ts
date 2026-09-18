import type { Messages, ModelEndpointDetails } from './types.ts'

const modelRequestTimeoutMs = 20000

class ModelRequest {
  private modelEndpoint: ModelEndpointDetails
  private messages: Messages

  constructor(modelEndpoint: ModelEndpointDetails, messages: Messages) {
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

export const modelRequest = (
  modelEndpoint: ModelEndpointDetails,
  messages: Messages,
) => {
  return new ModelRequest(modelEndpoint, messages).build()
}
