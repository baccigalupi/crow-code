import OpenAI from 'openai'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from './mock-fetch.ts'
import type { OpenAiClientOptions } from '../../src/model-requests/types.ts'

export const mockOpenAiClient = (content: string) => {
  return (options: OpenAiClientOptions) => {
    return new OpenAI({
      ...options,
      fetch: mockFetchSuccess({ choices: [{ message: { content } }] }),
    })
  }
}

export const mockOpenAiClientError = (status: number) => {
  return (options: OpenAiClientOptions) => {
    return new OpenAI({ ...options, fetch: mockFetchError(status) })
  }
}

export const mockOpenAiClientNetworkError = (message: string) => {
  return (options: OpenAiClientOptions) => {
    return new OpenAI({ ...options, fetch: mockFetchRejected(message) })
  }
}
