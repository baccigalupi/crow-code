import OpenAI from 'openai'
import type { ModelEndpoint, OpenAiClientOptions } from '../types.ts'

const modelRequestTimeoutMs = 20000
const modelRequestMaxRetries = 2
const openaiKeyPlaceholder = 'crow-no-api-key'

export const openAiClient = (options: OpenAiClientOptions) => {
  return new OpenAI(options)
}

export const openAiClientOptions = (
  modelEndpoint: ModelEndpoint,
  fetchClient: typeof fetch,
) => {
  return {
    apiKey: credential(modelEndpoint),
    baseURL: modelEndpoint.baseURL,
    timeout: modelRequestTimeoutMs,
    maxRetries: modelRequestMaxRetries,
    fetch: fetchClient,
  }
}

const credential = (modelEndpoint: ModelEndpoint) => {
  if (modelEndpoint.apiKey === '') return openaiKeyPlaceholder
  return modelEndpoint.apiKey
}
