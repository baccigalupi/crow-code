import type { ClientOptions } from 'openai'

export type ModelMessages = {
  role: string
  content: string
}

export type OpenAiClientOptions = ClientOptions

export type ModelEndpoint = {
  baseURL: string
  apiKey: string
  model: string
  providerId: number
}

export type RequestMessages<T> = (input: T) => ModelMessages[]

export type Timespan = {
  startTime: number
  endTime: number
}

type ChatChoices = {
  message: {
    content: string
    [key: string]: unknown
  }
  [key: string]: unknown
}[]

export type ChatCompletionJson = {
  choices: ChatChoices
  usage: {
    completion_tokens: number
    completion_tokens_details?: {
      reasoning_tokens: number
      [key: string]: unknown
    }
    cost?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}
